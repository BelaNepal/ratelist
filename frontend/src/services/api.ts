import {
  DashboardStats,
  Product,
  RateVersion,
  RateChangeRequest,
  ModularHomeTemplate,
  Project,
  BOQ,
  Quotation,
  Supplier,
  UserProfile,
  UserSession
} from '../types';

const API_BASE = '/api';

export async function loginUserApi(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; token?: string; error?: string; message?: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function logoutUserApi(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
}

export async function fetchCurrentUserApi(): Promise<{ authenticated: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    });
    if (!res.ok) return { authenticated: false };
    return res.json();
  } catch (e) {
    return { authenticated: false };
  }
}

export async function fetchUserSessionsApi(): Promise<{ success: boolean; sessions: UserSession[] }> {
  const res = await fetch(`${API_BASE}/auth/sessions`, {
    credentials: 'include'
  });
  return res.json();
}

export async function fetchUsersApi(): Promise<{ success: boolean; users: UserProfile[] }> {
  const res = await fetch(`${API_BASE}/auth/users`, {
    credentials: 'include'
  });
  return res.json();
}

export async function createUserApi(userData: Partial<UserProfile> & { password?: string }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData)
  });
  return res.json();
}

export async function updateUserRoleApi(userId: string, role: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/users/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, role })
  });
  return res.json();
}

export async function updateUserStatusApi(userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/users/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, status })
  });
  return res.json();
}

export async function resetUserPasswordApi(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, newPassword })
  });
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return res.json();
}

export async function fetchProducts(category = 'All', search = ''): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  return res.json();
}

export async function uploadProductImageFile(file: File, category = 'general'): Promise<{ success: boolean; imageUrl: string }> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('category', category);

  const res = await fetch(`${API_BASE}/products/upload-image`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  return res.json();
}

export async function deleteProductApi(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function syncLiveProducts(): Promise<{ message: string; count: number; total_products_in_master: number }> {
  const res = await fetch(`${API_BASE}/products/sync-live`, { method: 'POST' });
  return res.json();
}




export async function fetchRateHistory(productId: string): Promise<{ product: Product; current_rate: number; versions: RateVersion[] }> {
  const res = await fetch(`${API_BASE}/rates/history/${productId}`);
  return res.json();
}

export async function submitRateChange(product_id: string, new_rate: number, reason: string, requested_by: string): Promise<RateChangeRequest> {
  const res = await fetch(`${API_BASE}/rates/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id, new_rate, reason, requested_by })
  });
  return res.json();
}

export async function fetchApprovalRequests(): Promise<RateChangeRequest[]> {
  const res = await fetch(`${API_BASE}/approval-requests`);
  return res.json();
}

export async function approveRateRequest(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/approval-requests/${id}/approve`, { method: 'POST' });
  return res.json();
}

export async function rejectRateRequest(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/approval-requests/${id}/reject`, { method: 'POST' });
  return res.json();
}

export async function fetchModularTemplates(): Promise<ModularHomeTemplate[]> {
  const res = await fetch(`${API_BASE}/modular-homes`);
  return res.json();
}

export async function fetchBOMCalculation(productId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/bom/calculate/${productId}`);
  return res.json();
}

export async function saveBOMApi(bomData: any): Promise<{ success: boolean; message?: string; bom?: any; error?: string }> {
  const res = await fetch(`${API_BASE}/bom/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(bomData)
  });
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
}

export async function createProject(projectData: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(projectData)
  });
  return res.json();
}

export async function updateProjectApi(id: string, projectData: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(projectData)
  });
  return res.json();
}

export async function deleteProjectApi(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
}

export async function uploadProjectGalleryApi(id: string, formData: FormData): Promise<{ success: boolean; file_url?: string; project?: Project; error?: string }> {
  const res = await fetch(`${API_BASE}/projects/${id}/gallery`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  return res.json();
}

export async function uploadProjectDocumentApi(id: string, formData: FormData): Promise<{ success: boolean; file?: any; project?: Project; error?: string }> {
  const res = await fetch(`${API_BASE}/projects/${id}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  return res.json();
}

export async function deleteProjectFileApi(id: string, fileId: string): Promise<{ success: boolean; project?: Project; error?: string }> {
  const res = await fetch(`${API_BASE}/projects/${id}/files/${fileId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
}

export async function fetchBOQ(projectId: string): Promise<BOQ> {
  const res = await fetch(`${API_BASE}/boq/${projectId}`);
  return res.json();
}

export async function saveBOQ(boqData: any): Promise<{ success?: boolean; message?: string; boq: BOQ; quotation: Quotation; project_id?: string }> {
  const res = await fetch(`${API_BASE}/boq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(boqData)
  });
  return res.json();
}


export async function fetchQuotations(): Promise<Quotation[]> {
  const res = await fetch(`${API_BASE}/quotations`);
  return res.json();
}

export async function fetchQuotationById(id: string): Promise<{ quotation: Quotation; boq: BOQ }> {
  const res = await fetch(`${API_BASE}/quotations/${id}`);
  return res.json();
}

export async function fetchSuppliers(): Promise<{ suppliers: Supplier[]; rates: any[] }> {
  const res = await fetch(`${API_BASE}/suppliers`);
  return res.json();
}

export async function createSupplierApi(supData: Partial<Supplier>): Promise<{ success: boolean; message?: string; supplier?: Supplier; error?: string }> {
  const res = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(supData)
  });
  return res.json();
}

export async function updateSupplierApi(id: string, supData: Partial<Supplier>): Promise<{ success: boolean; message?: string; supplier?: Supplier; error?: string }> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(supData)
  });
  return res.json();
}

export async function deleteSupplierApi(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
}

export async function addSupplierRateApi(supplierId: string, rateData: any): Promise<{ success: boolean; message?: string; rate?: any; error?: string }> {
  const res = await fetch(`${API_BASE}/suppliers/${supplierId}/rates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(rateData)
  });
  return res.json();
}

export async function deleteSupplierRateApi(rateId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/suppliers/rates/${rateId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
}

export async function fetchReportTrends(): Promise<any> {
  const res = await fetch(`${API_BASE}/reports/trends`);
  return res.json();
}

export async function fetchTrashProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/trash`);
  return res.json();
}

export async function restoreProductApi(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/products/${id}/restore`, { method: 'POST' });
  return res.json();
}

export async function purgeProductApi(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/products/${id}/purge`, { method: 'DELETE' });
  return res.json();
}

export async function fetchRolePermissionsApi(): Promise<{ success: boolean; matrix: Record<string, { role: string; allowed_tabs: string[]; allowed_actions: string[] }> }> {
  const res = await fetch(`${API_BASE}/auth/role-permissions`, {
    credentials: 'include'
  });
  return res.json();
}

export async function updateRolePermissionsApi(role: string, allowed_tabs: string[], allowed_actions: string[]): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/role-permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role, allowed_tabs, allowed_actions })
  });
  return res.json();
}

