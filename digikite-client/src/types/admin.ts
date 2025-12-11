// Demo Request Types
export type DemoStatus = 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'DEMO_COMPLETED' | 'CONVERTED' | 'LOST';

export interface DemoRequest {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  organizationType: string;
  estimatedMembers?: number;
  website?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  status: DemoStatus;
  notes?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  demoScheduledAt?: string;
  demoCompletedAt?: string;
  demoOutcome?: string;
  convertedToClientId?: string;
  createdAt: string;
  updatedAt: string;
}

// Client Organization Types
export type ClientStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CHURNED';

export interface ClientOrganization {
  id: string;
  name: string;
  shortName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  organizationType?: string;
  foundationYear?: number;
  description?: string;
  guildTenantCode?: string;
  guildOrgId?: string;
  isGuildProvisioned: boolean;
  provisionedAt?: string;
  guildAdminEmail?: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  subscriptions?: Subscription[];
  _count?: {
    adminUsers: number;
  };
}

// Subscription Types
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED' | 'CANCELLED';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface SubscriptionPlan {
  id: string;
  name: string;
  code?: string;
  description?: string;
  monthlyPrice: number;
  quarterlyPrice?: number;
  yearlyPrice?: number;
  priceMonthly?: number;
  priceQuarterly?: number;
  priceYearly?: number;
  currency: string;
  maxUsers: number;
  storageQuotaMB: number;
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  trialDays?: number;
  createdAt: string;
  updatedAt: string;
}

// Alias for convenience
export type Client = ClientOrganization;

export interface Subscription {
  id: string;
  clientOrganizationId: string;
  clientOrganization?: ClientOrganization;
  planId: string;
  plan?: SubscriptionPlan;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  maxUsers: number;
  storageQuotaMB: number;
  customMaxUsers?: number;
  customStorageQuotaMB?: number;
  lastRenewalAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice Types
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientOrganizationId: string;
  clientOrganization?: ClientOrganization;
  subscriptionId?: string;
  subscription?: Subscription;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  description?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  periodStart: string;
  periodEnd: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  description?: string;
  failureReason?: string;
  paidAt?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  clientOrganizationId?: string;
  clientOrganization?: {
    id: string;
    name: string;
    contactEmail?: string;
  };
  subscriptionId?: string;
  subscription?: {
    id: string;
    plan?: {
      name: string;
    };
    billingCycle: string;
  };
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  // Basic counts
  totalClients: number;
  activeClients: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  pendingDemos: number;
  totalDemos: number;
  convertedDemos: number;

  // Revenue
  totalRevenue: number;
  monthlyRevenue: number;

  // Nested structure (alternative format from backend)
  demos?: {
    total: number;
    new: number;
    thisMonth: number;
    lastMonth: number;
    growth: string | number;
  };
  clients?: {
    total: number;
    active: number;
    thisMonth: number;
  };
  subscriptions?: {
    total: number;
    active: number;
    trial: number;
  };
  revenue?: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: string | number;
  };
  recent?: {
    demos: DemoRequest[];
    payments: Payment[];
  };
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    [key: string]: T[];
    pagination: Pagination;
  };
}
