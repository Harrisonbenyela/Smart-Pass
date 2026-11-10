import { NextResponse } from 'next/server';
import { sql, TZ } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [m] = await sql`
    WITH today AS (
      SELECT student_id, direction, scanned_at FROM attendance_logs
      WHERE (scanned_at AT TIME ZONE ${TZ})::date = (now() AT TIME ZONE ${TZ})::date
    ), last AS (
      SELECT DISTINCT ON (student_id) student_id, direction FROM today ORDER BY student_id, scanned_at DESC
    )
    SELECT (SELECT count(*) FROM students)::int AS total,
           (SELECT count(*) FROM last)::int AS present,
           (SELECT count(*) FROM last WHERE direction = 'IN')::int AS on_campus`;
  const recent = await sql`
    SELECT s.name, s.class, l.direction, l.scanned_at
    FROM attendance_logs l JOIN students s ON s.id = l.student_id
    WHERE (l.scanned_at AT TIME ZONE ${TZ})::date = (now() AT TIME ZONE ${TZ})::date
    ORDER BY l.scanned_at DESC LIMIT 15`;
  return NextResponse.json({ total: m.total, present: m.present, absent: m.total - m.present, onCampus: m.on_campus, recent });
}
