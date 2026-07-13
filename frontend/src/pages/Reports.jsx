import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Landmark, Users, DollarSign, FileText, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees'); // 'employees', 'headcount', 'departments'

  useEffect(() => {
    API.get('/api/reports/summary')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to compile reports diagnostics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-secondary-custom">
        Failed to load operational summaries.
      </div>
    );
  }

  // Chart 1: Headcount Distribution Doughnut
  const doughnutData = {
    labels: data.departmentSalaryReports.map(d => d.departmentName),
    datasets: [
      {
        data: data.departmentSalaryReports.map(d => d.employeeCount),
        backgroundColor: [
          'rgba(99, 102, 241, 0.75)',
          'rgba(16, 185, 129, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(239, 68, 68, 0.75)'
        ],
        borderColor: [
          '#4f46e5',
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 1,
      }
    ]
  };

  // Chart 2: Cost Overhead Allocation Bar Chart
  const barData = {
    labels: data.departmentSalaryReports.map(d => d.departmentName),
    datasets: [
      {
        label: 'Basic Salary Overhead (₹)',
        data: data.departmentSalaryReports.map(d => d.totalSalaryCost),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-custom font-sans">Corporate Reports & Auditing</h1>
        <p className="text-secondary-custom text-sm mt-1">Review operational headcount trends, salary structures, and department cost diagnostics.</p>
      </div>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-custom">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-custom uppercase tracking-wider block">Average Basic Wage</span>
            <span className="text-2xl font-extrabold text-primary-custom mt-1 block">₹{data.averageBasicWage?.toLocaleString([], {maximumFractionDigits:0})}/mo</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-custom">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-custom uppercase tracking-wider block">Total Disbursed Payroll</span>
            <span className="text-2xl font-extrabold text-primary-custom mt-1 block">₹{data.totalDistributedPayrollAmount?.toLocaleString()}</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-custom">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Landmark size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-custom uppercase tracking-wider block">Active Headcount</span>
            <span className="text-2xl font-extrabold text-primary-custom mt-1 block">{data.headcountReports?.length} Staff Members</span>
          </div>
        </div>
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Share */}
        <div className="glass-panel p-6 rounded-2xl border border-custom">
          <h3 className="text-lg font-bold text-primary-custom mb-6 flex items-center gap-2 font-sans">
            <Users size={20} className="text-indigo-500" />
            <span>Staff Headcount Distribution</span>
          </h3>
          <div className="h-64 flex justify-center items-center">
            <Doughnut 
              data={doughnutData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                  legend: { 
                    position: 'bottom', 
                    labels: { color: 'var(--text-secondary)', boxWidth: 12 } 
                  } 
                } 
              }} 
            />
          </div>
        </div>

        {/* Cost allocation */}
        <div className="glass-panel p-6 rounded-2xl border border-custom">
          <h3 className="text-lg font-bold text-primary-custom mb-6 flex items-center gap-2 font-sans">
            <DollarSign size={20} className="text-indigo-500" />
            <span>Department Cost Allocation</span>
          </h3>
          <div className="h-64">
            <Bar 
              data={barData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { 
                  y: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-secondary)' } }, 
                  x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } } 
                }, 
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Report tabs navigation */}
      <div className="flex border-b border-custom gap-6">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'employees'
              ? 'text-indigo-500 border-b-2 border-indigo-500'
              : 'text-secondary-custom hover:text-primary-custom'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Employee Pay Audit
          </span>
        </button>
        <button
          onClick={() => setActiveTab('headcount')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'headcount'
              ? 'text-indigo-500 border-b-2 border-indigo-500'
              : 'text-secondary-custom hover:text-primary-custom'
          }`}
        >
          <span className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Headcount Register
          </span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'departments'
              ? 'text-indigo-500 border-b-2 border-indigo-500'
              : 'text-secondary-custom hover:text-primary-custom'
          }`}
        >
          <span className="flex items-center gap-2">
            <Landmark className="w-4 h-4" /> Department Operational Costs
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="glass-panel p-6 rounded-2xl border border-custom">
        {activeTab === 'employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-custom text-secondary-custom text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3 text-right">Basic Salary</th>
                  <th className="pb-3 text-right">Gross Salary</th>
                  <th className="pb-3 text-right">Deductions</th>
                  <th className="pb-3 text-right">Net Salary</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total Paid Salary</th>
                  <th className="pb-3 text-right">Total Deductions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom text-primary-custom">
                {data.employeeReports.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3.5 font-medium">{row.employeeName}</td>
                    <td className="py-3.5 text-right font-semibold">₹{row.basicSalary?.toLocaleString()}</td>
                    <td className="py-3.5 text-right">₹{row.grossSalary?.toLocaleString()}</td>
                    <td className="py-3.5 text-right text-rose-400">₹{row.deductions?.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-bold text-indigo-400">₹{row.netSalary?.toLocaleString()}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        row.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-emerald-500">₹{row.totalPaidSalary?.toLocaleString()}</td>
                    <td className="py-3.5 text-right text-rose-400">₹{row.totalDeductions?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'headcount' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-custom text-secondary-custom text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Staff ID</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Designation</th>
                  <th className="pb-3">Hire Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom text-primary-custom">
                {data.headcountReports.map((row, idx) => (
                  <tr key={row.employeeId} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3.5 text-xs text-secondary-custom font-mono">#EMP00{row.employeeId}</td>
                    <td className="py-3.5 font-medium">{row.name}</td>
                    <td className="py-3.5 text-secondary-custom">{row.email}</td>
                    <td className="py-3.5 text-secondary-custom">{row.phone || '—'}</td>
                    <td className="py-3.5">{row.departmentName}</td>
                    <td className="py-3.5 text-secondary-custom">{row.jobTitle}</td>
                    <td className="py-3.5 text-secondary-custom">{row.hireDate}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-custom text-secondary-custom text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Department Name</th>
                  <th className="pb-3">Total Employees (Headcount)</th>
                  <th className="pb-3 text-right">Total Basic Salary Cost</th>
                  <th className="pb-3 text-right">Average Basic Wage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom text-primary-custom">
                {data.departmentSalaryReports.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3.5 font-semibold">{row.departmentName}</td>
                    <td className="py-3.5">{row.employeeCount}</td>
                    <td className="py-3.5 text-right font-bold text-indigo-400">₹{row.totalSalaryCost?.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-semibold">₹{row.averageSalaryCost?.toLocaleString([], {maximumFractionDigits:0})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
