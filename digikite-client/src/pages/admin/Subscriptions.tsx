import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getSubscriptions,
  getClients,
  getPlans,
  createSubscription,
  cancelSubscription,
} from '../../services/adminService';
import type { Subscription, Client, SubscriptionPlan } from '../../types/admin';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusOptions = ['ALL', 'TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED'];
const billingCycles = ['MONTHLY', 'YEARLY'];

export default function Subscriptions() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    clientOrganizationId: '',
    planId: '',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
    startTrial: true,
  });

  useEffect(() => {
    loadSubscriptions();
    loadClientsAndPlans();
  }, [pagination.page, statusFilter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await getSubscriptions({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setSubscriptions(data.subscriptions || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadClientsAndPlans = async () => {
    try {
      const [clientsData, plansData] = await Promise.all([
        getClients({ limit: 100 }),
        getPlans(),
      ]);
      setClients(clientsData.clients || []);
      setPlans(plansData || []);
    } catch (error) {
      console.error('Failed to load clients/plans:', error);
    }
  };

  const handleCreateSubscription = async () => {
    if (!createForm.clientOrganizationId || !createForm.planId) {
      toast.error('Please select a client and plan');
      return;
    }

    try {
      await createSubscription({
        clientOrganizationId: createForm.clientOrganizationId,
        planId: createForm.planId,
        billingCycle: createForm.billingCycle,
        startTrial: createForm.startTrial,
      });
      toast.success('Subscription created successfully');
      setShowCreateModal(false);
      setCreateForm({
        clientOrganizationId: '',
        planId: '',
        billingCycle: 'MONTHLY',
        startTrial: true,
      });
      loadSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create subscription');
    }
  };

  const handleCancelSubscription = async (id: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await cancelSubscription(id, reason);
      toast.success('Subscription cancelled');
      loadSubscriptions();
      setShowDetailsModal(false);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TRIAL: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      ACTIVE: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      GRACE_PERIOD: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800',
      EXPIRED: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
      CANCELLED: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800',
    };
    return colors[status] || (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getSelectedPlan = () => {
    return plans.find((p) => p.id === createForm.planId);
  };

  const getPriceForCycle = () => {
    const plan = getSelectedPlan();
    if (!plan) return 0;
    switch (createForm.billingCycle) {
      case 'MONTHLY':
        return plan.monthlyPrice;
      case 'QUARTERLY':
        return plan.quarterlyPrice || plan.monthlyPrice * 3;
      case 'YEARLY':
        return plan.yearlyPrice || plan.monthlyPrice * 12;
      default:
        return plan.monthlyPrice;
    }
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.clientOrganization?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Subscriptions</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage client subscriptions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            New Subscription
          </button>
        </div>

        {/* Filters */}
        <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by client or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className={isDark ? 'text-gray-500' : 'text-gray-400'} />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Status' : status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-lg shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No subscriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Client
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Plan
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Billing
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Period
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredSubscriptions.map((sub) => {
                    const daysRemaining = getDaysRemaining(sub.endDate);
                    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

                    return (
                      <tr key={sub.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sub.clientOrganization?.name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{sub.clientOrganization?.shortName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sub.plan?.name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ₹{sub.amount?.toLocaleString()}/{sub.billingCycle.toLowerCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{sub.billingCycle}</div>
                          {sub.autoRenew && (
                            <div className={`text-xs flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              <FiRefreshCw className="h-3 w-3" />
                              Auto-renew
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sub.status)}`}>
                            {sub.status}
                          </span>
                          {sub.status === 'TRIAL' && sub.trialEndsAt && (
                            <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(sub.startDate).toLocaleDateString()} -{' '}
                            {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                          {isExpiringSoon && (
                            <div className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                              <FiAlertTriangle className="h-3 w-3" />
                              {daysRemaining} days left
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedSubscription(sub);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-400"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className={`p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <span className={`px-3 py-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Subscription</h2>
              <button onClick={() => setShowCreateModal(false)} className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.clientOrganizationId}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, clientOrganizationId: e.target.value }))
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">Select a client</option>
                  {clients
                    .filter((c) => c.status !== 'CHURNED')
                    .map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.shortName})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Plan <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.planId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, planId: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">Select a plan</option>
                  {plans
                    .filter((p) => p.isActive)
                    .map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.monthlyPrice}/month
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Billing Cycle</label>
                <select
                  value={createForm.billingCycle}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      billingCycle: e.target.value as 'MONTHLY' | 'YEARLY',
                    }))
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {billingCycles.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {cycle.charAt(0) + cycle.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {getSelectedPlan() && (
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ₹{getPriceForCycle()?.toLocaleString()}
                    <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      /{createForm.billingCycle.toLowerCase()}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="startTrial"
                  checked={createForm.startTrial}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, startTrial: e.target.checked }))}
                  className={`h-4 w-4 text-blue-600 rounded focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
                <label htmlFor="startTrial" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Start with 7-day trial
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubscription}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Subscription Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Client</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedSubscription.clientOrganization?.name}</p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{selectedSubscription.clientOrganization?.contactEmail}</p>
                </div>
              </div>

              {/* Plan Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Plan Details</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedSubscription.plan?.name}</p>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{selectedSubscription.billingCycle} billing</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ₹{selectedSubscription.amount?.toLocaleString()}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        per {selectedSubscription.billingCycle.toLowerCase().replace('ly', '')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedSubscription.status)}`}
                  >
                    {selectedSubscription.status}
                  </span>
                  {selectedSubscription.autoRenew && (
                    <span className={`ml-2 text-sm flex items-center gap-1 inline-flex ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      <FiRefreshCw className="h-4 w-4" />
                      Auto-renewal enabled
                    </span>
                  )}
                </div>
              </div>

              {/* Period */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subscription Period</h3>
                <div className={`rounded-lg p-4 space-y-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <FiCalendar className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {new Date(selectedSubscription.startDate).toLocaleDateString()} -{' '}
                      {new Date(selectedSubscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedSubscription.status === 'TRIAL' && selectedSubscription.trialEndsAt && (
                    <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      Trial ends on {new Date(selectedSubscription.trialEndsAt).toLocaleDateString()}
                    </p>
                  )}
                  {getDaysRemaining(selectedSubscription.endDate) > 0 && (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getDaysRemaining(selectedSubscription.endDate)} days remaining
                    </p>
                  )}
                </div>
              </div>

              {/* Limits */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Usage Limits</h3>
                <div className={`rounded-lg p-4 grid grid-cols-2 gap-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Max Users</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedSubscription.maxUsers}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Storage</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedSubscription.storageQuotaMB} MB</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedSubscription.status !== 'CANCELLED' && (
                <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {['TRIAL', 'ACTIVE', 'GRACE_PERIOD'].includes(selectedSubscription.status) && (
                      <button
                        onClick={() => handleCancelSubscription(selectedSubscription.id)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className={`border-t pt-4 flex justify-end ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
