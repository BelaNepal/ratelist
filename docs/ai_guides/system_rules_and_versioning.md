# System Rules & Rate Versioning Architecture

## 1. Core System Invariants

### Invariant 1: Single Source of Truth
No component rate or product price is hardcoded inside BOQs, Prefab models, or Costing modules. All calculations perform dynamic lookups against the active `RateVersion` of the target product.

### Invariant 2: Version Locking for Quotations
When a BOQ or Quotation is generated:
1. The exact `rate_version_id` active at creation time is stored alongside the quotation item.
2. If today's product rate changes in the Rate Master, existing locked quotations **do not change**.
3. Re-evaluating or revising a quotation creates a new quotation revision linked to the current active rate list.

### Invariant 3: Rate Change Approval State Machine
Rate changes undergo strict state progression:
```
[ DRAFT ] ──(Submit)──> [ PENDING_APPROVAL ] ──(Approve)──> [ ACTIVE ]
                               │
                           (Reject)
                               ↓
                          [ REJECTED ]
```
When a new rate version transitions to `ACTIVE`, the previous `ACTIVE` version transitions to `ARCHIVED`.

---

## 2. Rate Versioning Data Model

Each product possesses a lineage of rate versions:

```json
{
  "product_id": "prod_eps_50mm",
  "product_code": "EP-050",
  "product_name": "EPS Cement Sandwich Panel 50mm",
  "unit": "m²",
  "current_rate": 1920.00,
  "versions": [
    {
      "version_id": "v4",
      "rate": 1920.00,
      "effective_date": "2026-08-12",
      "status": "ACTIVE",
      "reason": "Raw material supplier EPS resin increase",
      "created_by": "Ashish (Rate Manager)",
      "approved_by": "Admin User"
    },
    {
      "version_id": "v3",
      "rate": 1850.00,
      "effective_date": "2026-08-01",
      "status": "ARCHIVED"
    },
    {
      "version_id": "v2",
      "rate": 1800.00,
      "effective_date": "2026-07-15",
      "status": "ARCHIVED"
    }
  ]
}
```

---

## 3. Modular Prefab Home & BOM Calculation Rules

### Prefab Modular Home Cost Calculation Formula:
$$\text{Total Prefab Cost} = \sum_{c \in \text{Components}} (\text{Qty}_c \times \text{ActiveRate}_c)$$

Components include:
- Structural Steel (kg)
- EPS Wall Panels (m²)
- EPS Roof Panels (m²)
- Doors & Windows (pcs)
- Electrical Wiring & Fixtures (lumpsum / set)
- Plumbing & Sanitary (set)
- Flooring & Finishing (m²)
- On-site Labor (days / sq.ft)
- Freight & Transportation (trips / km)

### Raw Material BOM Cost Rollup Formula:
$$\text{Factory Unit Cost} = \left(\sum_{m \in \text{RawMaterials}} \text{Qty}_m \times \text{SupplierRate}_m\right) + \text{Factory Overhead} + \text{Direct Labor}$$
$$\text{Suggested Selling Rate} = \text{Factory Unit Cost} \times (1 + \text{Target Profit Margin \%})$$
