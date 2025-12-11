import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { getInvoices, sendInvoice, cancelInvoice } from '../../services/adminService';
import type { Invoice } from '../../types/admin';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiMail,
  FiDownload,
  FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusOptions = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];

export default function Invoices() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [pagination.page, statusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setInvoices(data.invoices || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (id: string) => {
    if (!confirm('Send this invoice to the client?')) return;

    try {
      await sendInvoice(id);
      toast.success('Invoice sent successfully');
      loadInvoices();
      setShowDetailsModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invoice');
    }
  };

  const handleCancelInvoice = async (id: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await cancelInvoice(id, reason);
      toast.success('Invoice cancelled');
      loadInvoices();
      setShowDetailsModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel invoice');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800',
      SENT: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      PAID: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      OVERDUE: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
      CANCELLED: isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-500',
    };
    return colors[status] || (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return false;
    return new Date(invoice.dueDate) < new Date();
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientOrganization?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Invoices</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage client invoices</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by invoice number or client..."
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
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Invoice
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
                      Due Date
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{invoice.invoiceNumber}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{invoice.clientOrganization?.name}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {invoice.subscription?.plan?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ₹{invoice.total?.toLocaleString()}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          (incl. ₹{invoice.taxAmount?.toLocaleString()} tax)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        {isOverdue(invoice) && invoice.status !== 'OVERDUE' && (
                          <span className="ml-1 text-red-500">
                            <FiAlertTriangle className="inline h-4 w-4" />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            isOverdue(invoice) && invoice.status !== 'PAID'
                              ? (isDark ? 'text-red-400' : 'text-red-600')
                              : (isDark ? 'text-white' : 'text-gray-900')
                          }`}
                        >
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        {invoice.paidAt && (
                          <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            Paid {new Date(invoice.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowDetailsModal(true);
                          }}
                          className={isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}
                        >
                          View
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

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Invoice {selectedInvoice.invoiceNumber}</h2>
              <button onClick={() => setShowDetailsModal(false)} className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg ${
                  selectedInvoice.status === 'PAID'
                    ? (isDark ? 'bg-green-900/20' : 'bg-green-50')
                    : selectedInvoice.status === 'OVERDUE'
                    ? (isDark ? 'bg-red-900/20' : 'bg-red-50')
                    : (isDark ? 'bg-gray-700' : 'bg-gray-50')
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                  {selectedInvoice.paidAt && (
                    <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      Paid on {new Date(selectedInvoice.paidAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Bill To</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInvoice.clientOrganization?.name}</p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{selectedInvoice.clientOrganization?.contactEmail}</p>
                  {selectedInvoice.clientOrganization?.address && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedInvoice.clientOrganization.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Invoice Details</h3>
                <div className={`rounded-lg p-4 space-y-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Invoice Number</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Issue Date</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Due Date</span>
                    <span className={isOverdue(selectedInvoice) ? (isDark ? 'text-red-400 font-medium' : 'text-red-600 font-medium') : (isDark ? 'text-gray-300' : 'text-gray-900')}>
                      {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Period</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                      {new Date(selectedInvoice.periodStart).toLocaleDateString()} -{' '}
                      {new Date(selectedInvoice.periodEnd).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Items</h3>
                  <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Description
                          </th>
                          <th className={`px-4 py-2 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Qty
                          </th>
                          <th className={`px-4 py-2 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Price
                          </th>
                          <th className={`px-4 py-2 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {selectedInvoice.lineItems.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.description}</td>
                            <td className={`px-4 py-2 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity}</td>
                            <td className={`px-4 py-2 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              ₹{item.unitPrice?.toLocaleString()}
                            </td>
                            <td className={`px-4 py-2 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ₹{item.amount?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div>
                <div className={`rounded-lg p-4 space-y-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>₹{selectedInvoice.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tax ({selectedInvoice.taxRate}%)</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>₹{selectedInvoice.taxAmount?.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between border-t pt-2 mt-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total</span>
                    <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{selectedInvoice.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedInvoice.status !== 'CANCELLED' && selectedInvoice.status !== 'PAID' && (
                <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedInvoice.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSendInvoice(selectedInvoice.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <FiMail className="h-4 w-4" />
                        Send Invoice
                      </button>
                    )}
                    {selectedInvoice.pdfUrl && (
                      <a
                        href={selectedInvoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                      >
                        <FiDownload className="h-4 w-4" />
                        Download PDF
                      </a>
                    )}
                    <button
                      onClick={() => handleCancelInvoice(selectedInvoice.id)}
                      className={`px-4 py-2 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                    >
                      Cancel Invoice
                    </button>
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
