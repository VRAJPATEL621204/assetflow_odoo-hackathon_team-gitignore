import React, { useState } from 'react';

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');

  const departments = [
    { id: 1, name: 'Engineering', head: 'Aditi Rao', parent: '-', status: 'Active' },
    { id: 2, name: 'Facilities', head: 'Rohan Mehta', parent: '-', status: 'Active' },
    { id: 3, name: 'Field Ops', head: 'Nisha Iqbal', parent: 'Operations', status: 'Inactive' },
  ];

  const categories = [
    { id: 1, name: 'Electronics', fields: 'Warranty Period, Serial Number' },
    { id: 2, name: 'Furniture', fields: 'Material, Dimensions' },
    { id: 3, name: 'Vehicles', fields: 'License Plate, Insurance Expiry' },
  ];

  const employees = [
    { id: 1, name: 'Priya Shah', email: 'priya@company.com', department: 'Engineering', role: 'Department Head', status: 'Active' },
    { id: 2, name: 'Raj Kumar', email: 'raj@company.com', department: 'Engineering', role: 'Employee', status: 'Active' },
    { id: 3, name: 'Siddharth Varma', email: 'sid@company.com', department: 'Facilities', role: 'Asset Manager', status: 'Active' },
  ];

  return (
    <div className="bg-ink-deep border border-hairline-violet rounded-lg p-6 space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-hairline-violet gap-6">
        {['departments', 'categories', 'employees'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-accent-lime text-white' : 'border-transparent text-on-dark-muted hover:text-white'
            }`}
          >
            {tab === 'categories' ? 'Asset Categories' : tab === 'employees' ? 'Employee Directory' : 'Departments'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'departments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider">Department Hierarchy</span>
              <button className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors">
                + Add Department
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Head</th>
                    <th className="pb-3">Parent Dept</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-hairline-violet/50">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-primary/20">
                      <td className="py-3 text-white font-medium">{dept.name}</td>
                      <td className="py-3 text-on-dark-muted">{dept.head}</td>
                      <td className="py-3 text-on-dark-muted">{dept.parent}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          dept.status === 'Active' ? 'bg-accent-lime/10 text-accent-lime' : 'bg-accent-pink/10 text-accent-pink'
                        }`}>
                          {dept.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider">Asset Categories</span>
              <button className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors">
                + Add Category
              </button>
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
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-primary/20">
                      <td className="py-3 text-white font-medium">{cat.name}</td>
                      <td className="py-3 text-on-dark-muted">{cat.fields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-dark-muted font-bold uppercase tracking-wider">System Users Directory</span>
              <button className="bg-accent-lime text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-accent-lime/90 transition-colors">
                + Invite Employee
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-violet text-xs text-on-dark-muted font-bold uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">System Role</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-hairline-violet/50">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-primary/20">
                      <td className="py-3 text-white font-medium">{emp.name}</td>
                      <td className="py-3 text-on-dark-muted">{emp.email}</td>
                      <td className="py-3 text-on-dark-muted">{emp.department}</td>
                      <td className="py-3">
                        <select className="bg-primary text-xs border border-hairline-violet rounded p-1 text-white">
                          <option value="Employee" selected={emp.role === 'Employee'}>Employee</option>
                          <option value="Department Head" selected={emp.role === 'Department Head'}>Department Head</option>
                          <option value="Asset Manager" selected={emp.role === 'Asset Manager'}>Asset Manager</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent-lime/10 text-accent-lime">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSetup;
