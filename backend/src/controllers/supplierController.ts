import { Request, Response } from 'express';
import {
  getAllSuppliersWithRates,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addSupplierRate,
  deleteSupplierRate
} from '../database/supplierStore';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function getSuppliersHandler(req: Request, res: Response) {
  try {
    const data = await getAllSuppliersWithRates();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createSupplierHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, contact_person, phone, location, category, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required.' });
    }
    const supplier = await createSupplier({ name, contact_person, phone, location, category, status });
    return res.json({ success: true, message: 'Supplier partner created successfully.', supplier });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateSupplierHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, contact_person, phone, location, category, status } = req.body;
    const updated = await updateSupplier(id, { name, contact_person, phone, location, category, status });
    if (!updated) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }
    return res.json({ success: true, message: 'Supplier details updated successfully.', supplier: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteSupplierHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await deleteSupplier(id);
    return res.json({ success: true, message: 'Supplier deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function addSupplierRateHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params; // supplierId
    const { material_name, purchase_rate, unit, effective_date, supplier_name } = req.body;
    if (!material_name || purchase_rate === undefined) {
      return res.status(400).json({ error: 'material_name and purchase_rate are required.' });
    }
    const rate = await addSupplierRate(id, { material_name, purchase_rate, unit, effective_date, supplier_name });
    return res.json({ success: true, message: 'Supplier rate entry added successfully.', rate });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteSupplierRateHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { rateId } = req.params;
    await deleteSupplierRate(rateId);
    return res.json({ success: true, message: 'Supplier rate entry deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
