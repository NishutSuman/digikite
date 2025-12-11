import api from '../utils/api';
import type { ClientDashboard, GuildAccess, ClientPortalInvoice, ClientPortalPayment } from '../types/clientPortal';
import type { ClientOrganization, Subscription, Pagination } from '../types/admin';

// Dashboard
export const getClientDashboard = async (): Promise<ClientDashboard> => {
  const response = await api.get('/my/dashboard');
  return response.data.data;
};

// Organization
export const getMyOrganization = async (): Promise<ClientOrganization> => {
  const response = await api.get('/my/organization');
  return response.data.data;
};

// Subscription
export const getMySubscription = async (): Promise<Subscription | null> => {
  const response = await api.get('/my/subscription');
  return response.data.data;
};

// Invoices
export const getMyInvoices = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ invoices: ClientPortalInvoice[]; pagination: Pagination }> => {
  const response = await api.get('/my/invoices', { params });
  return response.data.data;
};

// Payments
export const getMyPayments = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ payments: ClientPortalPayment[]; pagination: Pagination }> => {
  const response = await api.get('/my/payments', { params });
  return response.data.data;
};

// Guild Access
export const getGuildAccess = async (): Promise<GuildAccess> => {
  const response = await api.get('/my/guild');
  return response.data.data;
};

export const getMyGuildStats = async (): Promise<any> => {
  const response = await api.get('/my/guild/stats');
  return response.data.data;
};

// Payment
export const initiatePayment = async (invoiceId: string): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
}> => {
  const response = await api.post('/payments/create-order', { invoiceId });
  return response.data.data;
};

export const verifyPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<any> => {
  const response = await api.post('/payments/verify', data);
  return response.data.data;
};

// Initiate subscription renewal payment
export const initiateRenewalPayment = async (): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
  subscription: {
    id: string;
    plan: string;
    amount: number;
    billingCycle: string;
  };
}> => {
  const response = await api.post('/my/subscription/renew');
  return response.data.data;
};
