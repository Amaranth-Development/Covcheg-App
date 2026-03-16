import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import pbServer from '@/lib/pocketbaseServer';

const MAX_AGE = parseInt(process.env.TELEGRAM_LOGIN_MAX_AGE || '86400', 10);

// GET — обрабатывает редирект от Telegram OAuth попапа
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  if (!hash) return NextResponse.redirect(new URL('/?tg_error=no_hash', request.url));

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const secretKey = crypto.createHash('sha256').update(token).digest();

  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'hash') params[key] = value;
  });

  const checkString = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('\n');
  const computedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (computedHash !== hash) {
    return NextResponse.redirect(new URL('/?tg_error=invalid_hash', request.url));
  }

  const authDate = parseInt(params.auth_date || '0');
  if (Date.now() / 1000 - authDate > MAX_AGE) {
    return NextResponse.redirect(new URL('/?tg_error=expired', request.url));
  }

  // Всё ок — редиректим на главную с данными пользователя
  const userJson = encodeURIComponent(JSON.stringify(params));
  return NextResponse.redirect(new URL(`/?tg_auth=${userJson}`, request.url));
}

// POST — верифицирует данные от Telegram Login Widget и выдаёт временный пароль
export async function POST(req: NextRequest) {
  const data = await req.json();
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const secretKey = crypto.createHash('sha256').update(token).digest();
  const { hash, ...userData } = data || {} as any;

  if (!hash) {
    return NextResponse.json({ error: 'No hash' }, { status: 400 });
  }

  const checkString = Object.keys(userData).sort().map(k => `${k}=${userData[k]}`).join('\n');
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (hmac !== hash) return NextResponse.json({ error: 'Invalid data' }, { status: 401 });

  const authDate = parseInt(userData.auth_date || '0');
  if (Date.now() / 1000 - authDate > MAX_AGE) {
    return NextResponse.json({ error: 'Data expired' }, { status: 401 });
  }

  const telegramId = String(userData.id);
  const email = `tg_${telegramId}@covcheg.app`;
  const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Telegram user';

  try {
    // ищем пользователя по email
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

    // генерируем одноразовый временный пароль для клиентского логина
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
