import { NextResponse } from 'next/server';
import { sql, TZ } from '@/lib/db';

// Body: { token, mode: "AUTO" | "IN" | "OUT" }
export async function POST(req) {
  const { token, mode } = await req.json();
  const [s] = await sql`SELECT id, name, class, photo FROM students WHERE qr_token = ${String(token || '').trim()}`;
  if (!s) return NextResponse.json({ error: 'Card not recognised' }, { status: 404 });

  let direction = mode === 'IN' || mode === 'OUT' ? mode : null;
  if (!direction) {
    const [last] = await sql`
      SELECT direction FROM attendance_logs
      WHERE student_id = ${s.id}
        AND (scanned_at AT TIME ZONE ${TZ})::date = (now() AT TIME ZONE ${TZ})::date
      ORDER BY scanned_at DESC LIMIT 1`;
    direction = last?.direction === 'IN' ? 'OUT' : 'IN';
  }
  const [log] = await sql`INSERT INTO attendance_logs (student_id, direction) VALUES (${s.id}, ${direction}) RETURNING scanned_at`;
  return NextResponse.json({ student: s, direction, at: log.scanned_at });
}
