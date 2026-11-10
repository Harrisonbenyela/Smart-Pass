import './globals.css';

export const metadata = { title: 'SMARTPASS', description: 'QR student ID and gate attendance' };
export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
