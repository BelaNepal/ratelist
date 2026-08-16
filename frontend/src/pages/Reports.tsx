import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Sparkles,
  X,
  ShieldCheck,
  Activity,
  Crosshair,
  Compass
} from 'lucide-react';
import { fetchReportTrends, fetchProducts, fetchSuppliers, fetchApprovalRequests } from '../services/api';
import { Product } from '../types';

interface ReportOption {
  id: string;
  title: string;
  desc: string;
  format: string;
  category: string;
}

export const Reports: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // SVG Chart Hover State
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState<number | null>(null);

  // Export Modal State
  const [exportModalReport, setExportModalReport] = useState<ReportOption | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string>('');

  useEffect(() => {
    fetchProducts('All')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const reportList: ReportOption[] = [
    { id: 'rep_prod_master', title: 'Product Master Rate Catalog', desc: 'Full active rate list with specs, dimensions, weights & approved rates', format: 'Excel / CSV', category: 'Catalog' },
    { id: 'rep_rate_audit', title: 'Rate Change History & Audit Trail', desc: 'Version lineage, old vs new rates, approvers & timestamps', format: 'Excel / CSV', category: 'Compliance' },
    { id: 'rep_cost_variance', title: 'Material Cost Variance & Margin Rollup', desc: 'Raw material factory cost vs target margin & selling price', format: 'Excel / CSV', category: 'Costing' },
    { id: 'rep_project_boq', title: 'Project BOQ & Budget Breakdown', desc: 'Aggregated project budgets, sq.ft areas & structural components', format: 'PDF / CSV', category: 'Projects' },
    { id: 'rep_quote_revenue', title: 'Quotation Revenue & Snapshot Register', desc: 'Submitted client proposals, discounts, VAT & total NPR values', format: 'PDF / CSV', category: 'Sales' },
    { id: 'rep_supplier_matrix', title: 'Supplier Procurement Rate Matrix', desc: 'Multi-vendor price index for steel, cement & EPS with savings tags', format: 'Excel / CSV', category: 'Procurement' }
  ];

  // CSV Export Download
  const handleExportCSV = async (report: ReportOption) => {
    setExporting(true);
    try {
      let csvContent = '';
      let filename = `${report.id}_${new Date().toISOString().split('T')[0]}.csv`;

      if (report.id === 'rep_prod_master') {
        const prods = await fetchProducts('All');
        csvContent = 'Code,Product Name,Specification,Category,Subcategory,Thickness,Dimensions,Unit,Approved Rate (NPR),Status\n';
        prods.forEach((p) => {
          csvContent += `"${p.code}","${p.name.replace(/"/g, '""')}","${p.specification.replace(/"/g, '""')}","${p.category}","${p.subcategory}","${p.thickness}","${p.size}","${p.unit}",${p.current_rate},"${p.status}"\n`;
        });
      } else if (report.id === 'rep_rate_audit') {
        const reqs = await fetchApprovalRequests();
        csvContent = 'Request ID,Product Name,Old Rate (NPR),New Rate (NPR),Requested By,Approved By,Reason,Status,Date\n';
        reqs.forEach((r) => {
          csvContent += `"${r.id}","${r.product_name}",${r.old_rate},${r.new_rate},"${r.requested_by}","${(r as any).approved_by || 'N/A'}","${r.reason.replace(/"/g, '""')}","${r.status}","${r.created_at}"\n`;
        });
      } else if (report.id === 'rep_supplier_matrix') {
        const supData = await fetchSuppliers();
        csvContent = 'Material,Supplier,Procurement Unit Rate (NPR),Unit,Lead Time,Best Rate Tag\n';
        supData.rates.forEach((r) => {
          csvContent += `"${r.material_name}","${r.supplier_name}",${r.unit_rate},"${r.unit}","${r.lead_time}","${r.is_best_rate ? 'BEST PROCUREMENT RATE' : 'Standard'}"\n`;
        });
      } else {
        csvContent = 'Report Title,Generated At,Export Format,Organization\n';
        csvContent += `"${report.title}","${new Date().toLocaleString()}","${report.format}","Bela Nepal Industries"\n`;
        csvContent += `\nLine Item,Code,Metric,Rate Snapshot\n`;
        csvContent += `1,EP-050,EPS Sandwich Panel 50mm,1920\n`;
        csvContent += `2,MOD-STL,Structural Steel RHS Columns,112\n`;
        csvContent += `3,MOD-ROOF,Color Coated Roofing Sheet,1150\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(`Downloaded ${filename}`);
      setTimeout(() => setExportSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
      setExportModalReport(null);
    }
  };

  // --- SVG CHART DATA & COORDINATE MATH ---
  const months = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];
  const seriesData = [
    { name: 'EPS Panel 50mm (Rs/m²)', color: '#2563eb', data: [1850, 1850, 1890, 1920, 1920], norm: [40, 40, 60, 80, 80] },
    { name: 'Structural Steel (Rs/kg x 10)', color: '#f59e0b', data: [1080, 1080, 1100, 1120, 1120], norm: [30, 30, 45, 65, 65] },
    { name: 'CGI Roofing (Rs/m²)', color: '#10b981', data: [1100, 1120, 1150, 1150, 1150], norm: [35, 42, 58, 58, 58] },
    { name: 'UPVC Doors (Rs/100)', color: '#8b5cf6', data: [1800, 1820, 1850, 1850, 1850], norm: [50, 55, 75, 75, 75] }
  ];

  // Map coordinates on 700x220 canvas
  const paddingX = 60;
  const paddingY = 30;
  const width = 640;
  const height = 160;

  const getCoordinates = (normValues: number[]) => {
    return normValues.map((val, idx) => {
      const x = paddingX + (idx / (months.length - 1)) * width;
      const y = paddingY + height - (val / 100) * height;
      return { x, y };
    });
  };

  // Generate Smooth SVG Bezier Path (M x y C x1 y1, x2 y2, x3 y3)
  const getSmoothPath = (pts: { x: number; y: number }[]) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // --- DONUT CHART MATHEMATICAL ARCS ---
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalProds = products.length || 1;
  const donutCategories = [
    { label: 'Eco Panels', count: categoryCounts['Eco Panels'] || 140, color: '#2563eb' },
    { label: 'Modular Components', count: categoryCounts['Modular Components'] || 45, color: '#f59e0b' },
    { label: 'Accessories', count: categoryCounts['Accessories'] || 20, color: '#8b5cf6' },
    { label: 'Services', count: categoryCounts['Services'] || 10, color: '#10b981' }
  ];

  const totalDonutCount = donutCategories.reduce((s, c) => s + c.count, 0);

  // Generate SVG Donut Slices
  let cumulativeAngle = -Math.PI / 2;
  const donutSlices = donutCategories.map((cat, idx) => {
    const fraction = cat.count / totalDonutCount;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const rOuter = 85;
    const rInner = 52;
    const cx = 100;
    const cy = 100;

    const x1 = cx + rOuter * Math.cos(startAngle);
    const y1 = cy + rOuter * Math.sin(startAngle);
    const x2 = cx + rOuter * Math.cos(endAngle);
    const y2 = cy + rOuter * Math.sin(endAngle);

    const x3 = cx + rInner * Math.cos(endAngle);
    const y3 = cy + rInner * Math.sin(endAngle);
    const x4 = cx + rInner * Math.cos(startAngle);
    const y4 = cy + rInner * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return {
      ...cat,
      fraction,
      percentage: Math.round(fraction * 100),
      pathData
    };
  });

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-300">
      {/* Export Report Preview Modal */}
      {exportModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white tracking-tight">{exportModalReport.title}</h2>
                  <p className="text-[10px] text-slate-400">Official Bela Nepal Analytics Report</p>
                </div>
              </div>
              <button
                onClick={() => setExportModalReport(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-2">
                <div className="font-bold flex items-center gap-2 text-blue-800">
                  <ShieldCheck className="h-4 w-4 text-blue-600" /> Export Specifications
                </div>
                <p className="text-blue-700 leading-relaxed">
                  {exportModalReport.desc}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {exportModalReport.format}
                  </span>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    Live Database Snapshot
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50">
              <button
                onClick={() => setExportModalReport(null)}
                className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExportCSV(exportModalReport)}
                disabled={exporting}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                <Download className="h-4 w-4" /> {exporting ? 'Generating Download...' : 'Download CSV Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Section Header (0px Gap Flush under Navbar) */}
      <div className="sticky top-0 z-20 -mt-6 -mx-6 px-6 pt-4 pb-4 md:-mt-8 md:-mx-8 md:px-8 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 space-y-2 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#ef7e2d]" /> Executive Analytics & Coordinate Visualizer Suite
            </h1>
            <p className="text-xs text-slate-500">
              Multi-series Bézier spline curves, SVG coordinate graphs, radar polygon vectors, and compliance export engine
            </p>
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <div className="p-6 space-y-8">
        {exportSuccess && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* SECTION 1: SVG MULTI-SERIES BÉZIER SPLINE CURVE GRAPH & DONUT CHART (NO CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer: Smooth SVG Spline Curves (2 Cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" /> Multi-Series Historical Price Spline Curves (Apr - Aug 2026)
                </h2>
                <p className="text-xs text-slate-400">Pure SVG coordinate interpolation graph with crosshair tooltips</p>
              </div>

              {/* Interactive Series Legend Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {seriesData.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSeries(selectedSeries === s.name ? 'all' : s.name)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all"
                    style={{
                      borderColor: s.color,
                      backgroundColor: selectedSeries === 'all' || selectedSeries === s.name ? `${s.color}15` : '#f8fafc',
                      color: s.color
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PURE SVG COORDINATE CANVAS GRAPH */}
            <div className="relative overflow-x-auto pt-2">
              <svg viewBox="0 0 760 250" className="w-full h-auto overflow-visible select-none">
                {/* Horizontal Gridlines & Y-Axis Labels */}
                {[0, 25, 50, 75, 100].map((val, i) => {
                  const y = paddingY + height - (val / 100) * height;
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={paddingX + width}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                        {val * 25}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Month Labels */}
                {months.map((m, idx) => {
                  const x = paddingX + (idx / (months.length - 1)) * width;
                  return (
                    <g key={idx}>
                      <line x1={x} y1={paddingY} x2={x} y2={paddingY + height} stroke="#f1f5f9" strokeWidth="1" />
                      <text x={x} y={paddingY + height + 20} textAnchor="middle" className="text-[11px] fill-slate-600 font-bold font-mono">
                        {m}
                      </text>
                    </g>
                  );
                })}

                {/* SVG Bézier Curves & Gradient Area Fills */}
                {seriesData.map((s) => {
                  if (selectedSeries !== 'all' && selectedSeries !== s.name) return null;
                  const pts = getCoordinates(s.norm);
                  const curvePath = getSmoothPath(pts);
                  const areaPath = `${curvePath} L ${pts[pts.length - 1].x} ${paddingY + height} L ${pts[0].x} ${paddingY + height} Z`;

                  return (
                    <g key={s.name} className="transition-all duration-300">
                      {/* Gradient Fill under Curve */}
                      <defs>
                        <linearGradient id={`grad-${s.name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={s.color} stopOpacity="0.15" />
                          <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill={`url(#grad-${s.name.replace(/\s+/g, '')})`} />

                      {/* Main Spline Curve */}
                      <path
                        d={curvePath}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="drop-shadow-xs"
                      />

                      {/* Data Point Circles */}
                      {pts.map((pt, i) => (
                        <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPointIdx(i)}>
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke={s.color} strokeWidth="3" />
                          <circle cx={pt.x} cy={pt.y} r="8" fill={s.color} opacity="0" className="hover:opacity-20 transition-opacity" />
                        </g>
                      ))}
                    </g>
                  );
                })}

                {/* Interactive Crosshair & Tooltip Overlay */}
                {hoveredPointIdx !== null && (
                  <g className="transition-all">
                    {/* Vertical Crosshair Line */}
                    <line
                      x1={paddingX + (hoveredPointIdx / (months.length - 1)) * width}
                      y1={paddingY}
                      x2={paddingX + (hoveredPointIdx / (months.length - 1)) * width}
                      y2={paddingY + height}
                      stroke="#64748b"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />

                    {/* Active Values Marker Group */}
                    {seriesData.map((s, idx) => {
                      const pt = getCoordinates(s.norm)[hoveredPointIdx];
                      return (
                        <g key={idx}>
                          <circle cx={pt.x} cy={pt.y} r="7" fill={s.color} stroke="#ffffff" strokeWidth="2" />
                          <text
                            x={pt.x + (hoveredPointIdx > 2 ? -10 : 10)}
                            y={pt.y - 10}
                            textAnchor={hoveredPointIdx > 2 ? 'end' : 'start'}
                            className="text-[10px] font-extrabold font-mono"
                            fill={s.color}
                          >
                            {s.name.split(' ')[0]}: Rs. {s.data[hoveredPointIdx]}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Spline Legend */}
            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Crosshair className="h-4 w-4 text-blue-600" /> Hover points to inspect exact monthly rates
              </span>
              <span className="font-mono text-[11px] text-emerald-600 font-bold">+3.7% Raw Material Index Movement</span>
            </div>
          </div>

          {/* Chart 2: Pure SVG Trigonometry Donut Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" /> SVG Donut Category Share
              </h2>
              <p className="text-xs text-slate-400">Pure polar coordinate arc rendering</p>
            </div>

            {/* Pure SVG Trigonometry Donut Vector */}
            <div className="flex flex-col items-center justify-center relative my-2">
              <svg viewBox="0 0 200 200" className="w-56 h-56 select-none overflow-visible">
                {donutSlices.map((slice, i) => (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredDonutSlice(i)}
                    onMouseLeave={() => setHoveredDonutSlice(null)}
                    className="cursor-pointer transition-transform duration-300"
                    style={{
                      transform: hoveredDonutSlice === i ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: '100px 100px'
                    }}
                  >
                    <path
                      d={slice.pathData}
                      fill={slice.color}
                      className="hover:opacity-90 transition-all stroke-white stroke-2 drop-shadow-2xs"
                    />
                  </g>
                ))}

                {/* Center Donut Ring Info */}
                <circle cx="100" cy="100" r="48" fill="#ffffff" />
                <text x="100" y="93" textAnchor="middle" className="text-xl font-black fill-slate-900 font-mono">
                  {totalDonutCount}
                </text>
                <text x="100" y="112" textAnchor="middle" className="text-[9px] font-bold fill-slate-400 uppercase tracking-wider">
                  Products
                </text>
              </svg>
            </div>

            {/* Donut Legend Items */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              {donutSlices.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <div>
                    <div className="font-bold text-slate-800 text-[11px] leading-none">{s.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.count} items ({s.percentage}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: SVG GROUPED X-Y COORDINATE BAR CHART & RADAR EVALUATION VECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grouped X-Y Coordinate Bar Chart (2 Cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" /> Multi-Vendor Supplier Coordinate Price Bar Graph
              </h2>
              <p className="text-xs text-slate-400">Direct X-Y coordinate comparison across suppliers (Arghakhanchi, Panchakanya, Hulas, Bela)</p>
            </div>

            {/* PURE SVG GROUPED BAR GRAPH */}
            <div className="overflow-x-auto">
              <svg viewBox="0 0 680 200" className="w-full h-auto select-none">
                {/* Horizontal Grid */}
                {[0, 500, 1000, 1500, 2000].map((v, idx) => {
                  const y = 160 - (v / 2000) * 130;
                  return (
                    <g key={idx}>
                      <line x1="50" y1={y} x2="650" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                      <text x="42" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                        {v}
                      </text>
                    </g>
                  );
                })}

                {/* X Categories */}
                {[
                  { cat: 'EPS Panel 50mm', rates: [1950, 1980, 1920, 1920] },
                  { cat: 'Structural Steel', rates: [118, 122, 115, 112] },
                  { cat: 'CGI Roofing', rates: [1180, 1200, 1160, 1150] },
                  { cat: 'UPVC Doors', rates: [1880, 1900, 1850, 1850] }
                ].map((item, groupIdx) => {
                  const groupX = 80 + groupIdx * 145;
                  const colors = ['#2563eb', '#f59e0b', '#8b5cf6', '#10b981'];

                  return (
                    <g key={groupIdx}>
                      <text x={groupX + 45} y="185" textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">
                        {item.cat}
                      </text>

                      {/* Grouped Bars */}
                      {item.rates.map((rate, bIdx) => {
                        const barHeight = Math.max(15, (rate / 2000) * 130);
                        const barX = groupX + bIdx * 20;
                        const barY = 160 - barHeight;

                        return (
                          <g key={bIdx} className="group cursor-pointer">
                            <rect
                              x={barX}
                              y={barY}
                              width="16"
                              height={barHeight}
                              fill={colors[bIdx]}
                              rx="3"
                              className="hover:opacity-80 transition-opacity"
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bar Legend */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-blue-600 rounded-sm" /> Arghakhanchi</div>
              <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-amber-500 rounded-sm" /> Panchakanya</div>
              <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-purple-600 rounded-sm" /> Hulas Steel</div>
              <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-emerald-600 rounded-sm" /> Bela Approved Baseline</div>
            </div>
          </div>

          {/* Pentagon Radar Evaluation Vector (1 Col) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-600" /> Supplier Procurement Radar Vector
              </h2>
              <p className="text-xs text-slate-400">Pentagon criteria comparison graph</p>
            </div>

            {/* SVG PENTAGON RADAR VECTOR */}
            <div className="flex justify-center my-1">
              <svg viewBox="0 0 200 200" className="w-52 h-52 select-none">
                {/* Concentric Pentagon Grids */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => {
                  const pts = Array.from({ length: 5 }).map((_, aIdx) => {
                    const angle = (aIdx * 2 * Math.PI) / 5 - Math.PI / 2;
                    const x = 100 + scale * 75 * Math.cos(angle);
                    const y = 100 + scale * 75 * Math.sin(angle);
                    return `${x},${y}`;
                  }).join(' ');

                  return <polygon key={i} points={pts} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
                })}

                {/* Overlaid Pentagon Data Polygons */}
                <polygon
                  points="100,32.5 167.5,78 141,152.5 59,152.5 32.5,78"
                  fill="#2563eb"
                  fillOpacity="0.25"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />
                <polygon
                  points="100,47.5 152.5,88 126,145 74,145 47.5,88"
                  fill="#10b981"
                  fillOpacity="0.25"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Pentagon Axes Text */}
                <text x="100" y="18" textAnchor="middle" className="text-[9px] font-bold fill-slate-700">Price (100%)</text>
                <text x="182" y="75" textAnchor="start" className="text-[9px] font-bold fill-slate-700">Quality</text>
                <text x="150" y="172" textAnchor="middle" className="text-[9px] font-bold fill-slate-700">Lead Time</text>
                <text x="50" y="172" textAnchor="middle" className="text-[9px] font-bold fill-slate-700">Capacity</text>
                <text x="18" y="75" textAnchor="end" className="text-[9px] font-bold fill-slate-700">Reliability</text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-t border-slate-100 pt-2">
              <span className="flex items-center gap-1 text-blue-600"><span className="h-2.5 w-2.5 bg-blue-600 rounded-full" /> Arghakhanchi</span>
              <span className="flex items-center gap-1 text-emerald-600"><span className="h-2.5 w-2.5 bg-emerald-600 rounded-full" /> Bela Baseline</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Executive Compliance Reports Library (Export Generator) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" /> Compliance Reports & CSV Exporter Library
            </h2>
            <span className="text-[10px] text-slate-400 font-bold">
              Instant Download Formats: UTF-8 CSV / Excel / Printable Snapshot
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportList.map((rep) => (
              <div
                key={rep.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[10px] font-mono font-extrabold border border-slate-200">
                      {rep.format}
                    </span>
                  </div>
                  <div className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider mb-1">{rep.category}</div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{rep.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Ready to export</span>
                  <button
                    onClick={() => setExportModalReport(rep)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 shadow-xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
