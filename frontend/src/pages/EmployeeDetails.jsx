import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Clock, 
  CreditCard,
  User,
  FileText,
  Printer
} from 'lucide-react';
import { toast } from 'react-toastify';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Printable Payslip overlay state
  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      try {
        const [empRes, attendRes, payRes] = await Promise.all([
          API.get(`/api/employees/${id}`),
          API.get(`/api/attendance/employee/${id}`),
          API.get(`/api/payroll/employee/${id}`)
        ]);
        setEmployee(empRes.data);
        setAttendance(attendRes.data);
        setPayrolls(payRes.data);
      } catch (err) {
        toast.error('Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  const handleOpenPayslip = (payroll) => {
    setSelectedPayslip(payroll);
    setShowPayslip(false);
    // Double request state setting or opening modal
    setTimeout(() => {
      setSelectedPayslip(payroll);
      setShowPayslip(true);
    }, 50);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-300">Employee not found</h2>
        <button onClick={() => navigate('/employees')} className="mt-4 text-indigo-400 hover:underline">Back to Directory</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employees')}
          className="p-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{employee.firstName} {employee.lastName}</h1>
          <p className="text-slate-400 text-sm mt-1">{employee.jobTitle} • {employee.department?.name}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Profile Summary */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col items-center text-center h-fit">
          <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-400 text-3xl uppercase mb-4 shadow-lg shadow-indigo-500/10">
            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-slate-100">{employee.firstName} {employee.lastName}</h3>
          <span className="text-sm text-slate-500 font-semibold mt-1 uppercase tracking-wider">{employee.jobTitle}</span>

          <div className="w-full space-y-3 mt-6 text-left text-sm border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3 text-slate-300">
              <Building2 size={16} className="text-slate-500" />
              <span>{employee.department?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Mail size={16} className="text-slate-500" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Phone size={16} className="text-slate-500" />
              <span>{employee.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar size={16} className="text-slate-500" />
              <span>Joined: {employee.hireDate}</span>
            </div>
          </div>
        </div>

        {/* Right Side Detail Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-slate-800 flex gap-6 text-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 font-semibold tracking-wider transition-colors ${
                activeTab === 'profile' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              System Profile
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-3 font-semibold tracking-wider transition-colors ${
                activeTab === 'attendance' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Attendance logs ({attendance.length})
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`pb-3 font-semibold tracking-wider transition-colors ${
                activeTab === 'payroll' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Payroll History ({payrolls.length})
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <User size={18} className="text-indigo-400" />
                <span>Employment Profile Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Salary Grade Base</span>
                  <span className="text-slate-200 font-bold block mt-1">₹{employee.basicSalary?.toLocaleString()}/month</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Active Status</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                    employee.status === 'Active' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}>{employee.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Default User ID</span>
                  <span className="text-slate-200 font-medium block mt-1">{employee.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">System Access Credentials</span>
                  <span className="text-indigo-400 font-bold block mt-1">Default Password: employee123</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-850">
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Check In</th>
                      <th className="py-3 px-6">Check Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {attendance.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/10">
                        <td className="py-3.5 px-6 font-semibold">{a.date}</td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            a.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            a.status === 'ABSENT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            a.status === 'LEAVE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>{a.status}</span>
                        </td>
                        <td className="py-3.5 px-6 flex items-center gap-1">
                          {a.checkIn ? (
                            <>
                              <Clock size={14} className="text-slate-500" />
                              <span>{a.checkIn.substring(0, 5)}</span>
                            </>
                          ) : '-'}
                        </td>
                        <td className="py-3.5 px-6">
                          {a.checkOut ? a.checkOut.substring(0, 5) : '-'}
                        </td>
                      </tr>
                    ))}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">No attendance logs.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-850">
                      <th className="py-3 px-6">Pay Period</th>
                      <th className="py-3 px-6">Net Salary</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {payrolls.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/10">
                        <td className="py-3.5 px-6 font-semibold">{p.payPeriod}</td>
                        <td className="py-3.5 px-6 font-bold">₹{p.netSalary?.toLocaleString()}</td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>{p.paymentStatus}</span>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => handleOpenPayslip(p)}
                            className="inline-flex items-center gap-1 py-1 px-3 rounded-lg border border-slate-700 text-xs hover:bg-slate-800 transition"
                          >
                            <FileText size={13} />
                            <span>View Pay Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {payrolls.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">No payroll calculations.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payslip Overlay Modal */}
      {showPayslip && selectedPayslip && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:relative print:z-0">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl p-8 relative print:border-none print:shadow-none print:bg-white print:text-slate-900 print:rounded-none">
            
            {/* Control panel (hidden on print) */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-850 pb-4 print:hidden">
              <h3 className="text-xl font-bold text-slate-200 font-sans">View Salary Slip</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-slate-750 text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition text-xs font-semibold"
                >
                  <Printer size={15} />
                  <span>Print / Download</span>
                </button>
                <button
                  onClick={() => setShowPayslip(false)}
                  className="p-2 text-slate-400 hover:text-slate-250 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Print Sheet Content */}
            <div className="space-y-6 print:text-slate-900 font-sans">
              <div className="flex justify-between items-start border-b border-slate-700/50 pb-6 print:border-slate-300">
                <div>
                  <h2 className="text-2xl font-black tracking-wider text-white print:text-slate-900">PAYROLL<span className="text-indigo-400 font-extrabold print:text-indigo-650">PRO</span></h2>
                  <span className="text-xs text-slate-400 font-medium print:text-slate-500">Corporate Employee Pay Document</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block print:text-slate-500">Pay Period</span>
                  <span className="text-lg font-bold text-slate-200 print:text-slate-900">{selectedPayslip.payPeriod}</span>
                </div>
              </div>

              {/* Summary Details */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900/30 border border-slate-800 p-4 rounded-2xl print:bg-slate-100 print:border-slate-250">
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Employee Name</span>
                  <span className="text-slate-200 font-bold print:text-slate-800">{employee.firstName} {employee.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Designation</span>
                  <span className="text-slate-200 font-bold print:text-slate-800">{employee.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Department</span>
                  <span className="text-slate-200 font-medium print:text-slate-800">{employee.department?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Employee ID</span>
                  <span className="text-slate-200 font-medium print:text-slate-800">#EMP00{employee.id}</span>
                </div>
              </div>

              {/* Earnings/Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase text-xs tracking-wider print:text-slate-700 print:border-slate-200">Earnings</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">Basic Salary</span>
                    <span className="text-slate-200 font-semibold print:text-slate-800">₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">HRA Allowance</span>
                    <span className="text-slate-200 font-semibold print:text-slate-800">₹{selectedPayslip.hra?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">Other Allowances</span>
                    <span className="text-slate-200 font-semibold print:text-slate-800">₹{selectedPayslip.allowances?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">Bonus</span>
                    <span className="text-slate-200 font-semibold print:text-slate-800">₹{selectedPayslip.bonus?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase text-xs tracking-wider print:text-slate-700 print:border-slate-200">Deductions</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">Taxes & Provident Fund</span>
                    <span className="text-rose-400 font-semibold">₹{selectedPayslip.deductions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-slate-700/50 pt-6 mt-6 space-y-3 print:border-slate-300">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 print:text-slate-500">Gross Salary</span>
                  <span className="text-slate-200 font-bold print:text-slate-800">₹{selectedPayslip.grossSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 print:text-slate-500">Deductions Total</span>
                  <span className="text-rose-400 font-bold">₹{selectedPayslip.deductions?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-lg font-black print:bg-slate-100 print:border-slate-250">
                  <span className="text-indigo-300 font-bold print:text-slate-700">Net Take-Home Salary</span>
                  <span className="text-white font-extrabold print:text-indigo-650">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-850 flex justify-between text-xs text-slate-500 print:border-slate-200">
                <div>
                  <span className="block font-bold">Payment Mode: {selectedPayslip.paymentStatus === 'Paid' ? 'Razorpay' : 'Pending'}</span>
                  <span className="block mt-1">This is a system generated document.</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Authorized signatory</span>
                  <span className="font-serif italic text-indigo-400/90 font-bold text-sm block mt-1 print:text-slate-800">PayrollPro Inc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
