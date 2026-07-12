import React, { useState } from 'react';
import { Bell, Sparkles } from 'lucide-react';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const logs = [
    { type: 'all', detail: 'Laptop AF-0014 assigned to Priya Shah', time: '2m ago' },
    { type: 'approvals', detail: 'Maintenance request AF-0055 approved', time: '18m ago' },
    { type: 'bookings', detail: 'Booking confirmed : Room B2 : 2:00 to 3:00 PM', time: '1h ago' },
    { type: 'approvals', detail: 'Transfer approved : AF-0033 to facilities dept', time: '3h ago' },
    { type: 'alerts', detail: 'Overdue return : AF-0021 was due 3 days ago', time: '1d ago' },
    { type: 'alerts', detail: 'audit discrepancy flagged : AF-0088 damaged', time: '2d ago' },
  ];

  const filteredLogs = activeFilter === 'all' 
    ? logs 
    : logs.filter(log => log.type === activeFilter);

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
      {/* Filters header */}
      <div className="flex border-b border-hairline-violet gap-6">
        {['all', 'alerts', 'approvals', 'bookings'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
              activeFilter === filter ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredLogs.map((log, idx) => (
          <div key={idx} className="flex justify-between items-center p-4 bg-primary/40 border border-hairline-violet/50 rounded-md hover:border-accent-violet transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded ${
                log.type === 'alerts' 
                  ? 'bg-accent-pink/10 text-accent-pink' 
                  : log.type === 'approvals' 
                  ? 'bg-accent-lime/10 text-accent-lime' 
                  : 'bg-accent-violet/10 text-accent-violet'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-sm text-white font-medium">{log.detail}</span>
            </div>
            <span className="text-xs text-on-dark-muted font-mono">{log.time}</span>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-sm text-on-dark-muted border border-dashed border-hairline-violet/30 rounded-md">
            No activity logs found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
