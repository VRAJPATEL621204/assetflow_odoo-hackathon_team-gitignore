import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

const Maintenance = () => {
  // Lists
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [assets, setAssets] = useState([]);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formAssetId, setFormAssetId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('MEDIUM');

  // Action Modals
  const [activeRequest, setActiveRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState('');

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [actionTaken, setActionTaken] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [repairCost, setRepairCost] = useState('');

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isManager = currentUser?.permissions?.includes('approve_maintenance') || currentUser?.roles?.includes('ADMIN');
  const canRaise = currentUser?.permissions?.includes('raise_maintenance') || currentUser?.roles?.includes('ADMIN');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [reqRes, techRes, assetRes] = await Promise.all([
        fetch('http://localhost:5000/api/maintenance/requests', { headers }),
        fetch('http://localhost:5000/api/maintenance/technicians', { headers }),
        fetch('http://localhost:5000/api/assets', { headers }),
      ]);

      const reqs = await reqRes.json();
      const techs = await techRes.json();
      const asts = await assetRes.json();

      if (reqs.success) setRequests(reqs.data);
      if (techs.success) setTechnicians(techs.data);
      if (asts.success) setAssets(asts.data);
    } catch (err) {
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formAssetId) {
      setError('Please select an asset');
      return;
    }

    if (formDesc.trim().length < 5) {
      setError('Please enter a description (min 5 characters)');
      return;
    }

    try {
      const payload = {
        assetId: parseInt(formAssetId),
        description: formDesc,
        priority: formPriority,
      };

      const response = await fetch('http://localhost:5000/api/maintenance/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to file repair request');

      setSuccess('Maintenance request submitted successfully!');
      setShowRequestModal(false);
      setFormAssetId('');
      setFormDesc('');
      setFormPriority('MEDIUM');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/requests/${activeRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'APPROVED',
          technicianId: selectedTechId ? parseInt(selectedTechId) : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Approval failed');

      setSuccess('Request approved and technician assigned!');
      setShowApproveModal(false);
      setActiveRequest(null);
      setSelectedTechId('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartWork = async (reqId) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/requests/${reqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to start work');

      setSuccess('Repair work marked in progress!');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/requests/${activeRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'RESOLVED',
          actionTaken,
          partsReplaced: partsReplaced || null,
          cost: parseFloat(repairCost) || 0.00,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resolve request');

      setSuccess('Maintenance request resolved successfully! Asset is now available.');
      setShowResolveModal(false);
      setActiveRequest(null);
      setActionTaken('');
      setPartsReplaced('');
      setRepairCost('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (reqId) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/requests/${reqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'REJECTED',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Action failed');

      setSuccess('Maintenance request rejected.');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Organize columns
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'border-accent-pink text-accent-pink';
      case 'HIGH': return 'border-orange-500 text-orange-500';
      case 'MEDIUM': return 'border-accent-violet-mid text-accent-violet-mid';
      default: return 'border-on-dark-muted text-on-dark-muted';
    }
  };

  const lanes = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'RESOLVED'];

  return (
    <div className="space-y-6 relative">
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

      {/* Informative helper banner */}
      <div className="bg-ink-deep border border-hairline-violet rounded-lg p-4 flex items-center justify-between">
        <div className="text-xs text-on-dark-muted flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-lime" />
          <span>Approving a repair flips the asset status to <strong>Under Maintenance</strong>. Resolving reverts it to <strong>Available</strong>.</span>
        </div>
        {canRaise && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
          >
            + Request Maintenance
          </button>
        )}
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lanes.map((lane) => {
          const laneCards = requests.filter(r => r.status === lane);
          return (
            <div key={lane} className="bg-ink-deep border border-hairline-violet rounded-lg p-4 space-y-4">
              <div className="border-b border-hairline-violet pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {lane.replace('_', ' ').toLowerCase()} ({laneCards.length})
                </span>
              </div>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {laneCards.map((card) => (
                  <div key={card.id} className="p-4 rounded-md border border-hairline-violet bg-primary space-y-2 hover:border-accent-violet transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-accent-lime">{card.asset?.tag}</span>
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded capitalize ${getPriorityColor(card.priority)}`}>
                        {card.priority.toLowerCase()}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{card.asset?.name}</h4>
                    <p className="text-xs text-on-dark-muted italic">"{card.description}"</p>
                    
                    {card.technician && (
                      <div className="text-[10px] text-accent-violet-mid">
                        Assigned: {card.technician.name}
                      </div>
                    )}

                    {isManager && (
                      <div className="flex justify-end pt-2 border-t border-hairline-violet/30 mt-2 gap-2">
                        {lane === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                handleReject(card.id);
                              }}
                              className="text-[10px] text-accent-pink hover:underline"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setActiveRequest(card);
                                setShowApproveModal(true);
                              }}
                              className="text-[10px] text-accent-lime font-semibold hover:underline flex items-center gap-0.5"
                            >
                              Approve <ArrowRight className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {lane === 'APPROVED' && (
                          <button
                            onClick={() => handleStartWork(card.id)}
                            className="text-[10px] text-accent-lime font-semibold hover:underline flex items-center gap-0.5"
                          >
                            Start Work <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {lane === 'IN_PROGRESS' && (
                          <button
                            onClick={() => {
                              setActiveRequest(card);
                              setShowResolveModal(true);
                            }}
                            className="text-[10px] text-accent-lime font-semibold hover:underline flex items-center gap-0.5"
                          >
                            Complete <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {laneCards.length === 0 && (
                  <div className="text-center py-8 text-xs text-on-dark-muted border border-dashed border-hairline-violet/30 rounded-md">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- CREATE REQUEST MODAL --- */}
      {showRequestModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Raise Maintenance Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Select Asset</label>
                <select
                  value={formAssetId}
                  onChange={(e) => setFormAssetId(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                >
                  <option value="">Choose Asset...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.tag} - {a.name} ({a.status.toLowerCase()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Description of Issue</label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe failure details (e.g., fan noise, cracked screen)..."
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-primary hover:bg-primary/80 border border-hairline-violet text-on-dark-muted py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-2 rounded text-sm transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- APPROVAL & TECHNICIAN ASSIGNMENT MODAL --- */}
      {showApproveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Approve Request</h3>
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Assign Technician</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                >
                  <option value="">Select Technician...</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowApproveModal(false);
                    setActiveRequest(null);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/80 border border-hairline-violet text-on-dark-muted py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-2 rounded text-sm transition-colors"
                >
                  Approve Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESOLUTION DETAILS LOG MODAL --- */}
      {showResolveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Log Resolution Details</h3>
            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Action Taken</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Describe repair actions (e.g. replaced screen module)..."
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Parts Replaced</label>
                <input
                  type="text"
                  maxLength={250}
                  value={partsReplaced}
                  onChange={(e) => setPartsReplaced(e.target.value)}
                  placeholder="e.g. LCD Panel, fan cables"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Total Repair Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  placeholder="e.g. 150.00"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResolveModal(false);
                    setActiveRequest(null);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/80 border border-hairline-violet text-on-dark-muted py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-2 rounded text-sm transition-colors"
                >
                  Resolve Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
