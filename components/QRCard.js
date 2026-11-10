'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCard({ s }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    QRCode.toDataURL(s.qr_token, { margin: 1, width: 260, errorCorrectionLevel: 'M' }).then(setSrc);
  }, [s.qr_token]);
  return (
    <div className="break-inside-avoid rounded-xl border-2 border-slate-800 bg-white p-3 text-center text-black">
      <div className="text-[10px] font-bold tracking-widest text-brand">SMARTPASS · STUDENT ID</div>
      {s.photo && <img src={s.photo} alt="" className="mx-auto my-1 h-16 w-16 rounded-lg object-cover" />}
      <div className="font-bold leading-tight">{s.name}</div>
      <div className="text-sm">{s.class}</div>
      {src && <img src={src} alt="QR" className="mx-auto h-32 w-32" />}
      <div className="text-[9px] text-slate-500">{s.qr_token}</div>
    </div>
  );
}
