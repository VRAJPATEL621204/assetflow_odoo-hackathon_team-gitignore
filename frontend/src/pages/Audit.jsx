import React from 'react';
import { ClipboardList, Check, AlertTriangle, XOctagon } from 'lucide-react';

const Audit = () => {
  const auditList = [
    { tag: 'AF-003', name: 'Dell Laptop', expectedLoc: 'Desk E12', status: 'Verified' },
    { tag: 'AF-9921', name: 'Office Chair', expectedLoc: 'Desk E14', status: 'Missing' },
    { tag: 'AF-9838', name: 'Monitor', expectedLoc: 'Desk E15', status: 'Damaged' },
  ];

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
      {/* Active Audit header card */}
      <div className="bg-primary/50 border border-hairline-violet p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs text-accent-lime font-bold uppercase tracking-wider block">Active Audit Cycle</span>
          <h3 className="text-sm font-bold text-white mt-0.5">Q3 audit: Engineering dept - 1-15 jul</h3>
          <span className="text-xs text-on-dark-muted block">Auditors: A. Rao, S. Iqbal</span>
        </div>
        <button className="bg-accent-lime text-primary px-4 py-2 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors">
          + Start New Cycle
        </button>
      </div>

      {/* Discrepancy warning banner */}
      <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 text-xs text-on-dark-muted flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-accent-pink" />
        <span><strong>2 assets flagged</strong> - discrepancy report has been generated automatically.</span>
      </div>

      {/* Audit items checklist */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
              <th className="pb-3">Asset</th>
              <th className="pb-3">Expected Location</th>
              <th className="pb-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-hairline-violet/50">
            {auditList.map((item) => (
              <tr key={item.tag} className="hover:bg-primary/20">
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-accent-lime">{item.tag}</span>
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 text-on-dark-muted">{item.expectedLoc}</td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className={`p-1.5 rounded transition-colors ${
                      item.status === 'Verified' ? 'bg-accent-lime/20 text-accent-lime' : 'bg-primary border border-hairline-violet text-on-dark-muted'
                    }`} title="Verified">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className={`p-1.5 rounded transition-colors ${
                      item.status === 'Missing' ? 'bg-accent-pink/20 text-accent-pink' : 'bg-primary border border-hairline-violet text-on-dark-muted'
                    }`} title="Missing">
                      <XOctagon className="w-4 h-4" />
                    </button>
                    <button className={`p-1.5 rounded transition-colors ${
                      item.status === 'Damaged' ? 'bg-accent-violet/20 text-accent-violet' : 'bg-primary border border-hairline-violet text-on-dark-muted'
                    }`} title="Damaged">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-hairline-violet flex justify-end">
        <button className="bg-accent-pink hover:bg-accent-pink/90 text-white px-5 py-2.5 rounded text-xs font-bold transition-colors">
          Close Audit Cycle
        </button>
      </div>
    </div>
  );
};

export default Audit;
