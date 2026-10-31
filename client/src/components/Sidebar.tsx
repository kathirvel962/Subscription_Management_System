import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CreditCard,
  AlertTriangle,
  Package,
  Calendar,
  Percent,
  Tag,
  Users,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentPath?: string;
  role?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, role }) => {
  const path = currentPath || window.location.pathname;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = role || user.role || 'CUSTOMER';

  const isCurrent = (p: string) => {
    if (p === '/' && path === '/') return true;
    if (p !== '/' && path.startsWith(p)) return true;
    return false;
  };

  const navSections = [
    {
      title: 'INTELLIGENCE & KPI',
      items: [
        { label: 'Executive Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'Revenue & Growth', href: '/revenue-analytics', icon: TrendingUp },
      ],
    },
    {
      title: 'SALES & CONTRACTS',
      items: [
        { label: 'Subscriptions', href: '/subscriptions', icon: RefreshCw },
        { label: 'Quotations', href: '/quotations', icon: FileSpreadsheet },
        { label: 'Quotation Templates', href: '/quotation-templates', icon: FileText },
      ],
    },
    {
      title: 'BILLING & FINANCE',
      items: [
        { label: 'Invoices', href: '/invoices', icon: FileText },
        { label: 'Payments & Receipts', href: '/payments', icon: CreditCard },
        { label: 'Overdue Dunning', href: '/overdue-invoices', icon: AlertTriangle },
      ],
    },
    {
      title: 'CATALOG & RULES',
      items: [
        { label: 'Products & Variants', href: '/products', icon: Package, badge: '+560 Odoo' },
        { label: 'Subscription Plans', href: '/plans', icon: Calendar },
        { label: 'Taxes & GST', href: '/taxes', icon: Percent },
        { label: 'Discounts & Codes', href: '/discounts', icon: Tag },
      ],
    },
  ];

  if (userRole === 'ADMIN') {
    navSections.push({
      title: 'SYSTEM ADMIN',
      items: [
        { label: 'User & Staff Management', href: '/users', icon: Users },
        { label: 'My Profile', href: '/profile', icon: UserCheck },
      ],
    });
  } else {
    navSections.push({
      title: 'ACCOUNT',
      items: [{ label: 'My Profile', href: '/profile', icon: UserCheck }],
    });
  }

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 backdrop-blur-xl flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-2">
              {section.title}
            </h4>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span>Odoo Hackathon</span>
            <span className="text-indigo-400">v1.0</span>
          </div>
          <p className="text-[10px] text-slate-500">4-Member Modular Architecture</p>
        </div>
      </div>
    </aside>
  );
};
