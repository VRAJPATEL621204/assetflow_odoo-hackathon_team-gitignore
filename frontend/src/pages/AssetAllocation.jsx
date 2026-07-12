import React, { useState } from 'react';
import { AlertCircle, History } from 'lucide-react';

const AssetAllocation = () => {
  const [selectedAsset, setSelectedAsset] = useState('AF-0114');
  const [targetEmployee, setTargetEmployee] = useState('');
  const [reason, setReason] = useState('');

  const history = [
    { date: 'Mar 12', detail: 'Allocated to Priya Shah - Engineering' },
    { date: 'Jan 04', detail: 'Returned by Arjun Nair - condition: good' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Allocation Panel */}
      <div className="lg:col-span-2 bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Asset ID / Tag</label>
          <input
            type="text"
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none"
          />
        </div>

        {/* Double Allocation Conflict Block */}
        <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-accent-pink flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <span className="font-semibold text-white block">Already Allocated to Priya Shah (Engineering)</span>
            <span className="text-on-dark-muted block text-xs">
              Direct re-allocation is blocked. Submit a transfer request below to shift custody.
            </span>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="space-y-4 pt-4 border-t border-hairline-violet">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transfer Request</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">From</label>
              <input
                type="text"
                value="Priya Shah"
                className="w-full bg-primary/40 border border-hairline-violet/50 rounded px-3.5 py-2.5 text-sm text-on-dark-muted focus:outline-none"
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">To</label>
              <select
                value={targetEmployee}
                onChange={(e) => setTargetEmployee(e.target.value)}
                className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime"
              >
                <option value="">Select Employee...</option>
                <option value="Raj Kumar">Raj Kumar</option>
                <option value="Siddharth Varma">Siddharth Varma</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Reason</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for this transfer request..."
              className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime"
            />
          </div>

          <button className="bg-accent-lime text-primary font-bold px-5 py-2.5 rounded text-sm hover:bg-accent-lime/90 transition-colors">
            Submit Request
          </button>
        </div>
      </div>

      {/* Allocation History Sidebar */}
      <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2 text-white">
          <History className="w-5 h-5 text-accent-violet" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Allocation History</h3>
        </div>

        <div className="relative border-l border-hairline-violet pl-4 ml-2 space-y-6 py-2">
          {history.map((item, idx) => (
            <div key={idx} className="relative">
              {/* Dot */}
              <div className="absolute -left-6.5 top-1.5 w-4.5 h-4.5 rounded-full bg-primary border-2 border-accent-violet flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-lime"></div>
              </div>
              <div className="text-xs text-on-dark-muted font-semibold">{item.date}</div>
              <div className="text-sm text-white mt-1">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
