export type UserRole = 'Admin' | 'Rate Manager' | 'Approver' | 'Estimator' | 'Sales' | 'Viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
  status: 'ACTIVE' | 'INACTIVE';
  last_login_at?: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
  created_at: string;
}

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
  status: 'Active' | 'Inactive';
  current_rate: number;
  image_url?: string;
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
  current_rate?: number;
  amount?: number;
}

export interface ModularHomeTemplate {
  id: string;
  model_name: string;
  bedrooms: number;
  bathrooms: number;
  total_area_sqft: number;
  calculated_total?: number;
  components: ModularComponentItem[];
}

export interface RawMaterialBOMItem {
  id: string;
  material_name: string;
  qty_per_m2: number;
  unit: string;
  unit_cost: number;
  total?: number;
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
  contact_person?: string;
  phone?: string;
  location?: string;
  category?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  rating?: number;
  rates?: SupplierRate[];
  created_at?: string;
}

export interface SupplierRate {
  id: string;
  supplier_id: string;
  supplier_name: string;
  material_name: string;
  unit: string;
  purchase_rate: number;
  min_quantity?: number;
  lead_time_days?: number;
  effective_date: string;
  created_at?: string;
}

export interface ProjectFile {
  id: string;
  original_name: string;
  file_url: string;
  file_type: string;
  size: number;
  uploaded_at: string;
}

export interface Project {
  id: string;
  name: string;
  customer_name: string;
  location: string;
  building_type: string;
  area_sqft: number;
  floors: number;
  bedrooms?: number;
  bathrooms?: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Upcoming' | 'Running';
  assigned_staff: string;
  estimated_cost?: number;
  start_date?: string;
  completion_date?: string;
  description?: string;
  gallery_images?: string[];
  project_files?: ProjectFile[];
  created_date?: string;
}

export interface BOQItem {
  id?: string;
  product_id: string;
  product_code?: string;
  product_name: string;
  unit: string;
  rate_version_id?: string;
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

export interface DashboardStats {
  active_products: number;
  pending_rate_changes: number;
  active_projects: number;
  draft_quotations: number;
  recent_rate_changes: Array<{
    product_name: string;
    unit: string;
    rate: number;
    effective_date: string;
    reason: string;
    status: string;
  }>;
  price_alerts: Array<{
    material: string;
    change: string;
    status: 'warning' | 'success';
  }>;
}
