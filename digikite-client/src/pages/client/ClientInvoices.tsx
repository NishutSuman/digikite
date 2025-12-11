import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getMyInvoices, initiatePayment, verifyPayment } from '../../services/clientPortalService';
import type { ClientPortalInvoice } from '../../types/clientPortal';
import type { Pagination } from '../../types/admin';
import { toast } from 'react-hot-toast';
import {
  FiFileText,
  FiDownload,
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiEye,
  FiX,
} from 'react-icons/fi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ClientInvoices() {
  const { actualTheme } = useTheme();
  const [invoices, setInvoices] = useState<ClientPortalInvoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientPortalInvoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
  });

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) params.status = filters.status;

      const data = await getMyInvoices(params);
      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoice: ClientPortalInvoice) => {
    try {
      setPayingInvoice(invoice.id);
      const orderData = await initiatePayment(invoice.id);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Digikite',
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            loadInvoices();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: invoice.clientOrganization?.contactEmail,
        },
        theme: {
          color: '#10b981',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setPayingInvoice(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'OVERDUE':
        return <FiAlertCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'PAID' || status === 'CANCELLED') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Invoices
        </h1>
      </div>

      {/* Filters */}
      <div className={`flex items-center space-x-4 p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <FiFilter className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className={`rounded-lg border px-3 py-2 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className={`rounded-xl border p-12 text-center ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <FiFileText className={`h-16 w-16 mx-auto mb-4 ${actualTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Invoices Found
          </h3>
          <p className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            You don't have any invoices yet.
          </p>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Invoice
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Period
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Due Date
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className={actualTheme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <FiFileText className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                        </div>
                        <div>
                          <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {invoice.invoiceNumber}
                          </p>
                          <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(invoice.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(invoice.periodStart)}
                      </p>
                      <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        to {formatDate(invoice.periodEnd)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(invoice.total, invoice.currency)}
                      </p>
                      {invoice.taxAmount > 0 && (
                        <p className={`text-xs ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          incl. {formatCurrency(invoice.taxAmount)} tax
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCalendar className={`h-4 w-4 mr-2 ${
                          isOverdue(invoice.dueDate, invoice.status)
                            ? 'text-red-500'
                            : actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm ${
                          isOverdue(invoice.dueDate, invoice.status)
                            ? 'text-red-500 font-medium'
                            : actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className={`p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                          title="View Details"
                        >
                          <FiEye className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                        </button>
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title="Download PDF"
                          >
                            <FiDownload className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                          </a>
                        )}
                        {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                          <button
                            onClick={() => handlePayInvoice(invoice)}
                            disabled={payingInvoice === invoice.id}
                            className="flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {payingInvoice === invoice.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <FiCreditCard className="mr-1.5 h-4 w-4" />
                                Pay Now
                              </>
                            )}
                          </button>
                        )}
                      </div>
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

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedInvoice(null)} />
            <div className={`relative w-full max-w-2xl rounded-xl shadow-xl ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Invoice {selectedInvoice.invoiceNumber}
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className={`p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                    {getStatusIcon(selectedInvoice.status)}
                    <span className="ml-1">{selectedInvoice.status}</span>
                  </span>
                  {selectedInvoice.paidAt && (
                    <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Paid on {formatDate(selectedInvoice.paidAt)}
                    </span>
                  )}
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Invoice Date
                    </p>
                    <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedInvoice.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Due Date
                    </p>
                    <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedInvoice.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Period Start
                    </p>
                    <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedInvoice.periodStart)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Period End
                    </p>
                    <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedInvoice.periodEnd)}
                    </p>
                  </div>
                </div>

                {/* Line Items */}
                {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                  <div className={`rounded-lg border ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className="w-full">
                      <thead className={actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Description
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Qty
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Price
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${actualTheme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {selectedInvoice.lineItems.map((item, index) => (
                          <tr key={index}>
                            <td className={`px-4 py-3 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.description}
                            </td>
                            <td className={`px-4 py-3 text-right ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.quantity}
                            </td>
                            <td className={`px-4 py-3 text-right ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Totals */}
                <div className={`rounded-lg p-4 ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        Subtotal
                      </span>
                      <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}
                      </span>
                    </div>
                    {selectedInvoice.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          Tax ({selectedInvoice.taxRate}%)
                        </span>
                        <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}
                        </span>
                      </div>
                    )}
                    <div className={`flex justify-between pt-2 border-t ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Total
                      </span>
                      <span className={`font-semibold text-lg ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  {selectedInvoice.pdfUrl && (
                    <a
                      href={selectedInvoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        actualTheme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <FiDownload className="mr-2 h-4 w-4" />
                      Download PDF
                    </a>
                  )}
                  {(selectedInvoice.status === 'SENT' || selectedInvoice.status === 'OVERDUE') && (
                    <button
                      onClick={() => handlePayInvoice(selectedInvoice)}
                      disabled={payingInvoice === selectedInvoice.id}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {payingInvoice === selectedInvoice.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <FiCreditCard className="mr-2 h-4 w-4" />
                      )}
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
