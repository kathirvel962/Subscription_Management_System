import React from 'react';
import {
  LogOut,
  User,
  ShieldCheck,
  Bell,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  user?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const storedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const role = storedUser?.role || 'GUEST';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> ADMIN
          </span>
        );
      case 'STAFF':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            STAFF
          </span>
        );
      case 'CUSTOMER':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            PORTAL CLIENT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 px-6 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
      {/* Brand & System Tag */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Brightloop
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/80 uppercase">
                Odoo MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Subscription & Billing Engine</p>
          </div>
        </a>
      </div>

      {/* Right Controls: Status, User, Logout */}
      <div className="flex items-center gap-4">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Engine Online</span>
        </div>

        {/* User Card & Logout */}
        {storedUser?.id ? (
          <div className="flex items-center gap-3">
            <a
              href="/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {storedUser.name ? storedUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {storedUser.name || storedUser.email}
                </div>
                <div className="mt-0.5">{getRoleBadge(role)}</div>
              </div>
            </a>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20"
          >
            Sign In
          </a>
        )}
      </div>
    </header>
  );
};
