import type { Subscription, Invoice, Payment, ClientOrganization } from './admin';

export interface ClientDashboard {
  organization: ClientOrganization;
  subscription: Subscription | null;
  stats: {
    totalUsers: number;
    activeUsers: number;
    storageUsed: number;
    storageQuota: number;
  };
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
}

export interface GuildAccess {
  isProvisioned: boolean;
  tenantCode: string | null;
  guildUrl: string | null;
  adminCredentials?: {
    email: string;
    temporaryPassword?: string;
  };
  apkDownloadUrl: string | null;
  webAppUrl: string | null;
}

export interface ClientPortalInvoice extends Invoice {
  paymentLink?: string;
}

export interface ClientPortalPayment extends Payment {
  invoiceNumber?: string;
}
