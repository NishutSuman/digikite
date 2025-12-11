import api from '../utils/api';
import type {
  DemoRequest,
  ClientOrganization,
  Subscription,
  SubscriptionPlan,
  Invoice,
  Payment,
  AdminNotification,
  DashboardStats,
  Pagination,
} from '../types/admin';

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard');
  return response.data.data;
};

export const getRevenueAnalytics = async (year?: number): Promise<any> => {
  const response = await api.get('/admin/revenue', { params: { year } });
  return response.data.data;
};

// Demo Requests
export const getDemoRequests = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{ demoRequests: DemoRequest[]; pagination: Pagination }> => {
  const response = await api.get('/demo/requests', { params });
  return response.data.data;
};

export const getDemoRequestById = async (id: string): Promise<DemoRequest> => {
  const response = await api.get(`/demo/requests/${id}`);
  return response.data.data;
};

export const updateDemoRequest = async (id: string, data: Partial<DemoRequest>): Promise<DemoRequest> => {
  const response = await api.put(`/demo/requests/${id}`, data);
  return response.data.data;
};

export const scheduleDemo = async (id: string, data: { scheduledAt: string; notes?: string; assignedToId?: string }): Promise<DemoRequest> => {
  const response = await api.put(`/demo/requests/${id}/schedule`, data);
  return response.data.data;
};

export const completeDemo = async (id: string, outcome: string, notes?: string): Promise<DemoRequest> => {
  const response = await api.put(`/demo/requests/${id}/complete`, { outcome, notes });
  return response.data.data;
};

export const getDemoStats = async (): Promise<any> => {
  const response = await api.get('/demo/requests/stats');
  return response.data.data;
};

export const convertDemoToClient = async (id: string): Promise<any> => {
  const response = await api.post(`/demo/requests/${id}/convert`);
  return response.data.data;
};

// Clients
export const getClients = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{ clients: ClientOrganization[]; pagination: Pagination }> => {
  const response = await api.get('/clients', { params });
  return response.data.data;
};

export const getClientById = async (id: string): Promise<ClientOrganization> => {
  const response = await api.get(`/clients/${id}`);
  return response.data.data;
};

export const createClient = async (data: Partial<ClientOrganization>): Promise<ClientOrganization> => {
  const response = await api.post('/clients', data);
  return response.data.data;
};

export const updateClient = async (id: string, data: Partial<ClientOrganization>): Promise<ClientOrganization> => {
  const response = await api.put(`/clients/${id}`, data);
  return response.data.data;
};

export const createClientAdmin = async (clientId: string, data: { name: string; email: string; password: string }) => {
  const response = await api.post(`/clients/${clientId}/admins`, data);
  return response.data.data;
};

export const provisionGuild = async (clientId: string): Promise<any> => {
  const response = await api.post(`/clients/${clientId}/provision`);
  return response.data.data;
};

export const getGuildStats = async (clientId: string): Promise<any> => {
  const response = await api.get(`/clients/${clientId}/guild-stats`);
  return response.data.data;
};

export const getClientStats = async (): Promise<any> => {
  const response = await api.get('/clients/stats');
  return response.data.data;
};

// Subscription Plans
export const getPlans = async (includeInactive = false): Promise<SubscriptionPlan[]> => {
  const response = await api.get('/subscriptions/plans/all', { params: { includeInactive } });
  return response.data.data;
};

// Public endpoint - no auth required (for landing page)
export const getPublicPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await api.get('/subscriptions/plans');
  return response.data.data;
};

export const getPlanById = async (id: string): Promise<SubscriptionPlan> => {
  const response = await api.get(`/subscriptions/plans/${id}`);
  return response.data.data;
};

export const createPlan = async (data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await api.post('/subscriptions/plans', data);
  return response.data.data;
};

export const updatePlan = async (id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await api.put(`/subscriptions/plans/${id}`, data);
  return response.data.data;
};

// Subscriptions
export const getSubscriptions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  clientId?: string;
}): Promise<{ subscriptions: Subscription[]; pagination: Pagination }> => {
  const response = await api.get('/subscriptions', { params });
  return response.data.data;
};

export const getSubscriptionById = async (id: string): Promise<Subscription> => {
  const response = await api.get(`/subscriptions/${id}`);
  return response.data.data;
};

export const createSubscription = async (data: {
  clientOrganizationId: string;
  planId: string;
  billingCycle: string;
  startTrial?: boolean;
  startDate?: string;
  autoRenew?: boolean;
}): Promise<Subscription> => {
  const response = await api.post(`/clients/${data.clientOrganizationId}/subscription`, data);
  return response.data.data;
};

export const activateSubscription = async (id: string): Promise<Subscription> => {
  const response = await api.put(`/subscriptions/${id}/activate`);
  return response.data.data;
};

export const renewSubscription = async (id: string): Promise<Subscription> => {
  const response = await api.put(`/subscriptions/${id}/renew`);
  return response.data.data;
};

export const cancelSubscription = async (id: string, reason?: string): Promise<Subscription> => {
  const response = await api.put(`/subscriptions/${id}/cancel`, { reason });
  return response.data.data;
};

export const getExpiringSubscriptions = async (days = 7): Promise<Subscription[]> => {
  const response = await api.get('/subscriptions/expiring', { params: { days } });
  return response.data.data;
};

export const getSubscriptionStats = async (): Promise<any> => {
  const response = await api.get('/subscriptions/stats');
  return response.data.data;
};

// Invoices
export const getInvoices = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  clientId?: string;
}): Promise<{ invoices: Invoice[]; pagination: Pagination }> => {
  const response = await api.get('/invoices', { params });
  return response.data.data;
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await api.get(`/invoices/${id}`);
  return response.data.data;
};

export const createInvoice = async (subscriptionId: string, data?: {
  taxRate?: number;
  periodStart?: string;
  periodEnd?: string;
}): Promise<Invoice> => {
  const response = await api.post('/invoices', { subscriptionId, ...data });
  return response.data.data;
};

export const sendInvoice = async (id: string): Promise<Invoice> => {
  const response = await api.post(`/invoices/${id}/send`);
  return response.data.data;
};

export const cancelInvoice = async (id: string, reason?: string): Promise<Invoice> => {
  const response = await api.put(`/invoices/${id}/cancel`, { reason });
  return response.data.data;
};

export const getInvoiceStats = async (): Promise<any> => {
  const response = await api.get('/invoices/stats');
  return response.data.data;
};

// Payments
export const getPayments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  clientId?: string;
}): Promise<{ payments: Payment[]; pagination: Pagination }> => {
  const response = await api.get('/payments', { params });
  return response.data.data;
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await api.get(`/payments/${id}`);
  return response.data.data;
};

export const createPaymentOrder = async (subscriptionId: string): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
}> => {
  const response = await api.post('/payments/create-order', { subscriptionId });
  return response.data.data;
};

export const verifyPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<Payment> => {
  const response = await api.post('/payments/verify', data);
  return response.data.data;
};

export const getPaymentStats = async (): Promise<any> => {
  const response = await api.get('/payments/stats');
  return response.data.data;
};

// Notifications
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<{ notifications: AdminNotification[]; pagination: Pagination; unreadCount: number }> => {
  const response = await api.get('/admin/notifications', { params });
  return response.data.data;
};

export const markNotificationRead = async (id: string): Promise<AdminNotification> => {
  const response = await api.put(`/admin/notifications/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.put('/admin/notifications/read-all');
};

// Admin Users
export const getAdminUsers = async (): Promise<any[]> => {
  const response = await api.get('/admin/users');
  return response.data.data;
};

// Guild Health
export const getGuildHealth = async (): Promise<any> => {
  const response = await api.get('/admin/guild/health');
  return response.data.data;
};
