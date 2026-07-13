import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { CreditCard, Calendar, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentsPanel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const res = await API.get('/api/payments');
          setPayments(res.data);
        } else {
          const res = await API.get(`/api/payments/employee/${user.employeeId}`);
          setPayments(res.data);
        }
      } catch (err) {
        toast.error('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [isAdmin, user]);

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    try {
      const date = new Date(dtStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dtStr;
    }
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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-custom font-sans">Disbursement Ledger</h1>
        <p className="text-secondary-custom text-sm mt-1">Audit complete salary transaction logs, receipt IDs, and disbursement dates.</p>
      </div>

      {/* Ledger Grid Card */}
      <div className="glass-panel rounded-3xl border border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-custom text-xs font-semibold text-secondary-custom uppercase tracking-wider bg-card-custom/25">
                <th className="py-4 px-6">Transaction Date</th>
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6">Payroll Cycle</th>
                <th className="py-4 px-6">Amount Disbursed</th>
                <th className="py-4 px-6">Payment Mode</th>
                <th className="py-4 px-6">Transaction / Receipt ID</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-custom text-sm text-secondary-custom">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-500/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-secondary-custom" />
                      <span>{formatDateTime(pay.paymentDate)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-semibold text-primary-custom block">{pay.employee?.firstName} {pay.employee?.lastName}</span>
                      <span className="text-xs text-secondary-custom font-semibold">{pay.employee?.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-secondary-custom">
                    {pay.payroll?.payPeriod || 'N/A'}
                  </td>
                  <td className="py-4 px-6 font-bold text-primary-custom flex items-center gap-0.5">
                    <span>₹{pay.amount?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-indigo-400 bg-indigo-500/5 px-2.5 py-1 border border-indigo-500/10 rounded-lg text-xs">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-secondary-custom select-all" title="Click to select transaction ID">
                    {pay.transactionId || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                      pay.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      <CheckCircle2 size={13} />
                      <span>{pay.status}</span>
                    </span>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-secondary-custom">
                    No transactions captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPanel;
