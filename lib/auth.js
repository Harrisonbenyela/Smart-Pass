// Tiny signed-cookie auth that works in both Edge (middleware) and Node runtimes.
const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const key = () =>
  crypto.subtle.importKey('raw', enc.encode(process.env.AUTH_SECRET || ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

export async function sign(role) {
  const sig = await crypto.subtle.sign('HMAC', await key(), enc.encode(role));
  return `${role}.${hex(sig)}`;
}
export async function verify(value) {
  if (!value || !process.env.AUTH_SECRET) return null;
  const role = value.split('.')[0];
  if (!['admin', 'gate'].includes(role)) return null;
  return (await sign(role)) === value ? role : null;
}
