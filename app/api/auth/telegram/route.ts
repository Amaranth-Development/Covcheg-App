import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const data = await req.json();
  
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const secretKey = crypto.createHash('sha256').update(token).digest();
  
  const { hash, ...userData } = data;
  
  const checkString = Object.keys(userData)
    .sort()
    .map(k => `${k}=${userData[k]}`)
    .join('\n');
  
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');
  
  if (hmac !== hash) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 401 });
  }
  
  // Проверяем что данные не старше 24 часов
  const authDate = parseInt(userData.auth_date);
  if (Date.now() / 1000 - authDate > 86400) {
    return NextResponse.json({ error: 'Data expired' }, { status: 401 });
  }
  
  return NextResponse.json({ ok: true, user: userData });
}
