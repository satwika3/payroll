import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Landmark, Users, ArrowLeft, LandmarkIcon, CreditCard, CalendarCheck } from 'lucide-react';
import API from '../services/api';

function DepartmentDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees'); // 'employees', 'attendance', 'payments'

  useEffect(() => {
    API.get(`/api/departments/${id}/details`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load department details');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <LandmarkIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-xl font-bold text-secondary-custom">Department not found</h3>
        <Link to="/departments" className="text-indigo-500 hover:underline mt-4 inline-block">Back to Departments</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <div>
        <Link to="/departments" className="inline-flex items-center gap-2 text-sm text-secondary-custom hover:text-primary-custom transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Departments
        </Link>
      </div>

      {/* Header Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-custom relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary-custom font-sans">{data.name}</h1>
              <p className="text-sm text-secondary-custom mt-1">{data.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {data.totalEmployees} Employees
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
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
            <Users className="w-4 h-4" /> Employees & Salaries
          </span>
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'attendance'
              ? 'text-indigo-500 border-b-2 border-indigo-500'
              : 'text-secondary-custom hover:text-primary-custom'
          }`}
        >
          <span className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" /> Attendance Register
          </span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'payments'
              ? 'text-indigo-500 border-b-2 border-indigo-500'
              : 'text-secondary-custom hover:text-primary-custom'
          }`}
        >
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Payment History
          </span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="glass-panel p-6 rounded-2xl border border-custom">
        {activeTab === 'employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-custom text-secondary-custom text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Designation</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3 text-right">Basic Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom text-primary-custom">
                {data.employees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-secondary-custom">
                      No employees registered in this department yet.
                    </td>
                  </tr>
                ) : (
                  data.employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3.5 font-medium">{emp.firstName} {emp.lastName}</td>
                      <td className="py-3.5 text-secondary-custom">{emp.jobTitle}</td>
                      <td className="py-3.5 text-secondary-custom">{emp.email}</td>
                      <td className="py-3.5 text-right font-bold text-indigo-400">₹{emp.basicSalary?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-custom text-secondary-custom text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Clock In / Out</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom text-primary-custom">
                {data.employees.flatMap(emp => 
                  emp.attendances.map(att => ({
                    empName: `${emp.firstName} ${emp.lastName}`,
                    ...att
                  }))
                ).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-secondary-custom">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  data.employees.flatMap(emp => 
                    emp.attendances.map(att => ({
                      empName: `${emp.firstName} ${emp.lastName}`,
                      ...att
                    }))
                  )
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((att, index) => (
                    <tr key={index} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3.5 font-medium">{att.empName}</td>
                      <td className="py-3.5 text-secondary-custom">{att.date}</td>
                      <td className="py-3.5 text-secondary-custom">
                        {att.checkIn ? `${att.checkIn} - ${att.checkOut}` : '—'}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider ${
                          att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' :
                          att.status === 'ABSENT' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-custom text-secondary-custom text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Payment Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payment Method</th>
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom text-primary-custom">
                {data.employees.flatMap(emp => 
                  emp.payments.map(p => ({
                    empName: `${emp.firstName} ${emp.lastName}`,
                    ...p
                  }))
                ).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-secondary-custom">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  data.employees.flatMap(emp => 
                    emp.payments.map(p => ({
                      empName: `${emp.firstName} ${emp.lastName}`,
                      ...p
                    }))
                  )
                  .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''))
                  .map((p, index) => (
                    <tr key={index} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3.5 font-medium">{p.empName}</td>
                      <td className="py-3.5 text-secondary-custom">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 font-bold text-indigo-400">₹{p.amount?.toLocaleString()}</td>
                      <td className="py-3.5 text-secondary-custom">{p.paymentMethod}</td>
                      <td className="py-3.5 text-xs text-secondary-custom font-mono">{p.transactionId}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentDetails;
