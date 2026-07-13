import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(typeof result.error === 'string' ? result.error : 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] text-[var(--text-primary)] px-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background abstract decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-indigo-600/30 mb-4 transition-transform duration-300 hover:rotate-12">
            P
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary-custom font-sans">
            Welcome to <span className="text-indigo-400">PayrollPro</span>
          </h2>
          <p className="text-secondary-custom mt-2 text-sm font-medium">
            Manage employees, payroll calculations, and track attendance.
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl transition-all duration-300 border border-custom">
          <h3 className="text-xl font-bold text-primary-custom mb-6 font-sans">Sign In</h3>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-pulse">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-2">
                Username / Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-card-custom/50 border border-custom rounded-xl py-3 pl-10 pr-4 text-primary-custom placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                  placeholder="e.g. employee@company.com"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-custom">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card-custom/50 border border-custom rounded-xl py-3 pl-10 pr-10 text-primary-custom placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 gradient-bg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] focus:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 text-sm flex justify-center items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Signup Navigation Link */}
          <div className="mt-6 text-center text-sm text-secondary-custom">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-500 font-semibold hover:underline">
              Sign Up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
