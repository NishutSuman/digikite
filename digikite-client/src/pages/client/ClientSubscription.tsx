import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getMySubscription, getMyOrganization, initiateRenewalPayment, verifyPayment } from '../../services/clientPortalService';
import { getPlans } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import type { Subscription, SubscriptionPlan, ClientOrganization } from '../../types/admin';
import {
  FiPackage,
  FiCalendar,
  FiUsers,
  FiHardDrive,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
  FiArrowRight,
  FiCreditCard,
} from 'react-icons/fi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ClientSubscription() {
  const { actualTheme } = useTheme();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [organization, setOrganization] = useState<ClientOrganization | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch data separately to handle individual errors
      let subData = null;
      let orgData = null;
      let plansData: SubscriptionPlan[] = [];

      try {
        subData = await getMySubscription();
      } catch (err: any) {
        // 404 means no subscription, 403 means no org linked - both are OK
        if (err?.response?.status !== 404 && err?.response?.status !== 403) {
          console.error('Error loading subscription:', err);
        }
      }

      try {
        orgData = await getMyOrganization();
      } catch (err: any) {
        if (err?.response?.status !== 403) {
          console.error('Error loading organization:', err);
        }
      }

      try {
        plansData = await getPlans(false);
      } catch (err) {
        console.error('Error loading plans:', err);
      }

      setSubscription(subData);
      setOrganization(orgData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      setIsProcessingPayment(true);
      const orderData = await initiateRenewalPayment();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Digikite',
        description: `Subscription Renewal - ${orderData.subscription.plan}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Your subscription has been renewed.');
            loadData();
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: organization?.contactEmail,
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'GRACE_PERIOD':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        My Subscription
      </h1>

      {/* Current Subscription */}
      {subscription ? (
        <div className={`rounded-xl border ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <FiPackage className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {subscription.plan?.name || 'Current Plan'}
                  </h2>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {subscription.billingCycle.charAt(0) + subscription.billingCycle.slice(1).toLowerCase()} billing
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status === 'TRIAL' ? 'Trial Period' : subscription.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Billing Amount */}
            <div>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Billing Amount
              </p>
              <p className={`text-2xl font-bold mt-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(subscription.amount, subscription.currency)}
              </p>
              <p className={`text-xs ${actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                per {subscription.billingCycle.toLowerCase().replace('ly', '')}
              </p>
            </div>

            {/* Period */}
            <div>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Current Period
              </p>
              <p className={`text-lg font-semibold mt-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(subscription.startDate)}
              </p>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                to {formatDate(subscription.endDate)}
              </p>
            </div>

            {/* Days Remaining */}
            <div>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Days Remaining
              </p>
              <div className="flex items-center mt-1">
                {getDaysRemaining(subscription.endDate) <= 7 ? (
                  <FiAlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                ) : (
                  <FiClock className="h-5 w-5 text-emerald-500 mr-2" />
                )}
                <p className={`text-2xl font-bold ${
                  getDaysRemaining(subscription.endDate) <= 7
                    ? 'text-yellow-500'
                    : actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {Math.max(0, getDaysRemaining(subscription.endDate))}
                </p>
              </div>
            </div>

            {/* Auto Renewal */}
            <div>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Auto Renewal
              </p>
              <div className="flex items-center mt-1">
                {subscription.autoRenew ? (
                  <>
                    <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className={`font-medium ${actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      Enabled
                    </span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className={`font-medium ${actualTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      Disabled
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className={`p-6 border-t ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Plan Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FiUsers className={`h-5 w-5 mr-2 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Max Users
                    </span>
                  </div>
                  <span className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {subscription.customMaxUsers || subscription.maxUsers || subscription.plan?.maxUsers || 'Unlimited'}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FiHardDrive className={`h-5 w-5 mr-2 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Storage Quota
                    </span>
                  </div>
                  <span className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatStorage(subscription.customStorageQuotaMB || subscription.storageQuotaMB || subscription.plan?.storageQuotaMB || 5120)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          {subscription.plan?.features && subscription.plan.features.length > 0 && (
            <div className={`p-6 border-t ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Plan Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <FiCheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                    <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {(subscription.status === 'EXPIRED' || subscription.status === 'GRACE_PERIOD' || getDaysRemaining(subscription.endDate) <= 7) && (
            <div className={`p-6 border-t ${actualTheme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {subscription.status === 'EXPIRED'
                      ? 'Your subscription has expired'
                      : subscription.status === 'GRACE_PERIOD'
                      ? 'Your subscription is in grace period'
                      : 'Your subscription is expiring soon'}
                  </p>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Renew now to continue using all features
                  </p>
                </div>
                <button
                  onClick={handleRenewSubscription}
                  disabled={isProcessingPayment}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="mr-2 h-4 w-4" />
                      Pay & Renew
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-xl border p-8 text-center ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <FiPackage className={`h-16 w-16 mx-auto mb-4 ${actualTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <h2 className={`text-xl font-semibold mb-2 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Active Subscription
          </h2>
          <p className={`mb-6 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Choose a plan to get started with Guild
          </p>
        </div>
      )}

      {/* Available Plans */}
      {(!subscription || subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') && plans.length > 0 && (
        <div>
          <h2 className={`text-xl font-bold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl border overflow-hidden ${
                  plan.isPopular
                    ? 'border-emerald-500 ring-2 ring-emerald-500'
                    : actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } ${actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                {plan.isPopular && (
                  <div className="bg-emerald-500 text-white text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className={`text-xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mt-4">
                    <span className={`text-3xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(plan.monthlyPrice || plan.priceMonthly || 0)}
                    </span>
                    <span className={actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      /month
                    </span>
                  </div>

                  <div className={`mt-4 pt-4 border-t ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <FiUsers className="h-4 w-4 text-emerald-500 mr-2" />
                        <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          Up to {plan.maxUsers} users
                        </span>
                      </li>
                      <li className="flex items-center">
                        <FiHardDrive className="h-4 w-4 text-emerald-500 mr-2" />
                        <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {formatStorage(plan.storageQuotaMB)} storage
                        </span>
                      </li>
                      {plan.features?.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <FiCheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                          <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className={`w-full mt-6 py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                    plan.isPopular
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : actualTheme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                    Get Started
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organization Info */}
      {organization && (
        <div className={`rounded-xl border ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Organization Details
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Organization Name
              </p>
              <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {organization.name}
              </p>
            </div>
            <div>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Contact Email
              </p>
              <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {organization.contactEmail}
              </p>
            </div>
            {organization.contactPhone && (
              <div>
                <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Contact Phone
                </p>
                <p className={`font-medium ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {organization.contactPhone}
                </p>
              </div>
            )}
            <div>
              <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Status
              </p>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(organization.status)}`}>
                {organization.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
