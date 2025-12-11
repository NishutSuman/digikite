import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { getClients, createClient, provisionGuild } from '../../services/adminService';
import type { Client } from '../../types/admin';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiExternalLink,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiCalendar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusOptions = ['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED', 'CHURNED'];

export default function Clients() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [provisioning, setProvisioning] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    shortName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  useEffect(() => {
    loadClients();
  }, [pagination.page, statusFilter]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setClients(data.clients || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!createForm.name || !createForm.shortName || !createForm.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createClient(createForm);
      toast.success('Client created successfully');
      setShowCreateModal(false);
      setCreateForm({ name: '', shortName: '', contactEmail: '', contactPhone: '', address: '' });
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create client');
    }
  };

  const handleProvisionGuild = async (clientId: string) => {
    if (!confirm('Provision Guild for this client? This will create a new organization in Guild.')) {
      return;
    }

    setProvisioning(clientId);
    try {
      await provisionGuild(clientId);
      toast.success('Guild provisioned successfully!');
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to provision Guild');
    } finally {
      setProvisioning(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      ACTIVE: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      SUSPENDED: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800',
      CHURNED: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
      TRIAL: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      GRACE_PERIOD: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800',
      EXPIRED: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
      CANCELLED: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500',
    };
    return colors[status] || (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Clients</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage your client organizations</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Add Client
          </button>
        </div>

        {/* Filters */}
        <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by name, short name, or email..."
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
                    {status === 'ALL' ? 'All Status' : status}
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
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No clients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Organization
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Contact
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Guild
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Subscription
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.name}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{client.shortName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.contactEmail}</div>
                        {client.contactPhone && (
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{client.contactPhone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.isGuildProvisioned ? (
                          <span className={`inline-flex items-center text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            <FiCheck className="mr-1" />
                            Provisioned
                          </span>
                        ) : (
                          <button
                            onClick={() => handleProvisionGuild(client.id)}
                            disabled={provisioning === client.id}
                            className={`inline-flex items-center px-3 py-1 text-sm rounded-lg disabled:opacity-50 ${
                              isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            }`}
                          >
                            {provisioning === client.id ? (
                              <>
                                <div className={`animate-spin rounded-full h-3 w-3 border-b-2 mr-2 ${isDark ? 'border-purple-400' : 'border-purple-800'}`}></div>
                                Provisioning...
                              </>
                            ) : (
                              <>
                                <FiExternalLink className="mr-1" />
                                Provision
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.subscriptions && client.subscriptions.length > 0 ? (
                          <div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client.subscriptions[0].status)}`}
                            >
                              {client.subscriptions[0].status}
                            </span>
                            <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {client.subscriptions[0].plan?.name}
                            </div>
                          </div>
                        ) : (
                          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No subscription</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-400 mr-3"
                        >
                          View
                        </button>
                        <Link
                          to={`/admin/clients/${client.id}`}
                          className={isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
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

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add New Client</h2>
              <button onClick={() => setShowCreateModal(false)} className={isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  placeholder="e.g., ABC College"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Short Name / Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.shortName}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, shortName: e.target.value.toUpperCase() }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  placeholder="e.g., ABCC"
                  maxLength={10}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Used as tenant code for Guild</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createForm.contactEmail}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  placeholder="e.g., admin@abccollege.edu"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact Phone</label>
                <input
                  type="tel"
                  value={createForm.contactPhone}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  placeholder="e.g., +91 98765 43210"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
                <textarea
                  value={createForm.address}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Full address"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Client Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className={isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Organization Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Organization</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedClient.name}</p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Code: {selectedClient.shortName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Contact</h3>
                <div className={`rounded-lg p-4 space-y-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="flex items-center gap-2">
                    <FiMail className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    <a href={`mailto:${selectedClient.contactEmail}`} className="text-blue-500 hover:underline">
                      {selectedClient.contactEmail}
                    </a>
                  </p>
                  {selectedClient.contactPhone && (
                    <p className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FiPhone className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                      {selectedClient.contactPhone}
                    </p>
                  )}
                  {selectedClient.address && <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{selectedClient.address}</p>}
                </div>
              </div>

              {/* Guild Status */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Guild Integration</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {selectedClient.isGuildProvisioned ? (
                    <div className="space-y-2">
                      <p className={`flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        <FiCheck className="h-5 w-5" />
                        Guild Provisioned
                      </p>
                      {selectedClient.guildTenantCode && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Tenant Code: <span className="font-mono">{selectedClient.guildTenantCode}</span>
                        </p>
                      )}
                      {selectedClient.provisionedAt && (
                        <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <FiCalendar className="h-4 w-4" />
                          Provisioned on {new Date(selectedClient.provisionedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Guild not provisioned yet</p>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleProvisionGuild(selectedClient.id);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Provision Guild Now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription */}
              {selectedClient.subscriptions && selectedClient.subscriptions.length > 0 && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Subscription</h3>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {selectedClient.subscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sub.plan?.name} Plan</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ₹{sub.amount}/{sub.billingCycle.toLowerCase()}
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
                </div>
              )}

              {/* Actions */}
              <div className={`border-t pt-4 flex justify-end gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Close
                </button>
                <Link
                  to={`/admin/clients/${selectedClient.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Manage Client
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
