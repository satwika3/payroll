import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Building2, Plus, Edit2, Trash2, X, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [deptId, setDeptId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/departments');
      setDepartments(res.data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setDeptId(null);
    setName('');
    setDescription('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setDeptId(dept.id);
    setName(dept.name);
    setDescription(dept.description || '');
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Department Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = { name, description };
      if (deptId) {
        await API.put(`/api/departments/${deptId}`, payload);
        toast.success('Department updated successfully');
      } else {
        await API.post('/api/departments', payload);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department? This will delete all associated employees!')) {
      try {
        await API.delete(`/api/departments/${id}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-custom font-sans">Departments</h1>
          <p className="text-secondary-custom text-sm mt-1">Manage corporate structural divisions, designations, and descriptions.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Department Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div 
              key={dept.id} 
              className="glass-panel p-6 rounded-3xl border border-custom flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-200 shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Building2 size={20} />
                  </div>
                  <Link
                    to={`/departments/${dept.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                  >
                    <Eye size={12} /> View Details
                  </Link>
                </div>
                <Link to={`/departments/${dept.id}`} className="text-xl font-bold text-primary-custom hover:text-indigo-500 transition-colors block mb-2 font-sans">
                  {dept.name}
                </Link>
                <p className="text-sm text-secondary-custom leading-relaxed line-clamp-3">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-indigo-400/90 uppercase tracking-wider">
                  {dept.employees?.length || 0} Employees
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 rounded-lg border border-transparent hover:border-indigo-500/10 transition-all duration-200"
                    title="Edit Department"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/10 transition-all duration-200"
                    title="Delete Department"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {departments.length === 0 && (
            <div className="col-span-full glass-panel py-16 px-4 rounded-3xl text-center border border-slate-800/65">
              <Building2 className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-300">No Departments Found</h3>
              <p className="text-slate-500 text-sm mt-1">Get started by creating your first business department.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-200 mb-6">
              {deptId ? 'Edit Department' : 'Create Department'}
            </h3>

            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-pulse">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm"
                  placeholder="e.g. Engineering"
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-sm h-28 resize-none"
                  placeholder="Provide a brief summary of designations & roles..."
                  disabled={saving}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 gradient-bg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] focus:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm flex justify-center items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{deptId ? 'Update' : 'Create'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
