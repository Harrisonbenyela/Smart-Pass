'use client';
import { useEffect, useState } from 'react';
import QRCard from '@/components/QRCard';
import { shrinkImage } from '@/lib/image';

export default function Students() {
  const [all, setAll] = useState([]);
  const [cls, setCls] = useState('');
  const load = () => fetch('/api/students').then((r) => r.json()).then(setAll);
  useEffect(() => { load(); }, []);
  const classes = [...new Set(all.map((s) => s.class))];
  const list = all.filter((s) => !cls || s.class === cls);

  async function photo(s, file) {
    if (!file) return;
    await fetch('/api/students/photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, photo: await shrinkImage(file) }) });
    load();
  }
  async function remove(s) {
    if (!confirm(`Delete ${s.name}? Their attendance history is deleted too.`)) return;
    await fetch(`/api/students?id=${s.id}`, { method: 'DELETE' });
    load();
  }
  return (
    <div className="space-y-4">
      <div className="card no-print space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <select className="input" value={cls} onChange={(e) => setCls(e.target.value)}>
            <option value="">All classes</option>
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={() => window.print()}>Print / Save QR cards as PDF</button>
          <span className="text-sm text-slate-500">{list.length} students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-slate-500"><th className="p-2"></th><th className="p-2">Name</th><th className="p-2">Class</th><th className="p-2">Photo</th><th></th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.photo ? <img src={s.photo} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 font-bold text-slate-500">{s.name[0]}</span>}</td>
                  <td className="p-2">{s.name}</td><td className="p-2">{s.class}</td>
                  <td className="p-2"><input type="file" accept="image/*" className="max-w-[180px] text-xs" onChange={(e) => photo(s, e.target.files[0])} /></td>
                  <td className="p-2"><button className="text-red-600" onClick={() => remove(s)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
        {list.map((s) => <QRCard key={s.id} s={s} />)}
      </div>
    </div>
  );
}
