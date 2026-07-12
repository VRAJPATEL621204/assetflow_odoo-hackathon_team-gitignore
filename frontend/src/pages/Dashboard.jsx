import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRightLeft, 
  Wrench, 
  CalendarDays, 
  AlertTriangle,
  FolderPlus,
  PlusCircle,
  Bell,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [metrics, setMetrics] = useState({
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenanceToday: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    upcomingReturns: 0,
    overdueReturns: 0,
  });

  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem('token');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/reports/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const res = await response.json();
      if (res.success) {
        setMetrics(res.data.kpis);
      }

      // Fetch top 5 notifications
      const notifResponse = await fetch('http://localhost:5000/api/reports/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const notifData = await notifResponse.json();
      if (notifData.success) {
        setNotifications(notifData.data.slice(0, 5));
      }
    } catch (err) {
      setError('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const kpis = [
    { name: 'Assets Available', value: metrics.assetsAvailable.toString(), change: 'Good condition', icon: CheckCircle2, color: 'text-accent-lime' },
    { name: 'Assets Allocated', value: metrics.assetsAllocated.toString(), change: 'Assigned to staff', icon: ArrowRightLeft, color: 'text-accent-violet' },
    { name: 'Maintenance Today', value: metrics.maintenanceToday.toString(), change: 'Active repairs', icon: Wrench, color: 'text-accent-pink' },
    { name: 'Active Bookings', value: metrics.activeBookings.toString(), change: 'Resource rooms/cars', icon: CalendarDays, color: 'text-white' },
    { name: 'Pending Transfers', value: metrics.pendingTransfers.toString(), change: 'Awaiting approvals', icon: ArrowRightLeft, color: 'text-accent-violet-mid' },
    { name: 'Upcoming Returns', value: metrics.upcomingReturns.toString(), change: 'Due this week', icon: CalendarDays, color: 'text-accent-lime' },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Alert Banners */}
      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs p-3 rounded">
          {error}
        </div>
      )}

      {/* Alert Panel for Overdue Returns */}
      {metrics.overdueReturns > 0 && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-accent-pink w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-white">Attention Needed:</span>{' '}
            <span className="text-on-dark-muted">
              {metrics.overdueReturns} assets are currently overdue for return. Check the returns queue to initiate transfer or check-in.
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-ink-deep border border-hairline-violet rounded-lg p-6 flex items-center justify-between shadow">
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-dark-muted uppercase tracking-wider">{kpi.name}</span>
                <div className="text-3xl font-bold text-white">{kpi.value}</div>
                <span className="text-xs text-on-dark-muted block">{kpi.change}</span>
              </div>
              <div className={`p-3 bg-primary rounded border border-hairline-violet ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action panel & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Actions</h3>
          <button 
            onClick={() => navigate('/assets')} 
            className="w-full flex items-center gap-3 bg-primary hover:bg-accent-violet-deep/20 border border-hairline-violet text-white px-4 py-3 rounded text-sm font-medium transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-accent-lime" />
            Register Asset
          </button>
          <button 
            onClick={() => navigate('/booking')} 
            className="w-full flex items-center gap-3 bg-primary hover:bg-accent-violet-deep/20 border border-hairline-violet text-white px-4 py-3 rounded text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-accent-lime" />
            Book Resource
          </button>
          <button 
            onClick={() => navigate('/maintenance')} 
            className="w-full flex items-center gap-3 bg-primary hover:bg-accent-pink/10 border border-hairline-violet text-white px-4 py-3 rounded text-sm font-medium transition-colors"
          >
            <Wrench className="w-4 h-4 text-accent-pink" />
            Raise Maintenance
          </button>
        </div>

        {/* Recent Notifications */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Notifications</h3>
            <button 
              onClick={() => navigate('/notifications')}
              className="text-xs text-accent-lime font-bold hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isOverdue = n.type === 'OVERDUE';
                const isPending = n.type === 'REQUEST_PENDING';
                const isBooking = n.type === 'BOOKING_START';
                
                return (
                  <div 
                    key={n.id} 
                    className={`flex items-start gap-3 p-3 rounded border text-xs transition-colors ${
                      n.isRead 
                        ? 'bg-primary/5 border-hairline-violet/10' 
                        : 'bg-accent-violet-deep/5 border-accent-violet/30'
                    }`}
                  >
                    <div className={`p-1.5 rounded mt-0.5 border ${
                      isOverdue 
                        ? 'bg-accent-pink/10 text-accent-pink border-accent-pink/20' 
                        : isPending 
                        ? 'bg-accent-violet/10 text-accent-violet border-accent-violet/20' 
                        : isBooking 
                        ? 'bg-accent-lime/10 text-accent-lime border-accent-lime/20' 
                        : 'bg-white/5 text-on-dark-muted border-hairline-violet/10'
                    }`}>
                      {isOverdue ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : isPending ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : isBooking ? (
                        <CalendarDays className="w-3.5 h-3.5" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-white/95 leading-normal ${!n.isRead ? 'font-semibold' : ''}`}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-on-dark-muted block mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-on-dark-muted text-xs border border-dashed border-hairline-violet/25 rounded bg-primary/5">
                No recent notifications.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
