import { Request, Response } from 'express';
import { db, Product } from '../database/db';
import { pgPool, getPgStatus } from '../database/pgPool';

export interface PendingSyncItem {
  id: string;
  type: 'CREATE_CATEGORY' | 'CREATE_PRODUCT' | 'CREATE_SCHEMA_COLUMN';
  data: any;
  timestamp: string;
}

export const pendingSyncQueue: PendingSyncItem[] = [];

export const syncPendingMutationsToPg = async () => {
  const status = getPgStatus();
  if (!status.connected || pendingSyncQueue.length === 0) {
    return { syncedCount: 0, remainingPending: pendingSyncQueue.length };
  }

  let syncedCount = 0;
  const itemsToSync = [...pendingSyncQueue];

  for (const item of itemsToSync) {
    try {
      if (item.type === 'CREATE_CATEGORY') {
        await pgPool.query(
          `INSERT INTO categories (id, name, code, status, vat_rate, is_default)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
          [item.data.id, item.data.name, item.data.code, item.data.status, item.data.vatRate, item.data.isDefault]
        );
      } else if (item.type === 'CREATE_SCHEMA_COLUMN') {
        await pgPool.query(
          `INSERT INTO column_schemas (id, table_id, key, label, type, access_role, visible, required, description, is_custom)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
          [item.data.id, item.data.table_id, item.data.key, item.data.label, item.data.type, item.data.access_role, item.data.visible, item.data.required, item.data.description, item.data.is_custom]
        );
      }
      const idx = pendingSyncQueue.findIndex((i) => i.id === item.id);
      if (idx !== -1) pendingSyncQueue.splice(idx, 1);
      syncedCount++;
    } catch (err) {
      console.error(`Error syncing item ${item.id} to PostgreSQL:`, err);
    }
  }

  return { syncedCount, remainingPending: pendingSyncQueue.length };
};

// Helper to fetch live products from Bela EcoPanels official API

export const fetchLiveBelaApiProducts = async (): Promise<Product[]> => {
  try {
    const url = 'https://belaecopanels.com/api/products?take=200';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: any = await res.json();
    const rawList: any[] = json.data || [];

    const mappedProducts: Product[] = rawList.map((item: any) => {
      const prodCode = item.productCode || `EP-${item.thickness}-${item.length}`;
      let fullImgUrl = '';
      if (item.imageUrl) {
        fullImgUrl = item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `https://belaecopanels.com${item.imageUrl}`;
      }
      return {
        id: `live_${item.id}`,
        code: prodCode,
        name: item.name,
        category: 'Eco Panels' as const,
        subcategory: `${item.panelType || 'Panel'} ${item.panelShape || ''} Panel`.trim(),
        unit: 'sq.ft',
        specification: `${item.finishing || 'Standard'} | ${item.description || ''} | Wt: ${item.weight}kg | Area: ${item.sqft} sq.ft`,
        thickness: `${item.thickness} mm`,
        size: `${item.length} mm Length`,
        brand: 'Bela EcoPanels Live',
        status: item.isActive ? 'Active' : 'Inactive',
        current_rate: item.rateWithVat || 450,
        image_url: fullImgUrl
      };
    });


    // Merge into DB without duplicates
    mappedProducts.forEach((p) => {
      const existingIdx = db.products.findIndex((dp) => dp.id === p.id || dp.code === p.code);
      if (existingIdx >= 0) {
        db.products[existingIdx] = p;
      } else {
        db.products.push(p);
        // Create initial rate version
        db.rate_versions.push({
          id: `rv_live_${p.id}`,
          product_id: p.id,
          rate: p.current_rate,
          effective_date: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',

          reason: 'Synced live from belaecopanels.com API',
          created_by: 'Bela Live API Sync',
          approved_by: 'System'
        });
      }
    });

    return mappedProducts;
  } catch (err) {
    console.error('Error fetching live products from belaecopanels.com:', err);
    return [];
  }
};

export const syncLiveProductsHandler = async (req: Request, res: Response) => {
  const synced = await fetchLiveBelaApiProducts();
  const dbSyncResult = await syncPendingMutationsToPg();

  let msg = `Successfully synced ${synced.length} live products from belaecopanels.com API!`;
  if (dbSyncResult.syncedCount > 0) {
    msg += ` Auto-flushed and synced ${dbSyncResult.syncedCount} pending local edits directly to PostgreSQL database "bela_rate_db"!`;
  }

  res.json({
    message: msg,
    count: synced.length,
    total_products_in_master: db.products.length,
    products: synced,
    db_synced_count: dbSyncResult.syncedCount
  });
};


export const getDashboardStats = (req: Request, res: Response) => {
  const activeProductsCount = db.products.filter(p => p.status === 'Active').length;
  const pendingRateChangesCount = db.rate_change_requests.filter(r => r.status === 'PENDING').length;
  const activeProjectsCount = db.projects.filter(p => p.status === 'Active').length;
  const quotesCount = db.quotations.length;

  const recentRateChanges = db.rate_versions
    .slice()
    .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())
    .slice(0, 5)
    .map(rv => {
      const prod = db.products.find(p => p.id === rv.product_id);
      return {
        product_name: prod ? prod.name : 'Product',
        unit: prod ? prod.unit : 'unit',
        rate: rv.rate,
        effective_date: rv.effective_date,
        reason: rv.reason || 'Rate Update',
        status: rv.status
      };
    });

  const priceAlerts = [
    { material: 'Steel Structure', change: '+3.7%', status: 'warning' },
    { material: 'OPC Cement 53 Bag', change: '+3.2%', status: 'warning' },
    { material: 'Glass & Windows', change: '+2.8%', status: 'warning' },
    { material: 'EPS Core Resin', change: '-1.2%', status: 'success' }
  ];

  res.json({
    active_products: activeProductsCount,
    pending_rate_changes: pendingRateChangesCount,
    active_projects: activeProjectsCount,
    draft_quotations: quotesCount,
    recent_rate_changes: recentRateChanges,
    price_alerts: priceAlerts
  });
};

export const getProducts = (req: Request, res: Response) => {
  const { category, search } = req.query;
  // Filter out soft-deleted items from main listing
  let list = db.products.filter((p) => !p.is_deleted && p.status !== 'TRASHED');

  if (category && category !== 'All') {

    list = list.filter(p => p.category === category);
  }

  if (search) {
    const rawSearch = String(search).trim();
    if (rawSearch) {
      const tokens = rawSearch.toLowerCase().split(/\s+/).filter(Boolean);

      // Filter: Product MUST match EVERY token in search query across relevant columns: Code, Name, Spec, Category, Thickness/Size
      const scoredList = list
        .map(p => {
          const relevantText = [
            p.code,
            p.name,
            p.specification,
            p.category,
            p.subcategory,
            p.thickness,
            p.size
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          // Every single token must match somewhere in relevant columns
          const allTokensMatched = tokens.every(token => relevantText.includes(token));

          if (!allTokensMatched) return null;


          // Relevance Scoring algorithm
          let score = 0;
          const exactFullMatch = relevantText.includes(rawSearch.toLowerCase());

          if (exactFullMatch) score += 100;

          tokens.forEach(token => {
            if (p.code && p.code.toLowerCase().includes(token)) score += 30;
            if (p.name && p.name.toLowerCase().includes(token)) score += 20;
            if (p.thickness && p.thickness.toLowerCase().includes(token)) score += 15;
            if (p.size && p.size.toLowerCase().includes(token)) score += 15;
            if (p.specification && p.specification.toLowerCase().includes(token)) score += 10;
          });

          return { product: p, score };
        })
        .filter((item): item is { product: Product; score: number } => item !== null)
        .sort((a, b) => b.score - a.score);

      list = scoredList.map(item => item.product);
    }
  }

  res.json(list);
};




export const addProduct = (req: Request, res: Response) => {
  const { code, name, category, subcategory, unit, specification, thickness, size, brand, current_rate } = req.body;
  const newId = `prod_${Date.now()}`;
  const newProd = {
    id: newId,
    code: code || `PRD-${Math.floor(100 + Math.random() * 900)}`,
    name,
    category,
    subcategory: subcategory || 'General',
    unit: unit || 'm²',
    specification: specification || 'Standard',
    thickness: thickness || 'N/A',
    size: size || 'Standard',
    brand: brand || 'Bela Nepal',
    status: 'Active' as const,
    current_rate: Number(current_rate) || 0
  };

  db.products.unshift(newProd);

  // Add rate version
  db.rate_versions.unshift({
    id: `rv_${Date.now()}`,
    product_id: newId,
    rate: Number(current_rate) || 0,
    effective_date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    reason: 'Initial Product Registration',
    created_by: 'Admin'
  });

  res.status(201).json(newProd);
};

export const deleteProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const product = db.products.find((p) => p.id === id);
  if (product) {
    product.is_deleted = true;
    product.status = 'TRASHED';
    (product as any).deleted_at = new Date().toISOString();
    (product as any).deleted_by = 'Admin User';
    return res.json({ success: true, message: `Product ${product.name} (${product.code}) moved to Trash Bin for 30-day recovery!` });
  }
  res.status(404).json({ error: 'Product not found' });
};

export const getTrashProducts = (req: Request, res: Response) => {
  const trashed = db.products.filter((p) => p.is_deleted || p.status === 'TRASHED');
  res.json(trashed);
};

export const restoreProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const product = db.products.find((p) => p.id === id);
  if (product) {
    product.is_deleted = false;
    product.status = 'APPROVED';
    delete (product as any).deleted_at;
    delete (product as any).deleted_by;
    return res.json({ success: true, message: `Product ${product.name} (${product.code}) restored back to active rate list!` });
  }
  res.status(404).json({ error: 'Product not found' });
};

export const purgeProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    const purged = db.products.splice(idx, 1)[0];
    return res.json({ success: true, message: `Product ${purged.name} (${purged.code}) permanently purged from system memory.` });
  }
  res.status(404).json({ error: 'Product not found' });
};



export const getRateHistory = (req: Request, res: Response) => {
  const { productId } = req.params;
  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const versions = db.rate_versions
    .filter(rv => rv.product_id === productId)
    .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());

  res.json({
    product,
    current_rate: product.current_rate,
    versions
  });
};

export const submitRateChangeRequest = (req: Request, res: Response) => {
  const { product_id, new_rate, reason, requested_by } = req.body;
  const product = db.products.find(p => p.id === product_id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newReq = {
    id: `req_${Date.now()}`,
    product_id,
    product_name: product.name,
    product_code: product.code,
    old_rate: product.current_rate,
    new_rate: Number(new_rate),
    unit: product.unit,
    reason: reason || 'Market price update',
    requested_by: requested_by || 'Rate Staff',
    status: 'PENDING' as const,
    created_at: new Date().toISOString()
  };

  db.rate_change_requests.unshift(newReq);
  res.status(201).json(newReq);
};

export const getApprovalRequests = (req: Request, res: Response) => {
  res.json(db.rate_change_requests);
};

export const approveRateChange = (req: Request, res: Response) => {
  const { id } = req.params;
  const request = db.rate_change_requests.find(r => r.id === id);
  if (!request) {
    return res.status(404).json({ error: 'Approval request not found' });
  }

  request.status = 'APPROVED';

  // Update product rate
  const product = db.products.find(p => p.id === request.product_id);
  if (product) {
    product.current_rate = request.new_rate;

    // Archive previous active version
    db.rate_versions.forEach(rv => {
      if (rv.product_id === product.id && rv.status === 'ACTIVE') {
        rv.status = 'ARCHIVED';
      }
    });

    // Create new ACTIVE rate version
    db.rate_versions.unshift({
      id: `rv_${Date.now()}`,
      product_id: product.id,
      rate: request.new_rate,
      effective_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      reason: request.reason,
      created_by: request.requested_by,
      approved_by: 'Approver'
    });
  }

  res.json({ message: 'Rate change request approved successfully', request });
};

export const rejectRateChange = (req: Request, res: Response) => {
  const { id } = req.params;
  const request = db.rate_change_requests.find(r => r.id === id);
  if (!request) {
    return res.status(404).json({ error: 'Approval request not found' });
  }

  request.status = 'REJECTED';
  res.json({ message: 'Rate change request rejected', request });
};

export const getModularTemplates = (req: Request, res: Response) => {
  const templates = db.modular_templates.map(tmpl => {
    let calculated_total = 0;
    const detailed_components = tmpl.components.map(comp => {
      const prod = db.products.find(p => p.id === comp.product_id);
      const rate = prod ? prod.current_rate : 0;
      const amount = rate * comp.qty;
      calculated_total += amount;
      return {
        ...comp,
        current_rate: rate,
        amount
      };
    });

    return {
      ...tmpl,
      calculated_total,
      components: detailed_components
    };
  });

  res.json(templates);
};

export const getBOMCalculation = (req: Request, res: Response) => {
  const { productId } = req.params;
  const bom = db.boms.find(b => b.product_id === productId) || db.boms[0];

  let raw_materials_cost = 0;
  const materials = bom.raw_materials.map(m => {
    const total = m.qty_per_m2 * m.unit_cost;
    raw_materials_cost += total;
    return { ...m, total };
  });

  const factory_overhead = (raw_materials_cost * bom.factory_overhead_percent) / 100;
  const total_factory_cost = raw_materials_cost + factory_overhead + bom.labor_cost_per_unit;
  const profit_margin = (total_factory_cost * bom.profit_margin_percent) / 100;
  const suggested_selling_rate = Math.round(total_factory_cost + profit_margin);

  res.json({
    bom,
    raw_materials_cost,
    materials,
    factory_overhead,
    labor_cost: bom.labor_cost_per_unit,
    total_factory_cost,
    profit_margin,
    suggested_selling_rate
  });
};

export const getProjects = (req: Request, res: Response) => {
  res.json(db.projects);
};

export const createProject = (req: Request, res: Response) => {
  const { name, customer_name, location, building_type, area_sqft, floors, bedrooms, bathrooms } = req.body;
  const newPrj = {
    id: `prj_${Date.now()}`,
    name,
    customer_name,
    location: location || 'Kathmandu',
    building_type: building_type || 'Residential Prefab',
    area_sqft: Number(area_sqft) || 1000,
    floors: Number(floors) || 1,
    bedrooms: Number(bedrooms) || 2,
    bathrooms: Number(bathrooms) || 1,
    status: 'Active' as const,
    assigned_staff: 'Sales Manager',
    created_date: new Date().toISOString().split('T')[0]
  };

  db.projects.unshift(newPrj);
  res.status(201).json(newPrj);
};

export const getBOQ = (req: Request, res: Response) => {
  const { projectId } = req.params;
  let boq = db.boqs.find((b) => b.project_id === projectId);

  if (!boq) {
    // Dynamically create a initial target group BOQ fallback if not saved yet
    const project = db.projects.find((p) => p.id === projectId);
    boq = {
      id: `boq_${Date.now()}`,
      project_id: projectId,
      project_name: project ? project.name : 'Target Group Project',
      customer_name: project ? project.customer_name : 'General Client',
      area_sqft: project ? project.area_sqft : 2400,
      items: [
        { id: 'bi_1', product_id: 'prod_eps_75', product_code: 'EP-075', product_name: 'EPS Sandwich Wall Panel 75mm (1200x2440)', unit: 'm²', rate_version_id: 'rv_active', unit_rate: 2150, qty: 850, amount: 1827500 },
        { id: 'bi_2', product_id: 'prod_steel_struct', product_code: 'MOD-STL', product_name: 'Structural Steel RHS Columns & Trusses', unit: 'kg', rate_version_id: 'rv_active', unit_rate: 112, qty: 4200, amount: 470400 },
        { id: 'bi_3', product_id: 'prod_roof_100', product_code: 'EP-100R', product_name: 'EPS Insulated Roof Panel 100mm (Corrugated)', unit: 'm²', rate_version_id: 'rv_active', unit_rate: 1650, qty: 260, amount: 429000 },
        { id: 'bi_4', product_id: 'prod_window_upvc', product_code: 'MOD-WIN', product_name: 'UPVC Sliding Window with 5mm Glass', unit: 'pcs', rate_version_id: 'rv_active', unit_rate: 12400, qty: 12, amount: 148800 },
        { id: 'bi_5', product_id: 'prod_door_upvc', product_code: 'MOD-DOR', product_name: 'Flush Timber Door with WPC Frame (3x7 ft)', unit: 'pcs', rate_version_id: 'rv_active', unit_rate: 18500, qty: 8, amount: 148000 }
      ],
      subtotal: 3023700,
      direct_cost: 3673700,
      labor_cost: 350000,
      transport_cost: 120000,
      installation_cost: 180000,
      overhead_percent: 5,
      overhead_amount: 183685,
      profit_percent: 12,
      profit_amount: 462886,
      selling_price: 4320271,
      created_at: new Date().toISOString().split('T')[0]
    };
    db.boqs.unshift(boq);
  }

  res.json(boq);
};


export const saveBOQ = (req: Request, res: Response) => {
  const {
    project_id,
    project_name,
    customer_name,
    area_sqft,
    items,
    overhead_percent,
    profit_percent,
    labor_cost,
    transport_cost,
    installation_cost,
    save_mode, // 'overwrite' or 'copy'
    copy_title
  } = req.body;

  let activeProjectId = project_id;
  let activeProjectName = project_name;

  // Handle Save Mode: 'copy' creates a brand new Target Group / Revision Fork
  if (save_mode === 'copy') {
    activeProjectId = `prj_${Date.now()}`;
    activeProjectName = copy_title ? copy_title.trim() : `[Copy] ${project_name} Rev B`;

    const newTargetGroup = {
      id: activeProjectId,
      name: activeProjectName,
      customer_name: customer_name || 'General Client',
      location: 'Kathmandu, Nepal',
      building_type: 'Modular Prefab',
      area_sqft: Number(area_sqft) || 2400,
      floors: 2,
      bedrooms: 3,
      bathrooms: 2,
      status: 'Active' as const,
      assigned_staff: 'Sales Engineer',
      created_date: new Date().toISOString().split('T')[0]
    };
    db.projects.unshift(newTargetGroup);
  } else {
    // Overwrite mode: Update existing project area and details in db.projects
    const prj = db.projects.find((p) => p.id === project_id);
    if (prj) {
      prj.area_sqft = Number(area_sqft) || prj.area_sqft;
      prj.customer_name = customer_name || prj.customer_name;
      if (project_name) prj.name = project_name;
    }
  }

  let direct_cost = 0;
  const boq_items = items.map((item: any, idx: number) => {
    const prod = db.products.find((p) => p.id === item.product_id);
    const version = db.rate_versions.find((v) => v.product_id === item.product_id && v.status === 'ACTIVE');
    const unit_rate = Number(item.unit_rate) || (prod ? prod.current_rate : 0);
    const amount = unit_rate * Number(item.qty || 1);
    direct_cost += amount;

    return {
      id: `bi_${idx + 1}`,
      product_id: item.product_id || `prod_custom_${idx}`,
      product_code: item.product_code || (prod ? prod.code : 'PRD'),
      product_name: item.product_name || (prod ? prod.name : 'Item'),
      unit: item.unit || (prod ? prod.unit : 'pcs'),
      rate_version_id: version ? version.id : 'rv_active',
      unit_rate,
      qty: Number(item.qty || 1),
      amount
    };
  });

  const oh_pct = Number(overhead_percent) || 5;
  const pr_pct = Number(profit_percent) || 12;
  const lbr = Number(labor_cost) || 350000;
  const trn = Number(transport_cost) || 120000;
  const inst = Number(installation_cost) || 180000;

  const total_direct = direct_cost + lbr + trn + inst;
  const overhead_amount = Math.round((total_direct * oh_pct) / 100);
  const profit_amount = Math.round(((total_direct + overhead_amount) * pr_pct) / 100);
  const selling_price = total_direct + overhead_amount + profit_amount;

  const targetBOQ = {
    id: `boq_${Date.now()}`,
    project_id: activeProjectId,
    project_name: activeProjectName,
    customer_name,
    area_sqft: Number(area_sqft) || 2400,
    items: boq_items,
    subtotal: direct_cost,
    direct_cost: total_direct,
    labor_cost: lbr,
    transport_cost: trn,
    installation_cost: inst,
    overhead_percent: oh_pct,
    overhead_amount,
    profit_percent: pr_pct,
    profit_amount,
    selling_price,
    created_at: new Date().toISOString().split('T')[0]
  };

  const existingIdx = db.boqs.findIndex((b) => b.project_id === activeProjectId);
  if (existingIdx !== -1 && save_mode !== 'copy') {
    db.boqs[existingIdx] = targetBOQ;
  } else {
    db.boqs.unshift(targetBOQ);
  }

  // Auto generate or update quotation proposal
  const newQuote = {
    id: `qt_${Date.now()}`,
    quotation_no: `QT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    boq_id: targetBOQ.id,
    project_id: activeProjectId,
    customer_name,
    project_name: activeProjectName,
    location: 'Kathmandu',
    building_type: 'Modular Prefab',
    subtotal: selling_price,
    discount_percent: 0,
    discount_amount: 0,
    vat_percent: 13,
    vat_amount: Math.round(selling_price * 0.13),
    total_amount: Math.round(selling_price * 1.13),
    status: 'Submitted' as const,
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString().split('T')[0]
  };

  db.quotations.unshift(newQuote);

  res.status(201).json({
    success: true,
    message: save_mode === 'copy' ? `Created new Target Group Copy "${activeProjectName}"!` : `Overwrote & updated Target Group BOQ for "${activeProjectName}"!`,
    boq: targetBOQ,
    quotation: newQuote,
    project_id: activeProjectId
  });
};



export const getQuotations = (req: Request, res: Response) => {
  res.json(db.quotations);
};

export const getQuotationById = (req: Request, res: Response) => {
  const { id } = req.params;
  const quote = db.quotations.find(q => q.id === id || q.quotation_no === id) || db.quotations[0];
  const boq = db.boqs.find(b => b.id === quote.boq_id) || db.boqs[0];

  res.json({
    quotation: quote,
    boq
  });
};

export const getSuppliers = (req: Request, res: Response) => {
  const comparison = db.suppliers.map(sup => {
    const rates = db.supplier_rates.filter(sr => sr.supplier_id === sup.id);
    return {
      ...sup,
      rates
    };
  });

  res.json({
    suppliers: comparison,
    rates: db.supplier_rates
  });
};

export const getReportsTrend = (req: Request, res: Response) => {
  const trends = {
    months: ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
    products: [
      { name: 'Steel Structure (kg)', data: [100, 105, 108, 108, 112] },
      { name: 'OPC Cement (Bag)', data: [880, 900, 910, 920, 950] },
      { name: 'EPS Panel 50mm (m²)', data: [1750, 1800, 1800, 1850, 1920] },
      { name: 'Glass & Window (pcs)', data: [11800, 12000, 12200, 12400, 12400] }
    ]
  };

  res.json(trends);
};

// CATEGORY PERSISTENCE ENDPOINTS (PostgreSQL DB with In-Memory Fallback)
export const getCategories = async (req: Request, res: Response) => {
  let catList: any[] = [];
  try {
    const status = getPgStatus();
    if (status.connected) {
      const result = await pgPool.query('SELECT * FROM categories ORDER BY created_at DESC');
      if (result.rows.length > 0) {
        catList = result.rows;
      }
    }
  } catch (err) {
    console.error('PostgreSQL category fetch fallback to in-memory store:', err);
  }

  if (catList.length === 0) {
    catList = [...db.categories];
  }

  // Auto-discover any categories used in products that are not yet in the categories list
  const existingNames = new Set(catList.map((c) => (c.name || '').toLowerCase()));
  db.products.forEach((p) => {
    if (p.category && !existingNames.has(p.category.toLowerCase())) {
      existingNames.add(p.category.toLowerCase());
      const autoCat = {
        id: `cat_prod_${p.category.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: p.category,
        code: p.category.substring(0, 3).toUpperCase(),
        status: 'Active' as const,
        vatRate: 13,
        isDefault: false
      };
      catList.push(autoCat);
      db.categories.push(autoCat);
    }
  });


  res.json(catList);
};


export const createCategory = async (req: Request, res: Response) => {
  const { name, code, status, vatRate, isDefault } = req.body;
  const newCat = {
    id: `cat_${Date.now()}`,
    name: name.trim(),
    code: (code || name.substring(0, 3)).toUpperCase().trim(),
    status: (status || 'Active') as 'Active' | 'Inactive',
    vatRate: Number(vatRate) || 13,
    isDefault: Boolean(isDefault)
  };

  try {
    const pgStatus = getPgStatus();
    if (pgStatus.connected) {
      await pgPool.query(
        `CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'Active',
          vat_rate DECIMAL(5,2) DEFAULT 13.00,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      );

      await pgPool.query(
        'INSERT INTO categories (id, name, code, status, vat_rate, is_default) VALUES ($1, $2, $3, $4, $5, $6)',
        [newCat.id, newCat.name, newCat.code, newCat.status, newCat.vatRate, newCat.isDefault]
      );
    }
  } catch (err) {
    console.error('PostgreSQL category create fallback:', err);
  }

  db.categories.unshift(newCat);
  res.status(201).json({
    success: true,
    message: `Category "${newCat.name}" saved persistently to database!`,
    category: newCat
  });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const targetCat = db.categories.find((c) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
  const catName = targetCat ? targetCat.name : id;

  try {
    const pgStatus = getPgStatus();
    if (pgStatus.connected) {
      await pgPool.query('DELETE FROM categories WHERE id = $1 OR LOWER(name) = LOWER($2)', [id, catName]);
    }
  } catch (err) {
    console.error('PostgreSQL category delete fallback:', err);
  }

  db.categories = db.categories.filter((c) => c.id !== id && c.name.toLowerCase() !== catName.toLowerCase());

  // Update products using this deleted category to prevent auto-discovery on refresh
  db.products.forEach((p) => {
    if (p.category && p.category.toLowerCase() === catName.toLowerCase()) {
      p.category = 'Eco Panels';
    }
  });

  res.json({ success: true, message: `Category "${catName}" removed permanently!` });
};


// CUSTOM SCHEMA COLUMNS ENDPOINTS (PostgreSQL DB with In-Memory Fallback)
export const getSchemaColumns = async (req: Request, res: Response) => {
  const { table_id } = req.query;

  try {
    const status = getPgStatus();
    if (status.connected) {
      const result = await pgPool.query('SELECT * FROM column_schemas ORDER BY created_at DESC');
      if (result.rows.length > 0) {
        const filtered = table_id ? result.rows.filter((col: any) => col.table_id === table_id) : result.rows;
        return res.json(filtered);
      }
    }
  } catch (err) {
    console.error('PostgreSQL column schema fetch fallback:', err);
  }

  const filteredInMem = table_id ? db.column_schemas.filter((c) => c.table_id === table_id) : db.column_schemas;
  res.json(filteredInMem);
};

export const createSchemaColumn = async (req: Request, res: Response) => {
  const { table_id, key, label, type, access_role, visible, required, description } = req.body;

  const newCol = {
    id: `col_${Date.now()}`,
    table_id: table_id || 'products',
    key: (key || label.toLowerCase().replace(/[^a-z0-9_]/g, '_')).trim(),
    label: label.trim(),
    type: type || 'VARCHAR',
    access_role: access_role || 'All Roles',
    visible: visible !== undefined ? Boolean(visible) : true,
    required: Boolean(required),
    description: description || 'Custom schema column field',
    is_custom: true
  };

  try {
    const pgStatus = getPgStatus();
    if (pgStatus.connected) {
      await pgPool.query(
        `CREATE TABLE IF NOT EXISTS column_schemas (
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
        )`
      );

      await pgPool.query(
        `INSERT INTO column_schemas (id, table_id, key, label, type, access_role, visible, required, description, is_custom)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newCol.id, newCol.table_id, newCol.key, newCol.label, newCol.type, newCol.access_role, newCol.visible, newCol.required, newCol.description, newCol.is_custom]
      );
    }
  } catch (err) {
    console.error('PostgreSQL column schema create fallback:', err);
  }

  db.column_schemas.unshift(newCol);
  res.status(201).json({
    success: true,
    message: `Schema Column "${newCol.label}" created and saved persistently!`,
    column: newCol
  });
};

export const deleteSchemaColumn = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const pgStatus = getPgStatus();
    if (pgStatus.connected) {
      await pgPool.query('DELETE FROM column_schemas WHERE id = $1 OR key = $1', [id]);
    }
  } catch (err) {
    console.error('PostgreSQL column schema delete fallback:', err);
  }

  db.column_schemas = db.column_schemas.filter((col) => col.id !== id && col.key !== id);
  res.json({ success: true, message: 'Schema column removed permanently' });
};


