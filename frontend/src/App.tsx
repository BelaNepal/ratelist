import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';


import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProductMaster } from './pages/ProductMaster';
import { EcoPanels } from './pages/EcoPanels';
import { ModularHomes } from './pages/ModularHomes';
import { CostingEngine } from './pages/CostingEngine';
import { BOQBuilder } from './pages/BOQBuilder';
import { Projects } from './pages/Projects';
import { Quotations } from './pages/Quotations';
import { ApprovalWorkflow } from './pages/ApprovalWorkflow';
import { Suppliers } from './pages/Suppliers';
import { Reports } from './pages/Reports';
import { AIDocsViewer } from './pages/AIDocsViewer';
import { CategorySettings } from './pages/CategorySettings';
import { TrashBinPage } from './pages/TrashBin';
import { LoginPage } from './pages/LoginPage';
import { UserManagement } from './pages/UserManagement';
import { AccessRestricted } from './components/AccessRestricted';



import { RateHistoryModal } from './components/RateHistoryModal';
import { NewRateModal } from './components/NewRateModal';
import { AddProductModal } from './components/AddProductModal';
import { fetchApprovalRequests, fetchProducts } from './services/api';
import { Product } from './types';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, login, quickDemoSelect, canAccess } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Modals state
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);

  const mainRef = React.useRef<HTMLDivElement>(null);

  // Auto-reset scroll position to top whenever navigating between tabs
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeTab]);

  const loadPendingCount = () => {
    fetchApprovalRequests().then((reqs) => {
      const pending = reqs.filter((r) => r.status === 'PENDING').length;
      setPendingApprovalsCount(pending);
    }).catch(() => {});
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleOpenAddProject = () => {
    setActiveTab('projects');
  };

  const handleGlobalSearchChange = (query: string) => {
    setGlobalSearchQuery(query);
    if (query.trim() && activeTab !== 'products') {
      setActiveTab('products');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <img src="/bela_logo.png" alt="Bela Logo" className="h-16 w-auto mb-4 animate-pulse" />
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-xs font-semibold text-slate-400">Loading Bela Enterprise Engine...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={login} onQuickDemoLogin={quickDemoSelect} />;
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans overflow-hidden">
      {/* Navigation Header (Sticky Top) */}
      <Navbar
        pendingCount={pendingApprovalsCount}
        onOpenApprovalQueue={() => setActiveTab('approvals')}
        onGlobalSearchChange={handleGlobalSearchChange}
        globalSearchQuery={globalSearchQuery}
        onSelectProduct={(id) => {
          setHistoryProductId(id);
        }}
      />

      {/* Main Layout Row (Fixed Viewport) */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar Menu (Fixed, Non-Scrollable Page Sidebar) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Center Content View Area (Spacious Padding & Smooth Scroll) */}
        <main ref={mainRef} className="flex-1 overflow-y-auto h-full w-full scroll-smooth bg-slate-50">
          {!canAccess(activeTab) ? (
            <AccessRestricted tabName={activeTab} onNavigateHome={() => setActiveTab('dashboard')} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenAddProduct={() => setShowAddProduct(true)}
                  onOpenAddProject={handleOpenAddProject}
                />
              )}

              {activeTab === 'products' && (
                <ProductMaster
                  onInspectHistory={(id) => setHistoryProductId(id)}
                  onEditRate={(prod) => setEditProduct(prod)}
                  onOpenAddProduct={() => setShowAddProduct(true)}
                  searchQuery={globalSearchQuery}
                />
              )}

              {activeTab === 'product_settings' && <CategorySettings />}

              {activeTab === 'ecopanels' && (
                <EcoPanels
                  onInspectHistory={(id) => setHistoryProductId(id)}
                  onEditRate={(prod) => setEditProduct(prod)}
                />
              )}

              {activeTab === 'modular' && (
                <ModularHomes onNavigateToBOQ={() => setActiveTab('boq')} />
              )}

              {activeTab === 'costing' && <CostingEngine />}

              {activeTab === 'boq' && (
                <BOQBuilder onSavedBOQ={() => setActiveTab('quotations')} />
              )}

              {activeTab === 'projects' && (
                <Projects
                  onNavigateToBOQ={() => setActiveTab('boq')}
                  onOpenAddProject={handleOpenAddProject}
                />
              )}

              {activeTab === 'quotations' && <Quotations />}

              {activeTab === 'approvals' && <ApprovalWorkflow />}

              {activeTab === 'users' && <UserManagement />}

              {activeTab === 'suppliers' && <Suppliers />}

              {activeTab === 'reports' && <Reports />}

              {activeTab === 'trash' && <TrashBinPage />}

              {activeTab === 'docs' && <AIDocsViewer />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {historyProductId && (
        <RateHistoryModal
          productId={historyProductId}
          onClose={() => setHistoryProductId(null)}
        />
      )}

      {editProduct && (
        <NewRateModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSubmitted={() => {
            loadPendingCount();
            setActiveTab('approvals');
          }}
        />
      )}

      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onAdded={() => {
            loadPendingCount();
            setActiveTab('products');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

