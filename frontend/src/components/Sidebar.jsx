import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  CreditCard, 
  TrendingUp, 
  LogOut,
  User,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const adminLinks = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/employees", icon: <Users size={20} />, label: "Employees" },
    { to: "/departments", icon: <Building2 size={20} />, label: "Departments" },
    { to: "/attendance", icon: <CalendarCheck size={20} />, label: "Attendance" },
    { to: "/payroll", icon: <DollarSignComponent size={20} />, label: "Payroll" },
    { to: "/payments", icon: <CreditCard size={20} />, label: "Payments" },
    { to: "/reports", icon: <TrendingUp size={20} />, label: "Reports" }
  ];

  const employeeLinks = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "My Dashboard" },
    { to: `/employees/${user?.employeeId}`, icon: <User size={20} />, label: "My Profile" },
    { to: "/attendance", icon: <CalendarCheck size={20} />, label: "My Attendance" },
    { to: "/payroll", icon: <FileText size={20} />, label: "My Payslips" }
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col h-full z-10">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            P
          </div>
          <span className="font-bold text-lg tracking-wider text-white font-sans font-extrabold">
            Payroll<span className="text-indigo-400">Pro</span>
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-100'
              }`
            }
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              {link.icon}
            </span>
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/40">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-indigo-400 font-bold uppercase">
            {user?.username ? user.username.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-200 truncate">{user?.username}</h4>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{user?.role?.replace('ROLE_', '')}</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all duration-200 text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Quick temporary dollar sign component to bypass direct importing since DollarSign is in Lucide
const DollarSignComponent = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

export default Sidebar;
