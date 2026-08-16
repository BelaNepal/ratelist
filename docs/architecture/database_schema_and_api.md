# Database Schema & API Contracts Specification

This document details the database schema, entity relationships, and REST API specification for the Bela Rate & Costing Manager backend.

---

## 🗄️ Database Schema & Entities

### 1. `products`
- `id` (STRING, PK): e.g., `"prod_eps_50mm"`
- `code` (STRING, UNIQUE): e.g., `"EP-050"`
- `name` (STRING): e.g., `"EPS Cement Sandwich Panel"`
- `category` (STRING): `"Eco Panels" | "Modular Components" | "Accessories" | "Services"`
- `subcategory` (STRING): `"Wall Panel" | "Roof Panel" | "Steel" | "Roofing" | "Doors" ...`
- `unit` (STRING): `"m²" | "ft" | "kg" | "bag" | "pcs" | "set" | "trip"`
- `specification` (STRING): e.g., `"50mm EPS Core, 4.5mm Fiber Cement Face"`
- `thickness` (STRING): e.g., `"50 mm"`
- `size` (STRING): e.g., `"1200 x 2400 mm"`
- `brand` (STRING): e.g., `"Bela EcoPanel"`
- `status` (STRING): `"Active" | "Inactive"`

### 2. `rate_versions`
- `id` (STRING, PK): e.g., `"rv_001"`
- `product_id` (STRING, FK): references `products(id)`
- `rate` (NUMBER): e.g., `1920.00`
- `effective_date` (STRING): e.g., `"2026-08-12"`
- `status` (STRING): `"ACTIVE" | "PENDING_APPROVAL" | "ARCHIVED" | "REJECTED"`
- `reason` (STRING): e.g., `"Supplier EPS resin rate increase"`
- `created_by` (STRING): User name / role
- `approved_by` (STRING): Approver name / role

### 3. `rate_change_requests`
- `id` (STRING, PK)
- `product_id` (STRING, FK)
- `old_rate` (NUMBER)
- `new_rate` (NUMBER)
- `reason` (STRING)
- `status` (STRING): `"PENDING" | "APPROVED" | "REJECTED"`
- `requested_by` (STRING)
- `created_at` (TIMESTAMP)

### 4. `bom_items` (Raw Material Bill of Materials)
- `id` (STRING, PK)
- `finished_product_id` (STRING, FK)
- `raw_material_name` (STRING): e.g., `"EPS Resin Granules"`, `"OPC Cement"`, `"Sand"`
- `qty_per_unit` (NUMBER)
- `unit` (STRING)
- `unit_cost` (NUMBER)

### 5. `modular_components`
- `id` (STRING, PK)
- `model_name` (STRING): e.g., `"2 Bedroom Modular Home (600 sq.ft)"`
- `structure_items` (JSON ARRAY): List of items with `product_id`, `default_qty`, `unit`

### 6. `projects`
- `id` (STRING, PK): e.g., `"prj_001"`
- `name` (STRING): e.g., `"Kathmandu Residence"`
- `customer_name` (STRING): e.g., `"ABC Construction Ltd"`
- `location` (STRING): e.g., `"Kathmandu"`
- `building_type` (STRING): `"Residential Prefab" | "Resort" | "Office"`
- `area_sqft` (NUMBER): e.g., `2400`
- `floors` (NUMBER)
- `bedrooms` (NUMBER)
- `status` (STRING): `"Draft" | "Active" | "Completed"`
- `assigned_staff` (STRING)

### 7. `boqs` & `boq_items`
- `id` (STRING, PK)
- `project_id` (STRING, FK)
- `subtotal` (NUMBER)
- `direct_cost` (NUMBER)
- `overhead_amount` (NUMBER)
- `profit_amount` (NUMBER)
- `selling_price` (NUMBER)
- `items`: ARRAY of `{ product_id, product_name, unit, rate_version_id, unit_rate, qty, amount }`

### 8. `quotations`
- `id` (STRING, PK): e.g., `"QT-2026-00452"`
- `boq_id` (STRING, FK)
- `customer_name` (STRING)
- `project_name` (STRING)
- `subtotal` (NUMBER)
- `discount_amount` (NUMBER)
- `vat_amount` (NUMBER)
- `total_amount` (NUMBER)
- `status` (STRING): `"Draft" | "Submitted" | "Approved"`

---

## 🌐 REST API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Fetches dashboard metrics, counts, recent changes, alerts |
| `GET` | `/api/products` | Lists products with filtering by category & search query |
| `POST` | `/api/products` | Creates a new product item |
| `GET` | `/api/rates/history/:productId` | Fetches full versioned rate history for a product |
| `POST` | `/api/rates/request` | Submits a rate change request for approval |
| `GET` | `/api/approval-requests` | Returns queue of pending rate change requests |
| `POST` | `/api/approval-requests/:id/approve` | Approves rate change request & activates new rate version |
| `POST` | `/api/approval-requests/:id/reject` | Rejects rate change request |
| `GET` | `/api/modular-homes` | Returns prefab home templates & computes dynamic component cost |
| `GET` | `/api/bom/calculate/:productId` | Computes raw material rollup & factory selling cost |
| `GET` | `/api/projects` | Fetches active projects |
| `POST` | `/api/projects` | Creates a new project |
| `GET` | `/api/boq/:projectId` | Fetches or computes BOQ for project |
| `POST` | `/api/boq` | Saves BOQ with locked rate snapshots |
| `POST` | `/api/quotations` | Creates customer quotation |
| `GET` | `/api/quotations/:id` | Returns quotation details for PDF rendering |
| `GET` | `/api/suppliers` | Lists suppliers and rate comparisons |
| `GET` | `/api/reports/trends` | Historical price movement dataset for charts |
