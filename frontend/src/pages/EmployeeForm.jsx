import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    jobTitle: '',
    basicSalary: '',
    departmentId: '',
    status: 'Active',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch departments for dropdown
        const deptRes = await API.get('/api/departments');
        setDepartments(deptRes.data);

        if (isEdit) {
          // Fetch employee to edit
          const empRes = await API.get(`/api/employees/${id}`);
          const emp = empRes.data;
          setFormData({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone || '',
            hireDate: emp.hireDate,
            jobTitle: emp.jobTitle,
            basicSalary: emp.basicSalary.toString(),
            departmentId: emp.department?.id || '',
            status: emp.status,
          });
        }
      } catch (err) {
        toast.error('Failed to load form metadata');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.jobTitle || !formData.basicSalary || !formData.departmentId) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary),
        departmentId: parseInt(formData.departmentId),
      };

      if (isEdit) {
        await API.put(`/api/employees/${id}`, payload);
        toast.success('Employee updated successfully');
      } else {
        await API.post('/api/employees', payload);
        toast.success('Employee created successfully. Default password is employee123');
      }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving employee details');
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employees')}
          className="p-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isEdit ? 'Modify active staff configurations.' : 'Register a new employee with automatically provisioned credentials.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-pulse">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                First Name <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                placeholder="John"
                disabled={saving}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Last Name <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                placeholder="Doe"
                disabled={saving}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address <span className="text-indigo-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                placeholder="john.doe@company.com"
                disabled={saving}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                placeholder="+91 98765 43210"
                disabled={saving}
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Job Title <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                placeholder="e.g. Software Engineer"
                disabled={saving}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Department <span className="text-indigo-400">*</span>
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                disabled={saving}
              >
                <option value="" className="bg-slate-800">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-800">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Salary */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Basic Monthly Salary (₹) <span className="text-indigo-400">*</span>
              </label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                placeholder="e.g. 50000"
                disabled={saving}
              />
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Date of Joining
              </label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                disabled={saving}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Employment Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                disabled={saving}
              >
                <option value="Active" className="bg-slate-800">Active</option>
                <option value="Inactive" className="bg-slate-800">Inactive</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="py-3 px-6 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-all duration-200 text-sm"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 py-3 px-6 rounded-xl text-white font-semibold gradient-bg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] focus:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
