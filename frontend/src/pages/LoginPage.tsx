import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Building2, Layers, CheckCircle2, ArrowRight, Sparkles, Key, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (email: string, pass: string) => Promise<boolean>;
  onQuickDemoLogin?: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onQuickDemoLogin }) => {
  const [email, setEmail] = useState('admin@belanepal.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both corporate email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const ok = await onLoginSuccess(email, password);
      if (!ok) {
        setError('Invalid corporate credentials. Please check your email and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts: Array<{ role: UserRole; title: string; email: string; pass: string; badge: string; color: string }> = [
    {
      role: 'Admin',
      title: '👑 Executive Admin',
      email: 'admin@belanepal.com',
      pass: 'admin123',
      badge: 'Full Executive Access',
      color: 'border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200'
    },
    {
      role: 'Rate Manager',
      title: '📦 Rate Manager',
      email: 'rate.mgr@belanepal.com',
      pass: 'rate123',
      badge: 'Submit Rates & Catalog',
      color: 'border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200'
    },
    {
      role: 'Approver',
      title: '✅ Chief Approver',
      email: 'approver@belanepal.com',
      pass: 'approver123',
      badge: 'Audit & Approval Queue',
      color: 'border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-200 text-emerald-200'
    },
    {
      role: 'Estimator',
      title: '🧮 BOQ Estimator',
      email: 'estimator@belanepal.com',
      pass: 'est123',
      badge: 'Costing & BOQ Builder',
      color: 'border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200'
    },
    {
      role: 'Sales',
      title: '💼 Sales Executive',
      email: 'sales@belanepal.com',
      pass: 'sales123',
      badge: 'Client Quotations',
      color: 'border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200'
    },
    {
      role: 'Viewer',
      title: '👀 Guest Viewer',
      email: 'viewer@belanepal.com',
      pass: 'viewer123',
      badge: 'Read Only Access',
      color: 'border-slate-500/40 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
    }
  ];

  const handleSelectDemo = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    if (onQuickDemoLogin) {
      onQuickDemoLogin(demo.role);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand Narrative & Key Highlights */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Enterprise Rate & Costing MIS Engine
          </div>

          <div className="flex items-center gap-4">
            <img
              src="/bela_logo.png"
              alt="Bela Nepal Logo"
              className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
                BELA NEPAL
              </h1>
              <p className="text-sm font-semibold text-blue-400 tracking-wide uppercase">
                Industries & EcoPanels
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Single Source of Truth Rate Management system for EPS Cement Sandwich Panels, Raw Material Indexing, BOQ Costing, and Multi-Level Corporate Approval Workflows.
          </p>

          {/* Value Props */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">PostgreSQL DB & AES-256 Encryption</h4>
                <p className="text-[11px] text-slate-400">Strict data security at rest with bcrypt passwords and HTTP-only session cookies.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Granular Role-Based Access Control</h4>
                <p className="text-[11px] text-slate-400">Restricted views for Admin, Rate Managers, Approvers, Estimators & Sales.</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                1-Click Quick Demo Personas:
              </span>
              <span className="text-[10px] text-slate-400">Click card to select</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs font-medium backdrop-blur-sm cursor-pointer ${demo.color}`}
                >
                  <div className="font-bold text-[12px] truncate">{demo.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{demo.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Modern Glassmorphic Login Form Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
            <div className="mb-6 text-left">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                Sign in to Corporate Console
              </h2>
              <p className="text-xs text-slate-400 mt-1">Enter your Bela Nepal corporate credentials below.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@belanepal.com"
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span>Remember session on this device</span>
                </label>
                <span className="text-blue-400 hover:underline cursor-pointer">Forgot password?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                PostgreSQL DB Auth Active
              </span>
              <span>TLS 1.3 • AES-256</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
