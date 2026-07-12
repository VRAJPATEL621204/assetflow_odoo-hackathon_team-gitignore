import API_BASE_URL from '../config/api';
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const AssetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register form modal state
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formCondition, setFormCondition] = useState('GOOD');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formIsShared, setFormIsShared] = useState(false);
  const [formFieldValues, setFormFieldValues] = useState({}); // Stores { customFieldId: value }

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isManager = currentUser?.permissions?.includes('register_asset') || currentUser?.roles?.includes('ADMIN');

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`${API_BASE_URL}/api/assets?${params.toString()}`, { headers });
      const data = await response.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      setError('Failed to load assets directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [catRes, locRes] = await Promise.all([
        fetch('${API_BASE_URL}/api/org/categories', { headers }),
        fetch('${API_BASE_URL}/api/org/locations', { headers }),
      ]);

      const cats = await catRes.json();
      const locs = await locRes.json();

      if (cats.success) setCategories(cats.data);
      if (locs.success) setLocations(locs.data);
    } catch (err) {
      console.error('Failed to load metadata');
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssets();
      fetchMetadata();
    }
  }, [token, selectedCategory, selectedStatus]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchAssets();
    }
  };

  const handleCategoryChange = (catId) => {
    setFormCategoryId(catId);
    setFormFieldValues({}); // Reset custom fields
  };

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formName.trim().length < 2) {
      setError('Asset name must be at least 2 characters');
      return;
    }

    try {
      const payload = {
        name: formName,
        serialNumber: formSerial || null,
        acquisitionCost: parseFloat(formCost),
        acquisitionDate: new Date(formDate).toISOString(),
        condition: formCondition,
        categoryId: parseInt(formCategoryId),
        locationId: formLocationId ? parseInt(formLocationId) : null,
        isShared: formIsShared,
        fieldValues: formFieldValues,
      };

      const response = await fetch('${API_BASE_URL}/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(err => err.message).join(', '));
        }
        throw new Error(data.message || 'Failed to register asset');
      }

      setSuccess(`Asset registered successfully! Tag assigned: ${data.data.tag}`);
      setShowModal(false);
      // Reset form
      setFormName('');
      setFormSerial('');
      setFormCost('');
      setFormDate('');
      setFormCondition('GOOD');
      setFormCategoryId('');
      setFormLocationId('');
      setFormIsShared(false);
      setFormFieldValues({});
      fetchAssets();
    } catch (err) {
      setError(err.message);
    }
  };

  // Find dynamic custom fields for selected category in form
  const selectedCatObj = categories.find(c => c.id === parseInt(formCategoryId));
  const customFields = selectedCatObj?.customFields || [];

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6 relative">
      {/* Alerts */}
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

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-dark-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            placeholder="Type and press Enter to search assets..."
            className="w-full bg-primary border border-hairline-violet rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
          />
        </div>

        {/* Buttons and dropdowns */}
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-primary text-xs border border-hairline-violet rounded-md px-3 py-2 text-white focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-primary text-xs border border-hairline-violet rounded-md px-3 py-2 text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="LOST">Lost</option>
          </select>
          {isManager && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-accent-lime text-primary px-4 py-2 rounded-md text-xs font-bold hover:bg-accent-lime/90 transition-colors"
            >
              + Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
              <th className="pb-3">Tag</th>
              <th className="pb-3">Asset Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Location</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-hairline-violet/50">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <tr key={asset.tag} className="hover:bg-primary/20">
                  <td className="py-3 font-mono text-accent-lime">{asset.tag}</td>
                  <td className="py-3 text-white font-medium">
                    <div>{asset.name}</div>
                    {asset.serialNumber && (
                      <span className="text-[10px] text-on-dark-muted block">S/N: {asset.serialNumber}</span>
                    )}
                  </td>
                  <td className="py-3 text-on-dark-muted">{asset.category?.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      asset.status === 'AVAILABLE' 
                        ? 'bg-accent-lime/10 text-accent-lime' 
                        : asset.status === 'ALLOCATED' 
                        ? 'bg-accent-violet/10 text-accent-violet' 
                        : 'bg-accent-pink/10 text-accent-pink'
                    }`}>
                      {asset.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 text-on-dark-muted">{asset.location?.name || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-xs text-on-dark-muted text-center">
                  No assets registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- REGISTER ASSET MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-ink-deep border border-hairline-violet rounded-lg w-full max-w-lg p-6 space-y-4 shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register Asset</h3>
            <form onSubmit={handleRegisterAsset} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Asset Name</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dell Latitude 5420"
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Serial Number</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    placeholder="e.g. CN-0X12345"
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Acquisition Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="e.g. 1200.00"
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Acquisition Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Location</label>
                  <select
                    value={formLocationId}
                    onChange={(e) => setFormLocationId(e.target.value)}
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  >
                    <option value="">Select Location</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-dark-muted uppercase mb-1.5">Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="w-full bg-primary border border-hairline-violet rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsShared}
                      onChange={(e) => setFormIsShared(e.target.checked)}
                      className="rounded bg-primary border-hairline-violet text-accent-lime focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs font-bold text-white uppercase">Shared Bookable Resource</span>
                  </label>
                </div>
              </div>

              {/* Dynamic custom field inputs */}
              {customFields.length > 0 && (
                <div className="border-t border-hairline-violet pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Category Attributes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {customFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs font-semibold text-on-dark-muted mb-1">
                          {field.fieldName} {field.isRequired ? '*' : ''}
                        </label>
                        {field.fieldType === 'boolean' ? (
                          <div className="pt-2">
                            <input
                              type="checkbox"
                              checked={!!formFieldValues[field.id]}
                              onChange={(e) => setFormFieldValues({
                                ...formFieldValues,
                                [field.id]: e.target.checked
                              })}
                              className="rounded bg-primary border-hairline-violet text-accent-lime focus:ring-0 focus:ring-offset-0"
                            />
                          </div>
                        ) : (
                          <input
                            type={field.fieldType === 'number' ? 'number' : 'text'}
                            value={formFieldValues[field.id] || ''}
                            onChange={(e) => setFormFieldValues({
                              ...formFieldValues,
                              [field.id]: e.target.value
                            })}
                            className="w-full bg-primary border border-hairline-violet rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-lime transition-colors"
                            required={field.isRequired}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default AssetDirectory;
