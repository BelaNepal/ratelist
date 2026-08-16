import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Home,
  Calculator,
  FileSpreadsheet,
  Building,
  Receipt,
  CheckSquare,
  Truck,
  TrendingUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Users
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'product_settings'
  | 'ecopanels'
  | 'modular'
  | 'costing'
  | 'boq'
  | 'projects'
  | 'quotations'
  | 'approvals'
  | 'suppliers'
  | 'reports'
  | 'docs'
  | 'trash'
  | 'users';


interface SubMenuItem {
  id: string;
  label: string;
  tab: NavTab;
  categoryFilter?: string;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  onOpenAddProduct?: () => void;
}

import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount
}) => {
  const { canAccess, role } = useAuth();

  // Collapsible Sidebar State with Hover Auto-Peek
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Effective expanded state: expanded if pinned (!isCollapsed) OR if hovered in collapsed mode
  const effectiveExpanded = !isCollapsed || isHovered;

  // Track open expanded submenus
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    products: true
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'products',
      label: 'Product Master',
      icon: Package,
      subItems: [
        { id: 'prod_settings', label: '⚙️ Category & Column Settings', tab: 'product_settings' }
      ]
    },
    { id: 'ecopanels', label: 'Eco Panels Rate', icon: Layers },
    { id: 'modular', label: 'Modular Prefab Homes', icon: Home },
    { id: 'costing', label: 'Costing & BOM Engine', icon: Calculator },
    { id: 'boq', label: 'BOQ Builder', icon: FileSpreadsheet },
    { id: 'projects', label: 'Projects', icon: Building },
    { id: 'quotations', label: 'Quotations & PDF', icon: Receipt },
    { id: 'approvals', label: 'Approval Workflow', icon: CheckSquare, badge: pendingApprovalsCount },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'suppliers', label: 'Supplier Rate List', icon: Truck },
    { id: 'reports', label: 'Reports & Trends', icon: TrendingUp },
    { id: 'trash', label: 'Trash Bin & Recovery', icon: Trash2 },
    { id: 'docs', label: 'AI Docs & Guides', icon: BookOpen }
  ];

  const navItems = allNavItems.filter((item) => canAccess(item.id));


  return (
    <aside
      onMouseEnter={() => {
        if (isCollapsed) setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={`${
        effectiveExpanded ? 'w-64 p-3 shadow-2xl z-40' : 'w-16 p-2 z-30'
      } shrink-0 h-full border-r border-slate-800 bg-slate-900 text-slate-300 flex flex-col justify-between select-none overflow-hidden transition-all duration-300 relative`}
    >
      {/* Sticky Top Header Bar with Modern Collapse / Expand Toggle Button */}
      <div className="sticky top-0 z-10 bg-slate-900 flex items-center justify-between px-2 py-1.5 mb-2 border-b border-slate-800/80">
        {effectiveExpanded && (
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ef7e2d]">
            Navigation Vault
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-[#ef7e2d] transition-all shadow-xs ${
            !effectiveExpanded ? 'mx-auto' : 'ml-auto'
          }`}
          title={isCollapsed ? 'Pin Sidebar Menu Expanded' : 'Collapse Sidebar Menu'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-[#ef7e2d]" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Scrollable Center Menu Items with Compact Padding (py-2 px-3) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const filteredSubItems = item.subItems?.filter((sub) => canAccess(sub.tab)) || [];
          const hasSubItems = filteredSubItems.length > 0;
          const isExpanded = !!expandedItems[item.id] && effectiveExpanded;

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (hasSubItems) {
                    setExpandedItems((prev) => ({ ...prev, [item.id]: true }));
                  }
                }}
                title={!effectiveExpanded ? item.label : undefined}
                className={`flex w-full items-center ${
                  !effectiveExpanded ? 'justify-center px-1.5 py-2' : 'justify-between px-3 py-2'
                } text-xs font-bold transition-all duration-150 rounded-xl ${
                  isActive
                    ? 'bg-[#ef7e2d] text-white shadow-md shadow-[#ef7e2d]/30 font-black'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {effectiveExpanded && <span className="truncate tracking-wide text-[11px]">{item.label}</span>}
                </div>

                {effectiveExpanded && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow-xs">
                        {item.badge}
                      </span>
                    )}
                    {hasSubItems && (
                      <span
                        onClick={(e) => toggleExpand(item.id, e)}
                        className="p-0.5 rounded-md hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Submenu Dropdown List */}
              {hasSubItems && isExpanded && effectiveExpanded && (
                <div className="ml-4 pl-2.5 border-l-2 border-slate-700/80 space-y-0.5 py-0.5">
                  {filteredSubItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveTab(sub.tab)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                        activeTab === sub.tab
                          ? 'text-[#ef7e2d] font-black bg-slate-800/80 border-l-2 border-[#ef7e2d]'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Footer Branding Card */}
      <div className="sticky bottom-0 z-10 bg-slate-900 pt-2 border-t border-slate-800/80">
        {effectiveExpanded ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 text-[10px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <img
                src="/bela_logo.png"
                alt="Bela Logo"
                className="h-7 w-auto object-contain bg-white/10 p-1 rounded-md shrink-0"
              />
              <div>
                <div className="font-black text-white text-xs tracking-wide">BELA NEPAL</div>
                <div className="text-[9px] text-[#ef7e2d] font-black uppercase tracking-wider">
                  Building Solutions
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <img
              src="/bela_logo.png"
              alt="Bela Logo"
              className="h-7 w-auto object-contain bg-white/10 p-1 rounded-md"
              title="Bela Nepal Building Solutions"
            />
          </div>
        )}
      </div>
    </aside>
  );
};

