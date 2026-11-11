import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Tagged template sql helper
export async function sql(strings, ...values) {
  const client = await pool.connect();
  try {
    let query = '';
    for (let i = 0; i < strings.length; i++) {
      query += strings[i];
      if (i < values.length) {
        query += `$${i + 1}`;
      }
    }
    const result = await client.query(query, values);
    return result.rows;
  } finally {
    client.release();
  }
}

export const TZ = 'Africa/Douala';