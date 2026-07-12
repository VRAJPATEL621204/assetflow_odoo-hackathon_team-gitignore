import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const ResourceBooking = () => {
  const schedule = [
    { time: '9:00', label: 'Booked - Procurement Team - 9:00 to 10:00 AM', booked: true, conflict: false },
    { time: '10:00', label: 'Requested 9:30 to 10:30 - conflict - slot is unavailable', booked: false, conflict: true },
    { time: '11:00', label: 'Available', booked: false, conflict: false },
    { time: '12:00', label: 'Available', booked: false, conflict: false },
    { time: '1:00', label: 'Available', booked: false, conflict: false },
  ];

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline-violet pb-4">
        <div>
          <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Resource Scheduler</span>
          <h2 className="text-lg font-bold text-white mt-1">Conference Room B2 - Tue, 7 Jul</h2>
        </div>
        <button className="bg-accent-lime text-primary px-4 py-2 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors">
          Book a Slot
        </button>
      </div>

      {/* Scheduler list */}
      <div className="space-y-4 max-w-2xl">
        {schedule.map((slot, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="w-12 font-mono text-sm text-on-dark-muted text-right">{slot.time}</span>
            <div className={`flex-1 p-4 rounded-md border text-sm transition-colors ${
              slot.booked 
                ? 'bg-accent-violet-deep/20 border-accent-violet text-white' 
                : slot.conflict 
                ? 'bg-accent-pink/10 border-dashed border-accent-pink text-accent-pink flex items-center gap-2' 
                : 'bg-primary border-hairline-violet text-on-dark-muted hover:border-accent-lime hover:text-white cursor-pointer'
            }`}>
              {slot.conflict && <AlertCircle className="w-4 h-4 text-accent-pink flex-shrink-0" />}
              {slot.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceBooking;
