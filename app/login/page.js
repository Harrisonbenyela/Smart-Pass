'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState('admin');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, password }) });
    if (res.ok) { router.push(role === 'gate' ? '/scan' : '/dashboard'); router.refresh(); }
    else setErr('Wrong password');
  }
  return (
    <main className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="mb-4 text-center text-2xl font-bold">SMART<span className="text-brand">PASS</span></h1>
      <form onSubmit={submit} className="card space-y-3">
        <select className="input w-full" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin / Principal</option>
          <option value="gate">Gate keeper</option>
        </select>
        <input className="input w-full" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn w-full">Sign in</button>
      </form>
    </main>
  );
}
