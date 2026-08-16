import { pgPool } from './pgPool';

export interface RawMaterialItem {
  id: string;
  material_name: string;
  qty_per_m2: number;
  unit: string;
  unit_cost: number;
  total?: number;
}

export interface ProductBOMRecipe {
  product_id: string;
  product_name: string;
  materials: RawMaterialItem[];
  factory_overhead_percent: number;
  labor_cost_per_unit: number;
  profit_margin_percent: number;
  raw_materials_cost?: number;
  labor_cost?: number;
  factory_overhead?: number;
  total_factory_cost?: number;
  profit_margin?: number;
  suggested_selling_rate?: number;
  updated_at?: string;
}

const DEFAULT_BOM_MAP: Record<string, ProductBOMRecipe> = {
  prod_eps_50: {
    product_id: 'prod_eps_50',
    product_name: 'EPS Cement Sandwich Panel 50mm',
    factory_overhead_percent: 6,
    labor_cost_per_unit: 140,
    profit_margin_percent: 15,
    materials: [
      { id: 'mat_cem', material_name: 'OPC Cement 53 Grade', qty_per_m2: 0.45, unit: 'bag', unit_cost: 950 },
      { id: 'mat_eps', material_name: 'EPS Polymer Beads & Adhesive', qty_per_m2: 3.2, unit: 'kg', unit_cost: 185 },
      { id: 'mat_board', material_name: 'Fiber Cement Board (4.5mm Both Sides)', qty_per_m2: 2.0, unit: 'm²', unit_cost: 380 },
      { id: 'mat_water', material_name: 'Water & Chemical Curing Additive', qty_per_m2: 1.0, unit: 'lot', unit_cost: 65 }
    ]
  },
  prod_eps_75: {
    product_id: 'prod_eps_75',
    product_name: 'EPS Cement Sandwich Panel 75mm',
    factory_overhead_percent: 7,
    labor_cost_per_unit: 165,
    profit_margin_percent: 15,
    materials: [
      { id: 'mat_cem', material_name: 'OPC Cement 53 Grade', qty_per_m2: 0.60, unit: 'bag', unit_cost: 950 },
      { id: 'mat_eps', material_name: 'EPS Polymer Beads & Adhesive', qty_per_m2: 4.5, unit: 'kg', unit_cost: 185 },
      { id: 'mat_board', material_name: 'Fiber Cement Board (4.5mm Both Sides)', qty_per_m2: 2.0, unit: 'm²', unit_cost: 380 },
      { id: 'mat_water', material_name: 'Water & Chemical Curing Additive', qty_per_m2: 1.0, unit: 'lot', unit_cost: 80 }
    ]
  },
  prod_eps_100: {
    product_id: 'prod_eps_100',
    product_name: 'EPS Cement Sandwich Panel 100mm',
    factory_overhead_percent: 8,
    labor_cost_per_unit: 190,
    profit_margin_percent: 15,
    materials: [
      { id: 'mat_cem', material_name: 'OPC Cement 53 Grade', qty_per_m2: 0.80, unit: 'bag', unit_cost: 950 },
      { id: 'mat_eps', material_name: 'EPS Polymer Beads & Adhesive', qty_per_m2: 6.0, unit: 'kg', unit_cost: 185 },
      { id: 'mat_board', material_name: 'Fiber Cement Board (4.5mm Both Sides)', qty_per_m2: 2.0, unit: 'm²', unit_cost: 380 },
      { id: 'mat_water', material_name: 'Water & Chemical Curing Additive', qty_per_m2: 1.0, unit: 'lot', unit_cost: 100 }
    ]
  }
};

let inMemoryBOMMap: Record<string, ProductBOMRecipe> = { ...DEFAULT_BOM_MAP };

export async function initializeBOMDatabaseTables() {
  try {
    const client = await pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS boms (
          product_id VARCHAR(64) PRIMARY KEY,
          product_name VARCHAR(255) NOT NULL,
          factory_overhead_percent NUMERIC DEFAULT 6,
          labor_cost_per_unit NUMERIC DEFAULT 140,
          profit_margin_percent NUMERIC DEFAULT 15,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS bom_items (
          id VARCHAR(64) PRIMARY KEY,
          product_id VARCHAR(64) NOT NULL REFERENCES boms(product_id) ON DELETE CASCADE,
          material_name VARCHAR(255) NOT NULL,
          qty_per_m2 NUMERIC NOT NULL,
          unit VARCHAR(50) NOT NULL,
          unit_cost NUMERIC NOT NULL
        );
      `);

      // Seed initial BOMs if empty
      for (const pid of Object.keys(DEFAULT_BOM_MAP)) {
        const check = await client.query('SELECT product_id FROM boms WHERE product_id = $1', [pid]);
        if (check.rows.length === 0) {
          const recipe = DEFAULT_BOM_MAP[pid];
          await client.query(
            `INSERT INTO boms (product_id, product_name, factory_overhead_percent, labor_cost_per_unit, profit_margin_percent, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [recipe.product_id, recipe.product_name, recipe.factory_overhead_percent, recipe.labor_cost_per_unit, recipe.profit_margin_percent, new Date().toISOString()]
          );

          for (const item of recipe.materials) {
            await client.query(
              `INSERT INTO bom_items (id, product_id, material_name, qty_per_m2, unit, unit_cost)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [item.id, recipe.product_id, item.material_name, item.qty_per_m2, item.unit, item.unit_cost]
            );
          }
        }
      }
      console.log('✅ PostgreSQL Enterprise Manufacturing BOM Tables Initialized successfully!');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.log('ℹ️ PostgreSQL BOM Store fallback active (Using In-Memory BOM Store)');
  }
}

export function computeBOMCalculations(recipe: ProductBOMRecipe): ProductBOMRecipe {
  const materialsWithTotal = recipe.materials.map((m) => {
    const total = Math.round(Number(m.qty_per_m2) * Number(m.unit_cost));
    return { ...m, total };
  });

  const raw_materials_cost = materialsWithTotal.reduce((sum, m) => sum + (m.total || 0), 0);
  const labor_cost = Number(recipe.labor_cost_per_unit) || 0;
  const factory_overhead = Math.round((raw_materials_cost + labor_cost) * (Number(recipe.factory_overhead_percent) / 100));
  const total_factory_cost = raw_materials_cost + labor_cost + factory_overhead;
  const profit_margin = Math.round(total_factory_cost * (Number(recipe.profit_margin_percent) / 100));
  const suggested_selling_rate = total_factory_cost + profit_margin;

  return {
    ...recipe,
    materials: materialsWithTotal,
    raw_materials_cost,
    labor_cost,
    factory_overhead,
    total_factory_cost,
    profit_margin,
    suggested_selling_rate
  };
}

export async function getBOMByProductId(productId: string): Promise<ProductBOMRecipe> {
  try {
    const bomRes = await pgPool.query('SELECT * FROM boms WHERE product_id = $1', [productId]);
    if (bomRes.rows.length > 0) {
      const bRow = bomRes.rows[0];
      const itemsRes = await pgPool.query('SELECT id, material_name, qty_per_m2, unit, unit_cost FROM bom_items WHERE product_id = $1', [productId]);
      const recipe: ProductBOMRecipe = {
        product_id: bRow.product_id,
        product_name: bRow.product_name,
        factory_overhead_percent: Number(bRow.factory_overhead_percent),
        labor_cost_per_unit: Number(bRow.labor_cost_per_unit),
        profit_margin_percent: Number(bRow.profit_margin_percent),
        updated_at: bRow.updated_at,
        materials: itemsRes.rows.map((r) => ({
          id: r.id,
          material_name: r.material_name,
          qty_per_m2: Number(r.qty_per_m2),
          unit: r.unit,
          unit_cost: Number(r.unit_cost)
        }))
      };
      return computeBOMCalculations(recipe);
    }
  } catch (e) {
    // fallback
  }

  const recipe = inMemoryBOMMap[productId] || {
    product_id: productId,
    product_name: 'Custom Manufacturing Product',
    factory_overhead_percent: 6,
    labor_cost_per_unit: 140,
    profit_margin_percent: 15,
    materials: [
      { id: 'mat_cem', material_name: 'OPC Cement 53 Grade', qty_per_m2: 0.45, unit: 'bag', unit_cost: 950 },
      { id: 'mat_eps', material_name: 'EPS Polymer Beads & Adhesive', qty_per_m2: 3.2, unit: 'kg', unit_cost: 185 }
    ]
  };

  return computeBOMCalculations(recipe);
}

export async function saveBOMRecipe(recipe: ProductBOMRecipe): Promise<ProductBOMRecipe> {
  const updated_at = new Date().toISOString();
  try {
    await pgPool.query(
      `INSERT INTO boms (product_id, product_name, factory_overhead_percent, labor_cost_per_unit, profit_margin_percent, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (product_id) DO UPDATE SET
       factory_overhead_percent = EXCLUDED.factory_overhead_percent,
       labor_cost_per_unit = EXCLUDED.labor_cost_per_unit,
       profit_margin_percent = EXCLUDED.profit_margin_percent,
       updated_at = EXCLUDED.updated_at`,
      [recipe.product_id, recipe.product_name, recipe.factory_overhead_percent, recipe.labor_cost_per_unit, recipe.profit_margin_percent, updated_at]
    );

    // Re-insert items
    await pgPool.query('DELETE FROM bom_items WHERE product_id = $1', [recipe.product_id]);

    for (const item of recipe.materials) {
      const itemId = item.id || ('mat_' + Math.random().toString(36).substring(2, 9));
      await pgPool.query(
        `INSERT INTO bom_items (id, product_id, material_name, qty_per_m2, unit, unit_cost)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [itemId, recipe.product_id, item.material_name, item.qty_per_m2, item.unit, item.unit_cost]
      );
    }
  } catch (e) {
    // fallback
  }

  inMemoryBOMMap[recipe.product_id] = { ...recipe, updated_at };
  return computeBOMCalculations(recipe);
}
