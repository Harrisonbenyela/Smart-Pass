import { cookies } from 'next/headers';
import { verify } from '@/lib/auth';
import Shell from '@/components/Shell';

export default async function AppLayout({ children }) {
  const role = await verify(cookies().get('sp_session')?.value);
  return <Shell role={role}>{children}</Shell>;
}
