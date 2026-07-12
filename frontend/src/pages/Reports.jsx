import React from 'react';
import { BarChart3, TrendingUp, Sparkles, Download } from 'lucide-react';

const Reports = () => {
  const mostUsed = [
    { name: 'Conference Room B2', bookings: '34 bookings this month' },
    { name: 'Delivery Van AF-343', bookings: '21 trips this month' },
    { name: 'Projector AF-335', bookings: '18 uses this month' },
  ];

  const idleAssets = [
    { name: 'DSLR Camera AF-0301', days: 'unused 60+ days' },
    { name: 'Office Chair AF-0410', days: 'unused 45 days' },
  ];

  const alerts = [
    { name: 'Forklift AF-0087', reason: 'service due in 5 days' },
    { name: 'Laptop AF-0020', reason: '4 years old: nearing retirement' },
  ];

  return (
    <div className="space-y-6">
      {/* Charts / KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 flex flex-col justify-between h-64">
          <div>
            <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Chart Analysis</span>
            <h3 className="text-sm font-bold text-white mt-1">Utilization by Department</h3>
          </div>
          {/* Visual Placeholder */}
          <div className="h-32 bg-primary/40 border border-dashed border-hairline-violet/30 rounded flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-accent-violet-mid opacity-40 mr-2" />
            <span className="text-xs text-on-dark-muted">[ Bar Chart: Eng vs Ops vs Sales ]</span>
          </div>
        </div>

        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 flex flex-col justify-between h-64">
          <div>
            <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Trend Analysis</span>
            <h3 className="text-sm font-bold text-white mt-1">Maintenance Frequency</h3>
          </div>
          {/* Visual Placeholder */}
          <div className="h-32 bg-primary/40 border border-dashed border-hairline-violet/30 rounded flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-accent-pink opacity-40 mr-2" />
            <span className="text-xs text-on-dark-muted">[ Line Chart: Failure trends over time ]</span>
          </div>
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Used */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-hairline-violet pb-2">Most Used Assets</h3>
          <div className="space-y-3">
            {mostUsed.map((item, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-white font-medium block">{item.name}</span>
                <span className="text-xs text-accent-lime">{item.bookings}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Idle */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-hairline-violet pb-2">Idle Assets</h3>
          <div className="space-y-3">
            {idleAssets.map((item, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-white font-medium block">{item.name}</span>
                <span className="text-xs text-accent-violet-mid">{item.days}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance / Retirement */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-hairline-violet pb-2">Nearing Retirement</h3>
          <div className="space-y-3">
            {alerts.map((item, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-white font-medium block">{item.name}</span>
                <span className="text-xs text-accent-pink">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-hairline-violet">
        <button className="bg-accent-lime text-primary px-5 py-2.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-accent-lime/90 transition-colors">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>
    </div>
  );
};

export default Reports;
