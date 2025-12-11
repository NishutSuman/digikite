import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getMyPayments } from '../../services/clientPortalService';
import type { ClientPortalPayment } from '../../types/clientPortal';
import type { Pagination } from '../../types/admin';
import { toast } from 'react-hot-toast';
import {
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiExternalLink,
  FiDollarSign,
} from 'react-icons/fi';

export default function ClientPayments() {
  const { actualTheme } = useTheme();
  const [payments, setPayments] = useState<ClientPortalPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<ClientPortalPayment | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getMyPayments(filters);
      setPayments(data.payments);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUCCESS':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'FAILED':
        return <FiXCircle className="h-4 w-4" />;
      case 'PENDING':
        return <FiClock className="h-4 w-4" />;
      default:
        return <FiCreditCard className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const stats = {
    totalPaid: payments
      .filter((p) => p.status === 'COMPLETED' || p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.filter((p) => p.status === 'COMPLETED' || p.status === 'SUCCESS').length,
    pendingPayments: payments.filter((p) => p.status === 'PENDING').length,
    failedPayments: payments.filter((p) => p.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Payment History
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <FiDollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Paid
              </p>
              <p className={`text-xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.totalPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiCheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Successful
              </p>
              <p className={`text-xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalPayments}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Pending
              </p>
              <p className={`text-xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.pendingPayments}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-5 ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FiXCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Failed
              </p>
              <p className={`text-xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.failedPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className={`rounded-xl border p-12 text-center ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <FiCreditCard className={`h-16 w-16 mx-auto mb-4 ${actualTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Payments Found
          </h3>
          <p className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            You haven't made any payments yet.
          </p>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Transaction
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Method
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${actualTheme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {payments.map((payment) => (
                  <tr key={payment.id} className={actualTheme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <FiCreditCard className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                        </div>
                        <div>
                          <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {payment.razorpayPaymentId || payment.id.slice(0, 12)}
                          </p>
                          <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {payment.description || (payment.subscription?.plan?.name ? `${payment.subscription.plan.name} Subscription` : 'Payment')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {payment.paymentMethod || 'Razorpay'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className={`p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                        title="View Details"
                      >
                        <FiExternalLink className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className={`flex items-center justify-between px-6 py-4 border-t ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className={`p-2 rounded-lg disabled:opacity-50 ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FiChevronLeft className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                </button>
                <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {filters.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className={`p-2 rounded-lg disabled:opacity-50 ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FiChevronRight className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedPayment(null)} />
            <div className={`relative w-full max-w-lg rounded-xl shadow-xl ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Payment Details
                </h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className={`p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FiXCircle className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {getStatusIcon(selectedPayment.status)}
                    <span className="ml-2">{selectedPayment.status}</span>
                  </span>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p className={`text-4xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                  {selectedPayment.subscription?.plan?.name && (
                    <p className={`mt-2 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedPayment.subscription.plan.name} - {selectedPayment.subscription.billingCycle}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className={`rounded-lg p-4 space-y-3 ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <div className="flex justify-between">
                    <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Transaction ID
                    </span>
                    <span className={`font-mono ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedPayment.razorpayPaymentId || selectedPayment.id.slice(0, 16)}
                    </span>
                  </div>
                  {selectedPayment.razorpayOrderId && (
                    <div className="flex justify-between">
                      <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        Order ID
                      </span>
                      <span className={`font-mono ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedPayment.razorpayOrderId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Payment Method
                    </span>
                    <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {selectedPayment.paymentMethod || 'Razorpay'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Date & Time
                    </span>
                    <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {formatDate(selectedPayment.paidAt || selectedPayment.createdAt)}
                    </span>
                  </div>
                  {selectedPayment.invoiceNumber && (
                    <div className="flex justify-between">
                      <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        Invoice
                      </span>
                      <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {selectedPayment.invoiceNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Failure Reason */}
                {selectedPayment.status === 'FAILED' && selectedPayment.failureReason && (
                  <div className={`rounded-lg p-4 ${actualTheme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-medium ${actualTheme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                      Failure Reason
                    </p>
                    <p className={`mt-1 text-sm ${actualTheme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                      {selectedPayment.failureReason}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className={`px-4 py-2 rounded-lg ${
                      actualTheme === 'dark'
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
