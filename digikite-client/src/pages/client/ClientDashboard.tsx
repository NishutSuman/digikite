import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientDashboard } from '../../services/clientPortalService';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../hooks/useAppSelector';
import type { ClientDashboard as ClientDashboardData } from '../../types/clientPortal';
import {
  FiUsers,
  FiHardDrive,
  FiPackage,
  FiExternalLink,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiCreditCard,
} from 'react-icons/fi';

export default function ClientDashboard() {
  const { actualTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noOrganization, setNoOrganization] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setError(null);
      const data = await getClientDashboard();
      setDashboard(data);
    } catch (err: unknown) {
      console.error('Failed to load dashboard:', err);

      // Type guard for axios error
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };

      // Check if error is "No organization associated"
      if (axiosError.response?.status === 403) {
        setNoOrganization(true);
      } else {
        setError(axiosError.response?.data?.message || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      TRIAL: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400' },
      ACTIVE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
      GRACE_PERIOD: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400' },
      EXPIRED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
      CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-400' },
    };
    return colors[status] || colors.CANCELLED;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStoragePercentage = () => {
    if (!dashboard?.stats) return 0;
    return Math.round((dashboard.stats.storageUsed / dashboard.stats.storageQuota) * 100);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Show welcome screen for users without an organization
  if (noOrganization) {
    return (
      <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto py-16 px-4">
          <div className={`rounded-2xl p-8 text-center ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${actualTheme === 'dark' ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <FiPackage className={`w-10 h-10 ${actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h1 className={`text-2xl font-bold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Welcome to Digikite, {user?.name || 'User'}!
            </h1>
            <p className={`text-lg mb-6 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Your account is not associated with any organization yet.
            </p>
            <p className={`mb-8 ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              If you're a client administrator, please contact our support team to get your organization set up.
              If you're interested in Guild for your institution, request a demo to learn more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${actualTheme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                <FiMail className="w-5 h-5" />
                Contact Support
              </a>
              <a
                href="/"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${actualTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Request a Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto py-16 px-4">
          <div className={`rounded-2xl p-8 text-center ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${actualTheme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'}`}>
              <FiAlertTriangle className={`w-10 h-10 ${actualTheme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h1 className={`text-2xl font-bold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Something went wrong
            </h1>
            <p className={`text-lg mb-6 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${actualTheme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className={`rounded-xl p-6 ${actualTheme === 'dark' ? 'bg-gradient-to-r from-emerald-900 to-teal-900' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {dashboard?.organization?.name || user?.name}
            </h1>
            <p className="text-emerald-100 mt-1">
              Manage your Guild subscription and access your alumni portal
            </p>
          </div>

        {/* Subscription Status Alert */}
        {dashboard?.subscription && (
          <SubscriptionAlert subscription={dashboard.subscription} actualTheme={actualTheme} />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subscription Status */}
          <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Subscription</p>
                {dashboard?.subscription ? (
                  <>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-2 ${getStatusColor(dashboard.subscription.status).bg} ${getStatusColor(dashboard.subscription.status).text}`}>
                      {dashboard.subscription.status}
                    </span>
                    <p className={`text-xs mt-2 ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {dashboard.subscription.plan?.name} Plan
                    </p>
                  </>
                ) : (
                  <p className={`text-lg font-semibold mt-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Active Plan</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${actualTheme === 'dark' ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                <FiPackage className={`h-6 w-6 ${actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
            </div>
          </div>

          {/* Users */}
          <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Users</p>
                <p className={`text-2xl font-bold mt-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dashboard?.stats?.activeUsers || 0}
                  <span className={`text-sm font-normal ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    /{dashboard?.subscription?.maxUsers || 0}
                  </span>
                </p>
                <p className={`text-xs mt-1 ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Active members
                </p>
              </div>
              <div className={`p-3 rounded-full ${actualTheme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <FiUsers className={`h-6 w-6 ${actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Storage</p>
                <p className={`text-2xl font-bold mt-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {getStoragePercentage()}%
                </p>
                <div className={`mt-2 h-2 rounded-full ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full ${getStoragePercentage() > 90 ? 'bg-red-500' : getStoragePercentage() > 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                  />
                </div>
              </div>
              <div className={`p-3 rounded-full ml-4 ${actualTheme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <FiHardDrive className={`h-6 w-6 ${actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Validity</p>
                {dashboard?.subscription ? (
                  <>
                    <p className={`text-2xl font-bold mt-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {getDaysRemaining(dashboard.subscription.endDate)} days
                    </p>
                    <p className={`text-xs mt-1 ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Expires {new Date(dashboard.subscription.endDate).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className={`text-lg font-semibold mt-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>-</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${actualTheme === 'dark' ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
                <FiCalendar className={`h-6 w-6 ${actualTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/portal/guild"
            className={`flex items-center p-6 rounded-xl transition-all ${actualTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-md'} shadow-sm`}
          >
            <div className={`p-3 rounded-full ${actualTheme === 'dark' ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <FiExternalLink className={`h-6 w-6 ${actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className="ml-4">
              <h3 className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Access Guild</h3>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Launch your alumni portal</p>
            </div>
          </Link>

          <Link
            to="/portal/subscription"
            className={`flex items-center p-6 rounded-xl transition-all ${actualTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-md'} shadow-sm`}
          >
            <div className={`p-3 rounded-full ${actualTheme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <FiPackage className={`h-6 w-6 ${actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="ml-4">
              <h3 className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Subscription</h3>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>View plan details</p>
            </div>
          </Link>

          <Link
            to="/portal/invoices"
            className={`flex items-center p-6 rounded-xl transition-all ${actualTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-md'} shadow-sm`}
          >
            <div className={`p-3 rounded-full ${actualTheme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <FiCreditCard className={`h-6 w-6 ${actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="ml-4">
              <h3 className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Billing</h3>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>View invoices & payments</p>
            </div>
          </Link>
        </div>

          {/* Recent Activity */}
          {dashboard?.recentActivity && dashboard.recentActivity.length > 0 && (
            <div className={`rounded-xl p-6 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h2 className={`text-lg font-semibold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
              <div className="space-y-4">
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`p-2 rounded-full ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <FiClock className={`h-4 w-4 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activity.description}</p>
                      <p className={`text-xs ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Subscription Alert Component
function SubscriptionAlert({ subscription, actualTheme }: { subscription: any; actualTheme: string }) {
  const daysRemaining = Math.ceil(
    (new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Trial alert
  if (subscription.status === 'TRIAL') {
    const trialDays = Math.ceil(
      (new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return (
      <div className={`rounded-xl p-4 ${actualTheme === 'dark' ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-center">
          <FiClock className={`h-5 w-5 ${actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <div className="ml-3">
            <h3 className={`font-medium ${actualTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              Trial Period Active
            </h3>
            <p className={`text-sm ${actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Your trial ends in {trialDays} days. Upgrade to continue using Guild.
            </p>
          </div>
          <Link
            to="/portal/subscription"
            className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium ${actualTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  // Expiring soon alert
  if (daysRemaining <= 30 && daysRemaining > 0 && subscription.status === 'ACTIVE') {
    return (
      <div className={`rounded-xl p-4 ${actualTheme === 'dark' ? 'bg-orange-900/30 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
        <div className="flex items-center">
          <FiAlertTriangle className={`h-5 w-5 ${actualTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
          <div className="ml-3">
            <h3 className={`font-medium ${actualTheme === 'dark' ? 'text-orange-300' : 'text-orange-800'}`}>
              Subscription Expiring Soon
            </h3>
            <p className={`text-sm ${actualTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
              Your subscription expires in {daysRemaining} days. Renew to avoid service interruption.
            </p>
          </div>
          <Link
            to="/portal/subscription"
            className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium ${actualTheme === 'dark' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
          >
            Renew Now
          </Link>
        </div>
      </div>
    );
  }

  // Expired alert
  if (subscription.status === 'EXPIRED' || subscription.status === 'GRACE_PERIOD') {
    return (
      <div className={`rounded-xl p-4 ${actualTheme === 'dark' ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center">
          <FiAlertTriangle className={`h-5 w-5 ${actualTheme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          <div className="ml-3">
            <h3 className={`font-medium ${actualTheme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
              {subscription.status === 'GRACE_PERIOD' ? 'Grace Period' : 'Subscription Expired'}
            </h3>
            <p className={`text-sm ${actualTheme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {subscription.status === 'GRACE_PERIOD'
                ? 'Your subscription has expired. Renew within the grace period to restore full access.'
                : 'Your subscription has expired. Renew to restore access to Guild.'}
            </p>
          </div>
          <Link
            to="/portal/subscription"
            className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white`}
          >
            Renew Now
          </Link>
        </div>
      </div>
    );
  }

  // Active subscription
  return (
    <div className={`rounded-xl p-4 ${actualTheme === 'dark' ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
      <div className="flex items-center">
        <FiCheckCircle className={`h-5 w-5 ${actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
        <div className="ml-3">
          <h3 className={`font-medium ${actualTheme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
            Subscription Active
          </h3>
          <p className={`text-sm ${actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            Your {subscription.plan?.name} plan is active. Valid until {new Date(subscription.endDate).toLocaleDateString()}.
          </p>
        </div>
      </div>
    </div>
  );
}
