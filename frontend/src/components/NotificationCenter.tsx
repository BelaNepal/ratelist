import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, ShieldAlert, FileText, CheckCircle2, TrendingUp, AlertTriangle, X, Sparkles, PlusCircle } from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'approval' | 'system' | 'boq' | 'rate';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'approval',
    title: 'Pending Rate Approval Request',
    message: 'Bikash (Rate Mgr) requested rate change for EPS Panel 50mm from Rs. 1,920 to Rs. 1,980.',
    timestamp: '2 mins ago',
    read: false,
    actionTab: 'approvals'
  },
  {
    id: 'notif_2',
    type: 'system',
    title: 'PostgreSQL Enterprise DB Active',
    message: 'Local PostgreSQL database connection established. User tables & AES-256 session vault active.',
    timestamp: '10 mins ago',
    read: false
  },
  {
    id: 'notif_3',
    type: 'rate',
    title: 'Raw Material Cost Surge Alert',
    message: 'OPC Cement 53 Grade supplier price increased by +4.2%. Costing Engine updated automatically.',
    timestamp: '1 hour ago',
    read: false,
    actionTab: 'costing'
  },
  {
    id: 'notif_4',
    type: 'boq',
    title: 'New BOQ Estimate Generated',
    message: 'Project Pokhara Luxury Resort generated BOQ quote #QUO-2026-089 (Rs. 4.2M).',
    timestamp: '3 hours ago',
    read: true,
    actionTab: 'quotations'
  }
];

interface NotificationCenterProps {
  onNavigateTab: (tab: string) => void;
  pendingApprovalsCount: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateTab, pendingApprovalsCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'approval' | 'system' | 'rate'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Synchronize unread approval count if backend pending count changes
  useEffect(() => {
    if (pendingApprovalsCount > 0) {
      setNotifications((prev) => {
        const hasPendingNotif = prev.some((n) => n.id === 'notif_1' && !n.read);
        if (!hasPendingNotif) {
          return [
            {
              id: 'notif_1',
              type: 'approval',
              title: `${pendingApprovalsCount} Pending Rate Approvals`,
              message: `There are ${pendingApprovalsCount} rate change requests awaiting executive audit.`,
              timestamp: 'Just now',
              read: false,
              actionTab: 'approvals'
            },
            ...prev.filter((n) => n.id !== 'notif_1')
          ];
        }
        return prev;
      });
    }
  }, [pendingApprovalsCount]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleSimulateLiveNotification = () => {
    const liveAlerts: AppNotification[] = [
      {
        id: `live_${Date.now()}`,
        type: 'rate',
        title: '⚡ Live Rate Change Submitted',
        message: 'Steel Channel raw material rate recalculated at Rs. 145/ft. Live MIS updated.',
        timestamp: 'Just now',
        read: false,
        actionTab: 'products'
      },
      {
        id: `live_${Date.now()}`,
        type: 'system',
        title: '🔒 PostgreSQL Session Audit',
        message: 'New corporate user logged in from 192.168.1.45. AES-256 session token issued.',
        timestamp: 'Just now',
        read: false
      },
      {
        id: `live_${Date.now()}`,
        type: 'approval',
        title: '✅ Rate Change Approved',
        message: 'Chief Approver Sunil approved EPS 75mm rate update (Rs. 2,350/m²).',
        timestamp: 'Just now',
        read: false,
        actionTab: 'ecopanels'
      }
    ];
    const randomAlert = liveAlerts[Math.floor(Math.random() * liveAlerts.length)];
    setNotifications((prev) => [randomAlert, ...prev]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'approval': return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case 'system': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'rate': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        title="Live Notifications & Activity Stream"
      >
        <Bell className="h-5 w-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">

          
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-blue-400" />
              <h3 className="font-bold text-sm tracking-tight">Live Activity Stream</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSimulateLiveNotification}
                className="p-1 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Simulate Real-time Incoming Live Notification"
              >
                <PlusCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs">
            <div className="flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${filter === 'all' ? 'bg-white text-blue-600 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('approval')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${filter === 'approval' ? 'bg-white text-blue-600 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Approvals
              </button>
              <button
                onClick={() => setFilter('rate')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${filter === 'rate' ? 'bg-white text-blue-600 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Rates
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Read All
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    handleMarkAsRead(n.id);
                    if (n.actionTab) {
                      onNavigateTab(n.actionTab);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${!n.read ? 'bg-blue-50/40 border-l-4 border-blue-600' : ''}`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                  </div>

                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="h-8 w-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-medium">No live notifications right now.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              onClick={handleSimulateLiveNotification}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              Simulate Live Event
            </button>

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                Clear Stream
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
