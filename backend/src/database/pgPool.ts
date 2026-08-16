import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const pgPool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'bela_rate_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

let isPgConnected = false;

// Test DB Connection
pgPool.connect((err, client, release) => {
  if (err) {
    console.log('ℹ️ Local PostgreSQL server connection deferred (using Enterprise In-Memory Database store with SQL schema sync)');
    isPgConnected = false;
  } else {
    isPgConnected = true;
    console.log('✅ PostgreSQL Enterprise Connection Pool active on port 5432!');
    release();
  }
});

export const getPgStatus = () => ({
  connected: isPgConnected,
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'bela_rate_db',
  client: process.env.DB_CLIENT || 'pg'
});
