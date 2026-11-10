'use client';
import { useEffect, useRef, useState } from 'react';

const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Scan() {
  const [mode, setMode] = useState('AUTO');
  const [res, setRes] = useState(null);
  const [msg, setMsg] = useState('Starting camera…');
  const [manual, setManual] = useState('');
  const modeRef = useRef('AUTO');
  const last = useRef({ t: '', at: 0 });
  modeRef.current = mode;

  async function handle(raw) {
    const t = String(raw).trim(), now = Date.now();
    if (t === last.current.t && now - last.current.at < 4000) return; // ignore repeat reads of the same card
    last.current = { t, at: now };
    navigator.vibrate?.(80);
    try {
      const r = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: t, mode: modeRef.current }) });
      const j = await r.json();
      setRes(r.ok ? j : { error: j.error || 'Error' });
    } catch { setRes({ error: 'Network problem – not saved' }); }
  }

  useEffect(() => {
    let scanner;
    (async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      scanner = new Html5Qrcode('reader');
      try {
        await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 240 }, handle, () => {});
        setMsg('Hold the student card in front of the camera.');
      } catch (e) { setMsg('Camera could not start. Allow camera access, or type the card code below.'); }
    })();
    return () => { scanner?.isScanning && scanner.stop().then(() => scanner.clear()).catch(() => {}); };
  }, []);

  const dir = res?.direction;
  return (
    <div className="card space-y-3">
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
        {['AUTO', 'IN', 'OUT'].map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 ${mode === m ? 'bg-brand text-white' : 'bg-white'}`}>{m === 'AUTO' ? 'Auto IN/OUT' : m}</button>
        ))}
      </div>
      <div id="reader" className="mx-auto w-full max-w-md overflow-hidden rounded-xl" />
      <p className="text-center text-sm text-slate-500">{msg}</p>
      {res && (
        <div className={`flex items-center gap-4 rounded-2xl border-4 p-3 ${res.error ? 'border-red-600' : dir === 'IN' ? 'border-green-600' : 'border-amber-500'}`}>
          {res.student?.photo ? <img src={res.student.photo} alt="" className="h-28 w-28 rounded-xl object-cover" />
            : <div className="grid h-28 w-28 place-items-center rounded-xl bg-slate-200 text-4xl text-slate-500">{res.student?.name?.[0] || '?'}</div>}
          <div>
            <h2 className="text-2xl font-bold">{res.error || res.student.name}</h2>
            {!res.error && <div>{res.student.class} · {fmt(res.at)}</div>}
            <span className={`mt-1 inline-block rounded-full px-3 py-0.5 font-bold text-white ${res.error ? 'bg-red-600' : dir === 'IN' ? 'bg-green-600' : 'bg-amber-600'}`}>{res.error ? 'DENIED' : dir}</span>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="No camera? Type the card code" value={manual} onChange={(e) => setManual(e.target.value)} />
        <button className="btn-ghost" onClick={() => { if (manual) { last.current = { t: '', at: 0 }; handle(manual); setManual(''); } }}>Check</button>
      </div>
    </div>
  );
}
