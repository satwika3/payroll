import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Calendar, Save, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AttendancePanel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [personalAttendance, setPersonalAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAdminData = async (selectedDate) => {
    setLoading(true);
    try {
      const [empRes, attendRes] = await Promise.all([
        API.get('/api/employees'),
        API.get(`/api/attendance/date/${selectedDate}`)
      ]);
      
      setEmployees(empRes.data);
      
      // Map existing attendance onto employees list
      const initialAttendance = empRes.data.map((emp) => {
        const match = attendRes.data.find(a => a.employee.id === emp.id);
        return {
          employeeId: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          jobTitle: emp.jobTitle,
          status: match ? match.status : 'PRESENT',
          checkIn: match ? match.checkIn || '09:00' : '09:00',
          checkOut: match ? match.checkOut || '18:00' : '18:00'
        };
      });
      setAttendanceList(initialAttendance);
    } catch (err) {
      toast.error('Failed to load attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/attendance/employee/${user.employeeId}`);
      setPersonalAttendance(res.data);
    } catch (err) {
      toast.error('Failed to load your attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData(date);
    } else if (user?.employeeId) {
      fetchPersonalData();
    }
  }, [isAdmin, date, user]);

  const handleStatusChange = (index, status) => {
    const updated = [...attendanceList];
    updated[index].status = status;
    
    // Clear check-in/out if absent or leave
    if (status === 'ABSENT' || status === 'LEAVE') {
      updated[index].checkIn = '';
      updated[index].checkOut = '';
    } else {
      updated[index].checkIn = '09:00';
      updated[index].checkOut = '18:00';
    }
    setAttendanceList(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...attendanceList];
    updated[index][field] = value;
    setAttendanceList(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        attendanceList.map((record) => 
          API.post('/api/attendance', {
            employeeId: record.employeeId,
            date: date,
            status: record.status,
            checkIn: record.checkIn ? record.checkIn + ":00" : null,
            checkOut: record.checkOut ? record.checkOut + ":00" : null
          })
        )
      );
      toast.success('Attendance updated successfully');
      fetchAdminData(date);
    } catch (err) {
      toast.error('Failed to save attendance logs');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Admin View ---
  if (isAdmin) {
    return (
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Attendance Management</h1>
            <p className="text-slate-400 text-sm mt-1">Review check-in history, log statuses, and track working days.</p>
          </div>
          
          {/* Date Selector */}
          <div className="flex items-center gap-3 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-300 w-full md:w-auto">
            <Calendar size={18} className="text-indigo-400" />
            <span className="font-semibold text-slate-400">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Sheet Grid */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/20">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Status Badge</th>
                  <th className="py-4 px-6">Check In</th>
                  <th className="py-4 px-6">Check Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {attendanceList.map((record, index) => (
                  <tr key={record.employeeId} className="hover:bg-slate-800/10 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-semibold text-slate-200 block text-sm">{record.firstName} {record.lastName}</span>
                        <span className="text-xs text-slate-500 font-medium">{record.jobTitle}</span>
                      </div>
                    </td>

                    {/* Status selection */}
                    <td className="py-4 px-6">
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                        className={`bg-slate-900/80 border rounded-lg py-1.5 px-3 text-xs font-bold focus:outline-none ${
                          record.status === 'PRESENT' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                          record.status === 'ABSENT' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' :
                          record.status === 'LEAVE' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' :
                          'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' // HALF_DAY
                        }`}
                      >
                        <option value="PRESENT" className="bg-slate-800 text-emerald-400">PRESENT</option>
                        <option value="ABSENT" className="bg-slate-800 text-rose-400">ABSENT</option>
                        <option value="LEAVE" className="bg-slate-800 text-amber-400">LEAVE</option>
                        <option value="HALF_DAY" className="bg-slate-800 text-indigo-400">HALF DAY</option>
                      </select>
                    </td>

                    {/* Check In */}
                    <td className="py-4 px-6">
                      <input
                        type="time"
                        value={record.checkIn}
                        disabled={record.status === 'ABSENT' || record.status === 'LEAVE'}
                        onChange={(e) => handleTimeChange(index, 'checkIn', e.target.value)}
                        className="bg-slate-900/60 border border-slate-700/60 rounded-lg py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:pointer-events-none"
                      />
                    </td>

                    {/* Check Out */}
                    <td className="py-4 px-6">
                      <input
                        type="time"
                        value={record.checkOut}
                        disabled={record.status === 'ABSENT' || record.status === 'LEAVE'}
                        onChange={(e) => handleTimeChange(index, 'checkOut', e.target.value)}
                        className="bg-slate-900/60 border border-slate-700/60 rounded-lg py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:pointer-events-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Save button */}
          <div className="p-5 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 py-3 px-6 rounded-xl text-white font-semibold gradient-bg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] focus:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save size={18} />
              <span>{saving ? 'Saving Sheet...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Employee View ---
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">My Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">Review check-in logs and your monthly working days sheet.</p>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/20">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Check In</th>
                <th className="py-4 px-6">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {personalAttendance.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="py-4 px-6 font-semibold">{a.date}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      a.status === 'PRESENT' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                      a.status === 'ABSENT' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                      a.status === 'LEAVE' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                      'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                    }`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {a.checkIn ? (
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-500" />
                        <span>{a.checkIn.substring(0, 5)}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="py-4 px-6">
                    {a.checkOut ? (
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-500" />
                        <span>{a.checkOut.substring(0, 5)}</span>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}

              {personalAttendance.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    No attendance records logged yet.
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

export default AttendancePanel;
