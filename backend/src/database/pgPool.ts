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

export const initializePgDatabaseSchema = async () => {
  if (!isPgConnected) return;

  try {
    // 1. Categories Table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        vat_rate DECIMAL(5,2) DEFAULT 13.00,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Column Schemas Table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS column_schemas (
        id VARCHAR(100) PRIMARY KEY,
        table_id VARCHAR(100) NOT NULL,
        key VARCHAR(100) NOT NULL,
        label VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        access_role VARCHAR(100) DEFAULT 'All Roles',
        visible BOOLEAN DEFAULT true,
        required BOOLEAN DEFAULT false,
        description TEXT,
        is_custom BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Seed initial categories if empty
    const catRes = await pgPool.query('SELECT COUNT(*) FROM categories');
    if (Number(catRes.rows[0].count) === 0) {
      await pgPool.query(`
        INSERT INTO categories (id, name, code, status, vat_rate, is_default) VALUES
        ('cat_1', 'Eco Panels', 'ECO', 'Active', 13.00, true),
        ('cat_2', 'Modular Components', 'MOD', 'Active', 13.00, false),
        ('cat_3', 'Accessories', 'ACC', 'Active', 13.00, false),
        ('cat_4', 'Services', 'SRV', 'Active', 13.00, false),
        ('cat_5', 'Raw Materials', 'RAW', 'Active', 13.00, false);
      `);
      console.log('✅ Seeded initial categories into PostgreSQL database "bela_rate_db"');
    }
  } catch (err) {
    console.error('PostgreSQL table initialization notice:', err);
  }
};

// Test DB Connection
pgPool.connect((err, client, release) => {
  if (err) {
    console.log('ℹ️ Local PostgreSQL server connection deferred (using Enterprise In-Memory Database store with SQL schema sync)');
    isPgConnected = false;
  } else {
    isPgConnected = true;
    console.log('✅ PostgreSQL Enterprise Connection Pool active on port 5432 (Database: bela_rate_db)!');
    release();
    initializePgDatabaseSchema();
  }
});

export const getPgStatus = () => ({
  connected: isPgConnected,
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'bela_rate_db',
  client: process.env.DB_CLIENT || 'pg'
});

