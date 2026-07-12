import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, XOctagon } from 'lucide-react';

const Audit = () => {
  // Lists
  const [cycles, setCycles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);

  // States
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleStart, setCycleStart] = useState('');
  const [cycleEnd, setCycleEnd] = useState('');
  const [selectedAuditors, setSelectedAuditors] = useState([]);

  // Notes Modal for Verification
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeAssetId, setActiveAssetId] = useState(null);
  const [activeVerifyStatus, setActiveVerifyStatus] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isManager = currentUser?.permissions?.includes('create_audit') || currentUser?.roles?.includes('ADMIN');
  const canVerify = currentUser?.permissions?.includes('perform_audit') || currentUser?.roles?.includes('ADMIN');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [cycleRes, assetRes, empRes] = await Promise.all([
        fetch('http://localhost:5000/api/audits/cycles', { headers }),
        fetch('http://localhost:5000/api/assets', { headers }),
        fetch('http://localhost:5000/api/org/employees', { headers }),
      ]);

      const cycleList = await cycleRes.json();
      const assetList = await assetRes.json();
      const empList = await empRes.json();

      if (cycleList.success) {
        setCycles(cycleList.data);
        // Default to the first active/scheduled cycle if not selected
        if (cycleList.data.length > 0 && !selectedCycleId) {
          const activeOrFirst = cycleList.data.find(c => c.status === 'ACTIVE') || cycleList.data[0];
          setSelectedCycleId(activeOrFirst.id.toString());
        }
      }
      if (assetList.success) setAssets(assetList.data);
      if (empList.success) setEmployees(empList.data);
    } catch (err) {
      setError('Failed to load audit logs or asset lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const activeCycleObj = cycles.find(c => c.id === parseInt(selectedCycleId));
  const isCycleClosed = activeCycleObj?.status === 'CLOSED';

  // Count discrepancies
  const discrepanciesCount = activeCycleObj?.discrepancies?.filter(d => !d.resolved)?.length || 0;

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (cycleName.trim().length < 2) {
      setError('Cycle name must be at least 2 characters');
      return;
    }
    if (!cycleStart || !cycleEnd) {
      setError('Please select both a start and end date');
      return;
    }

    try {
      const payload = {
        name: cycleName,
        startDate: new Date(cycleStart).toISOString(),
        endDate: new Date(cycleEnd).toISOString(),
        auditorIds: selectedAuditors.map(id => parseInt(id)),
      };

      const response = await fetch('http://localhost:5000/api/audits/cycles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create audit cycle');

      setSuccess(`Audit cycle "${data.data.name}" scheduled successfully!`);
      setShowCycleModal(false);
      setCycleName('');
      setCycleStart('');
      setCycleEnd('');
      setSelectedAuditors([]);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyAsset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Guard: no cycle selected
    if (!selectedCycleId) {
      setError('Please select an audit cycle before verifying assets');
      setShowNotesModal(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/audits/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          auditCycleId: parseInt(selectedCycleId),
          assetId: activeAssetId,
          status: activeVerifyStatus,
          notes: verifyNotes || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification logging failed');

      setSuccess('Asset verification logged successfully!');
      setShowNotesModal(false);
      setActiveAssetId(null);
      setActiveVerifyStatus('');
      setVerifyNotes('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseCycle = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:5000/api/audits/cycles/${selectedCycleId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to lock audit cycle');

      setSuccess('Audit cycle has been closed and verification records locked. Missing items updated to Lost.');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAuditorCheckbox = (id, checked) => {
    if (checked) {
      setSelectedAuditors([...selectedAuditors, id]);
    } else {
      setSelectedAuditors(selectedAuditors.filter(aId => aId !== id));
    }
  };

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6 relative">
      {/* Alert Banners */}
      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-xs p-3 rounded">
          {success}
        </div>
      )}

      {/* Active Audit Cycle Controls Header */}
      <div className="bg-primary/50 border border-hairline-violet p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <label className="block text-xs text-accent-lime font-bold uppercase tracking-wider">Select Audit Cycle</label>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="bg-primary border border-hairline-violet text-sm rounded px-3 py-1.5 text-white focus:outline-none focus:border-accent-lime"
          >
            {cycles.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status.toLowerCase()})
              </option>
            ))}
          </select>
          {activeCycleObj && (
            <span className="block text-xs text-on-dark-muted">
              Scheduled: {new Date(activeCycleObj.startDate).toLocaleDateString()} to {new Date(activeCycleObj.endDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {isManager && (
          <button
            onClick={() => setShowCycleModal(true)}
            className="bg-accent-lime text-primary px-4 py-2 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
          >
            + Schedule New Cycle
          </button>
        )}
      </div>

      {/* Discrepancy warning banner */}
      {activeCycleObj && discrepanciesCount > 0 && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 text-xs text-on-dark-muted flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-pink" />
          <span><strong>{discrepanciesCount} assets flagged</strong> - discrepancies are logged for repair checkups.</span>
        </div>
      )}

      {/* No cycle selected — prompt user */}
      {!selectedCycleId && (
        <div className="border border-dashed border-hairline-violet rounded-lg p-8 text-center space-y-3">
          <p className="text-sm text-on-dark-muted">
            No audit cycle selected. Schedule a new cycle to begin verifying assets.
          </p>
          {isManager && (
            <button
              onClick={() => setShowCycleModal(true)}
              className="bg-accent-lime text-primary px-4 py-2 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
            >
              + Schedule New Cycle
            </button>
          )}
        </div>
      )}

      {/* Audit Checklist Table — only when a cycle is active */}
      {selectedCycleId && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                <th className="pb-3">Asset</th>
                <th className="pb-3">Expected Location</th>
                <th className="pb-3 text-right">Verification Checklist</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-hairline-violet/50">
              {assets.length > 0 ? (
                assets.map((asset) => {
                  const verificationObj = activeCycleObj?.verifications?.find(v => v.assetId === asset.id);
                  const currentVerifyStatus = verificationObj?.status || '';

                  return (
                    <tr key={asset.id} className="hover:bg-primary/20">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-accent-lime">{asset.tag}</span>
                          <span className="text-white font-medium">{asset.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-on-dark-muted">{asset.location?.name || 'Warehouse'}</td>
                      <td className="py-3 text-right">
                        {canVerify && !isCycleClosed ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setActiveAssetId(asset.id);
                                setActiveVerifyStatus('VERIFIED');
                                setShowNotesModal(true);
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                currentVerifyStatus === 'VERIFIED'
                                  ? 'bg-accent-lime/20 text-accent-lime border border-accent-lime/40'
                                  : 'bg-primary border border-hairline-violet text-on-dark-muted hover:border-accent-lime/50'
                              }`}
                              title="Mark Verified"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setActiveAssetId(asset.id);
                                setActiveVerifyStatus('MISSING');
                                setShowNotesModal(true);
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                currentVerifyStatus === 'MISSING'
                                  ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/40'
                                  : 'bg-primary border border-hairline-violet text-on-dark-muted hover:border-accent-pink/50'
                              }`}
                              title="Flag Missing"
                            >
                              <XOctagon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setActiveAssetId(asset.id);
                                setActiveVerifyStatus('DAMAGED');
                                setShowNotesModal(true);
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                currentVerifyStatus === 'DAMAGED'
                                  ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/40'
                                  : 'bg-primary border border-hairline-violet text-on-dark-muted hover:border-accent-violet/50'
                              }`}
                              title="Flag Damaged"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            currentVerifyStatus === 'VERIFIED'
                              ? 'bg-accent-lime/10 text-accent-lime'
                              : currentVerifyStatus === 'MISSING'
                              ? 'bg-accent-pink/10 text-accent-pink'
                              : currentVerifyStatus === 'DAMAGED'
                              ? 'bg-accent-violet/10 text-accent-violet'
                              : 'bg-primary border border-hairline-violet text-on-dark-muted'
                          }`}>
                            {currentVerifyStatus || 'unverified'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-xs text-on-dark-muted text-center">
                    No assets to verify.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Footer */}
      {isManager && activeCycleObj && !isCycleClosed && (
        <div className="pt-4 border-t border-hairline-violet flex justify-end">
          <button
            onClick={handleCloseCycle}
            className="bg-accent-pink hover:bg-accent-pink/90 text-white px-5 py-2.5 rounded text-xs font-bold transition-colors"
          >
            Close & Lock Audit Cycle
          </button>
        </div>
      )}

      {/* --- SCHEDULE AUDIT CYCLE MODAL --- */}
      {showCycleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Schedule Audit Cycle</h3>
            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Cycle Name</label>
                <input
                  type="text"
                  maxLength={100}
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  placeholder="e.g. Q3 Electronics Audit"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={cycleStart}
                    onChange={(e) => setCycleStart(e.target.value)}
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={cycleEnd}
                    onChange={(e) => setCycleEnd(e.target.value)}
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Assign Auditors</label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="checkbox"
                        checked={selectedAuditors.includes(emp.id.toString())}
                        onChange={(e) => handleAuditorCheckbox(emp.id.toString(), e.target.checked)}
                        className="rounded bg-primary border-hairline-violet text-accent-lime focus:ring-0"
                      />
                      <span>{emp.name} ({emp.email})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCycleModal(false)}
                  className="flex-1 bg-primary hover:bg-primary/80 border border-hairline-violet text-on-dark-muted py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-2 rounded text-sm transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VERIFICATION NOTES MODAL --- */}
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Log Asset Verification</h3>
            <form onSubmit={handleVerifyAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Verification Notes</label>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Record asset condition tags, location matches, or discrepancies..."
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotesModal(false);
                    setActiveAssetId(null);
                    setActiveVerifyStatus('');
                    setVerifyNotes('');
                  }}
                  className="flex-1 bg-primary hover:bg-primary/80 border border-hairline-violet text-on-dark-muted py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-2 rounded text-sm transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
