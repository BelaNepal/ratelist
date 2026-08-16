# Operational User Manual: Bela Rate & Costing Manager

This manual outlines standard operating procedures (SOPs) for all user roles within Bela Nepal.

---

## 👥 User Roles & Access Control (RBAC)

| Role | Permissions & SOP Responsibilities |
| :--- | :--- |
| **Admin** | Full system control. Can edit rates directly, approve pending rate requests, manage users, modify BOM formulas, and access profitability reports. |
| **Rate Manager** | Can add products, edit rates, view rate history, and submit rate change requests for approval. Cannot approve their own rate changes. |
| **Approver / Manager** | Receives pending rate change requests. Reviews old rate vs new rate, vendor price justifications, and approves or rejects updates. |
| **Estimator** | Creates BOQs, runs costing estimates, adjusts project overhead/profit sliders, and generates draft quotations. Cannot alter master rates. |
| **Sales** | Manages Customers and Projects. Converts approved BOQs to customer-facing PDF quotations (`BELANEPAL` format). |
| **Viewer** | Read-only view across products, active rates, and public reports. |

---

## 🚀 Common Workflow Guides

### SOP 1: Updating a Product Rate (e.g. Steel or EPS Panel)
1. Navigate to **Rate Management** or **Eco Panels / Modular Components**.
2. Click **[Edit Rate]** on the target item (e.g., `EPS Panel 50mm`).
3. Enter **New Rate** (e.g., `Rs. 1,950 / m²`) and mandatory **Reason** (e.g., *Cement supplier price increase*).
4. Click **[Submit for Approval]**.
5. The request instantly enters the **Approval Queue**.
6. Once an **Approver** clicks **[Approve]**, the rate becomes `ACTIVE` across all future BOQs and prefab calculators!

### SOP 2: Creating a BOQ for a Project
1. Navigate to **BOQ Builder**.
2. Select target **Project** (e.g., *Kathmandu Residence - 2,400 sq.ft*).
3. Type item name in the instant search box (e.g. `EPS`).
4. Select `EPS Cement Panel 50mm` from suggestions — Unit (`m²`) and current approved rate (`Rs. 1,920`) populate automatically!
5. Type quantity (e.g. `850`).
6. Adjust Direct Cost, Overhead %, and Profit % sliders.
7. Click **[Save BOQ & Generate Quotation]**.

### SOP 3: Generating & Exporting a Quotation PDF
1. Go to **Customer & Quotations**.
2. Select desired Quotation ID (e.g., `QT-2026-00452`).
3. Review company header (`BELANEPAL`), itemized components, subtotal, discount, and 13% VAT.
4. Click **[Download PDF]** or **[Print Quotation]**.
