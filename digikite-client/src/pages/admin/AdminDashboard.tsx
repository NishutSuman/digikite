import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { getDashboardStats, getDemoRequests, getExpiringSubscriptions } from '../../services/adminService';
import type { DashboardStats, DemoRequest, Subscription } from '../../types/admin';
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDemos, setRecentDemos] = useState<DemoRequest[]>([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch all data in parallel but handle errors individually
      const [statsResult, demosResult, expiringResult] = await Promise.allSettled([
        getDashboardStats(),
        getDemoRequests({ limit: 5 }),
        getExpiringSubscriptions(30),
      ]);

      // Handle stats
      if (statsResult.status === 'fulfilled') {
        const rawStats = statsResult.value;
        console.log('Dashboard stats received:', rawStats);

        // Map nested structure to flat structure if needed
        const mappedStats: DashboardStats = {
          totalClients: rawStats.totalClients ?? rawStats.clients?.total ?? 0,
          activeClients: rawStats.activeClients ?? rawStats.clients?.active ?? 0,
          activeSubscriptions: rawStats.activeSubscriptions ?? rawStats.subscriptions?.active ?? 0,
          trialSubscriptions: rawStats.trialSubscriptions ?? rawStats.subscriptions?.trial ?? 0,
          pendingDemos: rawStats.pendingDemos ?? rawStats.demos?.new ?? 0,
          totalDemos: rawStats.totalDemos ?? rawStats.demos?.total ?? 0,
          convertedDemos: rawStats.convertedDemos ?? 0,
          totalRevenue: rawStats.totalRevenue ?? rawStats.revenue?.total ?? 0,
          monthlyRevenue: rawStats.monthlyRevenue ?? rawStats.revenue?.thisMonth ?? 0,
          // Keep nested for any component that needs it
          demos: rawStats.demos,
          clients: rawStats.clients,
          subscriptions: rawStats.subscriptions,
          revenue: rawStats.revenue,
          recent: rawStats.recent,
        };

        setStats(mappedStats);
      } else {
        console.error('Failed to load dashboard stats:', statsResult.reason);
      }

      // Handle demos
      if (demosResult.status === 'fulfilled') {
        console.log('Demo requests received:', demosResult.value);
        setRecentDemos(demosResult.value.demoRequests || []);
      } else {
        console.error('Failed to load demo requests:', demosResult.reason);
      }

      // Handle expiring subscriptions
      if (expiringResult.status === 'fulfilled') {
        console.log('Expiring subscriptions received:', expiringResult.value);
        setExpiringSubscriptions(expiringResult.value || []);
      } else {
        console.error('Failed to load expiring subscriptions:', expiringResult.reason);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      CONTACTED: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      DEMO_SCHEDULED: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800',
      DEMO_COMPLETED: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      CONVERTED: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-800',
      LOST: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
      ACTIVE: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      TRIAL: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      EXPIRED: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
      GRACE_PERIOD: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800',
    };
    return colors[status] || (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Welcome back! Here's what's happening with your business.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={stats?.totalClients || 0}
            icon={FiUsers}
            color="blue"
            subtext={`${stats?.activeClients || 0} active`}
            isDark={isDark}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            icon={FiPackage}
            color="green"
            subtext={`${stats?.trialSubscriptions || 0} in trial`}
            isDark={isDark}
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K`}
            icon={FiDollarSign}
            color="emerald"
            subtext="This month"
            isDark={isDark}
          />
          <StatCard
            title="Demo Requests"
            value={stats?.pendingDemos || 0}
            icon={FiCalendar}
            color="purple"
            subtext="Pending"
            isDark={isDark}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ₹{((stats?.totalRevenue || 0) / 100000).toFixed(2)}L
                </p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <FiTrendingUp className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>
          <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Expiring Soon</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {expiringSubscriptions.length}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                <FiAlertTriangle className={`h-6 w-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </div>
          <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Conversion Rate</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.totalDemos ? ((stats.convertedDemos / stats.totalDemos) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <FiCheckCircle className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Demo Requests */}
          <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Demo Requests</h2>
              <Link to="/admin/demos" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="p-5">
              {recentDemos.length === 0 ? (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No demo requests yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentDemos.map((demo) => (
                    <div key={demo.id} className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {demo.organizationName}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {demo.contactName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(demo.status)}`}>
                          {demo.status.replace('_', ' ')}
                        </span>
                        <FiClock className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(demo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expiring Subscriptions */}
          <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Expiring Subscriptions</h2>
              <Link to="/admin/subscriptions" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="p-5">
              {expiringSubscriptions.length === 0 ? (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No subscriptions expiring soon
                </p>
              ) : (
                <div className="space-y-4">
                  {expiringSubscriptions.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sub.clientOrganization?.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {sub.plan?.name} Plan
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Expires {new Date(sub.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'orange' | 'red';
  subtext?: string;
  isDark: boolean;
}

function StatCard({ title, value, icon: Icon, color, subtext, isDark }: StatCardProps) {
  const colorClasses = {
    blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600',
    green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600',
    emerald: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
    purple: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600',
    orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600',
    red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600',
  };

  return (
    <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtext && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
