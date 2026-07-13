import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, User, Briefcase, Mail, Lock, Phone, Landmark, DollarSign, ArrowRight } from 'lucide-react';
import API from '../services/api';

function Signup() {
  const [role, setRole] = useState('ROLE_ADMIN'); // 'ROLE_ADMIN' or 'ROLE_EMPLOYEE'
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    departmentId: '',
    jobTitle: '',
    basicSalary: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'ROLE_EMPLOYEE') {
      API.get('/api/auth/departments')
        .then(res => setDepartments(res.data))
        .catch(err => toast.error('Failed to load departments'));
    }
  }, [role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        role: role,
        phone: formData.phone
      };

      if (role === 'ROLE_ADMIN') {
        payload.name = formData.name;
      } else {
        payload.firstName = formData.firstName;
        payload.lastName = formData.lastName;
        payload.departmentId = parseInt(formData.departmentId);
        payload.jobTitle = formData.jobTitle;
        payload.basicSalary = parseFloat(formData.basicSalary);
      }

      await API.post('/api/auth/signup', payload);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight gradient-text mb-2">Create Account</h2>
          <p className="text-secondary-custom text-sm">Join the Employee Payroll & Management Portal</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-custom p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('ROLE_ADMIN')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === 'ROLE_ADMIN'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-secondary-custom hover:text-primary-custom'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Registration
          </button>
          <button
            type="button"
            onClick={() => setRole('ROLE_EMPLOYEE')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === 'ROLE_EMPLOYEE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-secondary-custom hover:text-primary-custom'
            }`}
          >
            <User className="w-4 h-4" />
            Employee Registration
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Shared Login Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Login Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="username"
                  required
                  placeholder="name@company.com"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Contact Phone</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-custom my-4" />

          {/* Role Specific Forms */}
          {role === 'ROLE_ADMIN' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Administrator Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Admin Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Gowthami"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Kavuru"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Job Designation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="jobTitle"
                      required
                      placeholder="Senior Java Developer"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Basic Salary (INR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      name="basicSalary"
                      required
                      placeholder="25000"
                      value={formData.basicSalary}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-custom bg-card-custom/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-1.5">Department Assignment</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Landmark className="w-4 h-4" />
                  </span>
                  <select
                    name="departmentId"
                    required
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-custom bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all appearance-none"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 gradient-bg text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register User'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary-custom">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
