import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import {
  FiHome,
  FiPackage,
  FiCreditCard,
  FiFileText,
  FiExternalLink,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiUser,
  FiArrowLeft,
} from 'react-icons/fi';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/portal', icon: FiHome, label: 'Dashboard' },
  { path: '/portal/subscription', icon: FiPackage, label: 'Subscription' },
  { path: '/portal/invoices', icon: FiFileText, label: 'Invoices' },
  { path: '/portal/payments', icon: FiCreditCard, label: 'Payments' },
  { path: '/portal/guild', icon: FiExternalLink, label: 'Guild Access' },
];

export default function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { actualTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Redirect admins to admin dashboard - allow CLIENT_ADMIN and USER to stay
    if (user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${actualTheme === 'dark' ? 'bg-gray-950' : 'bg-white border-r border-gray-200'}`}
      >
        <div className={`flex items-center justify-between h-16 px-4 border-b ${actualTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <Link to="/" className="flex items-center space-x-2">
            <span className={`text-xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>DigiKite</span>
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">Portal</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden ${actualTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-emerald-600 text-white'
                  : actualTheme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className={`rounded-lg p-3 ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <p className={`text-xs ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Logged in as</p>
            <p className={`font-medium truncate ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
            <p className={`text-xs truncate ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className={`sticky top-0 z-30 ${actualTheme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden ${actualTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              {/* Back to Landing Page */}
              <Link
                to="/"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  actualTheme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <FiArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              {/* Theme Switcher */}
              <ThemeSwitcher variant="icon" />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <FiChevronDown className={`h-4 w-4 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`px-4 py-3 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                      <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>User</p>
                    </div>
                    <Link
                      to="/portal/profile"
                      className={`block px-4 py-2 ${actualTheme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser className="inline-block mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-red-600 ${actualTheme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
                    >
                      <FiLogOut className="inline-block mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Click outside to close dropdowns */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}
