import React, { useState } from 'react';
import { Search } from 'lucide-react';

const AssetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const assets = [
    { tag: 'AF-0012', name: 'Dell Laptop', category: 'Electronics', status: 'Allocated', location: 'Bengaluru Office' },
    { tag: 'AF-0062', name: 'Projector', category: 'Electronics', status: 'Maintenance', location: 'HQ Floor 2' },
    { tag: 'AF-0201', name: 'Office Chair', category: 'Furniture', status: 'Available', location: 'Warehouse' },
  ];

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-dark-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tag, serial, or QR code..."
            className="w-full bg-primary border border-hairline-violet rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-lime transition-colors"
          />
        </div>

        {/* Buttons and dropdowns */}
        <div className="flex items-center gap-3">
          <select className="bg-primary text-xs border border-hairline-violet rounded-md px-3 py-2 text-white">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Furniture</option>
          </select>
          <select className="bg-primary text-xs border border-hairline-violet rounded-md px-3 py-2 text-white">
            <option>All Statuses</option>
            <option>Available</option>
            <option>Allocated</option>
            <option>Under Maintenance</option>
          </select>
          <button className="bg-accent-lime text-primary px-4 py-2 rounded-md text-xs font-bold hover:bg-accent-lime/90 transition-colors">
            + Register Asset
          </button>
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
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-hairline-violet/50">
            {assets.map((asset) => (
              <tr key={asset.tag} className="hover:bg-primary/20">
                <td className="py-3 font-mono text-accent-lime">{asset.tag}</td>
                <td className="py-3 text-white font-medium">{asset.name}</td>
                <td className="py-3 text-on-dark-muted">{asset.category}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    asset.status === 'Available' 
                      ? 'bg-accent-lime/10 text-accent-lime' 
                      : asset.status === 'Allocated' 
                      ? 'bg-accent-violet/10 text-accent-violet' 
                      : 'bg-accent-pink/10 text-accent-pink'
                  }`}>
                    {asset.status}
                  </span>
                </td>
                <td className="py-3 text-on-dark-muted">{asset.location}</td>
                <td className="py-3 text-right">
                  <button className="text-xs text-accent-violet hover:underline">View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetDirectory;
