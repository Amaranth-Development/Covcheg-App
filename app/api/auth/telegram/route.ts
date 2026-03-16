import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import pbServer from '@/lib/pocketbaseServer';

const MAX_AGE = parseInt(process.env.TELEGRAM_LOGIN_MAX_AGE || '86400', 10);

// GET — handles redirect from Telegram OAuth popup
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  if (!hash) return NextResponse.redirect(new URL('/?tg_error=no_hash', request.url));

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const secretKey = crypto.createHash('sha256').update(token).digest();

  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    // Skip hash AND skip any keys with empty/undefined values
    if (key !== 'hash' && value != null && value !== '') {
      params[key] = value;
    }
  });

  const checkString = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('\n');
  const computedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (computedHash !== hash) {
    console.error('[TG Auth GET] Hash mismatch', { checkString, computedHash, hash });
    return NextResponse.redirect(new URL('/?tg_error=invalid_hash', request.url));
  }

  const authDate = parseInt(params.auth_date || '0');
  if (Date.now() / 1000 - authDate > MAX_AGE) {
    return NextResponse.redirect(new URL('/?tg_error=expired', request.url));
  }

  const userJson = encodeURIComponent(JSON.stringify(params));
  return NextResponse.redirect(new URL(`/?tg_auth=${userJson}`, request.url));
}

// POST — validates data from Telegram Login Widget and issues a temp password
export async function POST(req: NextRequest) {
  const data = await req.json();
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const secretKey = crypto.createHash('sha256').update(token).digest();
  const { hash, ...rawUserData } = (data || {}) as Record<string, any>;

  if (!hash) {
    return NextResponse.json({ error: 'No hash' }, { status: 400 });
  }

  // ⚠️ CRITICAL FIX: filter out fields with null/undefined/empty string values.
  // When a Telegram user has no last_name (or other optional fields), those keys
  // must be excluded from the check-string — otherwise HMAC won't match.
  const userData: Record<string, string> = {};
  for (const [key, val] of Object.entries(rawUserData)) {
    if (val != null && val !== '') {
      userData[key] = String(val);
    }
  }

  const checkString = Object.keys(userData).sort().map(k => `${k}=${userData[k]}`).join('\n');
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (hmac !== hash) {
    console.error('[TG Auth POST] Hash mismatch', { checkString, expected: hmac, received: hash });
    return NextResponse.json({ error: 'Invalid data' }, { status: 401 });
  }

  const authDate = parseInt(userData.auth_date || '0');
  if (Date.now() / 1000 - authDate > MAX_AGE) {
    return NextResponse.json({ error: 'Data expired' }, { status: 401 });
  }

  const telegramId = String(userData.id);
  const email = `tg_${telegramId}@covcheg.app`;
  const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Telegram user';

  try {
    let userRecord;
    try {
      userRecord = await pbServer.collection('users').getFirstListItem(`email = "${email}"`);
    } catch {
      userRecord = null;
    }

    if (!userRecord) {
      const initialPassword = crypto.randomBytes(32).toString('hex');
      userRecord = await pbServer.collection('users').create({
        email,
        password: initialPassword,
        passwordConfirm: initialPassword,
        name,
      });
    }

    // One-time temp password for client-side login
    const tempPassword = crypto.randomBytes(24).toString('hex');
    await pbServer.collection('users').update(userRecord.id, {
      password: tempPassword,
      passwordConfirm: tempPassword,
      name,
    });

    return NextResponse.json({ ok: true, email, password: tempPassword });
  } catch (e) {
    console.error('Telegram auth PocketBase error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
