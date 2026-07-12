import API_BASE_URL from '../config/api';
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const TOKEN = () => localStorage.getItem('token');

// ─── Custom Tooltip Styles ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink-deep border border-hairline-violet rounded px-3 py-2 text-xs shadow-lg">
      <p className="text-on-dark-muted font-bold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const Reports = () => {
  const [utilizationData, setUtilizationData]     = useState([]);
  const [deptData, setDeptData]                   = useState([]);
  const [maintenanceData, setMaintenanceData]     = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const h = { Authorization: `Bearer ${TOKEN()}` };
      const [uRes, dRes, mRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reports/utilization`,          { headers: h }),
        fetch(`${API_BASE_URL}/api/reports/dept-utilization`,     { headers: h }),
        fetch(`${API_BASE_URL}/api/reports/maintenance-frequency`, { headers: h }),
      ]);
      const [uData, dData, mData] = await Promise.all([uRes.json(), dRes.json(), mRes.json()]);
      if (uData.success) setUtilizationData(uData.data);
      if (dData.success) setDeptData(dData.data);
      if (mData.success) setMaintenanceData(mData.data);
    } catch {
      setError('Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Skeleton loader ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-primary/40 rounded-lg border border-hairline-violet" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-primary/40 rounded-lg border border-hairline-violet" />
          <div className="h-64 bg-primary/40 rounded-lg border border-hairline-violet" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs p-3 rounded">
          {error}
        </div>
      )}

      {/* ── 1. Utilization Summary Table ──────────────────────────────────── */}
      <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
        <div>
          <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Live Analytics</span>
          <h3 className="text-sm font-bold text-white mt-1">Asset Category Utilization Rate</h3>
        </div>
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                <th className="pb-3">Asset Category</th>
                <th className="pb-3 text-center">Total Assets</th>
                <th className="pb-3 text-center">Allocated</th>
                <th className="pb-3 text-center">In Repair</th>
                <th className="pb-3 text-right">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-hairline-violet/50">
              {utilizationData.length > 0 ? utilizationData.map((row, i) => (
                <tr key={i} className="hover:bg-primary/20">
                  <td className="py-3.5 text-white font-medium">{row.category}</td>
                  <td className="py-3.5 text-center text-on-dark-muted">{row.totalAssets}</td>
                  <td className="py-3.5 text-center text-on-dark-muted">{row.allocated}</td>
                  <td className="py-3.5 text-center text-on-dark-muted">{row.underMaintenance}</td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 bg-primary rounded-full h-1.5 overflow-hidden hidden md:block">
                        <div
                          className="bg-accent-lime h-full rounded-full transition-all duration-700"
                          style={{ width: `${row.utilizationRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-accent-lime font-bold">{row.utilizationRate}%</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-8 text-xs text-on-dark-muted text-center">
                    No utilization data. Register and allocate assets to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2. Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Bar Chart – Utilization by Department */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
          <div>
            <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Chart Analysis</span>
            <h3 className="text-sm font-bold text-white mt-1">Utilization by Department</h3>
          </div>

          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1f4e" />
                <XAxis
                  dataKey="department"
                  tick={{ fill: '#8b7eb8', fontSize: 10 }}
                  axisLine={{ stroke: '#2a1f4e' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8b7eb8', fontSize: 10 }}
                  axisLine={{ stroke: '#2a1f4e' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: '#8b7eb8', paddingTop: '8px' }}
                />
                <Bar dataKey="allocated" name="Allocated" fill="#b8ff57" radius={[3, 3, 0, 0]} />
                <Bar dataKey="available" name="Available" fill="#5b3fd4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="maintenance" name="In Repair" fill="#ff4081" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-on-dark-muted border border-dashed border-hairline-violet/30 rounded">
              No department asset data available.
            </div>
          )}
        </div>

        {/* Line Chart – Maintenance Frequency */}
        <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-4">
          <div>
            <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider block">Trend Analysis</span>
            <h3 className="text-sm font-bold text-white mt-1">Maintenance Frequency</h3>
          </div>

          {maintenanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={maintenanceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1f4e" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#8b7eb8', fontSize: 10 }}
                  axisLine={{ stroke: '#2a1f4e' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8b7eb8', fontSize: 10 }}
                  axisLine={{ stroke: '#2a1f4e' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: '#8b7eb8', paddingTop: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Requests"
                  stroke="#b8ff57"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#b8ff57' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#5b3fd4"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#5b3fd4' }}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke="#ff4081"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ff4081' }}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-on-dark-muted border border-dashed border-hairline-violet/30 rounded">
              Loading maintenance trends...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
