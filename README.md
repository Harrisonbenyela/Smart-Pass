# SMARTPASS

QR-code student ID cards and gate attendance. Next.js 14 (App Router) + Tailwind + Neon Postgres, hosted on Vercel.

## Features
- **Register:** upload an Excel/CSV list (column `Name`), choose the class, every student gets a unique random QR token.
- **Students & Cards:** per-class list, add photos, print QR cards (or "Save as PDF" from the print dialog).
- **Gate Scanner (phone):** rear camera via `html5-qrcode`; shows name, class and photo; logs IN/OUT (auto-toggle or forced).
- **Dashboard:** Total registered, Present today, Absent, Currently on campus, latest scans, and CSV/Excel export for any date.
- Two logins: `admin` (everything) and `gate` (scanner only).

## 1. Database (Neon)
1. Create a project at neon.tech and copy the **pooled** connection string.
2. Open the SQL Editor and run everything in `schema.sql`.

## 2. Run locally
```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, passwords and AUTH_SECRET
npm run dev                  # http://localhost:3000
```
(The camera works on `localhost`; on a phone it needs the https Vercel link.)

## 3. Deploy
1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project**, import the repo.
3. Add the four environment variables from `.env.example` (Settings → Environment Variables), then deploy.
4. Open the Vercel link on the gate phone, sign in as **Gate keeper**, and allow camera access.

## Where things live
- `app/api/*` – server routes (students, scan, dashboard, export, login)
- `app/(app)/*` – the four pages · `components/QRCard.js` – the ID card design
- `middleware.js` – login protection · `lib/db.js` – database + school timezone (`Africa/Douala`)

## Notes
- Photos are stored as small (160px) JPEGs inside the database, fine for a pilot. For the whole school, move them to Vercel Blob.
- Neon's free database sleeps when idle, so the first scan after a quiet period can be slow.
- This holds minors' data: keep the passwords strong and get the school's written consent.
