import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Cog,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  Bell,
  Lock,
} from 'lucide-react';
import { Modal } from './FormElements';
import ChangePassword from '../auth/ChangePassword';

const Layout = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      permission: 'quotations:read'
    },
    { 
      name: 'Quotations', 
      href: '/quotations', 
      icon: FileText,
      permission: 'quotations:read'
    },
    { 
      name: 'Customers', 
      href: '/customers', 
      icon: Building2,
      permission: 'customers:read'
    },
    { 
      name: 'Machines', 
      href: '/machines', 
      icon: Cog,
      permission: 'machines:read'
    },
    { 
      name: 'Auxiliary Costs', 
      href: '/auxiliary-costs', 
      icon: DollarSign,
      permission: 'auxiliary:read'
    },
    { 
      name: 'Users', 
      href: '/users', 
      icon: Users,
      permission: 'users:read'
    },
  ];

  const filteredNavigation = navigation.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-industrial-50">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-industrial-900 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-industrial-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">QuotePro</h1>
                <p className="text-xs text-industrial-400">Management</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-industrial-400 hover:text-white hover:bg-industrial-800 lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-industrial-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-industrial-700 flex items-center justify-center">
                <User className="w-5 h-5 text-industrial-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-industrial-400">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-industrial-400 hover:text-white hover:bg-industrial-800"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 rounded-lg text-industrial-400 hover:text-white hover:bg-industrial-800 flex justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top header */}
        <header className="h-16 bg-white border-b border-industrial-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-industrial-500 hover:text-industrial-700 hover:bg-industrial-100 hidden lg:block"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-industrial-500 hover:text-industrial-700 hover:bg-industrial-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-industrial-100"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-industrial-700 hidden sm:block">
                  {user?.fullName}
                </span>
                <ChevronDown className="w-4 h-4 text-industrial-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-industrial-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-industrial-200">
                    <p className="text-xs text-industrial-500">Signed in as</p>
                    <p className="text-sm font-medium text-industrial-900 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPasswordModal(true);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-industrial-700 hover:bg-industrial-50 w-full text-left"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-industrial-700 hover:bg-industrial-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-industrial-200 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <ChangePassword
          onClose={() => setShowPasswordModal(false)}
          isForced={false}
        />
      </Modal>
    </div>
  );
};

export default Layout;
