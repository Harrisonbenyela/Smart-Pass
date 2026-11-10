import { NextResponse } from 'next/server';
import { sign } from '@/lib/auth';

export async function POST(req) {
  const { role, password } = await req.json();
  const expected = role === 'admin' ? process.env.ADMIN_PASSWORD : role === 'gate' ? process.env.GATE_PASSWORD : null;
  if (!expected || password !== expected) return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  const res = NextResponse.json({ role });
  res.cookies.set('sp_session', await sign(role), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12,
  });
  return res;
}
