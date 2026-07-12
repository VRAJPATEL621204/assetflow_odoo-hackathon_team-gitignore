import API_BASE_URL from '../config/api';
import React, { useState, useEffect } from 'react';

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptParentId, setDeptParentId] = useState('');
  const [deptStatus, setDeptStatus] = useState('ACTIVE');

  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catFields, setCatFields] = useState([]);

  const [showLocModal, setShowLocModal] = useState(false);
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');

  const [showTechModal, setShowTechModal] = useState(false);
  const [techName, setTechName] = useState('');
  const [techEmail, setTechEmail] = useState('');
  const [techSpecialty, setTechSpecialty] = useState('');

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const [deptRes, catRes, empRes, locRes, techRes] = await Promise.all([
        fetch('${API_BASE_URL}/api/org/departments', { headers }),
        fetch('${API_BASE_URL}/api/org/categories', { headers }),
        fetch('${API_BASE_URL}/api/org/employees', { headers }),
        fetch('${API_BASE_URL}/api/org/locations', { headers }),
        fetch('${API_BASE_URL}/api/maintenance/technicians', { headers }),
      ]);

      const depts = await deptRes.json();
      const cats = await catRes.json();
      const emps = await empRes.json();
      const locs = await locRes.json();
      const techs = await techRes.json();

      if (depts.success) setDepartments(depts.data);
      if (cats.success) setCategories(cats.data);
      if (emps.success) setEmployees(emps.data);
      if (locs.success) setLocations(locs.data);
      if (techs.success) setTechnicians(techs.data);
    } catch (err) {
      setError('Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (deptName.trim().length < 2) {
      setError('Department name must be at least 2 characters');
      return;
    }

    try {
      const response = await fetch('${API_BASE_URL}/api/org/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: deptName,
          parentId: deptParentId || null,
          status: deptStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(err => err.message).join(', '));
        }
        throw new Error(data.message || 'Failed to add department');
      }

      setSuccess('Department added successfully!');
      setShowDeptModal(false);
      setDeptName('');
      setDeptParentId('');
      setDeptStatus('ACTIVE');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (catName.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }

    const filteredFields = catFields.filter(f => f.fieldName.trim().length > 0);

    try {
      const response = await fetch('${API_BASE_URL}/api/org/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: catName,
          customFields: filteredFields,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(err => err.message).join(', '));
        }
        throw new Error(data.message || 'Failed to add category');
      }

      setSuccess('Category added successfully!');
      setShowCatModal(false);
      setCatName('');
      setCatFields([]);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (locName.trim().length < 2) {
      setError('Location name must be at least 2 characters');
      return;
    }

    try {
      const response = await fetch('${API_BASE_URL}/api/org/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: locName,
          address: locAddress || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(err => err.message).join(', '));
        }
        throw new Error(data.message || 'Failed to add location');
      }

      setSuccess('Location added successfully!');
      setShowLocModal(false);
      setLocName('');
      setLocAddress('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (techName.trim().length < 2) {
      setError('Technician name must be at least 2 characters');
      return;
    }

    try {
      const response = await fetch('${API_BASE_URL}/api/maintenance/technicians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: techName,
          email: techEmail,
          specialty: techSpecialty,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(err => err.message).join(', '));
        }
        throw new Error(data.message || 'Failed to add technician');
      }

      setSuccess('Technician added successfully!');
      setShowTechModal(false);
      setTechName('');
      setTechEmail('');
      setTechSpecialty('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/org/employees/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleName: newRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to change role');

      setSuccess('Role updated successfully!');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addCatFieldRow = () => {
    setCatFields([...catFields, { fieldName: '', fieldType: 'string', isRequired: false }]);
  };

  const updateCatFieldRow = (idx, key, val) => {
    const updated = [...catFields];
    updated[idx][key] = val;
    setCatFields(updated);
  };

  const removeCatFieldRow = (idx) => {
    const updated = [...catFields];
    updated.splice(idx, 1);
    setCatFields(updated);
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

      {/* Tabs */}
      <div className="flex border-b border-hairline-violet gap-6">
        {['departments', 'categories', 'employees', 'locations', 'technicians'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
            }`}
          >
            {tab === 'categories' 
              ? 'Asset Categories' 
              : tab === 'employees' 
              ? 'Employee Directory' 
              : tab === 'locations' 
              ? 'Locations' 
              : tab === 'technicians' 
              ? 'Technicians' 
              : 'Departments'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'departments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider">Department Hierarchy</span>
              {isAdmin && (
                <button
                  onClick={() => setShowDeptModal(true)}
                  className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
                >
                  + Add Department
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Parent Dept</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-hairline-violet/50">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-primary/20">
                        <td className="py-3 text-white font-medium">{dept.name}</td>
                        <td className="py-3 text-on-dark-muted">{dept.parent?.name || '-'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            dept.status === 'ACTIVE' ? 'bg-accent-lime/10 text-accent-lime' : 'bg-accent-pink/10 text-accent-pink'
                          }`}>
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-xs text-on-dark-muted text-center">
                        No departments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider">Asset Categories</span>
              {isAdmin && (
                <button
                  onClick={() => setShowCatModal(true)}
                  className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
                >
                  + Add Category
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                    <th className="pb-3">Category Name</th>
                    <th className="pb-3">Custom Attributes Schema</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-hairline-violet/50">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-primary/20">
                        <td className="py-3 text-white font-medium">{cat.name}</td>
                        <td className="py-3 text-on-dark-muted">
                          {cat.customFields && cat.customFields.length > 0 
                            ? cat.customFields.map(f => `${f.fieldName} (${f.fieldType}${f.isRequired ? '*' : ''})`).join(', ')
                            : 'None'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-8 text-xs text-on-dark-muted text-center">
                        No asset categories created.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-4">
            <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Staff Directory</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Assigned Role</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-hairline-violet/50">
                  {employees.map((emp) => {
                    const currentRole = emp.userRoles?.[0]?.role?.name || 'EMPLOYEE';
                    return (
                      <tr key={emp.id} className="hover:bg-primary/20">
                        <td className="py-3 text-white font-medium">{emp.name}</td>
                        <td className="py-3 text-on-dark-muted">{emp.email}</td>
                        <td className="py-3 text-on-dark-muted">{emp.department?.name || 'Unassigned'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            currentRole === 'ADMIN' 
                              ? 'bg-accent-lime/10 text-accent-lime' 
                              : currentRole === 'ASSET_MANAGER' 
                              ? 'bg-accent-violet/10 text-accent-violet' 
                              : 'bg-primary border border-hairline-violet text-on-dark-muted'
                          }`}>
                            {currentRole.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {isAdmin && emp.email !== currentUser?.email && (
                            <select
                              value={currentRole}
                              onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                              className="bg-primary border border-hairline-violet text-xs rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-lime transition-colors"
                            >
                              <option value="EMPLOYEE">Employee</option>
                              <option value="DEPT_HEAD">Dept Head</option>
                              <option value="ASSET_MANAGER">Asset Manager</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider">Office & Storage Locations</span>
              {isAdmin && (
                <button
                  onClick={() => setShowLocModal(true)}
                  className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
                >
                  + Add Location
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                    <th className="pb-3">Location Name</th>
                    <th className="pb-3">Address / Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-hairline-violet/50">
                  {locations.length > 0 ? (
                    locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-primary/20">
                        <td className="py-3 text-white font-medium">{loc.name}</td>
                        <td className="py-3 text-on-dark-muted">{loc.address || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-8 text-xs text-on-dark-muted text-center">
                        No locations added.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'technicians' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider">Maintenance Technicians</span>
              {isAdmin && (
                <button
                  onClick={() => setShowTechModal(true)}
                  className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors"
                >
                  + Add Technician
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Specialty</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-hairline-violet/50">
                  {technicians.length > 0 ? (
                    technicians.map((tech) => (
                      <tr key={tech.id} className="hover:bg-primary/20">
                        <td className="py-3 text-white font-medium">{tech.name}</td>
                        <td className="py-3 text-on-dark-muted">{tech.email}</td>
                        <td className="py-3 text-on-dark-muted">{tech.specialty}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            tech.status === 'ACTIVE' ? 'bg-accent-lime/10 text-accent-lime' : 'bg-accent-pink/10 text-accent-pink'
                          }`}>
                            {tech.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-xs text-on-dark-muted text-center">
                        No technicians registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD DEPARTMENT MODAL --- */}
      {showDeptModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Department Name</label>
                <input
                  type="text"
                  maxLength={50}
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Engineering, Sales, Procurement"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Parent Department (Optional)</label>
                <select
                  value={deptParentId}
                  onChange={(e) => setDeptParentId(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                >
                  <option value="">None (Top-Level)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Status</label>
                <select
                  value={deptStatus}
                  onChange={(e) => setDeptStatus(e.target.value)}
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
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

      {/* --- ADD CATEGORY MODAL --- */}
      {showCatModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-lg p-6 space-y-4 shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Asset Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Category Name</label>
                <input
                  type="text"
                  maxLength={50}
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Laptops, Vehicles, Office Chairs"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="block text-xs font-bold text-on-dark-muted uppercase">Custom Attributes Schema</span>
                  <button
                    type="button"
                    onClick={addCatFieldRow}
                    className="text-xs text-accent-lime font-bold hover:underline"
                  >
                    + Add Field
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {catFields.map((field, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Field Name (e.g. Warranty)"
                        value={field.fieldName}
                        onChange={(e) => updateCatFieldRow(idx, 'fieldName', e.target.value)}
                        className="flex-1 bg-primary border border-hairline-violet rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent-lime transition-colors"
                        required
                      />
                      <select
                        value={field.fieldType}
                        onChange={(e) => updateCatFieldRow(idx, 'fieldType', e.target.value)}
                        className="bg-primary border border-hairline-violet rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent-lime transition-colors"
                      >
                        <option value="string">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => updateCatFieldRow(idx, 'isRequired', e.target.checked)}
                          className="rounded bg-primary border-hairline-violet text-accent-lime focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-[10px] text-on-dark-muted">Required</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCatFieldRow(idx)}
                        className="text-xs text-accent-pink hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {catFields.length === 0 && (
                    <div className="text-[11px] text-on-dark-muted text-center py-2">
                      No custom fields added yet. Category will have default system fields only.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
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

      {/* --- ADD LOCATION MODAL --- */}
      {showLocModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Location</h3>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Location Name</label>
                <input
                  type="text"
                  maxLength={100}
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Warehouse B, Mumbai Office"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Address / Details</label>
                <input
                  type="text"
                  maxLength={250}
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="e.g. 4th Floor, Terminal Tower"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
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

      {/* --- ADD TECHNICIAN MODAL --- */}
      {showTechModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Maintenance Technician</h3>
            <form onSubmit={handleAddTechnician} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Technician Name</label>
                <input
                  type="text"
                  maxLength={100}
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="e.g. Amit Kumar, John Varma"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  maxLength={100}
                  value={techEmail}
                  onChange={(e) => setTechEmail(e.target.value)}
                  placeholder="e.g. amit@tech.com"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Specialty Area</label>
                <input
                  type="text"
                  maxLength={100}
                  value={techSpecialty}
                  onChange={(e) => setTechSpecialty(e.target.value)}
                  placeholder="e.g. IT, Mechanical, Electrical"
                  className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTechModal(false)}
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
    </div>
  );
};

export default OrganizationSetup;
