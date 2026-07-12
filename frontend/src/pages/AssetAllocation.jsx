import React, { useState, useEffect } from 'react';
import { AlertCircle, History, Check, X } from 'lucide-react';

const AssetAllocation = () => {
  // Lists
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);

  // States
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Return check-in modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [activeReturnAllocId, setActiveReturnAllocId] = useState(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isManager = currentUser?.permissions?.includes('allocate_asset') || currentUser?.roles?.includes('ADMIN');
  const canApproveTransfers = currentUser?.permissions?.includes('approve_transfer') || currentUser?.roles?.includes('ADMIN');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [empRes, deptRes, assetRes, allocRes, transRes] = await Promise.all([
        fetch('http://localhost:5000/api/org/employees', { headers }),
        fetch('http://localhost:5000/api/org/departments', { headers }),
        fetch('http://localhost:5000/api/assets', { headers }),
        fetch('http://localhost:5000/api/allocations', { headers }),
        fetch('http://localhost:5000/api/allocations/transfers', { headers }),
      ]);

      const emps = await empRes.json();
      const depts = await deptRes.json();
      const asts = await assetRes.json();
      const alls = await allocRes.json();
      const trs = await transRes.json();

      if (emps.success) setEmployees(emps.data);
      if (depts.success) setDepartments(depts.data);
      if (asts.success) setAssets(asts.data);
      if (alls.success) setAllocations(alls.data);
      if (trs.success) setTransfers(trs.data);
    } catch (err) {
      setError('Failed to fetch allocation records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Find info about the currently selected asset in form
  const currentAssetObj = assets.find(a => a.id === parseInt(selectedAssetId));
  const isAssetAllocated = currentAssetObj && currentAssetObj.status === 'ALLOCATED';

  // Find active allocation details for currentAssetObj
  const activeAllocForAsset = isAssetAllocated
    ? allocations.find(al => al.assetId === currentAssetObj.id && al.status === 'ACTIVE')
    : null;

  const currentHolderName = activeAllocForAsset
    ? (activeAllocForAsset.employee?.name || activeAllocForAsset.department?.name || 'Department Allocation')
    : '';

  const handleAllocate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedAssetId) {
      setError('Please select an asset to allocate');
      return;
    }

    if (!targetEmployeeId && !targetDeptId) {
      setError('Please assign to either an employee or department');
      return;
    }

    try {
      const payload = {
        assetId: parseInt(selectedAssetId),
        employeeId: targetEmployeeId ? parseInt(targetEmployeeId) : null,
        departmentId: targetDeptId ? parseInt(targetDeptId) : null,
        expectedReturnDate: expectedReturnDate || null,
      };

      const response = await fetch('http://localhost:5000/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Allocation failed');

      setSuccess('Asset allocated successfully!');
      setSelectedAssetId('');
      setTargetEmployeeId('');
      setTargetDeptId('');
      setExpectedReturnDate('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedAssetId) return;
    if (!targetEmployeeId && !targetDeptId) {
      setError('Please select a target employee or department');
      return;
    }
    if (reason.trim().length < 5) {
      setError('Please provide a reason (minimum 5 characters)');
      return;
    }

    try {
      const payload = {
        assetId: parseInt(selectedAssetId),
        targetEmployeeId: targetEmployeeId ? parseInt(targetEmployeeId) : null,
        targetDepartmentId: targetDeptId ? parseInt(targetDeptId) : null,
        reason,
      };

      const response = await fetch('http://localhost:5000/api/allocations/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Transfer request failed');

      setSuccess('Transfer request submitted successfully!');
      setSelectedAssetId('');
      setTargetEmployeeId('');
      setTargetDeptId('');
      setReason('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturnAsset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/allocations/${activeReturnAllocId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnCondition,
          checkInNotes: returnNotes || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Return failed');

      setSuccess('Asset returned successfully!');
      setShowReturnModal(false);
      setActiveReturnAllocId(null);
      setReturnNotes('');
      setReturnCondition('GOOD');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProcessTransfer = async (transferId, action) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:5000/api/allocations/transfers/${transferId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Action failed');

      setSuccess(`Transfer request ${action}ed successfully!`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation/Transfer Action Panel */}
        <div className="lg:col-span-2 bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Custody Management</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Select Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-primary border border-hairline-violet rounded px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
              >
                <option value="">Choose Asset...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag} - {a.name} ({a.status.replace('_', ' ').toLowerCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* If Asset is already allocated, show conflict block and transfer form */}
            {isAssetAllocated ? (
              <div className="space-y-4">
                <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-pink flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <span className="font-semibold text-white block">Already Allocated to {currentHolderName}</span>
                    <span className="text-on-dark-muted block text-xs">
                      Direct re-allocation is blocked to prevent conflicts. Submit a custody transfer request below.
                    </span>
                  </div>
                </div>

                <form onSubmit={handleTransferRequest} className="space-y-4 border-t border-hairline-violet pt-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Request Custody Transfer</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">From</label>
                      <input
                        type="text"
                        value={currentHolderName}
                        className="w-full bg-primary/40 border border-hairline-violet/50 rounded px-3 py-2 text-sm text-on-dark-muted"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Transfer To (Employee)</label>
                      <select
                        value={targetEmployeeId}
                        onChange={(e) => {
                          setTargetEmployeeId(e.target.value);
                          setTargetDeptId('');
                        }}
                        className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime"
                      >
                        <option value="">Select Employee...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Reason for Transfer</label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide reasoning for transfer..."
                      maxLength={500}
                      className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-accent-lime text-primary font-bold px-4 py-2 rounded text-xs hover:bg-accent-lime/90 transition-colors"
                  >
                    Submit Transfer Request
                  </button>
                </form>
              </div>
            ) : selectedAssetId ? (
              // If Asset is available, show standard allocation form
              <form onSubmit={handleAllocate} className="space-y-4 border-t border-hairline-violet pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Allocate Custody</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Assign to Employee</label>
                    <select
                      value={targetEmployeeId}
                      onChange={(e) => {
                        setTargetEmployeeId(e.target.value);
                        setTargetDeptId('');
                      }}
                      className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Or Assign to Department</label>
                    <select
                      value={targetDeptId}
                      onChange={(e) => {
                        setTargetDeptId(e.target.value);
                        setTargetEmployeeId('');
                      }}
                      className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime"
                    >
                      <option value="">Select Department...</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Expected Return Date</label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime"
                  />
                </div>

                {isManager && (
                  <button
                    type="submit"
                    className="bg-accent-lime text-primary font-bold px-4 py-2 rounded text-xs hover:bg-accent-lime/90 transition-colors"
                  >
                    Allocate Asset
                  </button>
                )}
              </form>
            ) : (
              <div className="text-xs text-on-dark-muted text-center py-6 border-t border-hairline-violet">
                Select an asset above to allocate custody or request a transfer.
              </div>
            )}
          </div>
        </div>

        {/* Pending Custody Transfers Queue Sidebar */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider">Transfer Approvals</h3>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {transfers.filter(t => t.status === 'PENDING').length > 0 ? (
              transfers.filter(t => t.status === 'PENDING').map((transfer) => {
                const target = transfer.targetEmployeeId 
                  ? employees.find(e => e.id === transfer.targetEmployeeId)?.name 
                  : departments.find(d => d.id === transfer.targetDepartmentId)?.name;
                
                return (
                  <div key={transfer.id} className="border border-hairline-violet rounded p-3 space-y-2 bg-primary/20">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-accent-lime font-bold">
                        {transfer.allocation?.asset?.tag}
                      </span>
                      <span className="text-[10px] text-accent-violet-mid font-semibold uppercase">
                        Pending
                      </span>
                    </div>
                    <div className="text-xs text-white">
                      Shift custody to <span className="font-semibold text-accent-lime">{target || 'Target'}</span>
                    </div>
                    <div className="text-[10px] text-on-dark-muted italic">
                      "{transfer.reason}"
                    </div>

                    {canApproveTransfers && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleProcessTransfer(transfer.id, 'approve')}
                          className="flex-1 bg-accent-lime/20 border border-accent-lime/40 text-accent-lime hover:bg-accent-lime/30 p-1 rounded flex justify-center items-center"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleProcessTransfer(transfer.id, 'reject')}
                          className="flex-1 bg-accent-pink/20 border border-accent-pink/40 text-accent-pink hover:bg-accent-pink/30 p-1 rounded flex justify-center items-center"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-on-dark-muted text-center py-8">
                No pending transfer requests.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Allocations List & Returns Grid */}
      <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Custody Allocations</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                <th className="pb-3">Asset Tag</th>
                <th className="pb-3">Asset Name</th>
                <th className="pb-3">Custodian</th>
                <th className="pb-3">Allocated Date</th>
                <th className="pb-3">Expected Return</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-hairline-violet/50">
              {allocations.filter(al => al.status === 'ACTIVE').length > 0 ? (
                allocations.filter(al => al.status === 'ACTIVE').map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-primary/20">
                    <td className="py-3 font-mono text-accent-lime">{alloc.asset?.tag}</td>
                    <td className="py-3 text-white font-medium">{alloc.asset?.name}</td>
                    <td className="py-3 text-on-dark-muted">
                      {alloc.employee ? `${alloc.employee.name} (employee)` : `${alloc.department?.name} (department)`}
                    </td>
                    <td className="py-3 text-on-dark-muted">
                      {new Date(alloc.allocatedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-on-dark-muted">
                      {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'Indefinite'}
                    </td>
                    <td className="py-3 text-right">
                      {isManager && (
                        <button
                          onClick={() => {
                            setActiveReturnAllocId(alloc.id);
                            setShowReturnModal(true);
                          }}
                          className="bg-accent-pink/10 hover:bg-accent-pink/20 border border-accent-pink/30 text-accent-pink px-2.5 py-1.5 rounded text-xs transition-colors"
                        >
                          Check In Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-xs text-on-dark-muted text-center">
                    No active custody allocations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CHECK IN RETURN MODAL --- */}
      {showReturnModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Asset Return Check-in</h3>
            <form onSubmit={handleReturnAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Return Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                >
                  <option value="NEW">New / Perfect</option>
                  <option value="GOOD">Good / Normal Wear</option>
                  <option value="FAIR">Fair / Scratched</option>
                  <option value="POOR">Poor / Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Check-in Notes / Condition Report</label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  maxLength={500}
                  placeholder="Record condition notes or return issues..."
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnModal(false);
                    setActiveReturnAllocId(null);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/80 border border-hairline-violet text-on-dark-muted py-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-lime hover:bg-accent-lime/90 text-primary font-bold py-2 rounded text-sm transition-colors"
                >
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetAllocation;
