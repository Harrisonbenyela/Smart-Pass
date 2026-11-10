import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req) {
  const { id, photo } = await req.json();
  if (!photo?.startsWith('data:image/') || photo.length > 200000) return NextResponse.json({ error: 'Bad image' }, { status: 400 });
  await sql`UPDATE students SET photo = ${photo} WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
