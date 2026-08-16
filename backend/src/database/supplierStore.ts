import { pgPool } from './pgPool';

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  location: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface SupplierRate {
  id: string;
  supplier_id: string;
  supplier_name: string;
  material_name: string;
  purchase_rate: number;
  unit: string;
  effective_date: string;
  created_at?: string;
}

const SEEDED_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Shivam Cement Pvt Ltd',
    contact_person: 'Ramesh Adhikari',
    phone: '+977-9851023456',
    location: 'Hetauda Industrial Estate',
    category: 'Cement & Binding Materials',
    status: 'ACTIVE'
  },
  {
    id: 'sup_2',
    name: 'Hetauda Steel Industries',
    contact_person: 'Suresh Shrestha',
    phone: '+977-9841234567',
    location: 'Hetauda, Makwanpur',
    category: 'Steel & Metal Framing',
    status: 'ACTIVE'
  },
  {
    id: 'sup_3',
    name: 'Everest EPS Resins Nepal',
    contact_person: 'Bikram Thapa',
    phone: '+977-9801122334',
    location: 'Birgunj Dry Port Zone',
    category: 'Polystyrene & Raw Resins',
    status: 'ACTIVE'
  },
  {
    id: 'sup_4',
    name: 'Panchakanya Polymers',
    contact_person: 'Deepak Sharma',
    phone: '+977-9851199887',
    location: 'Kathmandu Industrial Area',
    category: 'Wire Mesh & Fasteners',
    status: 'ACTIVE'
  }
];

const SEEDED_SUPPLIER_RATES: SupplierRate[] = [
  {
    id: 'srate_1',
    supplier_id: 'sup_1',
    supplier_name: 'Shivam Cement Pvt Ltd',
    material_name: 'OPC 53 Grade Cement',
    purchase_rate: 720,
    unit: 'Bag (50kg)',
    effective_date: '2026-08-01'
  },
  {
    id: 'srate_2',
    supplier_id: 'sup_2',
    supplier_name: 'Hetauda Steel Industries',
    material_name: 'Fe 500 TMT Steel Rebar 12mm',
    purchase_rate: 98,
    unit: 'kg',
    effective_date: '2026-08-01'
  },
  {
    id: 'srate_3',
    supplier_id: 'sup_3',
    supplier_name: 'Everest EPS Resins Nepal',
    material_name: 'Expandable Polystyrene EPS Beads',
    purchase_rate: 210,
    unit: 'kg',
    effective_date: '2026-08-01'
  },
  {
    id: 'srate_4',
    supplier_id: 'sup_4',
    supplier_name: 'Panchakanya Polymers',
    material_name: 'GI Wire Mesh 3mm (Galvanized)',
    purchase_rate: 145,
    unit: 'm²',
    effective_date: '2026-08-01'
  }
];

let inMemorySuppliers: Supplier[] = [...SEEDED_SUPPLIERS];
let inMemoryRates: SupplierRate[] = [...SEEDED_SUPPLIER_RATES];

export async function initializeSupplierDatabaseTables() {
  try {
    const client = await pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS suppliers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(255),
          phone VARCHAR(50),
          location VARCHAR(255),
          category VARCHAR(100),
          status VARCHAR(20) DEFAULT 'ACTIVE',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS supplier_rates (
          id VARCHAR(50) PRIMARY KEY,
          supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
          supplier_name VARCHAR(255),
          material_name VARCHAR(255) NOT NULL,
          purchase_rate NUMERIC NOT NULL,
          unit VARCHAR(50) NOT NULL,
          effective_date VARCHAR(50),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const check = await client.query('SELECT COUNT(*) FROM suppliers');
      if (parseInt(check.rows[0].count, 10) === 0) {
        for (const s of SEEDED_SUPPLIERS) {
          await client.query(
            `INSERT INTO suppliers (id, name, contact_person, phone, location, category, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [s.id, s.name, s.contact_person, s.phone, s.location, s.category, s.status, new Date().toISOString()]
          );
        }

        for (const r of SEEDED_SUPPLIER_RATES) {
          await client.query(
            `INSERT INTO supplier_rates (id, supplier_id, supplier_name, material_name, purchase_rate, unit, effective_date, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [r.id, r.supplier_id, r.supplier_name, r.material_name, r.purchase_rate, r.unit, r.effective_date, new Date().toISOString()]
          );
        }
      }
      console.log('✅ PostgreSQL Enterprise Supplier Rate Tables Initialized successfully!');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.log('ℹ️ PostgreSQL Supplier Store fallback active (Using In-Memory Store)');
  }
}

export async function getAllSuppliersWithRates(): Promise<{ suppliers: Supplier[]; rates: SupplierRate[] }> {
  try {
    const sRes = await pgPool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    const rRes = await pgPool.query('SELECT * FROM supplier_rates ORDER BY created_at DESC');
    if (sRes.rows.length > 0) {
      const dbRates = rRes.rows.map((r) => ({
        ...r,
        purchase_rate: parseFloat(r.purchase_rate)
      }));
      return { suppliers: sRes.rows, rates: dbRates };
    }
  } catch (e) {
    // fallback
  }
  return { suppliers: inMemorySuppliers, rates: inMemoryRates };
}

export async function createSupplier(supData: Partial<Supplier>): Promise<Supplier> {
  const newSupplier: Supplier = {
    id: supData.id || `sup_${Date.now()}`,
    name: supData.name || 'New Supplier Partner',
    contact_person: supData.contact_person || '',
    phone: supData.phone || '',
    location: supData.location || 'Kathmandu, Nepal',
    category: supData.category || 'Raw Materials',
    status: supData.status || 'ACTIVE',
    created_at: new Date().toISOString()
  };

  try {
    await pgPool.query(
      `INSERT INTO suppliers (id, name, contact_person, phone, location, category, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newSupplier.id,
        newSupplier.name,
        newSupplier.contact_person,
        newSupplier.phone,
        newSupplier.location,
        newSupplier.category,
        newSupplier.status,
        newSupplier.created_at
      ]
    );
  } catch (e) {
    // fallback
  }

  inMemorySuppliers.unshift(newSupplier);
  return newSupplier;
}

export async function updateSupplier(id: string, supData: Partial<Supplier>): Promise<Supplier | null> {
  try {
    await pgPool.query(
      `UPDATE suppliers SET name = $1, contact_person = $2, phone = $3, location = $4, category = $5, status = $6 WHERE id = $7`,
      [supData.name, supData.contact_person, supData.phone, supData.location, supData.category, supData.status, id]
    );
  } catch (e) {
    // fallback
  }

  const idx = inMemorySuppliers.findIndex((s) => s.id === id);
  if (idx !== -1) {
    inMemorySuppliers[idx] = { ...inMemorySuppliers[idx], ...supData };
    return inMemorySuppliers[idx];
  }
  return null;
}

export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    await pgPool.query('DELETE FROM suppliers WHERE id = $1', [id]);
  } catch (e) {
    // fallback
  }

  inMemorySuppliers = inMemorySuppliers.filter((s) => s.id !== id);
  inMemoryRates = inMemoryRates.filter((r) => r.supplier_id !== id);
  return true;
}

export async function addSupplierRate(supplierId: string, rateData: Partial<SupplierRate>): Promise<SupplierRate> {
  let supName = 'Supplier Partner';
  try {
    const sCheck = await pgPool.query('SELECT name FROM suppliers WHERE id = $1', [supplierId]);
    if (sCheck.rows.length > 0) {
      supName = sCheck.rows[0].name;
    }
  } catch (e) {
    const sMem = inMemorySuppliers.find((s) => s.id === supplierId);
    if (sMem) supName = sMem.name;
  }

  const newRate: SupplierRate = {
    id: `srate_${Date.now()}`,
    supplier_id: supplierId,
    supplier_name: rateData.supplier_name || supName,
    material_name: rateData.material_name || 'Raw Ingredient',
    purchase_rate: Number(rateData.purchase_rate) || 0,
    unit: rateData.unit || 'kg',
    effective_date: rateData.effective_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  try {
    await pgPool.query(
      `INSERT INTO supplier_rates (id, supplier_id, supplier_name, material_name, purchase_rate, unit, effective_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newRate.id,
        newRate.supplier_id,
        newRate.supplier_name,
        newRate.material_name,
        newRate.purchase_rate,
        newRate.unit,
        newRate.effective_date,
        newRate.created_at
      ]
    );
  } catch (e) {
    // fallback
  }

  inMemoryRates.unshift(newRate);
  return newRate;
}

export async function deleteSupplierRate(rateId: string): Promise<boolean> {
  try {
    await pgPool.query('DELETE FROM supplier_rates WHERE id = $1', [rateId]);
  } catch (e) {
    // fallback
  }

  inMemoryRates = inMemoryRates.filter((r) => r.id !== rateId);
  return true;
}
