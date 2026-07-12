import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRightLeft, 
  Wrench, 
  CalendarDays, 
  AlertTriangle,
  FolderPlus,
  PlusCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const kpis = [
    { name: 'Assets Available', value: '128', change: 'Good condition', icon: CheckCircle2, color: 'text-accent-lime' },
    { name: 'Assets Allocated', value: '76', change: 'Assigned to staff', icon: ArrowRightLeft, color: 'text-accent-violet' },
    { name: 'Maintenance Today', value: '4', change: 'Active repairs', icon: Wrench, color: 'text-accent-pink' },
    { name: 'Active Bookings', value: '8', change: 'Resource rooms/cars', icon: CalendarDays, color: 'text-white' },
    { name: 'Pending Transfers', value: '3', change: 'Awaiting approvals', icon: ArrowRightLeft, color: 'text-accent-violet-mid' },
    { name: 'Upcoming Returns', value: '12', change: 'Due this week', icon: CalendarDays, color: 'text-accent-lime' },
  ];

  const recentActivity = [
    { id: 1, action: 'Laptop AF-0114 allocated to Priya Shah (IT Dept)', time: '2m ago' },
    { id: 2, action: 'Maintenance request AF-0062 for Projector resolved', time: '18m ago' },
    { id: 3, action: 'Booking confirmed: Conference Room B2 (2:00 to 3:00 PM)', time: '1h ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Panel for Overdue Returns */}
      <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="text-accent-pink w-5 h-5 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-semibold text-white">Attention Needed:</span>{' '}
          <span className="text-on-dark-muted">2 assets are currently overdue for return. Check the returns queue to initiate transfer or check-in.</span>
        </div>
      </div>

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

      {/* Action panel & Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
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

        {/* Recent Activity */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center border-b border-hairline-violet/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-on-dark-muted">{activity.action}</span>
                <span className="text-xs text-accent-violet-mid font-medium">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
