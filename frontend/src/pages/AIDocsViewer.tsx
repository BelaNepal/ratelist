import React, { useState } from 'react';
import { BookOpen, FileText, CheckCircle2, ShieldCheck, Layers, Cpu, ArrowRight, Database, Server, Smartphone, Lock, GitMerge, Layout, Sparkles } from 'lucide-react';

export const AIDocsViewer: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<string>('architecture');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#ef7e2d]" /> Technical Documentation & Architecture Diagrams
            </h1>
            <p className="text-xs text-slate-500">
              Interactive system topology, rate propagation diagrams, database schemas & operational SOPs.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#ef7e2d]/10 text-[#ef7e2d] border border-[#ef7e2d]/30 text-xs font-black">
            Vela System v2.4 (Enterprise Edition)
          </span>
        </div>
      </div>

      {/* Doc Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSelectedDoc('architecture')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'architecture'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Cpu className="h-4 w-4 text-[#ef7e2d]" />
          <span>1. System Architecture Topology</span>
        </button>

        <button
          onClick={() => setSelectedDoc('rate_flow')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'rate_flow'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <GitMerge className="h-4 w-4 text-blue-500" />
          <span>2. Rate Propagation & Approval Flow</span>
        </button>

        <button
          onClick={() => setSelectedDoc('schema')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'schema'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Database className="h-4 w-4 text-purple-500" />
          <span>3. PostgreSQL Database Schema</span>
        </button>

        <button
          onClick={() => setSelectedDoc('sop')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            selectedDoc === 'sop'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>4. Role SOPs & Security Matrix</span>
        </button>
      </div>

      {/* DOCUMENT 1: SYSTEM ARCHITECTURE TOPOLOGY */}
      {selectedDoc === 'architecture' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Visual Architecture Diagram Flow Cards */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Enterprise Diagram 01
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">Multi-Tier Architecture & Data Synchronization</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Layer 1 → Layer 4 Pipeline</span>
            </div>

            {/* Interactive Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
              {/* Box 1: React Frontend */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 relative shadow-md">
                <div className="h-9 w-9 rounded-xl bg-[#ef7e2d] flex items-center justify-center font-bold text-white shadow-sm">
                  <Layout className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">1. Client Tier</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Vite + React TS Single Page App with TailwindCSS glassmorphism, dynamic RBAC, and printable PDF renderer.
                </p>
                <div className="text-[9px] font-mono text-blue-400 bg-blue-950 p-2 rounded-lg border border-blue-800">
                  HTTP REST • JWT Auth • Port 5173
                </div>
              </div>

              {/* Box 2: Node Express API */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 relative shadow-md">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">2. Application Server</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Express TS REST Gateway handling AES-256 session validation, BOQ calculations, and Multer asset vault engine.
                </p>
                <div className="text-[9px] font-mono text-emerald-400 bg-emerald-950 p-2 rounded-lg border border-emerald-800">
                  Node.js • Express Router • Port 5000
                </div>
              </div>

              {/* Box 3: PostgreSQL Database */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 relative shadow-md">
                <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-sm">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">3. PostgreSQL Database</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  PostgreSQL ACID connection pool storing rate versions, granular permissions, project files, and supplier rates.
                </p>
                <div className="text-[9px] font-mono text-purple-300 bg-purple-950 p-2 rounded-lg border border-purple-800">
                  pgPool • Port 5432 • TLS Encrypted
                </div>
              </div>

              {/* Box 4: Asset Vault Vault */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 relative shadow-md">
                <div className="h-9 w-9 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white shadow-sm">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">4. Public Asset Vault</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Disk store subdirectories (`/uploads/projects/images`, `/uploads/projects/documents`) holding site CAD files & renders.
                </p>
                <div className="text-[9px] font-mono text-amber-300 bg-amber-950 p-2 rounded-lg border border-amber-800">
                  Static File Proxy • /uploads
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 2: RATE PROPAGATION FLOW */}
      {selectedDoc === 'rate_flow' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Enterprise Diagram 02
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">Single Source of Truth Rate Propagation Flow</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Rate Lock & Approval Pipeline</span>
            </div>

            {/* Mermaid Flow Diagram Card */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
              <h3 className="text-sm font-extrabold text-[#ef7e2d] flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Rate Engine Propagation Pipeline
              </h3>
              
              <div className="font-mono text-xs leading-relaxed text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto space-y-2">
                <div>[Rate Manager] ──(Submits Rate Change Request)──&gt; [Approval Queue (Pending)]</div>
                <div className="pl-6 font-bold text-amber-400">│</div>
                <div className="pl-6">[Executive Approver] ──(Audits Reason & Comparative Margin)──&gt; [Approve / Reject]</div>
                <div className="pl-12 font-bold text-emerald-400">│</div>
                <div className="pl-12">├──&gt; [PostgreSQL Rate Master] (Version bumped, status=ACTIVE)</div>
                <div className="pl-12">├──&gt; [Costing BOM Engine] (Recalculates Material Cost per m²)</div>
                <div className="pl-12">└──&gt; [BOQ Builder & PDF Quotation Generator] (Uses Locked Active Snapshot)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 3: DATABASE SCHEMA */}
      {selectedDoc === 'schema' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">PostgreSQL Relational Schema Definitions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-max border border-blue-200">
                  TABLE: products
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-mono text-[11px]">
                  id (UUID PK)<br/>
                  code (VARCHAR UNIQUE)<br/>
                  name (VARCHAR)<br/>
                  category (VARCHAR)<br/>
                  specification (TEXT)<br/>
                  current_rate (NUMERIC 12,2)<br/>
                  unit (VARCHAR)<br/>
                  image_url (VARCHAR)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded w-max border border-purple-200">
                  TABLE: projects
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-mono text-[11px]">
                  id (VARCHAR PK)<br/>
                  name (VARCHAR)<br/>
                  customer_name (VARCHAR)<br/>
                  estimated_cost (NUMERIC 14,2)<br/>
                  gallery_images (JSONB Array)<br/>
                  project_files (JSONB Array)<br/>
                  status (VARCHAR)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 4: ROLE SOPS */}
      {selectedDoc === 'sop' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="p-4 bg-slate-900 text-white flex justify-between font-bold">
                <span>User Role</span>
                <span>Permissions & Granular Controls</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="font-bold text-slate-900">Admin</span>
                <span className="text-slate-600">Full system override, policy editor, rate approval, user management.</span>
              </div>
              <div className="p-4 flex justify-between bg-slate-50">
                <span className="font-bold text-blue-600">Rate Manager</span>
                <span className="text-slate-600">Add products, edit rates, submit change requests for approval.</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="font-bold text-emerald-600">Approver</span>
                <span className="text-slate-600">Audit pending rate change requests, approve or reject updates.</span>
              </div>
              <div className="p-4 flex justify-between bg-slate-50">
                <span className="font-bold text-purple-600">Estimator</span>
                <span className="text-slate-600">Build BOQs, project wizard, quotation PDF generator.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

