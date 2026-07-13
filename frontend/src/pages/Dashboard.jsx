import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Users, 
  Building2, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  CheckCircle,
  Clock,
  Briefcase,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  // State for Admin
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalPayrollExpense: 0,
    presentToday: 0,
  });
  const [chartData, setChartData] = useState({
    deptNames: [],
    deptCounts: [],
    monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    monthlyExpenses: [180000, 190000, 190000, 205000, 205000, 220000, 220000]
  });

  // State for Employee
  const [empProfile, setEmpProfile] = useState(null);
  const [empPayrolls, setEmpPayrolls] = useState([]);
  const [empAttendance, setEmpAttendance] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // Fetch Admin Data
          const [empRes, deptRes, payRes, attendRes] = await Promise.all([
            API.get('/api/employees'),
            API.get('/api/departments'),
            API.get('/api/payroll'),
            API.get('/api/attendance')
          ]);

          const employees = empRes.data;
          const departments = deptRes.data;
          const payrolls = payRes.data;
          const attendance = attendRes.data;

          // Calculate summary stats
          const totalEmp = employees.length;
          const totalDept = departments.length;
          
          const totalPaidSalary = payrolls
            .filter(p => p.paymentStatus === 'Paid')
            .reduce((sum, p) => sum + p.netSalary, 0);

          const todayStr = new Date().toISOString().split('T')[0];
          const present = attendance
            .filter(a => a.date === todayStr && a.status === 'PRESENT')
            .length;

          setStats({
            totalEmployees: totalEmp,
            totalDepartments: totalDept,
            totalPayrollExpense: totalPaidSalary,
            presentToday: present
          });

          // Headcount distribution per department
          const deptCountMap = {};
          departments.forEach(d => {
            deptCountMap[d.name] = 0;
          });
          employees.forEach(e => {
            if (e.department && deptCountMap[e.department.name] !== undefined) {
              deptCountMap[e.department.name]++;
            }
          });

          setChartData(prev => ({
            ...prev,
            deptNames: Object.keys(deptCountMap),
            deptCounts: Object.values(deptCountMap)
          }));

        } else if (user?.employeeId) {
          // Fetch Employee Specific Data
          const [profileRes, payrollRes, attendanceRes] = await Promise.all([
            API.get(`/api/employees/${user.employeeId}`),
            API.get(`/api/payroll/employee/${user.employeeId}`),
            API.get(`/api/attendance/employee/${user.employeeId}`)
          ]);

          setEmpProfile(profileRes.data);
          setEmpPayrolls(payrollRes.data);
          setEmpAttendance(attendanceRes.data);
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Admin Render ---
  if (isAdmin) {
    const doughnutData = {
      labels: chartData.deptNames,
      datasets: [
        {
          label: 'Employees',
          data: chartData.deptCounts,
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(168, 85, 247, 0.7)',
          ],
          borderColor: [
            '#4f46e5',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#a855f7',
          ],
          borderWidth: 1,
        },
      ],
    };

    const lineData = {
      labels: chartData.monthlyLabels,
      datasets: [
        {
          label: 'Salary Disbursements (₹)',
          data: chartData.monthlyExpenses,
          fill: false,
          backgroundColor: 'rgb(99, 102, 241)',
          borderColor: 'rgba(99, 102, 241, 0.6)',
          tension: 0.3,
        },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time business insights and payroll analytics summary.</p>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Employees */}
          <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-slate-800 hover:border-slate-700/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Employees</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{stats.totalEmployees}</span>
            </div>
          </div>

          {/* Card 2: Departments */}
          <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-slate-800 hover:border-slate-700/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building2 size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Departments</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{stats.totalDepartments}</span>
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-slate-800 hover:border-slate-700/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Salary Disbursed</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">₹{stats.totalPayrollExpense.toLocaleString()}</span>
            </div>
          </div>

          {/* Card 4: Present Today */}
          <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-slate-800 hover:border-slate-700/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <CheckCircle size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Present Today</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{stats.presentToday}</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-400" />
              <span>Payroll Trend</span>
            </h3>
            <div className="h-64">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-indigo-400" />
              <span>Department Share</span>
            </h3>
            <div className="h-64 flex justify-center items-center">
              {chartData.deptCounts.length > 0 ? (
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } } } }} />
              ) : (
                <span className="text-slate-500 text-sm">No department data</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Employee Render ---
  const pendingPayroll = empPayrolls.find(p => p.paymentStatus === 'Pending');
  const lastPaidPayroll = empPayrolls.filter(p => p.paymentStatus === 'Paid').slice(-1)[0];
 
  const totalDays = empAttendance.length;
  const presentDays = empAttendance.filter(a => a.status === 'PRESENT').length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : '0';
 
  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Card banner */}
      <div className="relative gradient-bg rounded-3xl p-8 border border-indigo-500/25 overflow-hidden shadow-xl shadow-indigo-950/20">
        <div className="absolute top-[-30%] right-[-5%] w-[30%] h-[150%] rounded-full bg-white/5 rotate-12 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Hello, {empProfile?.firstName}!</h1>
            <p className="text-indigo-200 text-sm mt-1.5 flex items-center gap-2 font-medium">
              <Briefcase size={16} />
              <span>{empProfile?.jobTitle} • {empProfile?.department?.name}</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-right">
            <span className="text-xs text-indigo-250 font-semibold block uppercase tracking-wider">Salary Grade</span>
            <span className="text-xl font-black text-white block mt-0.5 font-sans">₹{empProfile?.basicSalary?.toLocaleString()}/mo</span>
          </div>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stat: Present days */}
            <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-custom">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Calendar size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-secondary-custom uppercase tracking-wider block">Attendance Rate</span>
                <span className="text-2xl font-extrabold text-primary-custom mt-1 block">{attendanceRate}% ({presentDays}/{totalDays} Days)</span>
              </div>
            </div>
 
            {/* Stat: Payment history count */}
            <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-custom">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CreditCard size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-secondary-custom uppercase tracking-wider block">Salary Slips</span>
                <span className="text-2xl font-extrabold text-primary-custom mt-1 block">{empPayrolls.length} Issued</span>
              </div>
            </div>
          </div>
 
          {/* Profile Card */}
          <div className="glass-panel p-6 rounded-3xl border border-custom">
            <h3 className="text-lg font-bold text-primary-custom mb-6 flex items-center gap-2 font-sans">
              <User size={20} className="text-indigo-400" />
              <span>Personal Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="text-secondary-custom" size={18} />
                <div>
                  <span className="text-xs text-secondary-custom uppercase block tracking-wider font-semibold">Email</span>
                  <span className="text-sm text-primary-custom font-medium">{empProfile?.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-secondary-custom" size={18} />
                <div>
                  <span className="text-xs text-secondary-custom uppercase block tracking-wider font-semibold">Phone</span>
                  <span className="text-sm text-primary-custom font-medium">{empProfile?.phone || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-secondary-custom" size={18} />
                <div>
                  <span className="text-xs text-secondary-custom uppercase block tracking-wider font-semibold">Hire Date</span>
                  <span className="text-sm text-primary-custom font-medium">{empProfile?.hireDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-secondary-custom" size={18} />
                <div>
                  <span className="text-xs text-secondary-custom uppercase block tracking-wider font-semibold">Status</span>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
                    {empProfile?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        {/* Right Column: Earnings Summary */}
        <div className="glass-panel p-6 rounded-3xl border border-custom flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary-custom mb-6 flex items-center gap-2 font-sans">
              <DollarSign size={20} className="text-indigo-400" />
              <span>Earnings Summary</span>
            </h3>
            
            {pendingPayroll ? (
              <div className="space-y-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 mb-6">
                <div>
                  <span className="text-xs text-indigo-400 uppercase tracking-wider font-bold">Current Cycle ({pendingPayroll.payPeriod})</span>
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="text-2xl font-black text-primary-custom">₹{pendingPayroll.netSalary.toLocaleString()}</span>
                    <span className="text-xs text-indigo-300 font-semibold px-2 py-0.5 bg-indigo-500/15 rounded-md border border-indigo-500/25 uppercase tracking-wider">Pending Pay</span>
                  </div>
                </div>
                <div className="text-xs text-secondary-custom border-t border-custom pt-3 flex justify-between">
                  <span>Gross: ₹{pendingPayroll.grossSalary.toLocaleString()}</span>
                  <span>Deductions: ₹{pendingPayroll.deductions.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-500/5 border border-custom rounded-2xl p-5 text-center mb-6">
                <span className="text-xs text-secondary-custom font-medium">All salary cycles fully paid.</span>
              </div>
            )}
 
            {lastPaidPayroll && (
              <div className="space-y-4">
                <span className="text-xs text-secondary-custom font-semibold uppercase tracking-wider">Last Receipt</span>
                <div className="flex justify-between items-center py-2.5 border-b border-custom">
                  <div className="text-sm font-medium text-secondary-custom">Net Paid:</div>
                  <div className="text-base font-bold text-primary-custom">₹{lastPaidPayroll.netSalary.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-custom">
                  <div className="text-sm font-medium text-secondary-custom">Period:</div>
                  <div className="text-sm text-secondary-custom font-semibold">{lastPaidPayroll.payPeriod}</div>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-custom">
                  <div className="text-sm font-medium text-secondary-custom">Basic:</div>
                  <div className="text-sm text-secondary-custom">₹{lastPaidPayroll.basicSalary.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <div className="text-sm font-medium text-secondary-custom">HRA/Allow:</div>
                  <div className="text-sm text-secondary-custom">₹{(lastPaidPayroll.hra + lastPaidPayroll.allowances).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
 
          <div className="mt-8 pt-4 border-t border-custom">
            <span className="text-xs text-secondary-custom italic block text-center">Payroll calculation uses standard HRA (40% Basic) + allowance distributions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
