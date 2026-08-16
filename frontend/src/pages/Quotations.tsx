import React, { useEffect, useState } from 'react';
import { Receipt, Printer, Download, Building2, CheckCircle, FileText, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchQuotations, fetchQuotationById } from '../services/api';
import { Quotation, BOQ, BOQItem } from '../types';
import { numberToWordsSouthAsian } from '../utils/nepaliFormatters';




export const Quotations: React.FC = () => {
  const { formatCurrency, formatNumber, digitMode, toggleDigitMode } = useLanguage();
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [selectedId, setSelectedId] = useState<string>('');
  const [activeData, setActiveData] = useState<{ quotation: Quotation; boq: BOQ } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchQuotations()
      .then((res) => {
        setQuotations(res);
        if (res.length > 0) {
          setSelectedId(res[0].id);
          fetchQuotationById(res[0].id).then(setActiveData);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectQuote = (id: string) => {
    setSelectedId(id);
    fetchQuotationById(id).then(setActiveData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!activeData) {
      window.print();
      return;
    }

    const sanitize = (str: string) => (str || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const quoteNo = activeData.quotation.quotation_no || 'QT-2026';
    const projName = activeData.quotation.project_name || 'Project';
    const customer = activeData.quotation.customer_name || 'Client';

    const meaningfulName = `BELA_Quotation_${sanitize(quoteNo)}_${sanitize(projName)}_${sanitize(customer)}_${dateStr}`;
    const originalTitle = document.title;

    document.title = meaningfulName;
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const toggleLanguage = () => {
    toggleDigitMode();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sticky Top Toolbar with Summary Bar (Hidden in Printed PDF) */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 pb-4 pt-2 space-y-4 no-print print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Receipt className="h-6 w-6 text-[#ef7e2d]" /> Official Quotation & Rate Document
            </h1>
            <p className="text-xs text-slate-500">
              Single Source of Truth Approved Rate Quote for Client Review and Printing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Numerical Format Switch (English Digits vs Nepali Digits) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Toggle Digits Format between English (123) and Nepali (१२३)"
            >
              <Globe className="h-4 w-4 text-[#ef7e2d]" />
              <span>{digitMode === 'nepali' ? '🇳🇵 नेपाली अंक (१२३)' : '🌐 English Digits (123)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-md cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print Quotation
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded-xl bg-[#ef7e2d] px-4 py-2 text-xs font-bold text-white hover:bg-[#ef7e2d]/90 shadow-md shadow-[#ef7e2d]/20 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* Quote Selector Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {quotations.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSelectQuote(q.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${selectedId === q.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
              <FileText className="h-4 w-4 text-[#ef7e2d]" />
              <span>{q.quotation_no}</span>
              <span className="text-[10px] text-slate-400">({q.customer_name})</span>
            </button>
          ))}
        </div>
      </div>

      {/* PRINTABLE QUOTATION CONTAINER (Matches Prompt Screen 9) */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          Loading quotation metadata...
        </div>
      ) : activeData ? (
        <div
          id="printable-quotation"
          className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xl text-slate-900 font-sans"
        >
          {/* Header Banner */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div className="flex items-center gap-4">
              <img src="/bela_logo.png" alt="Bela Nepal Logo" className="h-16 w-auto object-contain shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-wider text-slate-900">BELA NEPAL INDUSTRIES</span>
                </div>
                <p className="text-[11px] font-bold text-amber-600 mt-0.5">
                  Bela Eco Panels & Prefab Building Solutions Nepal
                </p>
                <p className="text-[10px] text-slate-500">Chhauni-15, Kathmandu, Nepal | Phone: +977-9802375303, 01-4356789</p>
              </div>
            </div>


            <div className="text-right">
              <div className="text-xl font-black text-blue-900">{activeData.quotation.quotation_no}</div>
              <div className="text-xs text-slate-500 font-bold mt-1">
                Date: {activeData.quotation.created_at}
              </div>
              <div className="text-[10px] text-slate-400">Valid Until: {activeData.quotation.valid_until}</div>
            </div>
          </div>

          {/* Customer & Project Details Box */}
          <div className="my-6 grid grid-cols-2 gap-6 rounded-xl bg-slate-50 p-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">CUSTOMER INFO</span>
              <div className="font-extrabold text-slate-900 text-sm">{activeData.quotation.customer_name}</div>
              <div className="text-slate-500">Contact: Purchasing Department</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">PROJECT DETAILS</span>
              <div className="font-bold text-slate-900">{activeData.quotation.project_name}</div>
              <div className="text-slate-500">Location: {activeData.quotation.location}</div>
              <div className="text-slate-500">Type: {activeData.quotation.building_type}</div>
            </div>
          </div>

          {/* Quotation Line Items Table */}
          <div className="my-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-800 uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-center">Unit</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Rate (NPR)</th>
                  <th className="py-3 px-3 text-right">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {activeData.boq.items.map((item: BOQItem, idx: number) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-bold text-slate-900">{item.product_name}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-3 px-3 text-center font-bold font-mono">
                      {formatNumber(item.qty)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700 font-mono">
                      {formatCurrency(item.unit_rate)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 font-mono">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Taxes Summary Box (Prompt Screen 9 format) */}
          <div className="my-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            {/* Amount In Words Executive Box */}
            <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Amount In Words (Nepali / South Asian System)
              </span>
              <div className="font-bold text-slate-900 leading-relaxed italic">
                "{numberToWordsSouthAsian(activeData.quotation.total_amount)}"
              </div>
            </div>

            <div className="w-full sm:w-80 space-y-2 border-t-2 border-slate-900 sm:border-t-0 sm:pt-0 pt-4 text-xs font-bold shrink-0">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(activeData.quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Discount ({formatNumber(activeData.quotation.discount_percent)}%)</span>
                <span className="font-mono">- {formatCurrency(activeData.quotation.discount_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>VAT ({formatNumber(activeData.quotation.vat_percent)}%)</span>
                <span className="font-mono">{formatCurrency(activeData.quotation.vat_amount)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm sm:text-base font-black text-blue-900">
                <span>TOTAL AMOUNT</span>
                <span className="font-mono">{formatCurrency(activeData.quotation.total_amount)}</span>
              </div>
            </div>
          </div>



          {/* Footer Terms & Signatures */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-end justify-between text-[10px] text-slate-500">
            <div>
              <div className="font-bold text-slate-700 mb-1">Terms & Conditions:</div>
              <p>1. Prices are based on current approved Bela Rate Master snapshots.</p>
              <p>2. Payment Schedule: 50% Advance, 40% on Panel Delivery, 10% on Completion.</p>
            </div>

            <div className="text-center">
              <div className="h-12 border-b border-slate-400 w-40 mb-1"></div>
              <div className="font-bold text-slate-800">Authorized Signature</div>
              <div className="text-slate-400">Bela Nepal Costing Dept</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
