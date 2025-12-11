import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { getDemoRequests, updateDemoRequest, scheduleDemo, convertDemoToClient } from '../../services/adminService';
import type { DemoRequest } from '../../types/admin';
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiPhone,
  FiMail,
  FiGlobe,
  FiUsers,
  FiMessageSquare,
  FiX,
  FiCheck,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusOptions = ['ALL', 'NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'CONVERTED', 'LOST'];

export default function DemoRequests() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const [demos, setDemos] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedDemo, setSelectedDemo] = useState<DemoRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ scheduledAt: '', notes: '' });

  useEffect(() => {
    loadDemos();
  }, [pagination.page, statusFilter]);

  const loadDemos = async () => {
    setLoading(true);
    try {
      const data = await getDemoRequests({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setDemos(data.demoRequests || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      toast.error('Failed to load demo requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDemoRequest(id, { status });
      toast.success('Status updated');
      loadDemos();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleScheduleDemo = async () => {
    if (!selectedDemo || !scheduleData.scheduledAt) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      await scheduleDemo(selectedDemo.id, {
        scheduledAt: new Date(scheduleData.scheduledAt).toISOString(),
        notes: scheduleData.notes,
      });
      toast.success('Demo scheduled successfully');
      setShowScheduleModal(false);
      setScheduleData({ scheduledAt: '', notes: '' });
      loadDemos();
    } catch (error) {
      toast.error('Failed to schedule demo');
    }
  };

  const handleConvert = async (id: string) => {
    if (!confirm('Convert this demo request to a client? This will create a new client organization.')) {
      return;
    }

    try {
      await convertDemoToClient(id);
      toast.success('Demo converted to client successfully');
      loadDemos();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to convert demo');
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
    };
    return colors[status] || (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  const filteredDemos = demos.filter(
    (demo) =>
      demo.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Demo Requests</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage incoming demo requests from potential clients</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-lg shadow p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by organization, name, or email..."
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
          ) : filteredDemos.length === 0 ? (
            <div className="text-center py-12">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No demo requests found</p>
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
                      Type
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
                  {filteredDemos.map((demo) => (
                    <tr key={demo.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{demo.organizationName}</div>
                        {demo.website && (
                          <div className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <FiGlobe className="h-3 w-3" />
                            {demo.website}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{demo.contactName}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{demo.contactEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{demo.organizationType}</div>
                        {demo.estimatedMembers && (
                          <div className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <FiUsers className="h-3 w-3" />
                            {demo.estimatedMembers} members
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(demo.status)}`}>
                          {demo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(demo.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedDemo(demo);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-400"
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

      {/* Details Modal */}
      {showModal && selectedDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Demo Request Details</h2>
              <button onClick={() => setShowModal(false)} className={isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Organization Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Organization</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDemo.organizationName}</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{selectedDemo.organizationType}</p>
                  {selectedDemo.website && (
                    <a
                      href={selectedDemo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      <FiGlobe className="h-4 w-4" />
                      {selectedDemo.website}
                    </a>
                  )}
                  {selectedDemo.estimatedMembers && (
                    <p className={`flex items-center gap-1 mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FiUsers className="h-4 w-4" />
                      {selectedDemo.estimatedMembers} estimated members
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Contact Person</h3>
                <div className={`rounded-lg p-4 space-y-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDemo.contactName}</p>
                  <p className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <FiMail className="h-4 w-4" />
                    <a href={`mailto:${selectedDemo.contactEmail}`} className="text-blue-500 hover:underline">
                      {selectedDemo.contactEmail}
                    </a>
                  </p>
                  {selectedDemo.contactPhone && (
                    <p className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FiPhone className="h-4 w-4" />
                      <a href={`tel:${selectedDemo.contactPhone}`} className="text-blue-500 hover:underline">
                        {selectedDemo.contactPhone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              {selectedDemo.message && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Message</h3>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FiMessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                      {selectedDemo.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Preferred Schedule */}
              {(selectedDemo.preferredDate || selectedDemo.preferredTime) && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Preferred Schedule</h3>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FiClock className="h-4 w-4" />
                      {selectedDemo.preferredDate && new Date(selectedDemo.preferredDate).toLocaleDateString()}
                      {selectedDemo.preferredTime && ` at ${selectedDemo.preferredTime}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Demo Info */}
              {selectedDemo.demoScheduledAt && (
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Scheduled Demo</h3>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <p className={`flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
                      <FiCalendar className="h-4 w-4" />
                      {new Date(selectedDemo.demoScheduledAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Status</h3>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedDemo.status)}`}>
                  {selectedDemo.status.replace('_', ' ')}
                </span>
              </div>

              {/* Actions */}
              <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDemo.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedDemo.id, 'CONTACTED')}
                      className={`px-4 py-2 rounded-lg ${isDark ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                    >
                      Mark as Contacted
                    </button>
                  )}
                  {(selectedDemo.status === 'NEW' || selectedDemo.status === 'CONTACTED') && (
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className={`px-4 py-2 rounded-lg ${isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
                    >
                      Schedule Demo
                    </button>
                  )}
                  {selectedDemo.status === 'DEMO_SCHEDULED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedDemo.id, 'DEMO_COMPLETED')}
                      className={`px-4 py-2 rounded-lg ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                    >
                      Mark Demo Completed
                    </button>
                  )}
                  {selectedDemo.status === 'DEMO_COMPLETED' && (
                    <>
                      <button
                        onClick={() => handleConvert(selectedDemo.id)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <FiCheck className="inline-block mr-1" />
                        Convert to Client
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedDemo.id, 'LOST')}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        Mark as Lost
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Schedule Demo</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className={isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleData.scheduledAt}
                  onChange={(e) => setScheduleData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notes (optional)</label>
                <textarea
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Add any notes about the demo..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleDemo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
