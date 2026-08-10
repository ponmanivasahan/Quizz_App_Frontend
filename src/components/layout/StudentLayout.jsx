import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  BarChart2, 
  Trophy, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const StudentLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Available Quizzes', path: '/student/quizzes', icon: BookOpen },
    { name: 'My Attempts', path: '/student/attempts', icon: ClipboardList },
    { name: 'Performance', path: '/student/performance', icon: BarChart2 },
    { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgb(0,0,0,0.02)] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-8">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                <BookOpen className="h-6 w-6 text-white" />
             </div>
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">AssessPro</h1>
          </div>
          <button 
            className="lg:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-5rem)] flex flex-col justify-between py-6">
          <nav className="px-5 space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">
              Learning Menu
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-[inset_4px_0_0_#4f46e5]' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className={`mr-4 h-5 w-5 transition-colors ${
                  window.location.pathname.includes(item.path) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          <div className="px-5 mt-8">
             <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
             </div>
             <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200"
              >
                <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                Sign Out
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Top Navbar (Visible only on mobile/tablet) */}
        <header className="lg:hidden flex-shrink-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-1.5 rounded-md">
                <BookOpen className="h-5 w-5 text-white" />
             </div>
             <h1 className="text-lg font-bold text-gray-900">AssessPro</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 animate-fade-in relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
