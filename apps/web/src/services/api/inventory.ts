import type {
  ApiSuccessResponse,
  InventoryAlertSeverity,
  InventoryAlertStatus,
  InventoryReservationStatus,
  InventoryTrackingType,
  ProductStatus,
  ProductVariantStatus,
  SupplierStatus,
  WarehouseStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type ProductSummary = {
  id: string;
  code: string;
  name: string;
  status: ProductStatus;
  inventoryTracking: InventoryTrackingType;
  variantCount: number;
  categoryName: string | null;
  brandName: string | null;
};

export type ProductVariantSummary = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  status: ProductVariantStatus;
  isDefault: boolean;
};

export type WarehouseSummary = {
  id: string;
  code: string;
  name: string;
  status: WarehouseStatus;
  timezone: string;
  isDefault: boolean;
};

export type SupplierSummary = {
  id: string;
  supplierNumber: string;
  name: string;
  status: SupplierStatus;
  leadTimeDays: number | null;
};

export type InventoryBalanceSummary = {
  id: string;
  productVariantId: string;
  warehouseName: string;
  storageLocationCode: string;
  onHandQuantity: string;
  reservedQuantity: string;
  availableQuantity: string;
};

export type InventoryReservationSummary = {
  id: string;
  reservationNumber: string;
  sourceType: string;
  quantity: string;
  status: InventoryReservationStatus;
  expiresAt: string | null;
};

export type InventoryAlertSummary = {
  id: string;
  alertType: string;
  severity: InventoryAlertSeverity;
  status: InventoryAlertStatus;
  title: string;
  detectedAt: string;
};

export type ProductListResponse = ApiSuccessResponse<{
  items: ProductSummary[];
}>;

export type ProductVariantListResponse = ApiSuccessResponse<{
  items: ProductVariantSummary[];
}>;

export type WarehouseListResponse = ApiSuccessResponse<{
  items: WarehouseSummary[];
}>;

export type SupplierListResponse = ApiSuccessResponse<{
  items: SupplierSummary[];
}>;

export type InventoryBalanceListResponse = ApiSuccessResponse<{
  items: InventoryBalanceSummary[];
}>;

export type InventoryReservationListResponse = ApiSuccessResponse<{
  items: InventoryReservationSummary[];
}>;

export type InventoryAlertListResponse = ApiSuccessResponse<{
  items: InventoryAlertSummary[];
}>;

export const inventoryApi = {
  listProducts() {
    return apiClient.get<ProductListResponse>('/products');
  },
  listProductVariants(productId: string) {
    return apiClient.get<ProductVariantListResponse>(`/products/${productId}/variants`);
  },
  listWarehouses() {
    return apiClient.get<WarehouseListResponse>('/warehouses');
  },
  listSuppliers() {
    return apiClient.get<SupplierListResponse>('/suppliers');
  },
  listBalances() {
    return apiClient.get<InventoryBalanceListResponse>('/inventory/balances');
  },
  listReservations() {
    return apiClient.get<InventoryReservationListResponse>('/inventory/reservations');
  },
  listAlerts() {
    return apiClient.get<InventoryAlertListResponse>('/inventory/alerts');
  },
};
