import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Repeat,
  Receipt,
  CreditCard,
  Percent,
  Users,
  Settings,
  X,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  // Navigation items defined with role access rules
  const allNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'staff', 'customer']
    },
    {
      name: 'Products',
      path: '/products',
      icon: Package,
      roles: ['admin', 'staff']
    },
    {
      name: 'Subscription Plans',
      path: '/plans',
      icon: CalendarDays,
      roles: ['admin', 'staff']
    },
    {
      name: role === 'customer' ? 'My Subscriptions' : 'Subscriptions',
      path: '/subscriptions',
      icon: Repeat,
      roles: ['admin', 'staff', 'customer']
    },
    {
      name: role === 'customer' ? 'My Invoices' : 'Invoices',
      path: '/invoices',
      icon: Receipt,
      roles: ['admin', 'staff', 'customer']
    },
    {
      name: role === 'customer' ? 'Payment History' : 'Payments',
      path: '/payments',
      icon: CreditCard,
      roles: ['admin', 'staff', 'customer']
    },
    {
      name: 'Discounts',
      path: '/discounts',
      icon: Percent,
      roles: ['admin'] // Only Admin can manage discounts
    },
    {
      name: role === 'admin' ? 'Users & Staff' : 'Customers',
      path: '/customers',
      icon: Users,
      roles: ['admin', 'staff']
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['admin', 'staff', 'customer']
    }
  ];

  const visibleItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#172554] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-none">
                Subscript<span className="text-indigo-400">IQ</span>
              </span>
              <span className="text-[10px] text-blue-300 font-medium tracking-wider uppercase block mt-1">
                Brightloop
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-blue-300 hover:text-white rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-semibold text-blue-300/70 uppercase tracking-wider">
            {role === 'customer' ? 'Customer Portal' : 'Workspace'}
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-blue-100 hover:bg-blue-900/40 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom role indicator */}
        <div className="p-4 border-t border-blue-900/50 bg-[#121c40]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs uppercase">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-blue-300 capitalize truncate">Role: {role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
