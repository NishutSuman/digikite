import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { getPlans, createPlan, updatePlan } from '../../services/adminService';
import type { SubscriptionPlan } from '../../types/admin';
import { FiPlus, FiEdit2, FiX, FiCheck, FiPackage, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Plans() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    monthlyPrice: 0,
    yearlyDiscount: 20, // Discount percentage for yearly
    maxUsers: 500,
    storageQuotaMB: 5120,
    features: [''],
    isActive: true,
  });

  // Calculate yearly price based on monthly and discount
  const calculatedYearlyPrice = Math.round(form.monthlyPrice * 12 * (1 - form.yearlyDiscount / 100));

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await getPlans();
      setPlans(data || []);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      monthlyPrice: 0,
      yearlyDiscount: 20,
      maxUsers: 500,
      storageQuotaMB: 5120,
      features: [''],
      isActive: true,
    });
    setEditingPlan(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    const monthlyPrice = plan.monthlyPrice ?? plan.priceMonthly ?? 0;
    const yearlyPrice = plan.yearlyPrice ?? plan.priceYearly ?? monthlyPrice * 12;
    // Calculate discount from existing prices
    const fullYearlyPrice = monthlyPrice * 12;
    const discount = fullYearlyPrice > 0 ? Math.round((1 - yearlyPrice / fullYearlyPrice) * 100) : 20;

    setForm({
      name: plan.name,
      description: plan.description || '',
      monthlyPrice,
      yearlyDiscount: discount,
      maxUsers: plan.maxUsers,
      storageQuotaMB: plan.storageQuotaMB,
      features: Array.isArray(plan.features) ? (plan.features.length ? plan.features : ['']) : [''],
      isActive: plan.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || form.monthlyPrice <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        name: form.name,
        description: form.description,
        priceMonthly: form.monthlyPrice,
        priceYearly: calculatedYearlyPrice,
        maxUsers: form.maxUsers,
        storageQuotaMB: form.storageQuotaMB,
        features: form.features.filter((f) => f.trim() !== ''),
        isActive: form.isActive,
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, data);
        toast.success('Plan updated successfully');
      } else {
        const code = form.name.toUpperCase().replace(/\s+/g, '_');
        await createPlan({ ...data, code });
        toast.success('Plan created successfully');
      }

      setShowModal(false);
      resetForm();
      loadPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index: number, value: string) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      await updatePlan(plan.id, { isActive: !plan.isActive });
      toast.success(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`);
      loadPlans();
    } catch (error) {
      toast.error('Failed to update plan status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Subscription Plans
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Manage pricing plans for your clients
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Add Plan
          </button>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className={`text-center py-12 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <FiPackage className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No plans yet</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Create your first subscription plan.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiPlus className="mr-2" />
                Add Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const monthlyPrice = plan.monthlyPrice ?? plan.priceMonthly ?? 0;
              const yearlyPrice = plan.yearlyPrice ?? plan.priceYearly ?? monthlyPrice * 12;
              const discount = monthlyPrice > 0 ? Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100) : 0;
              const features = Array.isArray(plan.features)
                ? plan.features
                : (plan.features && typeof plan.features === 'object'
                    ? Object.keys(plan.features).filter(k => plan.features[k])
                    : []);

              return (
                <div
                  key={plan.id}
                  className={`rounded-lg shadow-lg overflow-hidden ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } ${!plan.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {plan.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {plan.isActive ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800'}`}>
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {plan.description || 'No description'}
                    </p>

                    {/* Pricing */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-baseline">
                        <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ₹{monthlyPrice.toLocaleString()}
                        </span>
                        <span className={`ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
                      </div>
                      {yearlyPrice > 0 && (
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ₹{yearlyPrice.toLocaleString()}/year
                          </p>
                          {discount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              Save {discount}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Limits */}
                    <div className={`border-t pt-4 mb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-medium">Max Users:</span> {plan.maxUsers}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-medium">Storage:</span> {plan.storageQuotaMB} MB
                      </p>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Features:
                        </p>
                        <ul className="space-y-1">
                          {features.slice(0, 5).map((feature: string, index: number) => (
                            <li key={index} className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {features.length > 5 && (
                            <li className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              +{features.length - 5} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`px-6 py-4 border-t flex justify-between ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <button
                      onClick={() => togglePlanStatus(plan)}
                      className={`text-sm ${
                        plan.isActive
                          ? isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditModal(plan)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FiEdit2 className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., Starter, Professional"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Active (visible to clients)
                  </label>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Brief description of this plan"
                />
              </div>

              {/* Pricing */}
              <div>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monthly Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.monthlyPrice}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, monthlyPrice: parseInt(e.target.value) || 0 }))
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Yearly Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.yearlyDiscount}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, yearlyDiscount: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))
                        }
                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min={0}
                        max={100}
                      />
                      <FiPercent className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                </div>

                {/* Calculated Yearly Price Display */}
                {form.monthlyPrice > 0 && (
                  <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Yearly Price (auto-calculated):
                      </span>
                      <div className="text-right">
                        <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ₹{calculatedYearlyPrice.toLocaleString()}
                        </span>
                        <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          (was ₹{(form.monthlyPrice * 12).toLocaleString()})
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Savings: ₹{((form.monthlyPrice * 12) - calculatedYearlyPrice).toLocaleString()} per year
                    </p>
                  </div>
                )}
              </div>

              {/* Limits */}
              <div>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Max Users
                    </label>
                    <input
                      type="number"
                      value={form.maxUsers}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }))
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Storage Quota (MB)
                    </label>
                    <input
                      type="number"
                      value={form.storageQuotaMB}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, storageQuotaMB: parseInt(e.target.value) || 0 }))
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Features</h3>
                  <button
                    onClick={addFeature}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {form.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Feature description"
                      />
                      {form.features.length > 1 && (
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className={`flex justify-end gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className={`px-4 py-2 border rounded-lg ${
                    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
