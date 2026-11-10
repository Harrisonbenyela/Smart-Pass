import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await sql`SELECT id, qr_token, name, class, photo FROM students ORDER BY class, name`;
  return NextResponse.json(rows);
}

// Body: { class: "Form 3A", names: ["Ada Obi", ...] }
export async function POST(req) {
  const { class: cls, names } = await req.json();
  const clean = [...new Set((names || []).map((n) => String(n).trim()).filter(Boolean))].slice(0, 2000);
  if (!cls?.trim() || !clean.length) return NextResponse.json({ error: 'Class and names required' }, { status: 400 });
  const tokens = clean.map(() => 'SP' + randomBytes(8).toString('hex').toUpperCase());
  const classes = clean.map(() => cls.trim());
  const rows = await sql`
    INSERT INTO students (qr_token, name, class)
    SELECT * FROM unnest(${tokens}::text[], ${clean}::text[], ${classes}::text[])
    ON CONFLICT DO NOTHING RETURNING id`;
  return NextResponse.json({ added: rows.length, skipped: clean.length - rows.length });
}

export async function DELETE(req) {
  const id = new URL(req.url).searchParams.get('id');
  await sql`DELETE FROM students WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
