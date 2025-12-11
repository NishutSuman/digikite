import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getGuildAccess, getMyGuildStats } from '../../services/clientPortalService';
import type { GuildAccess as GuildAccessType } from '../../types/clientPortal';
import { toast } from 'react-hot-toast';
import {
  FiExternalLink,
  FiDownload,
  FiSmartphone,
  FiGlobe,
  FiUsers,
  FiHardDrive,
  FiActivity,
  FiCalendar,
  FiFileText,
  FiMessageCircle,
  FiImage,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiLock,
  FiMail,
  FiKey,
} from 'react-icons/fi';

export default function GuildAccess() {
  const { actualTheme } = useTheme();
  const [guildAccess, setGuildAccess] = useState<GuildAccessType | null>(null);
  const [guildStats, setGuildStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadGuildAccess();
  }, []);

  const loadGuildAccess = async () => {
    try {
      setLoading(true);
      const accessData = await getGuildAccess();
      setGuildAccess(accessData);

      if (accessData.isProvisioned) {
        try {
          const statsData = await getMyGuildStats();
          setGuildStats(statsData);
        } catch (error) {
          console.error('Error loading guild stats:', error);
        }
      }
    } catch (error) {
      console.error('Error loading guild access:', error);
      toast.error('Failed to load Guild access information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Not Provisioned State
  if (!guildAccess?.isProvisioned) {
    return (
      <div className="space-y-6">
        <h1 className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Guild Access
        </h1>

        <div className={`rounded-xl border p-12 text-center ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
            <FiLock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Guild Not Yet Provisioned
          </h2>
          <p className={`max-w-md mx-auto mb-8 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Your Guild alumni portal is being set up. This usually happens within 24 hours after your subscription is activated.
            You'll receive an email with your login credentials once ready.
          </p>
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${actualTheme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
            <FiAlertCircle className="mr-2" />
            Setup in progress...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Guild Access
      </h1>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Web App Access */}
        <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <FiGlobe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Web Application
                </h3>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Access Guild from any browser
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {guildAccess.webAppUrl ? (
              <>
                <div className={`mb-4 p-3 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Your Guild URL
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`font-medium truncate ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {guildAccess.webAppUrl}
                    </p>
                    <button
                      onClick={() => copyToClipboard(guildAccess.webAppUrl!, 'url')}
                      className={`ml-2 p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                      {copiedField === 'url' ? (
                        <FiCheck className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <FiCopy className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      )}
                    </button>
                  </div>
                </div>
                <a
                  href={guildAccess.webAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  <FiExternalLink className="mr-2" />
                  Open Guild Web App
                </a>
              </>
            ) : (
              <p className={`text-center ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Web URL not available yet
              </p>
            )}
          </div>
        </div>

        {/* Mobile App Access */}
        <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FiSmartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Mobile Application
                </h3>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Download the Guild app for Android
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className={`mb-4 p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-center space-x-4">
                <img
                  src="/images/playstore-badge.png"
                  alt="Get it on Google Play"
                  className="h-12"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            {guildAccess.apkDownloadUrl ? (
              <a
                href={guildAccess.apkDownloadUrl}
                download
                className={`flex items-center justify-center w-full px-4 py-3 rounded-lg transition ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <FiDownload className="mr-2" />
                Download APK
              </a>
            ) : (
              <p className={`text-center text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                APK download will be available soon
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Credentials */}
      {guildAccess.adminCredentials && (
        <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Admin Credentials
            </h3>
            <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Use these credentials to log in as administrator
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <FiMail className={`mr-2 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Admin Email
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {guildAccess.adminCredentials.email}
                </span>
                <button
                  onClick={() => copyToClipboard(guildAccess.adminCredentials!.email, 'email')}
                  className={`p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  {copiedField === 'email' ? (
                    <FiCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <FiCopy className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                  )}
                </button>
              </div>
            </div>

            {guildAccess.adminCredentials.temporaryPassword && (
              <div className={`p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <FiKey className={`mr-2 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Temporary Password
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-medium font-mono ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {guildAccess.adminCredentials.temporaryPassword}
                  </span>
                  <button
                    onClick={() => copyToClipboard(guildAccess.adminCredentials!.temporaryPassword!, 'password')}
                    className={`p-2 rounded-lg ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    {copiedField === 'password' ? (
                      <FiCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <FiCopy className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={`px-6 pb-6`}>
            <div className={`p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                <strong>Security Note:</strong> Please change your password after first login for security purposes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Code */}
      {guildAccess.tenantCode && (
        <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Organization Code
                </h3>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your unique organization identifier for Guild
                </p>
              </div>
              <div className={`flex items-center px-4 py-2 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <span className={`font-mono font-bold text-lg ${actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {guildAccess.tenantCode}
                </span>
                <button
                  onClick={() => copyToClipboard(guildAccess.tenantCode!, 'tenantCode')}
                  className={`ml-3 p-1 rounded ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  {copiedField === 'tenantCode' ? (
                    <FiCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <FiCopy className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guild Stats */}
      {guildStats && (
        <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Guild Platform Statistics
            </h3>
            <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Live data from your Guild alumni portal
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {guildStats.totalUsers || 0}
                </p>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Users
                </p>
              </div>

              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FiActivity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {guildStats.activeUsers || 0}
                </p>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Active Users
                </p>
              </div>

              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <FiCalendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {guildStats.totalEvents || 0}
                </p>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Events
                </p>
              </div>

              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                  <FiFileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {guildStats.totalPosts || 0}
                </p>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Posts
                </p>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className={`mt-6 pt-6 border-t ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-100'}`}>
                    <FiImage className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {guildStats.totalPhotos || 0}
                  </p>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Photos
                  </p>
                </div>

                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-cyan-900/30' : 'bg-cyan-100'}`}>
                    <FiMessageCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {guildStats.totalComments || 0}
                  </p>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Comments
                  </p>
                </div>

                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                    <FiHardDrive className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {guildStats.storageUsedMB ? `${(guildStats.storageUsedMB / 1024).toFixed(1)}` : '0'} GB
                  </p>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Storage Used
                  </p>
                </div>

                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${actualTheme === 'dark' ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                    <FiUsers className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {guildStats.totalGroups || 0}
                  </p>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Groups
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className={`rounded-xl border overflow-hidden ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="mailto:support@digikite.in"
              className={`p-4 rounded-lg flex items-center ${
                actualTheme === 'dark' ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
              } transition`}
            >
              <FiMail className={`h-5 w-5 mr-3 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Email Support
                </p>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  support@digikite.in
                </p>
              </div>
            </a>
            <a
              href="https://docs.guild.digikite.in"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-lg flex items-center ${
                actualTheme === 'dark' ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
              } transition`}
            >
              <FiFileText className={`h-5 w-5 mr-3 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Documentation
                </p>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  View setup guides
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
