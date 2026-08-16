export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  unit: string;
  specification: string;
  thickness: string;
  size: string;
  brand: string;
  status: string;
  current_rate: number;
  image_url?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}



export interface RateVersion {
  id: string;
  product_id: string;
  rate: number;
  effective_date: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'ARCHIVED' | 'REJECTED';
  reason?: string;
  created_by: string;
  approved_by?: string;
}

export interface RateChangeRequest {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  old_rate: number;
  new_rate: number;
  unit: string;
  reason: string;
  requested_by: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface ModularComponentItem {
  product_id: string;
  name: string;
  qty: number;
  unit: string;
}

export interface ModularHomeTemplate {
  id: string;
  model_name: string;
  bedrooms: number;
  bathrooms: number;
  total_area_sqft: number;
  components: ModularComponentItem[];
}

export interface RawMaterialBOMItem {
  id: string;
  material_name: string;
  qty_per_m2: number;
  unit: string;
  unit_cost: number;
}

export interface ProductBOM {
  product_id: string;
  product_name: string;
  raw_materials: RawMaterialBOMItem[];
  factory_overhead_percent: number;
  labor_cost_per_unit: number;
  profit_margin_percent: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  rating: number;
}

export interface SupplierRate {
  id: string;
  supplier_id: string;
  supplier_name: string;
  material_name: string;
  unit: string;
  purchase_rate: number;
  min_quantity: number;
  lead_time_days: number;
  effective_date: string;
}

export interface Project {
  id: string;
  name: string;
  customer_name: string;
  location: string;
  building_type: string;
  area_sqft: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  status: 'Draft' | 'Active' | 'Completed';
  assigned_staff: string;
  created_date: string;
}

export interface BOQItem {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  unit: string;
  rate_version_id: string;
  unit_rate: number;
  qty: number;
  amount: number;
}

export interface BOQ {
  id: string;
  project_id: string;
  project_name: string;
  customer_name: string;
  area_sqft: number;
  items: BOQItem[];
  subtotal: number;
  direct_cost: number;
  labor_cost: number;
  transport_cost: number;
  installation_cost: number;
  overhead_percent: number;
  overhead_amount: number;
  profit_percent: number;
  profit_amount: number;
  selling_price: number;
  created_at: string;
}

export interface Quotation {
  id: string;
  quotation_no: string;
  boq_id: string;
  project_id: string;
  customer_name: string;
  project_name: string;
  location: string;
  building_type: string;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  vat_percent: number;
  vat_amount: number;
  total_amount: number;
  status: 'Draft' | 'Submitted' | 'Approved';
  valid_until: string;
  created_at: string;
}

class InMemoryDatabase {
  public products: Product[] = [
    {
      id: 'prod_eps_50',
      code: 'EP-050',
      name: 'EPS Cement Sandwich Panel 50mm',
      category: 'Eco Panels',
      subcategory: 'Wall Panel',
      unit: 'm²',
      specification: '50mm EPS Core, 4.5mm Fiber Cement Board Both Sides',
      thickness: '50 mm',
      size: '1200 × 2400 mm',
      brand: 'Bela EcoPanel',
      status: 'Active',
      current_rate: 1920
    },
    {
      id: 'prod_eps_75',
      code: 'EP-075',
      name: 'EPS Cement Sandwich Panel 75mm',
      category: 'Eco Panels',
      subcategory: 'Wall Panel',
      unit: 'm²',
      specification: '75mm EPS Core, High Thermal Insulation',
      thickness: '75 mm',
      size: '1200 × 2400 mm',
      brand: 'Bela EcoPanel',
      status: 'Active',
      current_rate: 2350
    },
    {
      id: 'prod_eps_100',
      code: 'EP-100',
      name: 'EPS Cement Sandwich Panel 100mm',
      category: 'Eco Panels',
      subcategory: 'Wall Panel',
      unit: 'm²',
      specification: '100mm EPS Core, Structural Acoustic Grade',
      thickness: '100 mm',
      size: '1200 × 2400 mm',
      brand: 'Bela EcoPanel',
      status: 'Active',
      current_rate: 2800
    },
    {
      id: 'prod_uchannel',
      code: 'ACC-UCH',
      name: 'Galvanized U Channel (Base Track)',
      category: 'Accessories',
      subcategory: 'Fasteners',
      unit: 'ft',
      specification: '1.2mm Heavy Galvanized Steel U-Track',
      thickness: '1.2 mm',
      size: '50mm Channel',
      brand: 'Bela Steel',
      status: 'Active',
      current_rate: 145
    },
    {
      id: 'prod_cement_opc',
      code: 'MAT-CEM',
      name: 'OPC Cement 53 Grade',
      category: 'Raw Materials',
      subcategory: 'Adhesive & Mortar',
      unit: 'bag',
      specification: 'High Early Strength Cement (50kg Bag)',
      thickness: 'N/A',
      size: '50 kg Bag',
      brand: 'Shivam Cement',
      status: 'Active',
      current_rate: 950
    },
    {
      id: 'prod_steel_struct',
      code: 'MOD-STL',
      name: 'Structural Steel RHS / SHS Column & Truss',
      category: 'Modular Components',
      subcategory: 'Structure',
      unit: 'kg',
      specification: 'IS 2062 Grade Structural Hollow Steel',
      thickness: '3.2 mm',
      size: '100x100 mm RHS',
      brand: 'Panchakanya Steel',
      status: 'Active',
      current_rate: 112
    },
    {
      id: 'prod_roofing_cgi',
      code: 'MOD-ROOF',
      name: 'Color Coated Roofing Sheet (0.45mm)',
      category: 'Modular Components',
      subcategory: 'Roofing',
      unit: 'm²',
      specification: 'PPGL Tile Profile Roofing Sheet with Ridge Cap',
      thickness: '0.45 mm',
      size: 'Custom Profile',
      brand: 'Bela Roof',
      status: 'Active',
      current_rate: 1150
    },
    {
      id: 'prod_door_upvc',
      code: 'MOD-DOR',
      name: 'Flush Door with WPC Frame (3x7 ft)',
      category: 'Modular Components',
      subcategory: 'Doors & Windows',
      unit: 'pcs',
      specification: 'Waterproof Laminate Flush Door + Stainless Lock',
      thickness: '35 mm',
      size: '900 x 2100 mm',
      brand: 'Bela Door',
      status: 'Active',
      current_rate: 18500
    },
    {
      id: 'prod_window_upvc',
      code: 'MOD-WIN',
      name: 'UPVC Sliding Window with 5mm Glass',
      category: 'Modular Components',
      subcategory: 'Doors & Windows',
      unit: 'pcs',
      specification: 'Double Track UPVC Frame with Mosquito Net',
      thickness: '60 mm Frame',
      size: '1200 x 1200 mm',
      brand: 'Bela Window',
      status: 'Active',
      current_rate: 12400
    },
    {
      id: 'prod_flooring_vinyl',
      code: 'MOD-FLR',
      name: 'SPC Click Vinyl Flooring 4mm',
      category: 'Modular Components',
      subcategory: 'Flooring',
      unit: 'm²',
      specification: 'Wood Grain Waterproof SPC Plank with IXPE Underlayment',
      thickness: '4 mm',
      size: '180 x 1220 mm',
      brand: 'Bela Floor',
      status: 'Active',
      current_rate: 1650
    },
    {
      id: 'prod_labor_install',
      code: 'SRV-LBR',
      name: 'Panel Erection & Structural Labor Charge',
      category: 'Services',
      subcategory: 'Installation',
      unit: 'm²',
      specification: 'Skilled Prefab Erection Team with Safety Gear',
      thickness: 'N/A',
      size: 'Standard Team',
      brand: 'Bela Service',
      status: 'Active',
      current_rate: 350
    },
    {
      id: 'prod_transport_freight',
      code: 'SRV-TRN',
      name: 'Site Freight Transportation (Flatbed Trailer)',
      category: 'Services',
      subcategory: 'Transportation',
      unit: 'trip',
      specification: 'Up to 10 Ton Freight Delivery to Project Site',
      thickness: 'N/A',
      size: 'Per Trip',
      brand: 'Bela Logistics',
      status: 'Active',
      current_rate: 25000
    }
  ];

  public rate_versions: RateVersion[] = [
    {
      id: 'rv_eps50_v4',
      product_id: 'prod_eps_50',
      rate: 1920,
      effective_date: '2026-08-12',
      status: 'ACTIVE',
      reason: 'Raw material EPS resin market increase',
      created_by: 'Ashish (Rate Manager)',
      approved_by: 'Admin'
    },
    {
      id: 'rv_eps50_v3',
      product_id: 'prod_eps_50',
      rate: 1850,
      effective_date: '2026-08-01',
      status: 'ARCHIVED',
      reason: 'Standard monthly index adjustment',
      created_by: 'Ashish (Rate Manager)',
      approved_by: 'Admin'
    },
    {
      id: 'rv_eps50_v2',
      product_id: 'prod_eps_50',
      rate: 1800,
      effective_date: '2026-07-15',
      status: 'ARCHIVED',
      reason: 'Monsoon freight surcharge discount',
      created_by: 'Ashish (Rate Manager)',
      approved_by: 'Admin'
    },
    {
      id: 'rv_eps50_v1',
      product_id: 'prod_eps_50',
      rate: 1750,
      effective_date: '2026-06-20',
      status: 'ARCHIVED',
      reason: 'Initial fiscal rate list entry',
      created_by: 'Ashish (Rate Manager)',
      approved_by: 'Admin'
    },
    {
      id: 'rv_steel_v2',
      product_id: 'prod_steel_struct',
      rate: 112,
      effective_date: '2026-08-11',
      status: 'ACTIVE',
      reason: 'Steel ingot import tax adjustment',
      created_by: 'Purchasing Dept',
      approved_by: 'Admin'
    },
    {
      id: 'rv_steel_v1',
      product_id: 'prod_steel_struct',
      rate: 108,
      effective_date: '2026-07-01',
      status: 'ARCHIVED',
      reason: 'Quarterly steel revision',
      created_by: 'Purchasing Dept',
      approved_by: 'Admin'
    },
    {
      id: 'rv_cement_v2',
      product_id: 'prod_cement_opc',
      rate: 950,
      effective_date: '2026-08-11',
      status: 'ACTIVE',
      reason: 'Clinker transport price raise',
      created_by: 'Purchasing Dept',
      approved_by: 'Admin'
    },
    {
      id: 'rv_cement_v1',
      product_id: 'prod_cement_opc',
      rate: 920,
      effective_date: '2026-07-10',
      status: 'ARCHIVED',
      reason: 'Mid-summer price adjustment',
      created_by: 'Purchasing Dept',
      approved_by: 'Admin'
    }
  ];

  public rate_change_requests: RateChangeRequest[] = [
    {
      id: 'req_001',
      product_id: 'prod_roofing_cgi',
      product_name: 'Color Coated Roofing Sheet (0.45mm)',
      product_code: 'MOD-ROOF',
      old_rate: 1150,
      new_rate: 1220,
      unit: 'm²',
      reason: 'Raw coil import tariffs increased by 6%',
      requested_by: 'Ashish (Rate Manager)',
      status: 'PENDING',
      created_at: '2026-08-12T09:30:00Z'
    },
    {
      id: 'req_002',
      product_id: 'prod_eps_75',
      product_name: 'EPS Cement Sandwich Panel 75mm',
      product_code: 'EP-075',
      old_rate: 2350,
      new_rate: 2420,
      unit: 'm²',
      reason: 'Chemical bonding additive cost spike',
      requested_by: 'Bikash (Purchase Officer)',
      status: 'PENDING',
      created_at: '2026-08-12T10:15:00Z'
    }
  ];

  public modular_templates: ModularHomeTemplate[] = [
    {
      id: 'tmpl_2bed',
      model_name: '2 Bedroom Prefab Modular Home',
      bedrooms: 2,
      bathrooms: 1,
      total_area_sqft: 650,
      components: [
        { product_id: 'prod_steel_struct', name: 'Structural Steel RHS Columns & Trusses', qty: 3200, unit: 'kg' },
        { product_id: 'prod_eps_50', name: 'EPS Wall Panels 50mm (Interior/Exterior)', qty: 450, unit: 'm²' },
        { product_id: 'prod_roofing_cgi', name: 'Color Coated Roofing Sheets', qty: 120, unit: 'm²' },
        { product_id: 'prod_door_upvc', name: 'Flush Doors with WPC Frames', qty: 5, unit: 'pcs' },
        { product_id: 'prod_window_upvc', name: 'UPVC Sliding Windows', qty: 6, unit: 'pcs' },
        { product_id: 'prod_flooring_vinyl', name: 'SPC Vinyl Flooring', qty: 60, unit: 'm²' },
        { product_id: 'prod_labor_install', name: 'Structural Assembly & Erection Labor', qty: 450, unit: 'm²' },
        { product_id: 'prod_transport_freight', name: 'Site Delivery Freight', qty: 2, unit: 'trip' }
      ]
    },
    {
      id: 'tmpl_3bed',
      model_name: '3 Bedroom Deluxe Modular Home',
      bedrooms: 3,
      bathrooms: 2,
      total_area_sqft: 1100,
      components: [
        { product_id: 'prod_steel_struct', name: 'Structural Steel RHS Columns & Trusses', qty: 5800, unit: 'kg' },
        { product_id: 'prod_eps_75', name: 'EPS Wall Panels 75mm (High Insulation)', qty: 780, unit: 'm²' },
        { product_id: 'prod_roofing_cgi', name: 'Color Coated Roofing Sheets', qty: 195, unit: 'm²' },
        { product_id: 'prod_door_upvc', name: 'Flush Doors with WPC Frames', qty: 8, unit: 'pcs' },
        { product_id: 'prod_window_upvc', name: 'UPVC Sliding Windows', qty: 10, unit: 'pcs' },
        { product_id: 'prod_flooring_vinyl', name: 'SPC Vinyl Flooring', qty: 102, unit: 'm²' },
        { product_id: 'prod_labor_install', name: 'Structural Assembly & Erection Labor', qty: 780, unit: 'm²' },
        { product_id: 'prod_transport_freight', name: 'Site Delivery Freight', qty: 3, unit: 'trip' }
      ]
    }
  ];

  public boms: ProductBOM[] = [
    {
      product_id: 'prod_eps_50',
      product_name: 'EPS Cement Sandwich Panel 50mm',
      raw_materials: [
        { id: 'rm_1', material_name: 'EPS Bead Resin Granules', qty_per_m2: 1.8, unit: 'kg', unit_cost: 280 },
        { id: 'rm_2', material_name: 'OPC Cement 53 Grade', qty_per_m2: 0.35, unit: 'bag', unit_cost: 950 },
        { id: 'rm_3', material_name: 'Washed Silica Sand', qty_per_m2: 12.0, unit: 'kg', unit_cost: 8.5 },
        { id: 'rm_4', material_name: 'Fiber Cement Boards (4.5mm x 2)', qty_per_m2: 2.0, unit: 'm²', unit_cost: 320 },
        { id: 'rm_5', material_name: 'Chemical Foaming Additives', qty_per_m2: 0.15, unit: 'ltr', unit_cost: 650 }
      ],
      factory_overhead_percent: 8,
      labor_cost_per_unit: 140,
      profit_margin_percent: 15
    }
  ];

  public suppliers: Supplier[] = [
    { id: 'sup_1', name: 'Panchakanya Steel Mills', contact_person: 'Ramesh Sharma', phone: '+977-9801234567', rating: 4.8 },
    { id: 'sup_2', name: 'Himalayan Cement Ltd', contact_person: 'Sunil Thapa', phone: '+977-9841122334', rating: 4.5 },
    { id: 'sup_3', name: 'AeroPolymers Raw Materials', contact_person: 'Kiran KC', phone: '+977-9851098765', rating: 4.9 },
    { id: 'sup_4', name: 'Siddhartha Roofing & Glass', contact_person: 'Deepak Giri', phone: '+977-9812345678', rating: 4.2 }
  ];

  public supplier_rates: SupplierRate[] = [
    { id: 'sr_1', supplier_id: 'sup_1', supplier_name: 'Panchakanya Steel Mills', material_name: 'Structural Steel RHS', unit: 'kg', purchase_rate: 109, min_quantity: 5000, lead_time_days: 3, effective_date: '2026-08-01' },
    { id: 'sr_2', supplier_id: 'sup_4', supplier_name: 'Siddhartha Roofing & Glass', material_name: 'Structural Steel RHS', unit: 'kg', purchase_rate: 112, min_quantity: 2000, lead_time_days: 2, effective_date: '2026-08-05' },
    { id: 'sr_3', supplier_id: 'sup_2', supplier_name: 'Himalayan Cement Ltd', material_name: 'OPC Cement 53 Grade', unit: 'bag', purchase_rate: 910, min_quantity: 200, lead_time_days: 1, effective_date: '2026-08-10' },
    { id: 'sr_4', supplier_id: 'sup_3', supplier_name: 'AeroPolymers Raw Materials', material_name: 'EPS Bead Resin', unit: 'kg', purchase_rate: 275, min_quantity: 500, lead_time_days: 5, effective_date: '2026-08-08' }
  ];

  public projects: Project[] = [
    {
      id: 'prj_001',
      name: 'Kathmandu Residence Modular Project',
      customer_name: 'ABC Construction & Builders',
      location: 'Kathmandu',
      building_type: 'Residential Prefab',
      area_sqft: 2400,
      floors: 2,
      bedrooms: 4,
      bathrooms: 3,
      status: 'Active',
      assigned_staff: 'Ashish Shrestha',
      created_date: '2026-08-05'
    },
    {
      id: 'prj_002',
      name: 'Pokhara Mountain Eco Resort',
      customer_name: 'Annapurna Hospitality Group',
      location: 'Pokhara',
      building_type: 'Resort Cottages',
      area_sqft: 4500,
      floors: 1,
      bedrooms: 8,
      bathrooms: 8,
      status: 'Active',
      assigned_staff: 'Bikash Adhikari',
      created_date: '2026-08-08'
    },
    {
      id: 'prj_003',
      name: 'Chitwan Wildlife Field Office',
      customer_name: 'Eco Infra Nepal',
      location: 'Chitwan',
      building_type: 'Commercial Office',
      area_sqft: 1800,
      floors: 1,
      bedrooms: 0,
      bathrooms: 2,
      status: 'Draft',
      assigned_staff: 'Sujan Rai',
      created_date: '2026-08-11'
    }
  ];

  public boqs: BOQ[] = [
    {
      id: 'boq_001',
      project_id: 'prj_001',
      project_name: 'Kathmandu Residence Modular Project',
      customer_name: 'ABC Construction & Builders',
      area_sqft: 2400,
      items: [
        { id: 'bi_1', product_id: 'prod_eps_50', product_code: 'EP-050', product_name: 'EPS Cement Sandwich Panel 50mm', unit: 'm²', rate_version_id: 'rv_eps50_v4', unit_rate: 1920, qty: 850, amount: 1632000 },
        { id: 'bi_2', product_id: 'prod_steel_struct', product_code: 'MOD-STL', product_name: 'Structural Steel RHS Columns & Trusses', unit: 'kg', rate_version_id: 'rv_steel_v2', unit_rate: 112, qty: 4200, amount: 470400 },
        { id: 'bi_3', product_id: 'prod_roofing_cgi', product_code: 'MOD-ROOF', product_name: 'Color Coated Roofing Sheet (0.45mm)', unit: 'm²', rate_version_id: 'rv_roof_v1', unit_rate: 1150, qty: 260, amount: 299000 },
        { id: 'bi_4', product_id: 'prod_door_upvc', product_code: 'MOD-DOR', product_name: 'Flush Door with WPC Frame (3x7 ft)', unit: 'pcs', rate_version_id: 'rv_door_v1', unit_rate: 18500, qty: 8, amount: 148000 },
        { id: 'bi_5', product_id: 'prod_window_upvc', product_code: 'MOD-WIN', product_name: 'UPVC Sliding Window with 5mm Glass', unit: 'pcs', rate_version_id: 'rv_win_v1', unit_rate: 12400, qty: 12, amount: 148800 }
      ],
      subtotal: 2698200,
      direct_cost: 2698200,
      labor_cost: 350000,
      transport_cost: 120000,
      installation_cost: 180000,
      overhead_percent: 5,
      overhead_amount: 167410,
      profit_percent: 12,
      profit_amount: 421873,
      selling_price: 3937483,
      created_at: '2026-08-10'
    }
  ];

  public quotations: Quotation[] = [
    {
      id: 'qt_001',
      quotation_no: 'QT-2026-00452',
      boq_id: 'boq_001',
      project_id: 'prj_001',
      customer_name: 'ABC Construction & Builders',
      project_name: 'Kathmandu Residence Modular Project',
      location: 'Kathmandu',
      building_type: 'Residential Prefab',
      subtotal: 3937483,
      discount_percent: 2,
      discount_amount: 78750,
      vat_percent: 13,
      vat_amount: 501635,
      total_amount: 4360368,
      status: 'Submitted',
      valid_until: '2026-09-12',
      created_at: '2026-08-11'
    }
  ];
}

export const db = new InMemoryDatabase();
