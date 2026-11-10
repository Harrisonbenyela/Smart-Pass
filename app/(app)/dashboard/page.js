'use client';
import { useEffect, useState } from 'react';

const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [date, setDate] = useState('');
  useEffect(() => {
    const load = () => fetch('/api/dashboard').then((r) => r.json()).then(setD).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);
  const metrics = [['Total registered', d?.total], ['Present today', d?.present], ['Absent', d?.absent], ['Currently on campus', d?.onCampus]];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map(([label, v]) => (
          <div key={label} className="card"><div className="text-3xl font-bold">{v ?? '–'}</div><div className="text-sm text-slate-500">{label}</div></div>
        ))}
      </div>
      <div className="card flex flex-wrap items-center gap-2">
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        <a className="btn" href={`/api/export${date ? `?date=${date}` : ''}`}>Download attendance (CSV / Excel)</a>
        <span className="text-sm text-slate-500">Leave the date empty for today.</span>
      </div>
      <div className="card overflow-x-auto">
        <h2 className="mb-2 font-semibold">Latest scans today</h2>
        <table className="w-full text-left text-sm">
          <thead><tr className="text-slate-500"><th className="p-2">Time</th><th className="p-2">Student</th><th className="p-2">Class</th><th className="p-2">Event</th></tr></thead>
          <tbody>
            {d?.recent?.map((r, i) => (
              <tr key={i} className="border-t"><td className="p-2">{fmt(r.scanned_at)}</td><td className="p-2">{r.name}</td><td className="p-2">{r.class}</td>
                <td className="p-2"><span className={`rounded-full px-2 py-0.5 text-white ${r.direction === 'IN' ? 'bg-green-600' : 'bg-amber-600'}`}>{r.direction}</span></td></tr>
            ))}
            {d && !d.recent.length && <tr><td className="p-2 text-slate-500" colSpan={4}>No scans yet today</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
