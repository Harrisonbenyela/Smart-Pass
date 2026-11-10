'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  ['/dashboard', 'Dashboard'],
  ['/register', 'Register'],
  ['/students', 'Students & Cards'],
  ['/scan', 'Gate Scanner'],
];

export default function Shell({ role, children }) {
  const path = usePathname();
  const router = useRouter();
  const links = role === 'gate' ? LINKS.filter((l) => l[0] === '/scan') : LINKS;
  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <header className="no-print flex flex-wrap items-center justify-between gap-2 py-4">
        <h1 className="text-xl font-bold">SMART<span className="text-brand">PASS</span></h1>
        <button onClick={logout} className="text-sm text-slate-500 underline">Log out ({role})</button>
      </header>
      <nav className="no-print mb-4 flex gap-2 overflow-x-auto">
        {links.map(([href, label]) => (
          <Link key={href} href={href}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${path === href ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'}`}>
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
