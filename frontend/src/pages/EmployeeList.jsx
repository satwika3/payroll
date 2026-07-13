import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  UserPlus, 
  Mail, 
  Phone,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchEmployees = async (query = '') => {
    setLoading(true);
    try {
      const res = await API.get('/api/employees', {
        params: query ? { query } : {}
      });
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchEmployees(query);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This will delete all login, payroll, and attendance history!')) {
      try {
        await API.delete(`/api/employees/${id}`);
        toast.success('Employee profile deleted');
        fetchEmployees(searchQuery);
      } catch (err) {
        toast.error('Failed to delete employee profile');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Employees</h1>
          <p className="text-slate-400 text-sm mt-1">Access profiles, manage positions, salaries, and system logins.</p>
        </div>
        <button
          onClick={() => navigate('/employees/add')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm w-full md:w-auto justify-center"
        >
          <UserPlus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Control Bar: Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <span className="text-slate-500">
          <Search size={20} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
          placeholder="Search by first name, last name, email, or designation..."
        />
      </div>

      {/* Grid or Table list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/20">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contacts</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Basic Salary</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/10 transition-colors">
                    {/* Avatar & Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-indigo-400 uppercase">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block text-sm">{emp.firstName} {emp.lastName}</span>
                          <span className="text-xs text-slate-500">ID: {emp.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email/Phone */}
                    <td className="py-4 px-6 text-sm text-slate-300">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-500" />
                          <span>{emp.email}</span>
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-500" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Job / Department */}
                    <td className="py-4 px-6 text-sm text-slate-300">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={13} className="text-slate-500" />
                          <span className="font-medium text-slate-200">{emp.jobTitle}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">{emp.department?.name || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="py-4 px-6 text-sm font-semibold text-slate-200">
                      ₹{emp.basicSalary?.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.status === 'Active' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        {emp.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex gap-1.5 justify-center">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 rounded-lg border border-transparent hover:border-indigo-500/10 transition-all duration-200"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg border border-transparent hover:border-amber-500/10 transition-all duration-200"
                          title="Edit Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/10 transition-all duration-200"
                          title="Delete Employee"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-500 text-sm">
                      No employees found. Click "Add Employee" to register staff.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
