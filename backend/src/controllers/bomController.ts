import { Request, Response } from 'express';
import { getBOMByProductId, saveBOMRecipe, ProductBOMRecipe } from '../database/bomStore';

export async function getBOMCalculationHandler(req: Request, res: Response) {
  try {
    const productId = req.params.productId || 'prod_eps_50';
    const bomData = await getBOMByProductId(productId);
    return res.json(bomData);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch BOM calculation.', details: err.message });
  }
}

export async function saveBOMRecipeHandler(req: Request, res: Response) {
  try {
    const { product_id, product_name, materials, factory_overhead_percent, labor_cost_per_unit, profit_margin_percent } = req.body;
    if (!product_id || !materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'product_id and materials array are required.' });
    }

    const recipePayload: ProductBOMRecipe = {
      product_id,
      product_name: product_name || 'Bela Manufacturing Product',
      factory_overhead_percent: Number(factory_overhead_percent) || 0,
      labor_cost_per_unit: Number(labor_cost_per_unit) || 0,
      profit_margin_percent: Number(profit_margin_percent) || 0,
      materials: materials.map((m: any) => ({
        id: m.id || ('mat_' + Math.random().toString(36).substring(2, 9)),
        material_name: m.material_name || 'Raw Ingredient',
        qty_per_m2: Number(m.qty_per_m2) || 0,
        unit: m.unit || 'units',
        unit_cost: Number(m.unit_cost) || 0
      }))
    };

    const savedBOM = await saveBOMRecipe(recipePayload);
    return res.json({
      success: true,
      message: `Manufacturing BOM recipe for ${savedBOM.product_name} saved to PostgreSQL database!`,
      bom: savedBOM
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save BOM recipe to DB.', details: err.message });
  }
}
