import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
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
  LogOut,
  Check
} from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        const unread = data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark single read', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
    } else if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchNotifications();
    }
  }, [navigate, location.pathname]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
            <span className="text-sm font-semibold text-white">{user?.name || 'Loading...'}</span>
            <span className="text-xs text-on-dark-muted capitalize">
              {user?.roles && user.roles.length > 0 ? user.roles.join(', ').toLowerCase().replace('_', ' ') : 'Employee'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-on-dark-muted hover:text-accent-pink hover:bg-accent-pink/10 rounded transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
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
            <div className="relative">
              {/* Quick action notification pill */}
              <button 
                onClick={() => {
                  fetchNotifications();
                  setShowDropdown(!showDropdown);
                }}
                className="relative p-1.5 text-on-dark-muted hover:text-white transition-colors focus:outline-none"
                title="Notifications"
              >
                <BellRing className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-accent-pink text-[9px] font-bold text-white flex items-center justify-center rounded-full px-0.5 border border-ink-deep">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  
                  {/* Popover Container */}
                  <div className="absolute right-0 mt-2 w-80 bg-ink-deep border border-hairline-violet rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-hairline-violet bg-primary/20 flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-accent-lime font-bold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-hairline-violet/20">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-3 text-xs flex justify-between items-start gap-2 hover:bg-primary/20 transition-colors ${
                              n.isRead ? 'text-on-dark-muted bg-transparent' : 'text-white bg-accent-violet-deep/5 font-medium'
                            }`}
                          >
                            <div className="flex-1 space-y-1">
                              <p className="leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[9px] text-on-dark-muted block">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkSingleRead(n.id)}
                                className="p-1 rounded-full border border-hairline-violet/50 hover:text-accent-lime hover:border-accent-lime transition-all mt-0.5 flex-shrink-0"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-on-dark-muted text-xs">
                          No notifications found.
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 border-t border-hairline-violet bg-primary/10 text-center">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/notifications');
                        }}
                        className="text-xs text-accent-lime font-bold hover:underline"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
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
