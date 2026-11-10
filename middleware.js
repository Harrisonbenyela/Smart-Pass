import { NextResponse } from 'next/server';
import { verify } from '@/lib/auth';

const PUBLIC = ['/login', '/api/login', '/api/logout'];
const GATE_ALLOWED = ['/scan', '/api/scan'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const isApi = pathname.startsWith('/api');
  const role = await verify(req.cookies.get('sp_session')?.value);
  if (!role) return isApi ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) : NextResponse.redirect(new URL('/login', req.url));
  if (role === 'gate' && !GATE_ALLOWED.includes(pathname))
    return isApi ? NextResponse.json({ error: 'Forbidden' }, { status: 403 }) : NextResponse.redirect(new URL('/scan', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
