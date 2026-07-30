import type {
  ApiSuccessResponse,
  BookingMode,
  BookingSource,
  BookingStatus,
  CustomerStatus,
  LocationStatus,
  ResourceStatus,
  ServiceStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type BookingSummary = {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  source: BookingSource;
  bookingMode: BookingMode;
  customerDisplayName: string | null;
  locationName: string | null;
  startAt: string;
  endAt: string;
  grandTotal: string;
  balanceDue: string;
  currency: string;
};

export type CustomerSummary = {
  id: string;
  customerNumber: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  status: CustomerStatus;
};

export type ServiceSummary = {
  id: string;
  code: string;
  name: string;
  status: ServiceStatus;
  bookingMode: BookingMode;
  basePrice: string;
  currency: string;
};

export type ResourceSummary = {
  id: string;
  code: string;
  name: string;
  status: ResourceStatus;
  locationName: string | null;
};

export type LocationSummary = {
  id: string;
  code: string;
  name: string;
  timezone: string;
  status: LocationStatus;
};

export type AvailabilitySlot = {
  startAt: string;
  endAt: string;
  available: boolean;
  resourceIds: string[];
};

export type BookingListResponse = ApiSuccessResponse<{
  items: BookingSummary[];
}>;

export type CustomerListResponse = ApiSuccessResponse<{
  items: CustomerSummary[];
}>;

export type ServiceListResponse = ApiSuccessResponse<{
  items: ServiceSummary[];
}>;

export type ResourceListResponse = ApiSuccessResponse<{
  items: ResourceSummary[];
}>;

export type LocationListResponse = ApiSuccessResponse<{
  items: LocationSummary[];
}>;

export type AvailabilityResponse = ApiSuccessResponse<{
  slots: AvailabilitySlot[];
}>;

export const bookingApi = {
  listBookings() {
    return apiClient.get<BookingListResponse>('/bookings');
  },
  listCustomers() {
    return apiClient.get<CustomerListResponse>('/customers');
  },
  listServices() {
    return apiClient.get<ServiceListResponse>('/services');
  },
  listResources() {
    return apiClient.get<ResourceListResponse>('/resources');
  },
  listLocations() {
    return apiClient.get<LocationListResponse>('/locations');
  },
  getAvailability(query: URLSearchParams) {
    return apiClient.get<AvailabilityResponse>(`/availability?${query.toString()}`);
  },
};
