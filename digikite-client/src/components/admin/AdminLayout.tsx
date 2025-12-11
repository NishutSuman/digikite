import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../slices/authSlice';
import { getNotifications, markAllNotificationsRead } from '../../services/adminService';
import type { AdminNotification } from '../../types/admin';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiCreditCard,
  FiFileText,
  FiBell,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiPackage,
  FiDollarSign,
} from 'react-icons/fi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/admin', icon: FiHome, label: 'Dashboard' },
  { path: '/admin/demos', icon: FiCalendar, label: 'Demo Requests' },
  { path: '/admin/clients', icon: FiUsers, label: 'Clients' },
  { path: '/admin/subscriptions', icon: FiPackage, label: 'Subscriptions' },
  { path: '/admin/plans', icon: FiDollarSign, label: 'Plans' },
  { path: '/admin/invoices', icon: FiFileText, label: 'Invoices' },
  { path: '/admin/payments', icon: FiCreditCard, label: 'Payments' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { actualTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications({ limit: 5, unreadOnly: false });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
        } ${actualTheme === 'dark' ? 'bg-gray-950' : 'bg-gray-900'}`}
      >
        <div className={`flex items-center justify-between h-16 px-4 ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'}`}>
          <Link to="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">DigiKite</span>
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
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
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className={`rounded-lg p-3 ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'}`}>
            <p className="text-gray-400 text-xs">Logged in as</p>
            <p className="text-white font-medium truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className={`sticky top-0 z-30 shadow-sm ${actualTheme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden ${actualTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              {/* Theme Switcher */}
              <ThemeSwitcher variant="icon" />

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-full ${actualTheme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <FiBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${actualTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <span className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className={`p-4 text-center ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b ${
                              !notification.isRead
                                ? actualTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                                : ''
                            } ${actualTheme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                            <p className={`font-medium text-sm ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                            <p className={`text-sm truncate ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{notification.message}</p>
                            <p className={`text-xs mt-1 ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      to="/admin/notifications"
                      className={`block px-4 py-3 text-center text-sm text-blue-600 border-t ${actualTheme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <FiChevronDown className={`h-4 w-4 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`px-4 py-3 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                      <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role}</p>
                    </div>
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
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
}
