import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sun, Moon } from 'lucide-react';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Components & Layout
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetails from './pages/EmployeeDetails';
import DepartmentList from './pages/DepartmentList';
import DepartmentDetails from './pages/DepartmentDetails';
import AttendancePanel from './pages/AttendancePanel';
import PayrollPanel from './pages/PayrollPanel';
import PaymentsPanel from './pages/PaymentsPanel';
import Reports from './pages/Reports';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Admin Only Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user && user.role === 'ROLE_ADMIN' ? children : <Navigate to="/" replace />;
};

// Main Layout Wrapper
const PortalLayout = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-primary)] overflow-hidden font-sans relative transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-custom bg-card-custom/40 backdrop-blur-md flex items-center justify-between px-8 z-10 transition-colors duration-200">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10">
            {user?.role === 'ROLE_ADMIN' ? 'Control Panel (Admin)' : 'Staff Portal (Employee)'}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-card-custom hover:bg-slate-200 dark:hover:bg-slate-800 border border-custom transition-all duration-200 text-secondary-custom"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <div className="text-secondary-custom text-xs font-medium">
              System Clock: <span className="font-semibold text-primary-custom">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Employee Management (Admin Only) */}
            <Route path="/employees" element={
              <AdminRoute>
                <EmployeeList />
              </AdminRoute>
            } />
            <Route path="/employees/add" element={
              <AdminRoute>
                <EmployeeForm />
              </AdminRoute>
            } />
            <Route path="/employees/edit/:id" element={
              <AdminRoute>
                <EmployeeForm />
              </AdminRoute>
            } />
            
            {/* Shared Profile details (Admin can see any, Employee can only see their own) */}
            <Route path="/employees/:id" element={<EmployeeDetails />} />

            {/* Department Management */}
            <Route path="/departments" element={
              <AdminRoute>
                <DepartmentList />
              </AdminRoute>
            } />
            <Route path="/departments/:id" element={
              <AdminRoute>
                <DepartmentDetails />
              </AdminRoute>
            } />

            {/* Attendance & Payroll */}
            <Route path="/attendance" element={<AttendancePanel />} />
            <Route path="/payroll" element={<PayrollPanel />} />
            
            {/* Payments */}
            <Route path="/payments" element={<PaymentsPanel />} />
            
            {/* Reports & Analytics (Admin Only) */}
            <Route path="/reports" element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <PortalLayout />
                </PrivateRoute>
              }
            />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
