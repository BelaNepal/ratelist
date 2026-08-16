# Bela Rate & Costing Manager - Documentation & AI Training Suite

Welcome to the **Bela Rate & Costing Manager** local AI and staff documentation repository.

## 📂 Directory Organization

- `ai_guides/`: System invariants, prompt context rules, rate versioning mechanics, and AI agent operating guidelines.
- `operating_manuals/`: Role-specific user guides for Rate Managers, Approvers, Estimators, and Sales staff.
- `infographics_training/`: Visual ASCII & Mermaid flowcharts, BOM cost rollup diagrams, and training infographics.
- `architecture/`: Data dictionary, DB entity-relationship specifications, and REST API contracts.

---

## 🎯 Key UX & System Philosophy
1. **Single Source of Truth**: Updating a rate in the Rate Master automatically updates all future cost calculations, BOQs, and prefab home estimates.
2. **Immutable Rate Versioning**: Historical rates are never overwritten. Quotations lock the rate version active at the time of creation.
3. **Approval Safety Net**: Rate changes submitted by staff enter a pending queue for manager approval before going live.
4. **BOM & Component Costing**: Finished products (EPS panels) and Prefab homes are dynamically computed from raw material and component rates.
