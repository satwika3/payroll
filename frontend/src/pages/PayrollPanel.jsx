import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Plus, 
  DollarSign, 
  CreditCard, 
  FileText, 
  X, 
  Printer, 
  Calculator,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const PayrollPanel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal toggles
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Payment Gateway State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayrollForPayment, setSelectedPayrollForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    phone: '',
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [paymentStatusSimulation, setPaymentStatusSimulation] = useState('Success');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Generate Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriod: new Date().toISOString().substring(0, 7), // YYYY-MM
    hra: '',
    allowances: '',
    bonus: '',
    deductions: '',
  });
  const [selectedEmployeeBasic, setSelectedEmployeeBasic] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [payRes, empRes] = await Promise.all([
          API.get('/api/payroll'),
          API.get('/api/employees')
        ]);
        setPayrolls(payRes.data);
        setEmployees(empRes.data);
      } else {
        const payRes = await API.get(`/api/payroll/employee/${user.employeeId}`);
        setPayrolls(payRes.data);
      }
    } catch (err) {
      toast.error('Failed to fetch payroll records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [isAdmin, user]);

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setFormData(prev => ({ ...prev, employeeId: empId }));
    const emp = employees.find(x => x.id === parseInt(empId));
    if (emp) {
      setSelectedEmployeeBasic(emp.basicSalary);
      // Auto fill HRA as 40% of basic
      setFormData(prev => ({ 
        ...prev, 
        employeeId: empId,
        hra: (emp.basicSalary * 0.4).toString(),
        allowances: '5000',
        bonus: '0',
        deductions: '4000'
      }));
    } else {
      setSelectedEmployeeBasic(0);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId || !formData.payPeriod) {
      setError('Please select an employee and pay period');
      return;
    }

    setGenerating(true);
    try {
      const params = new URLSearchParams();
      params.append('employeeId', formData.employeeId);
      params.append('payPeriod', formData.payPeriod);
      params.append('hra', formData.hra || '0');
      params.append('allowances', formData.allowances || '0');
      params.append('bonus', formData.bonus || '0');
      params.append('deductions', formData.deductions || '0');

      await API.post(`/api/payroll/generate?${params.toString()}`);
      toast.success('Payroll generated successfully');
      setShowGenerateModal(false);
      fetchPayrolls();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payroll record');
    } finally {
      setGenerating(false);
    }
  };

  // Custom Payment options handler
  const handlePaySalary = (payroll) => {
    setSelectedPayrollForPayment(payroll);
    setPaymentMethod('UPI');
    setPaymentDetails({ upiId: '', phone: '', cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
    setPaymentStatusSimulation('Success');
    setPaymentResult(null);
    setPaymentProcessing(false);
    setShowPaymentModal(true);
  };

  const submitSimulatedPayment = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);
    setPaymentResult(null);

    // Simulate 1.5s bank latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      let details = '';
      if (paymentMethod === 'UPI') details = paymentDetails.upiId;
      else if (paymentMethod === 'PhonePe') details = paymentDetails.phone;
      else details = `Card: ${paymentDetails.cardNumber.slice(-4)}`;

      await API.post('/api/payments/process', {
        payrollId: selectedPayrollForPayment.id,
        employeeId: selectedPayrollForPayment.employee.id,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatusSimulation,
        paymentDetails: details
      });

      setPaymentResult(paymentStatusSimulation);
      if (paymentStatusSimulation === 'Success') {
        toast.success('Salary successfully dispersed!');
      } else {
        toast.error('Salary payment transaction failed.');
      }
      fetchPayrolls();
    } catch (err) {
      toast.error('Payment processing encountered an error');
      setPaymentResult('Failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleOpenPayslip = (payroll) => {
    setSelectedPayslip(payroll);
    setShowPayslipModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-custom font-sans">Payroll Ledger</h1>
          <p className="text-secondary-custom text-sm mt-1">Review wage cycles, HRA deductions, and disburse salaries via our payment gateway.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm w-full md:w-auto justify-center cursor-pointer"
          >
            <Plus size={18} />
            <span>Generate Payroll</span>
          </button>
        )}
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-3xl border border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-custom text-xs font-semibold text-secondary-custom uppercase tracking-wider bg-card-custom/25">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6">Pay Period</th>
                <th className="py-4 px-6">Gross Salary</th>
                <th className="py-4 px-6">Deductions</th>
                <th className="py-4 px-6">Net Salary</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-custom text-secondary-custom text-sm">
              {payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-slate-500/5 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-semibold text-primary-custom block">{p.employee?.firstName} {p.employee?.lastName}</span>
                      <span className="text-xs text-secondary-custom font-semibold">{p.employee?.jobTitle}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-secondary-custom">{p.payPeriod}</td>
                  <td className="py-4 px-6">₹{p.grossSalary?.toLocaleString()}</td>
                  <td className="py-4 px-6 text-rose-400 font-semibold">₹{p.deductions?.toLocaleString()}</td>
                  <td className="py-4 px-6 font-bold text-primary-custom">₹{p.netSalary?.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.paymentStatus === 'Paid' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleOpenPayslip(p)}
                        className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                      >
                        <FileText size={14} />
                        <span>Payslip</span>
                      </button>
                      {isAdmin && p.paymentStatus === 'Pending' && (
                        <button
                          onClick={() => handlePaySalary(p)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs text-white font-semibold transition-all shadow-md shadow-indigo-600/10"
                        >
                          <CreditCard size={14} />
                          <span>Pay Salary</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {payrolls.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500">
                    No payroll calculations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-indigo-400" />
              <span>Compute Employee Wages</span>
            </h3>

            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-pulse">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Selection */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Employee Designation
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={handleEmployeeChange}
                    className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Basic Salary Info (Prefilled) */}
                <div className="col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-sm flex justify-between text-slate-400">
                  <span>Basic Month Grade Salary:</span>
                  <span className="font-semibold text-slate-200">₹{selectedEmployeeBasic.toLocaleString()}</span>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Pay Period
                  </label>
                  <input
                    type="month"
                    value={formData.payPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, payPeriod: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* HRA */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    HRA (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.hra}
                    onChange={(e) => setFormData(prev => ({ ...prev, hra: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    placeholder="40% of Basic"
                  />
                </div>

                {/* Allowances */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Allowances (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowances: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    placeholder="e.g. 5000"
                  />
                </div>

                {/* Bonus */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Bonus (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    placeholder="e.g. 2000"
                  />
                </div>

                {/* Deductions */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Deductions (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData(prev => ({ ...prev, deductions: e.target.value }))}
                    className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    placeholder="PF, taxes, etc."
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={generating}
                className="w-full py-3.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 gradient-bg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] focus:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm flex justify-center items-center gap-2 mt-4"
              >
                {generating ? 'Calculating...' : 'Compute and Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Payslip Modal (Print Ready Layout) */}
      {showPayslipModal && selectedPayslip && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:relative print:z-0">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl p-8 relative print:border-none print:shadow-none print:bg-white print:text-slate-900 print:rounded-none">
            
            {/* Control banner (hidden on print) */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-850 pb-4 print:hidden">
              <h3 className="text-xl font-bold text-slate-200">View Salary Slip</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-slate-750 text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition"
                >
                  <Printer size={16} />
                  <span>Print / Download</span>
                </button>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-250 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Payslip Content Sheet */}
            <div className="space-y-6 print:text-slate-900">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-700/50 pb-6 print:border-slate-300">
                <div>
                  <h2 className="text-2xl font-black tracking-wider text-white print:text-slate-900">PAYROLL<span className="text-indigo-400 font-extrabold print:text-indigo-600">PRO</span></h2>
                  <span className="text-xs text-slate-400 font-medium print:text-slate-500">Corporate Employee Pay Document</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block print:text-slate-500">Pay Period</span>
                  <span className="text-lg font-bold text-slate-200 print:text-slate-900">{selectedPayslip.payPeriod}</span>
                </div>
              </div>

              {/* Employee Summary details */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900/30 border border-slate-800 p-4 rounded-2xl print:bg-slate-100 print:border-slate-200">
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Employee Name</span>
                  <span className="text-slate-200 font-bold print:text-slate-800">{selectedPayslip.employee?.firstName} {selectedPayslip.employee?.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Designation</span>
                  <span className="text-slate-200 font-bold print:text-slate-800">{selectedPayslip.employee?.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Department</span>
                  <span className="text-slate-200 font-medium print:text-slate-800">{selectedPayslip.employee?.department?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Employee ID</span>
                  <span className="text-slate-200 font-medium print:text-slate-800">#EMP00{selectedPayslip.employee?.id}</span>
                </div>
              </div>

              {/* Financial Earnings / Deductions breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm">
                {/* Earnings */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase text-xs tracking-wider print:text-slate-700 print:border-slate-200">Earnings</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">Basic Salary</span>
                    <span className="text-slate-200 font-semibold print:text-slate-800">₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">House Rent Allowance (HRA)</span>
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

                {/* Deductions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase text-xs tracking-wider print:text-slate-700 print:border-slate-200">Deductions</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-500">Statutory Deductions (PF/Tax)</span>
                    <span className="text-rose-400 font-semibold">₹{selectedPayslip.deductions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Total Calculation Section */}
              <div className="border-t border-slate-700/50 pt-6 mt-6 space-y-3 print:border-slate-300">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 print:text-slate-500">Gross Salary</span>
                  <span className="text-slate-200 font-bold print:text-slate-800">₹{selectedPayslip.grossSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 print:text-slate-500">Deductions Total</span>
                  <span className="text-rose-400 font-bold">₹{selectedPayslip.deductions?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-lg font-black print:bg-slate-100 print:border-slate-300">
                  <span className="text-indigo-300 font-bold print:text-slate-700">Net Take-Home Salary</span>
                  <span className="text-white font-extrabold print:text-indigo-600">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                </div>
              </div>

              {/* Verified Signatures / Footer */}
              <div className="pt-8 border-t border-slate-850 flex justify-between text-xs text-slate-500 print:border-slate-200">
                <div>
                  <span className="block font-bold">Payment Mode: {selectedPayslip.paymentStatus === 'Paid' ? 'Razorpay' : 'Pending'}</span>
                  <span className="block mt-1">This is a system generated document and does not require a physical seal.</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Authorized signatory</span>
                  <div className="h-6 mt-1 flex justify-end items-center">
                    <span className="font-serif italic text-indigo-400/90 font-bold print:text-slate-800 text-sm">PayrollPro Inc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentModal && selectedPayrollForPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-custom shadow-2xl p-6 relative">
            <button
              onClick={() => {
                if (!paymentProcessing) setShowPaymentModal(false);
              }}
              className="absolute top-4 right-4 text-secondary-custom hover:text-primary-custom transition-colors"
              disabled={paymentProcessing}
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-primary-custom mb-2 font-sans flex items-center gap-2">
              <CreditCard className="text-indigo-500" />
              <span>Salary Payment Gateway</span>
            </h3>
            <p className="text-xs text-secondary-custom mb-4">
              Disbursing ₹{selectedPayrollForPayment.netSalary?.toLocaleString()} to {selectedPayrollForPayment.employee?.firstName} {selectedPayrollForPayment.employee?.lastName}
            </p>

            {paymentResult === null ? (
              <form onSubmit={submitSimulatedPayment} className="space-y-4">
                {/* Method selector tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-900 border border-custom p-1 rounded-xl">
                  {['UPI', 'PhonePe', 'Card'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-secondary-custom hover:text-primary-custom'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {/* Form Fields */}
                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">
                      VPA / UPI ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. employee@okaxis"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                      className="w-full bg-card-custom/50 border border-custom rounded-xl py-2.5 px-4 text-primary-custom placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                )}

                {paymentMethod === 'PhonePe' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">
                      Phone Number linked to PhonePe
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={paymentDetails.phone}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, phone: e.target.value })}
                      className="w-full bg-card-custom/50 border border-custom rounded-xl py-2.5 px-4 text-primary-custom placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="16-digit Card Number"
                        maxLength="16"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        className="w-full bg-card-custom/50 border border-custom rounded-xl py-2.5 px-4 text-primary-custom placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          maxLength="5"
                          value={paymentDetails.expiry}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                          className="w-full bg-card-custom/50 border border-custom rounded-xl py-2.5 px-4 text-primary-custom placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">
                          CVV
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="CVV"
                          maxLength="3"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                          className="w-full bg-card-custom/50 border border-custom rounded-xl py-2.5 px-4 text-primary-custom placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulation Control */}
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                    Payment Simulator Control
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-secondary-custom hover:text-primary-custom">
                      <input
                        type="radio"
                        name="simStatus"
                        value="Success"
                        checked={paymentStatusSimulation === 'Success'}
                        onChange={() => setPaymentStatusSimulation('Success')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Simulate Success
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-secondary-custom hover:text-primary-custom">
                      <input
                        type="radio"
                        name="simStatus"
                        value="Failed"
                        checked={paymentStatusSimulation === 'Failed'}
                        onChange={() => setPaymentStatusSimulation('Failed')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Simulate Failure
                    </label>
                  </div>
                </div>

                {/* Action buttons */}
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold transition-all duration-200 gradient-bg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-sm flex justify-center items-center gap-2 mt-4 cursor-pointer"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                      <span>Contacting Bank Gateway...</span>
                    </>
                  ) : (
                    <span>Disburse Salary (Simulate)</span>
                  )}
                </button>
              </form>
            ) : (
              /* Success / Failure Screen */
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                    paymentResult === 'Success'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                      : 'bg-rose-500/10 border-rose-500 text-rose-500'
                  }`}>
                    {paymentResult === 'Success' ? (
                      <span className="text-3xl font-black">✓</span>
                    ) : (
                      <span className="text-3xl font-black">✗</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-primary-custom">
                    {paymentResult === 'Success' ? 'Transaction Success' : 'Transaction Failed'}
                  </h4>
                  <p className="text-sm text-secondary-custom mt-1">
                    {paymentResult === 'Success'
                      ? 'The salary amount has been disbursed successfully to the employee account.'
                      : 'The payment transaction was rejected by the simulating bank gateway.'}
                  </p>
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Close Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPanel;
