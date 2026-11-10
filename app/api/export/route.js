import { sql, TZ } from '@/lib/db';

export const dynamic = 'force-dynamic';

const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const time = (d) => (d ? new Date(d).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) : '');

// GET /api/export            -> today's attendance
// GET /api/export?date=2026-11-10 -> a given day. Opens directly in Excel.
export async function GET(req) {
  const date = new URL(req.url).searchParams.get('date') || null;
  const rows = await sql`
    WITH d AS (SELECT COALESCE(${date}::date, (now() AT TIME ZONE ${TZ})::date) AS day)
    SELECT s.name, s.class,
           min(l.scanned_at) FILTER (WHERE l.direction = 'IN') AS first_in,
           max(l.scanned_at) FILTER (WHERE l.direction = 'OUT') AS last_out,
           (array_agg(l.direction ORDER BY l.scanned_at DESC))[1] AS last_dir,
           (SELECT day FROM d) AS day
    FROM students s
    LEFT JOIN attendance_logs l ON l.student_id = s.id AND (l.scanned_at AT TIME ZONE ${TZ})::date = (SELECT day FROM d)
    GROUP BY s.id ORDER BY s.class, s.name`;
  const status = (r) => (!r.last_dir ? 'Absent' : r.last_dir === 'IN' ? 'On campus' : 'Left');
  const csv = '\uFEFF' + ['Name,Class,Status,First IN,Last OUT']
    .concat(rows.map((r) => [r.name, r.class, status(r), time(r.first_in), time(r.last_out)].map(q).join(','))).join('\r\n');
  const day = rows[0]?.day ? new Date(rows[0].day).toISOString().slice(0, 10) : date || 'today';
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="attendance-${day}.csv"` } });
}
