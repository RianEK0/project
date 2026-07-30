import type {
  ApiSuccessResponse,
  BookingSource,
  BookingStatus,
  DownloadAssetStatus,
  DownloadAssetType,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  PortalDashboardPeriod,
  PortalNotificationChannel,
  PortalNotificationStatus,
  PortalTrackingEntityType,
  PortalTrackingEventStatus,
  SalesOrderSourceType,
  SalesOrderStatus,
  SupportTicketCategory,
  SupportTicketChannel,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type PortalDashboard = {
  periods: PortalDashboardPeriod[];
  summary: {
    bookings: {
      activeStatuses: BookingStatus[];
    };
    invoices: {
      openStatuses: InvoiceStatus[];
    };
    payments: {
      visibleStatuses: PaymentStatus[];
    };
    support: {
      trackedStatuses: SupportTicketStatus[];
    };
  };
  cards: Array<{
    id: string;
    label: string;
    route: string;
    insight: string;
  }>;
};

export type PortalBookingsFoundation = {
  items: unknown[];
  statuses: BookingStatus[];
  sources: BookingSource[];
  selfServiceActions: string[];
};

export type PortalOrdersFoundation = {
  items: unknown[];
  statuses: SalesOrderStatus[];
  sourceTypes: SalesOrderSourceType[];
  customerFacingStatuses: SalesOrderStatus[];
};

export type PortalInvoicesFoundation = {
  items: unknown[];
  statuses: InvoiceStatus[];
  downloadableAssets: DownloadAssetType[];
};

export type PortalPaymentsFoundation = {
  items: unknown[];
  statuses: PaymentStatus[];
  methods: PaymentMethod[];
  availableActions: string[];
};

export type PortalProfileFoundation = {
  sections: string[];
  notificationChannels: PortalNotificationChannel[];
  availableActions: string[];
};

export type PortalSupportCenter = {
  channels: SupportTicketChannel[];
  categories: SupportTicketCategory[];
  priorities: SupportTicketPriority[];
  serviceWindow: {
    timezone: string;
    businessHours: string;
  };
  responseTargets: Array<{
    priority: string;
    firstResponseTargetHours: number;
  }>;
};

export type SupportTicketFoundation = {
  items: unknown[];
  statuses: SupportTicketStatus[];
  priorities: SupportTicketPriority[];
  channels: SupportTicketChannel[];
  categories: SupportTicketCategory[];
};

export type SupportTicketMetadata = {
  transitions: Record<SupportTicketStatus, SupportTicketStatus[]>;
  customerWritableStatuses: SupportTicketStatus[];
  closableStatuses: SupportTicketStatus[];
};

export type PortalNotificationInbox = {
  statuses: PortalNotificationStatus[];
  summary: {
    channels: PortalNotificationChannel[];
    unreadCount: number;
    totalCount: number;
  };
  items: Array<{
    id: string;
    title: string;
    message: string;
    channel: PortalNotificationChannel;
    status: PortalNotificationStatus;
    route: string;
    createdAt: string;
  }>;
};

export type PortalTrackingOverview = {
  entityTypes: PortalTrackingEntityType[];
  statuses: PortalTrackingEventStatus[];
  cards: Array<{
    id: string;
    label: string;
    metric: number;
  }>;
};

export type PortalTrackingTimeline = {
  items: Array<{
    id: string;
    entityType: PortalTrackingEntityType;
    entityId: string;
    title: string;
    description: string;
    route: string;
    status: PortalTrackingEventStatus;
    occurredAt: string;
  }>;
  exceptionItems: Array<{
    id: string;
    entityType: PortalTrackingEntityType;
    entityId: string;
    title: string;
    description: string;
    route: string;
    status: PortalTrackingEventStatus;
    occurredAt: string;
  }>;
};

export type PortalDownloadCatalog = {
  assetTypes: DownloadAssetType[];
  statuses: DownloadAssetStatus[];
  availableCount: number;
  items: Array<{
    id: string;
    title: string;
    documentType: DownloadAssetType;
    status: DownloadAssetStatus;
    route: string;
    generatedAt: string;
  }>;
};

export type PortalDashboardResponse = ApiSuccessResponse<PortalDashboard>;
export type PortalBookingsFoundationResponse = ApiSuccessResponse<PortalBookingsFoundation>;
export type PortalOrdersFoundationResponse = ApiSuccessResponse<PortalOrdersFoundation>;
export type PortalInvoicesFoundationResponse = ApiSuccessResponse<PortalInvoicesFoundation>;
export type PortalPaymentsFoundationResponse = ApiSuccessResponse<PortalPaymentsFoundation>;
export type PortalProfileFoundationResponse = ApiSuccessResponse<PortalProfileFoundation>;
export type PortalSupportCenterResponse = ApiSuccessResponse<PortalSupportCenter>;
export type SupportTicketFoundationResponse = ApiSuccessResponse<SupportTicketFoundation>;
export type SupportTicketMetadataResponse = ApiSuccessResponse<SupportTicketMetadata>;
export type PortalNotificationInboxResponse = ApiSuccessResponse<PortalNotificationInbox>;
export type PortalTrackingOverviewResponse = ApiSuccessResponse<PortalTrackingOverview>;
export type PortalTrackingTimelineResponse = ApiSuccessResponse<PortalTrackingTimeline>;
export type PortalDownloadCatalogResponse = ApiSuccessResponse<PortalDownloadCatalog>;

export const portalApi = {
  getDashboard() {
    return apiClient.get<PortalDashboardResponse>('/portal-dashboard');
  },
  getBookingsFoundation() {
    return apiClient.get<PortalBookingsFoundationResponse>('/portal-bookings');
  },
  getOrdersFoundation() {
    return apiClient.get<PortalOrdersFoundationResponse>('/portal-orders');
  },
  getInvoicesFoundation() {
    return apiClient.get<PortalInvoicesFoundationResponse>('/portal-invoices');
  },
  getPaymentsFoundation() {
    return apiClient.get<PortalPaymentsFoundationResponse>('/portal-payments');
  },
  getProfileFoundation() {
    return apiClient.get<PortalProfileFoundationResponse>('/portal-profile');
  },
  getSupportCenter() {
    return apiClient.get<PortalSupportCenterResponse>('/portal-support');
  },
  getTicketsFoundation() {
    return apiClient.get<SupportTicketFoundationResponse>('/support-tickets');
  },
  getTicketMetadata() {
    return apiClient.get<SupportTicketMetadataResponse>('/support-tickets/metadata');
  },
  getNotifications() {
    return apiClient.get<PortalNotificationInboxResponse>('/portal-notifications');
  },
  getTrackingOverview() {
    return apiClient.get<PortalTrackingOverviewResponse>('/portal-tracking');
  },
  getTrackingTimeline() {
    return apiClient.get<PortalTrackingTimelineResponse>('/portal-tracking/timeline');
  },
  getDownloadCatalog() {
    return apiClient.get<PortalDownloadCatalogResponse>('/portal-downloads');
  },
};
