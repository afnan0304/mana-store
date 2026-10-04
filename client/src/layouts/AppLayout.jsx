import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  ArrowLeftRight,
  ClockAlert,
  History,
  BarChart3,
  Tags,
  Wrench,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Store,
  LogOut,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, group: 'Operations' },
  { name: 'Inventory', to: '/items', icon: Package, group: 'Operations' },
  { name: 'People / Borrowers', to: '/people', icon: Users, group: 'Operations' },
  { name: 'Issue / Return', to: '/transactions', icon: ArrowLeftRight, group: 'Operations' },
  { name: 'Overdue Items', to: '/overdue', icon: ClockAlert, badge: 'Alert', group: 'Operations' },
  { name: 'Maintenance', to: '/maintenance', icon: Wrench, group: 'Operations' },
  { name: 'Reports', to: '/reports', icon: BarChart3, group: 'Insights' },
  { name: 'Categories', to: '/categories', icon: Tags, group: 'Catalog' },
  { name: 'Audit Logs', to: '/audit-logs', icon: History, group: 'Catalog' },
  { name: 'Settings', to: '/settings', icon: Settings, group: 'Workspace' },
];

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentItem =
    navigationItems.find((item) =>
      item.to === '/dashboard'
        ? location.pathname === '/' || location.pathname === '/dashboard'
        : location.pathname.startsWith(item.to)
    ) || { name: 'Northline' };

  return (
    <div className="min-h-screen bg-[#f4f6f3] flex antialiased text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#172523] text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col border-r border-[#314542] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#314542]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">
                NORTHLINE
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Equipment Hub
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.name}>
                {(index === 0 || navigationItems[index - 1].group !== item.group) && (
                  <div className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 first:pt-0">
                    {item.group}
                  </div>
                )}
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold border-l-2 border-amber-400 pl-3'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-slate-500 group-hover:text-slate-200'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 m-3 border-t border-[#314542] rounded-md bg-[#10201e] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-md bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                {user?.role || 'STOREKEEPER'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-[#fbfcfa] border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 hidden sm:block tracking-tight">
              {currentItem.name}
            </h1>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory, tags..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 text-slate-800 placeholder-slate-400 transition-colors"
              />
            </div>

            <button
              type="button"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="h-8 w-8 rounded-md bg-teal-100 border border-teal-200 text-teal-800 font-semibold text-xs flex items-center justify-center">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-slate-800">{user?.username || 'Admin'}</p>
                <p className="text-slate-500 text-[11px]">{user?.role || 'Manager'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
