import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  BellRing,
  LogOut
} from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Organization Setup', path: '/organization', icon: Building2 },
    { name: 'Assets', path: '/assets', icon: Package },
    { name: 'Allocation & Transfer', path: '/allocation', icon: ArrowLeftRight },
    { name: 'Resource Booking', path: '/booking', icon: CalendarDays },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Audit', path: '/audit', icon: ClipboardCheck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: BellRing },
  ];

  return (
    <div className="flex h-screen bg-primary text-surface-canvas-light font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-deep border-r border-hairline-violet flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-hairline-violet gap-2">
            <div className="w-8 h-8 rounded bg-accent-lime flex items-center justify-center text-primary font-bold">
              AF
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AssetFlow</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-violet-deep text-white border-l-4 border-accent-lime'
                      : 'text-on-dark-muted hover:text-white hover:bg-accent-violet-deep/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-lime' : 'text-accent-violet-mid'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-hairline-violet flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Priya Shah</span>
            <span className="text-xs text-on-dark-muted">Dept Head</span>
          </div>
          <Link
            to="/login"
            className="p-2 text-on-dark-muted hover:text-accent-pink hover:bg-accent-pink/10 rounded transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-ink-deep border-b border-hairline-violet flex items-center justify-between px-8">
          <h1 className="text-lg font-bold text-white">
            {menuItems.find(m => m.path === location.pathname)?.name || 'AssetFlow'}
          </h1>
          <div className="flex items-center gap-4">
            {/* Quick action notification pill */}
            <div className="relative cursor-pointer p-1 text-on-dark-muted hover:text-white transition-colors">
              <BellRing className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent-pink rounded-full ring-2 ring-ink-deep"></span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8 bg-primary">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
