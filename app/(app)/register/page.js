'use client';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export default function Register() {
  const [cls, setCls] = useState('');
  const [classes, setClasses] = useState([]);
  const [names, setNames] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [one, setOne] = useState('');

  useEffect(() => {
    fetch('/api/students').then((r) => r.json()).then((rows) => setClasses([...new Set(rows.map((s) => s.class))])).catch(() => {});
  }, [msg]);

  async function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const wb = XLSX.read(await f.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' }).filter((r) => r.some((c) => String(c).trim()));
      const head = (rows[0] || []).map((c) => String(c).toLowerCase());
      const idx = head.findIndex((c) => c.includes('name'));
      const col = idx >= 0 ? idx : 0;
      const list = rows.slice(idx >= 0 ? 1 : 0).map((r) => String(r[col]).trim()).filter(Boolean);
      setNames(list);
      setMsg(`${list.length} names found, e.g. ${list.slice(0, 3).join(', ')}`);
    } catch (err) { setMsg('Could not read the file: ' + err.message); }
  }
  async function save(list) {
    if (!cls.trim()) return setMsg('Choose or type the class first.');
    setBusy(true);
    const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ class: cls, names: list }) });
    const j = await res.json();
    setBusy(false);
    setMsg(res.ok ? `${j.added} students registered in ${cls}${j.skipped ? ` (${j.skipped} duplicates skipped)` : ''}. Open "Students & Cards" to print.` : j.error);
    if (res.ok) setNames([]);
  }
  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="font-semibold">Import students from Excel</h2>
        <p className="text-sm text-slate-500">The sheet needs a column headed <b>Name</b> (or just names in column A). The class below is applied to everyone in the file.</p>
        <div className="flex flex-wrap gap-3">
          <input className="input" list="classes" placeholder="Class, e.g. Form 3A" value={cls} onChange={(e) => setCls(e.target.value)} />
          <datalist id="classes">{classes.map((c) => <option key={c} value={c} />)}</datalist>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} />
        </div>
        <button className="btn" disabled={busy || !names.length} onClick={() => save(names)}>Register &amp; generate QR cards</button>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </div>
      <div className="card flex flex-wrap items-center gap-2">
        <h2 className="mr-2 font-semibold">Add one student</h2>
        <input className="input" placeholder="Full name" value={one} onChange={(e) => setOne(e.target.value)} />
        <button className="btn-ghost" onClick={() => one.trim() && save([one]).then(() => setOne(''))}>Add to class above</button>
      </div>
    </div>
  );
}
