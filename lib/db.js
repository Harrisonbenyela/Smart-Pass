import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);
// "Today" is always calculated in the school's timezone. Change it here if needed.
export const TZ = 'Africa/Douala';
