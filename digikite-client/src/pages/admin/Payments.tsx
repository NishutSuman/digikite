import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { getPayments, getPaymentStats } from '../../services/adminService';
import type { Payment } from '../../types/admin';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusOptions = ['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

interface PaymentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  totalAmount: number;
  thisMonth: number;
}

export default function Payments() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [pagination.page, statusFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await getPayments({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setPayments(data.payments || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getPaymentStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load payment stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
      COMPLETED: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      SUCCESS: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      FAILED: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
      REFUNDED: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800',
    };
    return colors[status] || (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUCCESS':
        return <FiCheckCircle className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />;
      case 'FAILED':
        return <FiXCircle className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />;
      case 'PENDING':
        return <FiClock className={`h-4 w-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />;
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientOrganization?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payments</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Track and manage payment transactions</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ₹{((stats.totalAmount || 0) / 100000).toFixed(2)}L
                  </p>
                </div>
                <div className={`p-3 rounded-full ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <FiDollarSign className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </div>
            </div>
            <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This Month</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ₹{((stats.thisMonth || 0) / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <FiTrendingUp className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>
            </div>
            <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completed || 0}</p>
                </div>
                <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FiCheckCircle className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
              </div>
            </div>
            <div className={`rounded-lg shadow p-5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending || 0}</p>
                </div>
                <div className={`p-3 rounded-full ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                  <FiClock className={`h-6 w-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by payment ID, order ID, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
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
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FiCreditCard className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Transaction
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Client
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Amount
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {payment.razorpayPaymentId || payment.razorpayOrderId || 'N/A'}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {payment.clientOrganization?.name || 'N/A'}
                        </div>
                        {payment.subscription && (
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {payment.subscription.plan?.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ₹{payment.amount?.toLocaleString()}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{payment.currency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                        <div className="text-xs">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailsModal(true);
                          }}
                          className={isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}
                        >
                          View Details
                        </button>
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
                  className={`p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <FiChevronLeft className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
                <span className={`px-3 py-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <FiChevronRight className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  selectedPayment.status === 'COMPLETED' || selectedPayment.status === 'SUCCESS'
                    ? (isDark ? 'bg-green-900/20' : 'bg-green-50')
                    : selectedPayment.status === 'FAILED'
                    ? (isDark ? 'bg-red-900/20' : 'bg-red-50')
                    : (isDark ? 'bg-yellow-900/20' : 'bg-yellow-50')
                }`}
              >
                {getStatusIcon(selectedPayment.status)}
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                  {selectedPayment.paidAt && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      Completed at {new Date(selectedPayment.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className={`text-center py-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount</p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ₹{selectedPayment.amount?.toLocaleString()}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedPayment.currency}</p>
              </div>

              {/* Transaction Details */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transaction Details</h3>
                <div className={`rounded-lg p-4 space-y-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {selectedPayment.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Payment ID</span>
                      <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.razorpayPaymentId}</span>
                    </div>
                  )}
                  {selectedPayment.razorpayOrderId && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Order ID</span>
                      <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.razorpayOrderId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Created</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              {selectedPayment.clientOrganization && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Client</h3>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.clientOrganization.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedPayment.clientOrganization.contactEmail}
                    </p>
                  </div>
                </div>
              )}

              {/* Subscription Info */}
              {selectedPayment.subscription && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subscription</h3>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.subscription.plan?.name} Plan</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedPayment.subscription.billingCycle}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedPayment.description && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Description</h3>
                  <p className={`rounded-lg p-4 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {selectedPayment.description}
                  </p>
                </div>
              )}

              {/* Error Info */}
              {selectedPayment.status === 'FAILED' && selectedPayment.failureReason && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>Failure Reason</h3>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
                    {selectedPayment.failureReason}
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
