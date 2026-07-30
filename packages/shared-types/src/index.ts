export type ApiSuccessResponse<TData, TMeta = Record<string, never>> = {
  success: true;
  data: TData;
  meta?: TMeta;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
  requestId?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const userStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED'] as const;
export type UserStatus = (typeof userStatuses)[number];

export const organizationStatuses = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] as const;
export type OrganizationStatus = (typeof organizationStatuses)[number];

export const membershipStatuses = ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED'] as const;
export type MembershipStatus = (typeof membershipStatuses)[number];

export const workspaceStatuses = ['ACTIVE', 'ARCHIVED'] as const;
export type WorkspaceStatus = (typeof workspaceStatuses)[number];

export const customerTypes = ['INDIVIDUAL', 'COMPANY'] as const;
export type CustomerType = (typeof customerTypes)[number];

export const customerStatuses = ['ACTIVE', 'INACTIVE', 'BLOCKED'] as const;
export type CustomerStatus = (typeof customerStatuses)[number];

export const customerGroupStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type CustomerGroupStatus = (typeof customerGroupStatuses)[number];

export const discountTypes = ['PERCENTAGE', 'FIXED_AMOUNT'] as const;
export type DiscountType = (typeof discountTypes)[number];

export const locationTypes = [
  'BRANCH',
  'OFFICE',
  'HOTEL',
  'STUDIO',
  'WAREHOUSE',
  'CLINIC',
  'VENUE',
  'ONLINE',
  'OTHER',
] as const;
export type LocationType = (typeof locationTypes)[number];

export const locationStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type LocationStatus = (typeof locationStatuses)[number];

export const serviceCategoryStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ServiceCategoryStatus = (typeof serviceCategoryStatuses)[number];

export const serviceTypes = [
  'APPOINTMENT',
  'RENTAL',
  'ACCOMMODATION',
  'TRANSPORT',
  'EVENT',
  'CLASS',
  'CONSULTATION',
  'GENERAL',
] as const;
export type ServiceType = (typeof serviceTypes)[number];

export const bookingModes = [
  'TIME_SLOT',
  'DATE_RANGE',
  'SESSION',
  'CAPACITY',
  'OPEN_SCHEDULE',
] as const;
export type BookingMode = (typeof bookingModes)[number];

export const serviceStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ServiceStatus = (typeof serviceStatuses)[number];

export const resourceGroupStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ResourceGroupStatus = (typeof resourceGroupStatuses)[number];

export const resourceTypes = [
  'PERSON',
  'ROOM',
  'VEHICLE',
  'EQUIPMENT',
  'SEAT',
  'DESK',
  'FIELD',
  'VIRTUAL',
  'OTHER',
] as const;
export type ResourceType = (typeof resourceTypes)[number];

export const resourceStatuses = [
  'AVAILABLE',
  'UNAVAILABLE',
  'MAINTENANCE',
  'INACTIVE',
  'ARCHIVED',
] as const;
export type ResourceStatus = (typeof resourceStatuses)[number];

export const resourceBlockTypes = [
  'MAINTENANCE',
  'INTERNAL_USE',
  'HOLIDAY',
  'UNAVAILABLE',
  'OTHER',
] as const;
export type ResourceBlockType = (typeof resourceBlockTypes)[number];

export const bookingStatuses = [
  'DRAFT',
  'PENDING',
  'PENDING_APPROVAL',
  'CONFIRMED',
  'PARTIALLY_PAID',
  'PAID',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'EXPIRED',
  'REFUNDED',
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const bookingBlockingStatuses = [
  'PENDING_APPROVAL',
  'CONFIRMED',
  'PARTIALLY_PAID',
  'PAID',
  'CHECKED_IN',
  'IN_PROGRESS',
] as const;
export type BookingBlockingStatus = (typeof bookingBlockingStatuses)[number];

export const bookingSources = [
  'ADMIN',
  'CUSTOMER_PORTAL',
  'WALK_IN',
  'PHONE',
  'WHATSAPP',
  'API',
  'IMPORT',
] as const;
export type BookingSource = (typeof bookingSources)[number];

export const priceRuleTypes = [
  'WEEKDAY',
  'WEEKEND',
  'HOLIDAY',
  'PEAK_HOUR',
  'OFF_PEAK',
  'DATE_RANGE',
  'DURATION',
  'QUANTITY',
  'RESOURCE',
  'CUSTOMER_GROUP',
] as const;
export type PriceRuleType = (typeof priceRuleTypes)[number];

export const priceAdjustmentTypes = [
  'FIXED_PRICE',
  'FIXED_ADDITION',
  'FIXED_DISCOUNT',
  'PERCENT_ADDITION',
  'PERCENT_DISCOUNT',
] as const;
export type PriceAdjustmentType = (typeof priceAdjustmentTypes)[number];

export const priceRuleStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type PriceRuleStatus = (typeof priceRuleStatuses)[number];

export const promotionStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED'] as const;
export type PromotionStatus = (typeof promotionStatuses)[number];

export const invoiceStatuses = [
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'VOID',
  'REFUNDED',
] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export const paymentMethods = [
  'CASH',
  'BANK_TRANSFER',
  'CARD_MANUAL',
  'QRIS_MANUAL',
  'E_WALLET_MANUAL',
  'OTHER',
] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentStatuses = [
  'PENDING',
  'VERIFIED',
  'REJECTED',
  'CANCELLED',
  'REFUNDED',
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const checkInMethods = ['MANUAL', 'QR_CODE', 'SELF_SERVICE'] as const;
export type CheckInMethod = (typeof checkInMethods)[number];

export const bookingNoteTypes = ['INTERNAL', 'CUSTOMER_VISIBLE'] as const;
export type BookingNoteType = (typeof bookingNoteTypes)[number];

export const reminderChannels = ['EMAIL', 'SMS', 'WHATSAPP', 'INTERNAL'] as const;
export type ReminderChannel = (typeof reminderChannels)[number];

export const reminderStatuses = ['PENDING', 'SENT', 'FAILED', 'CANCELLED'] as const;
export type ReminderStatus = (typeof reminderStatuses)[number];

export const productCategoryStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductCategoryStatus = (typeof productCategoryStatuses)[number];

export const brandStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type BrandStatus = (typeof brandStatuses)[number];

export const uomCategories = [
  'QUANTITY',
  'WEIGHT',
  'LENGTH',
  'AREA',
  'VOLUME',
  'TIME',
  'PACKAGE',
  'OTHER',
] as const;
export type UomCategory = (typeof uomCategories)[number];

export const uomDimensions = [
  'EACH',
  'MASS',
  'LENGTH',
  'AREA',
  'VOLUME',
  'TIME',
  'CUSTOM',
] as const;
export type UomDimension = (typeof uomDimensions)[number];

export const uomStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type UomStatus = (typeof uomStatuses)[number];

export const roundingModes = ['UP', 'DOWN', 'HALF_UP', 'HALF_DOWN', 'HALF_EVEN'] as const;
export type RoundingMode = (typeof roundingModes)[number];

export const productTypes = [
  'PHYSICAL',
  'DIGITAL',
  'CONSUMABLE',
  'SERVICE_LINKED',
  'RENTAL_ITEM',
  'ASSET',
  'BUNDLE',
  'OTHER',
] as const;
export type ProductType = (typeof productTypes)[number];

export const productStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ARCHIVED'] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const inventoryTrackingTypes = ['NONE', 'QUANTITY', 'LOT', 'SERIAL'] as const;
export type InventoryTrackingType = (typeof inventoryTrackingTypes)[number];

export const productAttributeDataTypes = [
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'DATE',
  'SELECT',
  'MULTI_SELECT',
  'COLOR',
] as const;
export type ProductAttributeDataType = (typeof productAttributeDataTypes)[number];

export const productAttributeDisplayTypes = [
  'INPUT',
  'DROPDOWN',
  'RADIO',
  'CHECKBOX',
  'COLOR_SWATCH',
] as const;
export type ProductAttributeDisplayType = (typeof productAttributeDisplayTypes)[number];

export const productAttributeStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductAttributeStatus = (typeof productAttributeStatuses)[number];

export const productVariantStatuses = ['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ARCHIVED'] as const;
export type ProductVariantStatus = (typeof productVariantStatuses)[number];

export const barcodeTypes = [
  'EAN_8',
  'EAN_13',
  'UPC_A',
  'UPC_E',
  'CODE_39',
  'CODE_128',
  'ITF',
  'QR',
  'INTERNAL',
] as const;
export type BarcodeType = (typeof barcodeTypes)[number];

export const barcodeStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type BarcodeStatus = (typeof barcodeStatuses)[number];

export const productAttachmentTypes = [
  'MANUAL',
  'SPECIFICATION',
  'CERTIFICATE',
  'WARRANTY',
  'SAFETY_DATA',
  'OTHER',
] as const;
export type ProductAttachmentType = (typeof productAttachmentTypes)[number];

export const productTagStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductTagStatus = (typeof productTagStatuses)[number];

export const productBundlePricingModes = [
  'FIXED',
  'SUM_COMPONENTS',
  'SUM_COMPONENTS_WITH_DISCOUNT',
] as const;
export type ProductBundlePricingMode = (typeof productBundlePricingModes)[number];

export const productBundleStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductBundleStatus = (typeof productBundleStatuses)[number];

export const supplierStatuses = ['ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED'] as const;
export type SupplierStatus = (typeof supplierStatuses)[number];

export const productSupplierStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductSupplierStatus = (typeof productSupplierStatuses)[number];

export const warehouseTypes = [
  'MAIN',
  'BRANCH',
  'TRANSIT',
  'RETURNS',
  'QUARANTINE',
  'VIRTUAL',
  'CONSIGNMENT',
  'OTHER',
] as const;
export type WarehouseType = (typeof warehouseTypes)[number];

export const warehouseStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED'] as const;
export type WarehouseStatus = (typeof warehouseStatuses)[number];

export const warehouseZoneTypes = [
  'RECEIVING',
  'STORAGE',
  'PICKING',
  'PACKING',
  'DISPATCH',
  'RETURNS',
  'QUARANTINE',
  'COLD_STORAGE',
  'HAZARDOUS',
  'HIGH_VALUE',
  'OTHER',
] as const;
export type WarehouseZoneType = (typeof warehouseZoneTypes)[number];

export const warehouseZoneStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type WarehouseZoneStatus = (typeof warehouseZoneStatuses)[number];

export const storageLocationTypes = [
  'FLOOR',
  'AISLE',
  'RACK',
  'SHELF',
  'BIN',
  'PALLET',
  'ROOM',
  'VIRTUAL',
  'OTHER',
] as const;
export type StorageLocationType = (typeof storageLocationTypes)[number];

export const storageLocationStatuses = ['ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED'] as const;
export type StorageLocationStatus = (typeof storageLocationStatuses)[number];

export const inventoryItemStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type InventoryItemStatus = (typeof inventoryItemStatuses)[number];

export const inventoryBalanceStatuses = [
  'AVAILABLE',
  'RESERVED',
  'QUARANTINE',
  'DAMAGED',
  'EXPIRED',
  'BLOCKED',
] as const;
export type InventoryBalanceStatus = (typeof inventoryBalanceStatuses)[number];

export const inventoryLotStatuses = [
  'ACTIVE',
  'QUARANTINE',
  'RELEASED',
  'BLOCKED',
  'EXPIRED',
  'DEPLETED',
  'ARCHIVED',
] as const;
export type InventoryLotStatus = (typeof inventoryLotStatuses)[number];

export const inventorySerialStatuses = [
  'AVAILABLE',
  'RESERVED',
  'ISSUED',
  'IN_TRANSIT',
  'QUARANTINE',
  'DAMAGED',
  'RETURNED',
  'LOST',
  'SCRAPPED',
  'EXPIRED',
] as const;
export type InventorySerialStatus = (typeof inventorySerialStatuses)[number];

export const inventorySerialConditions = [
  'NEW',
  'GOOD',
  'FAIR',
  'DAMAGED',
  'REFURBISHED',
  'UNKNOWN',
] as const;
export type InventorySerialCondition = (typeof inventorySerialConditions)[number];

export const inventoryReservationSourceTypes = [
  'BOOKING',
  'SALES_ORDER',
  'RENTAL',
  'INTERNAL',
  'MANUAL',
  'OTHER',
] as const;
export type InventoryReservationSourceType = (typeof inventoryReservationSourceTypes)[number];

export const inventoryReservationStatuses = [
  'PENDING',
  'ACTIVE',
  'PARTIALLY_FULFILLED',
  'FULFILLED',
  'RELEASED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type InventoryReservationStatus = (typeof inventoryReservationStatuses)[number];

export const reorderRuleStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ReorderRuleStatus = (typeof reorderRuleStatuses)[number];

export const inventoryAlertTypes = [
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'OVERSTOCK',
  'EXPIRING_SOON',
  'EXPIRED',
  'NEGATIVE_STOCK',
  'SERIAL_MISMATCH',
  'LOT_BLOCKED',
  'LOCATION_CAPACITY',
  'DATA_INCONSISTENCY',
] as const;
export type InventoryAlertType = (typeof inventoryAlertTypes)[number];

export const inventoryAlertSeverities = ['INFO', 'WARNING', 'CRITICAL'] as const;
export type InventoryAlertSeverity = (typeof inventoryAlertSeverities)[number];

export const inventoryAlertStatuses = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'] as const;
export type InventoryAlertStatus = (typeof inventoryAlertStatuses)[number];

export const inventoryOpeningBalanceStatuses = ['DRAFT', 'POSTED', 'CANCELLED'] as const;
export type InventoryOpeningBalanceStatus = (typeof inventoryOpeningBalanceStatuses)[number];

export const inventoryMovementTypes = [
  'RECEIPT',
  'ISSUE',
  'TRANSFER',
  'INTERNAL_TRANSFER',
  'STATUS_TRANSFER',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'PUTAWAY',
  'PICK',
  'PACK',
  'DISPATCH',
  'RETURN_IN',
  'RETURN_OUT',
  'REVERSAL',
  'SYSTEM_CORRECTION',
] as const;
export type InventoryMovementType = (typeof inventoryMovementTypes)[number];

export const inventoryMovementStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ALLOCATED',
  'IN_PROGRESS',
  'PARTIALLY_COMPLETED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'REVERSED',
  'FAILED',
] as const;
export type InventoryMovementStatus = (typeof inventoryMovementStatuses)[number];

export const inventoryMovementSourceTypes = [
  'MANUAL',
  'PURCHASE_ORDER',
  'SALES_ORDER',
  'BOOKING',
  'TRANSFER',
  'CUSTOMER_RETURN',
  'SUPPLIER_RETURN',
  'OPENING_BALANCE',
  'STOCK_COUNT',
  'ADJUSTMENT',
  'PRODUCTION',
  'OTHER',
] as const;
export type InventoryMovementSourceType = (typeof inventoryMovementSourceTypes)[number];

export const movementPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type MovementPriority = (typeof movementPriorities)[number];

export const inventoryAllocationStrategies = [
  'MANUAL',
  'FIFO',
  'FEFO',
  'LIFO',
  'LOCATION_PRIORITY',
  'SERIAL_EXPLICIT',
  'LOT_EXPLICIT',
  'SYSTEM_DEFAULT',
] as const;
export type InventoryAllocationStrategy = (typeof inventoryAllocationStrategies)[number];

export const inventoryMovementAllocationStatuses = [
  'ALLOCATED',
  'PARTIALLY_FULFILLED',
  'FULFILLED',
  'RELEASED',
  'CANCELLED',
] as const;
export type InventoryMovementAllocationStatus =
  (typeof inventoryMovementAllocationStatuses)[number];

export const goodsReceiptStatuses = [
  'DRAFT',
  'EXPECTED',
  'ARRIVED',
  'RECEIVING',
  'RECEIVED',
  'INSPECTION_REQUIRED',
  'INSPECTED',
  'PARTIALLY_ACCEPTED',
  'ACCEPTED',
  'REJECTED',
  'POSTED',
  'CANCELLED',
] as const;
export type GoodsReceiptStatus = (typeof goodsReceiptStatuses)[number];

export const goodsReceiptInspectionStatuses = [
  'PENDING',
  'PASSED',
  'PARTIALLY_PASSED',
  'FAILED',
  'QUARANTINED',
] as const;
export type GoodsReceiptInspectionStatus = (typeof goodsReceiptInspectionStatuses)[number];

export const goodsIssueStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ALLOCATED',
  'PICKING',
  'PICKED',
  'PACKING',
  'PACKED',
  'ISSUED',
  'PARTIALLY_ISSUED',
  'CANCELLED',
  'REJECTED',
] as const;
export type GoodsIssueStatus = (typeof goodsIssueStatuses)[number];

export const stockTransferTypes = [
  'INTERNAL_LOCATION',
  'INTER_WAREHOUSE',
  'STATUS_CHANGE',
  'RETURN_TO_STORAGE',
  'MOVE_TO_QUARANTINE',
  'MOVE_TO_DAMAGED',
  'REPLENISHMENT',
] as const;
export type StockTransferType = (typeof stockTransferTypes)[number];

export const stockTransferStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ALLOCATED',
  'PICKING',
  'PICKED',
  'DISPATCHED',
  'IN_TRANSIT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'PUTAWAY',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
] as const;
export type StockTransferStatus = (typeof stockTransferStatuses)[number];

export const stockTransferShipmentStatuses = [
  'DRAFT',
  'READY',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
] as const;
export type StockTransferShipmentStatus = (typeof stockTransferShipmentStatuses)[number];

export const stockTransferReceiptStatuses = [
  'DRAFT',
  'RECEIVING',
  'RECEIVED',
  'DISCREPANCY',
  'POSTED',
  'CANCELLED',
] as const;
export type StockTransferReceiptStatus = (typeof stockTransferReceiptStatuses)[number];

export const stockAdjustmentTypes = [
  'INCREASE',
  'DECREASE',
  'RECLASSIFICATION',
  'DAMAGE',
  'EXPIRATION',
  'LOSS',
  'FOUND',
  'SYSTEM_CORRECTION',
] as const;
export type StockAdjustmentType = (typeof stockAdjustmentTypes)[number];

export const stockAdjustmentStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'POSTED',
  'REJECTED',
  'CANCELLED',
  'REVERSED',
] as const;
export type StockAdjustmentStatus = (typeof stockAdjustmentStatuses)[number];

export const inventoryStatusTransferStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'POSTED',
  'REJECTED',
  'CANCELLED',
] as const;
export type InventoryStatusTransferStatus = (typeof inventoryStatusTransferStatuses)[number];

export const putawayTaskStatuses = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'PARTIALLY_COMPLETED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type PutawayTaskStatus = (typeof putawayTaskStatuses)[number];

export const pickingWaveStrategies = ['SINGLE_ORDER', 'BATCH', 'ZONE', 'WAVE', 'PRIORITY'] as const;
export type PickingWaveStrategy = (typeof pickingWaveStrategies)[number];

export const pickingWaveStatuses = [
  'DRAFT',
  'RELEASED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type PickingWaveStatus = (typeof pickingWaveStatuses)[number];

export const pickingTaskStatuses = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'PARTIALLY_PICKED',
  'PICKED',
  'SHORT_PICK',
  'CANCELLED',
] as const;
export type PickingTaskStatus = (typeof pickingTaskStatuses)[number];

export const packingSessionStatuses = ['DRAFT', 'IN_PROGRESS', 'PACKED', 'CANCELLED'] as const;
export type PackingSessionStatus = (typeof packingSessionStatuses)[number];

export const dispatchRecordStatuses = ['DRAFT', 'READY', 'DISPATCHED', 'CANCELLED'] as const;
export type DispatchRecordStatus = (typeof dispatchRecordStatuses)[number];

export const inventoryAllocationStatuses = [
  'PENDING',
  'ALLOCATED',
  'PARTIALLY_ALLOCATED',
  'FULFILLED',
  'RELEASED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type InventoryAllocationStatus = (typeof inventoryAllocationStatuses)[number];

export const warehouseTaskTypes = [
  'RECEIVING',
  'INSPECTION',
  'PUTAWAY',
  'PICKING',
  'PACKING',
  'DISPATCH',
  'REPLENISHMENT',
  'COUNTING',
  'RELOCATION',
  'OTHER',
] as const;
export type WarehouseTaskType = (typeof warehouseTaskTypes)[number];

export const warehouseTaskStatuses = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'BLOCKED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type WarehouseTaskStatus = (typeof warehouseTaskStatuses)[number];

export const inventoryMovementReversalStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'POSTED',
  'REJECTED',
  'CANCELLED',
] as const;
export type InventoryMovementReversalStatus = (typeof inventoryMovementReversalStatuses)[number];

export const stockCountTypes = ['FULL', 'CYCLE', 'SPOT'] as const;
export type StockCountType = (typeof stockCountTypes)[number];

export const stockCountStatuses = [
  'DRAFT',
  'SCHEDULED',
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
  'POSTED',
  'CANCELLED',
] as const;
export type StockCountStatus = (typeof stockCountStatuses)[number];

export const stockCountScopeTypes = [
  'WAREHOUSE',
  'ZONE',
  'LOCATION',
  'CATEGORY',
  'PRODUCT',
] as const;
export type StockCountScopeType = (typeof stockCountScopeTypes)[number];

export const scanSessionStatuses = ['ACTIVE', 'COMPLETED', 'CANCELLED'] as const;
export type ScanSessionStatus = (typeof scanSessionStatuses)[number];

export const scanTypes = [
  'PRODUCT',
  'VARIANT',
  'BARCODE',
  'SERIAL',
  'LOT',
  'WAREHOUSE',
  'STORAGE_LOCATION',
  'DOCUMENT',
  'PACKAGE',
] as const;
export type ScanType = (typeof scanTypes)[number];

export const inventoryLedgerEntryTypes = [
  'OPENING_BALANCE',
  'RESERVATION_CREATED',
  'RESERVATION_RELEASED',
  'RESERVATION_FULFILLED',
  'MANUAL_INITIALIZATION',
  'SYSTEM_CORRECTION',
  'FUTURE_RECEIPT',
  'FUTURE_ISSUE',
  'FUTURE_TRANSFER',
  'GOODS_RECEIPT',
  'GOODS_ISSUE',
  'TRANSFER_OUT',
  'TRANSFER_IN',
  'TRANSFER_TRANSIT_IN',
  'TRANSFER_TRANSIT_OUT',
  'INTERNAL_TRANSFER_OUT',
  'INTERNAL_TRANSFER_IN',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'STATUS_TRANSFER_OUT',
  'STATUS_TRANSFER_IN',
  'PUTAWAY_OUT',
  'PUTAWAY_IN',
  'PICK_OUT',
  'PICK_STAGING_IN',
  'DISPATCH_OUT',
  'RETURN_IN',
  'RETURN_OUT',
  'STOCK_COUNT_ADJUSTMENT',
  'REVERSAL',
] as const;
export type InventoryLedgerEntryType = (typeof inventoryLedgerEntryTypes)[number];

export const importJobStatuses = [
  'UPLOADED',
  'PARSED',
  'VALIDATED',
  'PREVIEW_READY',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;
export type ImportJobStatus = (typeof importJobStatuses)[number];

export const exportJobStatuses = [
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type ExportJobStatus = (typeof exportJobStatuses)[number];

export const procurementRequestSourceTypes = [
  'EMPLOYEE',
  'REPLENISHMENT',
  'PROJECT',
  'MAINTENANCE',
  'CAPEX',
  'BUDGET',
  'OTHER',
] as const;
export type ProcurementRequestSourceType = (typeof procurementRequestSourceTypes)[number];

export const purchaseRequestStatuses = [
  'DRAFT',
  'SUBMITTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'SOURCING',
  'PARTIALLY_ORDERED',
  'ORDERED',
  'CANCELLED',
] as const;
export type PurchaseRequestStatus = (typeof purchaseRequestStatuses)[number];

export const rfqStatuses = [
  'DRAFT',
  'SENT',
  'RESPONSES_RECEIVED',
  'UNDER_REVIEW',
  'AWARDED',
  'CLOSED',
  'CANCELLED',
] as const;
export type RfqStatus = (typeof rfqStatuses)[number];

export const supplierQuotationStatuses = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type SupplierQuotationStatus = (typeof supplierQuotationStatuses)[number];

export const vendorComparisonStatuses = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'DECIDED',
  'CANCELLED',
] as const;
export type VendorComparisonStatus = (typeof vendorComparisonStatuses)[number];

export const purchaseOrderTypes = [
  'STANDARD',
  'BLANKET_RELEASE',
  'CONTRACT_RELEASE',
  'SPOT_BUY',
  'CAPEX',
  'SERVICE',
] as const;
export type PurchaseOrderType = (typeof purchaseOrderTypes)[number];

export const purchaseOrderStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'PARTIALLY_INVOICED',
  'INVOICED',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
] as const;
export type PurchaseOrderStatus = (typeof purchaseOrderStatuses)[number];

export const blanketOrderStatuses = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'EXPIRED',
  'CLOSED',
  'CANCELLED',
] as const;
export type BlanketOrderStatus = (typeof blanketOrderStatuses)[number];

export const purchaseContractStatuses = [
  'DRAFT',
  'ACTIVE',
  'EXPIRED',
  'CLOSED',
  'CANCELLED',
] as const;
export type PurchaseContractStatus = (typeof purchaseContractStatuses)[number];

export const purchaseApprovalStatuses = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ESCALATED',
  'CANCELLED',
] as const;
export type PurchaseApprovalStatus = (typeof purchaseApprovalStatuses)[number];

export const purchaseReceiptStatuses = [
  'PENDING',
  'READY_FOR_RECEIPT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CLOSED',
  'CANCELLED',
] as const;
export type PurchaseReceiptStatus = (typeof purchaseReceiptStatuses)[number];

export const purchaseInvoicePreparationStatuses = [
  'PENDING',
  'READY',
  'PARTIALLY_PREPARED',
  'PREPARED',
  'BLOCKED',
  'CANCELLED',
] as const;
export type PurchaseInvoicePreparationStatus = (typeof purchaseInvoicePreparationStatuses)[number];

export const vendorRatingLevels = [
  'PREFERRED',
  'APPROVED',
  'CONDITIONAL',
  'WATCHLIST',
  'BLOCKED',
] as const;
export type VendorRatingLevel = (typeof vendorRatingLevels)[number];

export const vendorLeadTimeTrends = ['IMPROVING', 'STABLE', 'WORSENING'] as const;
export type VendorLeadTimeTrend = (typeof vendorLeadTimeTrends)[number];

export const leadSources = [
  'WEBSITE',
  'PHONE',
  'EMAIL',
  'WHATSAPP',
  'REFERRAL',
  'CAMPAIGN',
  'WALK_IN',
  'IMPORT',
  'MANUAL',
] as const;
export type LeadSource = (typeof leadSources)[number];

export const leadStatuses = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'NURTURING',
  'PROPOSAL_READY',
  'CONVERTED',
  'LOST',
  'ARCHIVED',
] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const opportunityStages = [
  'DISCOVERY',
  'QUALIFICATION',
  'SOLUTION_FIT',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'ON_HOLD',
] as const;
export type OpportunityStage = (typeof opportunityStages)[number];

export const dealStages = [
  'PIPELINE',
  'PROPOSAL',
  'NEGOTIATION',
  'VERBAL_COMMIT',
  'WON',
  'LOST',
  'CANCELLED',
] as const;
export type DealStage = (typeof dealStages)[number];

export const salesActivityTypes = [
  'NOTE',
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'MEETING',
  'TASK',
  'REMINDER',
  'FOLLOW_UP',
] as const;
export type SalesActivityType = (typeof salesActivityTypes)[number];

export const salesActivityStatuses = [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'MISSED',
  'CANCELLED',
] as const;
export type SalesActivityStatus = (typeof salesActivityStatuses)[number];

export const callLogOutcomes = [
  'NO_ANSWER',
  'CONNECTED',
  'CALLBACK_REQUESTED',
  'VOICEMAIL',
  'INTERESTED',
  'NOT_INTERESTED',
] as const;
export type CallLogOutcome = (typeof callLogOutcomes)[number];

export const salesCommunicationChannels = ['EMAIL', 'WHATSAPP'] as const;
export type SalesCommunicationChannel = (typeof salesCommunicationChannels)[number];

export const salesCommunicationStatuses = [
  'DRAFT',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'BOUNCED',
] as const;
export type SalesCommunicationStatus = (typeof salesCommunicationStatuses)[number];

export const salesQuotationStatuses = [
  'DRAFT',
  'SENT',
  'VIEWED',
  'NEGOTIATING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CONVERTED',
  'CANCELLED',
] as const;
export type SalesQuotationStatus = (typeof salesQuotationStatuses)[number];

export const salesPipelineStages = [
  'LEAD',
  'OPPORTUNITY',
  'QUOTATION',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const;
export type SalesPipelineStage = (typeof salesPipelineStages)[number];

export const salesPipelineStatuses = ['ACTIVE', 'PAUSED', 'ARCHIVED'] as const;
export type SalesPipelineStatus = (typeof salesPipelineStatuses)[number];

export const salesTaskPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type SalesTaskPriority = (typeof salesTaskPriorities)[number];

export const followUpStatuses = [
  'PLANNED',
  'DUE_TODAY',
  'COMPLETED',
  'MISSED',
  'CANCELLED',
] as const;
export type FollowUpStatus = (typeof followUpStatuses)[number];

export const meetingStatuses = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
] as const;
export type MeetingStatus = (typeof meetingStatuses)[number];

export const customerTimelineEventTypes = [
  'LEAD_CREATED',
  'LEAD_QUALIFIED',
  'OPPORTUNITY_ADVANCED',
  'DEAL_UPDATED',
  'CALL_LOGGED',
  'EMAIL_SENT',
  'WHATSAPP_SENT',
  'QUOTATION_SENT',
  'TASK_CREATED',
  'FOLLOW_UP_SCHEDULED',
  'MEETING_HELD',
] as const;
export type CustomerTimelineEventType = (typeof customerTimelineEventTypes)[number];

export const salesDashboardPeriods = [
  'THIS_WEEK',
  'THIS_MONTH',
  'THIS_QUARTER',
  'THIS_YEAR',
] as const;
export type SalesDashboardPeriod = (typeof salesDashboardPeriods)[number];

export const portalDashboardPeriods = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_QUARTER'] as const;
export type PortalDashboardPeriod = (typeof portalDashboardPeriods)[number];

export const supportTicketStatuses = [
  'OPEN',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'CLOSED',
] as const;
export type SupportTicketStatus = (typeof supportTicketStatuses)[number];

export const supportTicketPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type SupportTicketPriority = (typeof supportTicketPriorities)[number];

export const supportTicketChannels = ['PORTAL', 'EMAIL', 'WHATSAPP', 'PHONE'] as const;
export type SupportTicketChannel = (typeof supportTicketChannels)[number];

export const supportTicketCategories = [
  'BOOKING',
  'ORDER',
  'INVOICE',
  'PAYMENT',
  'TECHNICAL',
  'DOCUMENT',
  'GENERAL',
] as const;
export type SupportTicketCategory = (typeof supportTicketCategories)[number];

export const downloadAssetTypes = [
  'INVOICE_PDF',
  'BOOKING_VOUCHER',
  'DELIVERY_PROOF',
  'PAYMENT_RECEIPT',
  'STATEMENT',
  'GENERAL_DOCUMENT',
] as const;
export type DownloadAssetType = (typeof downloadAssetTypes)[number];

export const downloadAssetStatuses = ['AVAILABLE', 'GENERATING', 'EXPIRED', 'ARCHIVED'] as const;
export type DownloadAssetStatus = (typeof downloadAssetStatuses)[number];

export const portalNotificationStatuses = ['UNREAD', 'READ', 'ARCHIVED'] as const;
export type PortalNotificationStatus = (typeof portalNotificationStatuses)[number];

export const portalNotificationChannels = ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'] as const;
export type PortalNotificationChannel = (typeof portalNotificationChannels)[number];

export const portalTrackingEntityTypes = [
  'BOOKING',
  'ORDER',
  'INVOICE',
  'PAYMENT',
  'SHIPMENT',
  'TICKET',
] as const;
export type PortalTrackingEntityType = (typeof portalTrackingEntityTypes)[number];

export const portalTrackingEventStatuses = [
  'SCHEDULED',
  'ACTIVE',
  'COMPLETED',
  'EXCEPTION',
] as const;
export type PortalTrackingEventStatus = (typeof portalTrackingEventStatuses)[number];

export const accountTypes = [
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
  'CONTRA_ASSET',
  'CONTRA_LIABILITY',
  'CONTRA_REVENUE',
  'MEMORANDUM',
] as const;
export type AccountType = (typeof accountTypes)[number];

export const accountNormalBalances = ['DEBIT', 'CREDIT'] as const;
export type AccountNormalBalance = (typeof accountNormalBalances)[number];

export const accountStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export const journalEntryStatuses = [
  'DRAFT',
  'BALANCED',
  'POSTED',
  'REVERSED',
  'CANCELLED',
] as const;
export type JournalEntryStatus = (typeof journalEntryStatuses)[number];

export const postingBatchStatuses = ['DRAFT', 'READY', 'POSTED', 'FAILED', 'REVERSED'] as const;
export type PostingBatchStatus = (typeof postingBatchStatuses)[number];

export const accountingVoucherStatuses = ['DRAFT', 'APPROVED', 'POSTED', 'VOID'] as const;
export type AccountingVoucherStatus = (typeof accountingVoucherStatuses)[number];

export const bankAccountStatuses = ['ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED'] as const;
export type BankAccountStatus = (typeof bankAccountStatuses)[number];

export const bankAccountTypes = ['OPERATING', 'PAYROLL', 'SAVINGS', 'CLEARING', 'VIRTUAL'] as const;
export type BankAccountType = (typeof bankAccountTypes)[number];

export const cashAccountStatuses = ['ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED'] as const;
export type CashAccountStatus = (typeof cashAccountStatuses)[number];

export const cashAccountTypes = ['PETTY_CASH', 'CASH_ON_HAND', 'CASH_DRAWER', 'FLOAT'] as const;
export type CashAccountType = (typeof cashAccountTypes)[number];

export const budgetPlanStatuses = ['DRAFT', 'ACTIVE', 'LOCKED', 'CLOSED', 'ARCHIVED'] as const;
export type BudgetPlanStatus = (typeof budgetPlanStatuses)[number];

export const fixedAssetStatuses = [
  'DRAFT',
  'ACTIVE',
  'IN_SERVICE',
  'DEPRECIATING',
  'FULLY_DEPRECIATED',
  'DISPOSED',
  'ARCHIVED',
] as const;
export type FixedAssetStatus = (typeof fixedAssetStatuses)[number];

export const fixedAssetCategories = [
  'BUILDING',
  'VEHICLE',
  'MACHINERY',
  'EQUIPMENT',
  'IT_DEVICE',
  'FURNITURE',
  'LEASEHOLD_IMPROVEMENT',
  'OTHER',
] as const;
export type FixedAssetCategory = (typeof fixedAssetCategories)[number];

export const depreciationMethods = [
  'STRAIGHT_LINE',
  'DECLINING_BALANCE',
  'UNITS_OF_PRODUCTION',
] as const;
export type DepreciationMethod = (typeof depreciationMethods)[number];

export const depreciationRunStatuses = [
  'DRAFT',
  'SCHEDULED',
  'POSTED',
  'REVERSED',
  'CANCELLED',
] as const;
export type DepreciationRunStatus = (typeof depreciationRunStatuses)[number];

export const costCenterStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type CostCenterStatus = (typeof costCenterStatuses)[number];

export const fiscalYearStatuses = ['DRAFT', 'OPEN', 'SOFT_CLOSED', 'CLOSED', 'ARCHIVED'] as const;
export type FiscalYearStatus = (typeof fiscalYearStatuses)[number];

export const currencyStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type CurrencyStatus = (typeof currencyStatuses)[number];

export const exchangeRateTypes = ['SPOT', 'CORPORATE', 'BUDGET', 'MONTH_END', 'AVERAGE'] as const;
export type ExchangeRateType = (typeof exchangeRateTypes)[number];

export const financialStatementTypes = [
  'BALANCE_SHEET',
  'PROFIT_LOSS',
  'CASH_FLOW',
  'TRIAL_BALANCE',
  'GENERAL_LEDGER',
] as const;
export type FinancialStatementType = (typeof financialStatementTypes)[number];

export const employeeStatuses = [
  'ONBOARDING',
  'ACTIVE',
  'ON_LEAVE',
  'INACTIVE',
  'TERMINATED',
] as const;
export type EmployeeStatus = (typeof employeeStatuses)[number];

export const employeeEmploymentTypes = [
  'PERMANENT',
  'CONTRACT',
  'PROBATION',
  'INTERN',
  'OUTSOURCE',
] as const;
export type EmployeeEmploymentType = (typeof employeeEmploymentTypes)[number];

export const departmentStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type DepartmentStatus = (typeof departmentStatuses)[number];

export const attendanceStatuses = [
  'PRESENT',
  'LATE',
  'ABSENT',
  'LEAVE',
  'REMOTE',
  'HOLIDAY',
] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];

export const leaveRequestStatuses = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'TAKEN',
] as const;
export type LeaveRequestStatus = (typeof leaveRequestStatuses)[number];

export const leaveTypes = [
  'ANNUAL',
  'SICK',
  'UNPAID',
  'MATERNITY',
  'PATERNITY',
  'BEREAVEMENT',
  'OTHER',
] as const;
export type LeaveType = (typeof leaveTypes)[number];

export const payrollStatuses = [
  'DRAFT',
  'CALCULATED',
  'APPROVED',
  'POSTED',
  'PAID',
  'CANCELLED',
] as const;
export type PayrollStatus = (typeof payrollStatuses)[number];

export const payrollFrequencies = ['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const;
export type PayrollFrequency = (typeof payrollFrequencies)[number];

export const shiftStatuses = ['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;
export type ShiftStatus = (typeof shiftStatuses)[number];

export const recruitmentStages = [
  'SOURCING',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;
export type RecruitmentStage = (typeof recruitmentStages)[number];

export const candidateStatuses = [
  'NEW',
  'IN_REVIEW',
  'SHORTLISTED',
  'OFFERED',
  'HIRED',
  'REJECTED',
] as const;
export type CandidateStatus = (typeof candidateStatuses)[number];

export const performanceReviewStatuses = [
  'DRAFT',
  'IN_PROGRESS',
  'CALIBRATING',
  'COMPLETED',
  'ACKNOWLEDGED',
] as const;
export type PerformanceReviewStatus = (typeof performanceReviewStatuses)[number];

export const trainingStatuses = [
  'DRAFT',
  'PUBLISHED',
  'OPEN',
  'ONGOING',
  'COMPLETED',
  'ARCHIVED',
] as const;
export type TrainingStatus = (typeof trainingStatuses)[number];

export const kpiStatuses = ['DRAFT', 'ACTIVE', 'REVIEW', 'CLOSED', 'ARCHIVED'] as const;
export type KpiStatus = (typeof kpiStatuses)[number];

export const organizationChartNodeTypes = [
  'COMPANY',
  'DIVISION',
  'DEPARTMENT',
  'TEAM',
  'POSITION',
  'EMPLOYEE',
] as const;
export type OrganizationChartNodeType = (typeof organizationChartNodeTypes)[number];

export const billOfMaterialStatuses = [
  'DRAFT',
  'ACTIVE',
  'EFFECTIVE',
  'OBSOLETE',
  'ARCHIVED',
] as const;
export type BillOfMaterialStatus = (typeof billOfMaterialStatuses)[number];

export const bomLineTypes = ['COMPONENT', 'SUBASSEMBLY', 'BYPRODUCT', 'CONSUMABLE'] as const;
export type BomLineType = (typeof bomLineTypes)[number];

export const productionStatuses = [
  'PLANNED',
  'RELEASED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CLOSED',
  'CANCELLED',
] as const;
export type ProductionStatus = (typeof productionStatuses)[number];

export const workOrderStatuses = [
  'DRAFT',
  'RELEASED',
  'READY',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type WorkOrderStatus = (typeof workOrderStatuses)[number];

export const routingStatuses = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;
export type RoutingStatus = (typeof routingStatuses)[number];

export const routingOperationTypes = [
  'CUTTING',
  'ASSEMBLY',
  'MACHINING',
  'PACKAGING',
  'INSPECTION',
  'CUSTOM',
] as const;
export type RoutingOperationType = (typeof routingOperationTypes)[number];

export const machineStatuses = [
  'AVAILABLE',
  'SETUP',
  'RUNNING',
  'MAINTENANCE',
  'DOWN',
  'RETIRED',
] as const;
export type MachineStatus = (typeof machineStatuses)[number];

export const machineTypes = [
  'CNC',
  'ASSEMBLY_LINE',
  'PACKAGING',
  'UTILITY',
  'QA_EQUIPMENT',
  'OTHER',
] as const;
export type MachineType = (typeof machineTypes)[number];

export const maintenanceStatuses = [
  'PLANNED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type MaintenanceStatus = (typeof maintenanceStatuses)[number];

export const maintenanceTypes = ['PREVENTIVE', 'CORRECTIVE', 'CALIBRATION', 'BREAKDOWN'] as const;
export type MaintenanceType = (typeof maintenanceTypes)[number];

export const qualityControlStatuses = [
  'PENDING',
  'IN_INSPECTION',
  'PASSED',
  'FAILED',
  'REWORK',
  'SCRAPPED',
] as const;
export type QualityControlStatus = (typeof qualityControlStatuses)[number];

export const qualityDecisionTypes = ['ACCEPT', 'REJECT', 'REWORK', 'SORT'] as const;
export type QualityDecisionType = (typeof qualityDecisionTypes)[number];

export const scrapReasonTypes = [
  'PROCESS_LOSS',
  'SETUP_LOSS',
  'QUALITY_REJECT',
  'MATERIAL_DEFECT',
  'BREAKDOWN',
  'OTHER',
] as const;
export type ScrapReasonType = (typeof scrapReasonTypes)[number];

export const productionPlanningStatuses = [
  'DRAFT',
  'CONFIRMED',
  'RELEASED',
  'LOCKED',
  'ARCHIVED',
] as const;
export type ProductionPlanningStatus = (typeof productionPlanningStatuses)[number];

export const mrpStatuses = ['DRAFT', 'RUNNING', 'COMPLETED', 'EXCEPTION', 'CANCELLED'] as const;
export type MrpStatus = (typeof mrpStatuses)[number];

export const mrpExceptionTypes = [
  'SHORTAGE',
  'EXPEDITE',
  'RESCHEDULE_IN',
  'RESCHEDULE_OUT',
  'EXCESS',
] as const;
export type MrpExceptionType = (typeof mrpExceptionTypes)[number];

export const capacityPlanningStatuses = [
  'DRAFT',
  'BALANCED',
  'OVERLOADED',
  'UNDERUTILIZED',
  'PUBLISHED',
] as const;
export type CapacityPlanningStatus = (typeof capacityPlanningStatuses)[number];

export const aiRequestStatuses = [
  'DRAFT',
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'ARCHIVED',
] as const;
export type AiRequestStatus = (typeof aiRequestStatuses)[number];

export const aiConversationRoles = ['SYSTEM', 'USER', 'ASSISTANT'] as const;
export type AiConversationRole = (typeof aiConversationRoles)[number];

export const aiInsightTypes = [
  'ANSWER',
  'SUMMARY',
  'SEARCH',
  'REPORT',
  'FORECAST',
  'RECOMMENDATION',
  'ANOMALY',
] as const;
export type AiInsightType = (typeof aiInsightTypes)[number];

export const aiRecommendationPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type AiRecommendationPriority = (typeof aiRecommendationPriorities)[number];

export const aiForecastHorizons = ['7_DAYS', '30_DAYS', '90_DAYS', '12_MONTHS'] as const;
export type AiForecastHorizon = (typeof aiForecastHorizons)[number];

export const aiSearchDomains = [
  'ERP',
  'INVENTORY',
  'FINANCE',
  'CRM',
  'PROCUREMENT',
  'SALES',
  'ACCOUNTING',
  'HR',
  'MANUFACTURING',
  'ANALYTICS',
] as const;
export type AiSearchDomain = (typeof aiSearchDomains)[number];

export const aiReportTypes = [
  'EXECUTIVE_SUMMARY',
  'OPERATIONS_BRIEF',
  'EXCEPTION_DIGEST',
  'DOMAIN_RECAP',
  'COMPARISON_REPORT',
] as const;
export type AiReportType = (typeof aiReportTypes)[number];

export const aiModelModes = ['RULE_BASED', 'LLM_ASSISTED', 'HYBRID'] as const;
export type AiModelMode = (typeof aiModelModes)[number];

export const aiCopilotIntentTypes = [
  'SALES_REPORT',
  'REPLENISHMENT_RECOMMENDATION',
  'CASH_FLOW_BRIEF',
  'PROCUREMENT_ACTION',
] as const;
export type AiCopilotIntentType = (typeof aiCopilotIntentTypes)[number];

export const aiCopilotExecutionStatuses = [
  'SAFE_QUERY_READY',
  'DRAFT_ACTION_READY',
  'REVIEW_NEEDED',
] as const;
export type AiCopilotExecutionStatus = (typeof aiCopilotExecutionStatuses)[number];

export const aiCopilotExportFormats = ['PDF', 'EXCEL', 'DASHBOARD_LINK'] as const;
export type AiCopilotExportFormat = (typeof aiCopilotExportFormats)[number];

export const aiOcrDocumentTypes = ['INVOICE', 'RECEIPT', 'PURCHASE_ORDER', 'GENERAL'] as const;
export type AiOcrDocumentType = (typeof aiOcrDocumentTypes)[number];

export const aiDocumentReviewTypes = [
  'CONTRACT',
  'AGREEMENT',
  'NDA',
  'PURCHASE_ORDER',
  'INVOICE',
] as const;
export type AiDocumentReviewType = (typeof aiDocumentReviewTypes)[number];

export const aiDocumentConfidenceBands = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type AiDocumentConfidenceBand = (typeof aiDocumentConfidenceBands)[number];

export const aiDocumentSaveStatuses = ['READY_TO_SAVE', 'REVIEW_NEEDED'] as const;
export type AiDocumentSaveStatus = (typeof aiDocumentSaveStatuses)[number];

export const aiDocumentReviewStatuses = [
  'DRAFT',
  'PENDING_SIGNATURE',
  'ACTIVE',
  'EXPIRING',
  'REVIEW_NEEDED',
  'CLOSED',
] as const;
export type AiDocumentReviewStatus = (typeof aiDocumentReviewStatuses)[number];

export const aiVisionScanModes = ['RACK', 'WAREHOUSE', 'FACE_ATTENDANCE', 'PPE'] as const;
export type AiVisionScanMode = (typeof aiVisionScanModes)[number];

export const aiVisionDetectionTypes = [
  'LOCATION',
  'PRODUCT',
  'QUANTITY',
  'BARCODE',
  'QR',
  'LOT',
  'SERIAL',
  'FACE',
  'HELMET',
  'MASK',
  'SAFETY_SHOES',
  'VEST',
] as const;
export type AiVisionDetectionType = (typeof aiVisionDetectionTypes)[number];

export const aiVisionResultStatuses = ['MATCHED', 'REVIEW_NEEDED', 'ALERT'] as const;
export type AiVisionResultStatus = (typeof aiVisionResultStatuses)[number];

export const aiVoiceIntentTypes = [
  'CREATE_PURCHASE_ORDER',
  'CREATE_PURCHASE_REQUEST',
  'CHECK_STOCK',
  'LOOKUP_INVOICE',
] as const;
export type AiVoiceIntentType = (typeof aiVoiceIntentTypes)[number];

export const aiVoiceExecutionStatuses = [
  'DRAFT_CREATED',
  'CONFIRMATION_REQUIRED',
  'ROUTED_TO_WORKSPACE',
] as const;
export type AiVoiceExecutionStatus = (typeof aiVoiceExecutionStatuses)[number];

export const aiVoiceConfirmationModes = [
  'VOICE_CONFIRMATION',
  'PIN_CONFIRMATION',
  'MANAGER_APPROVAL',
] as const;
export type AiVoiceConfirmationMode = (typeof aiVoiceConfirmationModes)[number];

export const aiMeetingTypes = [
  'PROCUREMENT_REVIEW',
  'SALES_SYNC',
  'OPERATIONS_STANDUP',
  'EXECUTIVE_SYNC',
] as const;
export type AiMeetingType = (typeof aiMeetingTypes)[number];

export const aiMeetingArtifactStatuses = ['READY_TO_SHARE', 'REVIEW_NEEDED'] as const;
export type AiMeetingArtifactStatus = (typeof aiMeetingArtifactStatuses)[number];

export const approvalFlowStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'] as const;
export type ApprovalFlowStatus = (typeof approvalFlowStatuses)[number];

export const approvalRequestStatuses = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ESCALATED',
  'CANCELLED',
] as const;
export type ApprovalRequestStatus = (typeof approvalRequestStatuses)[number];

export const automationRuleStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'] as const;
export type AutomationRuleStatus = (typeof automationRuleStatuses)[number];

export const automationTriggerTypes = [
  'DOCUMENT_CREATED',
  'STATUS_CHANGED',
  'APPROVAL_REQUESTED',
  'REMINDER_DUE',
  'WEBHOOK_RECEIVED',
  'CRON_TICK',
] as const;
export type AutomationTriggerType = (typeof automationTriggerTypes)[number];

export const automationConditionOperators = [
  'EQUALS',
  'NOT_EQUALS',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'CONTAINS',
  'IN',
] as const;
export type AutomationConditionOperator = (typeof automationConditionOperators)[number];

export const automationActionTypes = [
  'CREATE_APPROVAL',
  'SEND_REMINDER',
  'CALL_WEBHOOK',
  'SEND_EMAIL',
  'SEND_WHATSAPP',
  'SEND_SLACK',
  'SEND_DISCORD',
  'CREATE_TASK',
] as const;
export type AutomationActionType = (typeof automationActionTypes)[number];

export const automationRunStatuses = [
  'QUEUED',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
] as const;
export type AutomationRunStatus = (typeof automationRunStatuses)[number];

export const automationChannelTypes = ['EMAIL', 'WHATSAPP', 'SLACK', 'DISCORD', 'WEBHOOK'] as const;
export type AutomationChannelType = (typeof automationChannelTypes)[number];

export const cronFrequencies = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as const;
export type CronFrequency = (typeof cronFrequencies)[number];

export const selfServeBuilderStatuses = ['DRAFT', 'READY', 'REVIEW_NEEDED'] as const;
export type SelfServeBuilderStatus = (typeof selfServeBuilderStatuses)[number];

export const enterpriseCloudTenancyModes = [
  'SHARED_SAAS',
  'DEDICATED_ENTERPRISE',
  'HYBRID_RESIDENCY',
] as const;
export type EnterpriseCloudTenancyMode = (typeof enterpriseCloudTenancyModes)[number];

export const enterpriseCloudRegionStrategies = [
  'SINGLE_REGION',
  'ACTIVE_PASSIVE_MULTI_REGION',
  'ACTIVE_ACTIVE_MULTI_REGION',
] as const;
export type EnterpriseCloudRegionStrategy = (typeof enterpriseCloudRegionStrategies)[number];

export const enterpriseCloudServiceLanes = [
  'SUBSCRIPTION',
  'BILLING',
  'USAGE',
  'TENANT',
  'REGION',
  'BACKUP',
  'RESTORE',
  'MONITORING',
  'AUDIT',
  'SECURITY',
  'CDN',
  'STORAGE',
  'QUEUE',
  'WORKER',
  'SCALING',
] as const;
export type EnterpriseCloudServiceLane = (typeof enterpriseCloudServiceLanes)[number];

export const devOpsDeploymentTargets = ['DOCKER_COMPOSE', 'KUBERNETES', 'HYBRID_EDGE'] as const;
export type DevOpsDeploymentTarget = (typeof devOpsDeploymentTargets)[number];

export const devOpsPipelineProviders = ['GITHUB_ACTIONS', 'GITLAB_CI', 'HYBRID_CI'] as const;
export type DevOpsPipelineProvider = (typeof devOpsPipelineProviders)[number];

export const devOpsObservabilityTools = [
  'GRAFANA',
  'PROMETHEUS',
  'ELK',
  'SENTRY',
  'OPENTELEMETRY',
] as const;
export type DevOpsObservabilityTool = (typeof devOpsObservabilityTools)[number];

export const enterpriseSecurityTrustModes = [
  'ZERO_TRUST_FOUNDATION',
  'ADAPTIVE_ENTERPRISE',
  'SOVEREIGN_REGULATED',
] as const;
export type EnterpriseSecurityTrustMode = (typeof enterpriseSecurityTrustModes)[number];

export const enterpriseSecurityIdentityModes = [
  'MFA_AND_PASSKEY',
  'SSO_FEDERATION',
  'WORKFORCE_DEVICE_POSTURE',
] as const;
export type EnterpriseSecurityIdentityMode = (typeof enterpriseSecurityIdentityModes)[number];

export const enterpriseSecurityFrameworks = [
  'SOC2_READY',
  'ISO27001_READY',
  'GDPR',
  'PDPA',
] as const;
export type EnterpriseSecurityFramework = (typeof enterpriseSecurityFrameworks)[number];

export const novaOsStudios = [
  'VISUAL_WORKFLOW_STUDIO',
  'AI_STUDIO',
  'EXTENSION_MARKETPLACE',
  'THEME_BUILDER',
  'WHITE_LABEL',
  'EVENT_BUS',
  'PLUGIN_SDK',
  'API_GATEWAY',
  'REALTIME_COLLABORATION',
  'OFFLINE_FIRST_SYNC',
  'OBSERVABILITY_CENTER',
  'FEATURE_FLAGS',
  'TENANT_MIGRATION',
] as const;
export type NovaOsStudio = (typeof novaOsStudios)[number];

export const novaOsDeploymentModes = [
  'SINGLE_CONTROL_PLANE',
  'MULTI_REGION_FABRIC',
  'SOVEREIGN_FABRIC',
] as const;
export type NovaOsDeploymentMode = (typeof novaOsDeploymentModes)[number];

export const novaOsCollaborationModes = [
  'ASYNC_REVIEW',
  'LIVE_MULTIPLAYER',
  'HYBRID_SESSION',
] as const;
export type NovaOsCollaborationMode = (typeof novaOsCollaborationModes)[number];

export const globalEnterpriseScaleDimensions = [
  'COMPANY',
  'BRANCH',
  'USER',
  'WAREHOUSE',
  'STORE',
  'CURRENCY',
  'LANGUAGE',
  'THEME',
] as const;
export type GlobalEnterpriseScaleDimension = (typeof globalEnterpriseScaleDimensions)[number];

export const globalEnterpriseDeploymentModels = [
  'SHARED_CONTROL_PLANE',
  'REGIONAL_PARTITION',
  'GLOBAL_FEDERATION',
] as const;
export type GlobalEnterpriseDeploymentModel = (typeof globalEnterpriseDeploymentModels)[number];

export const globalEnterpriseTopologyModes = [
  'HUB_AND_SPOKE',
  'REGIONAL_HUBS',
  'SOVEREIGN_PODS',
] as const;
export type GlobalEnterpriseTopologyMode = (typeof globalEnterpriseTopologyModes)[number];

export const pluginMarketplaceVerticals = [
  'POS',
  'HOTEL',
  'HOSPITAL',
  'SCHOOL',
  'RESTAURANT',
  'LAUNDRY',
  'RENTAL',
  'GYM',
  'SALON',
  'CLINIC',
] as const;
export type PluginMarketplaceVertical = (typeof pluginMarketplaceVerticals)[number];

export const pluginMarketplacePackageTypes = [
  'VERTICAL_APP',
  'WORKFLOW_ADDON',
  'UI_EXTENSION',
  'DATA_BRIDGE',
] as const;
export type PluginMarketplacePackageType = (typeof pluginMarketplacePackageTypes)[number];

export const pluginMarketplaceInstallScopes = ['TENANT', 'COMPANY', 'BRANCH'] as const;
export type PluginMarketplaceInstallScope = (typeof pluginMarketplaceInstallScopes)[number];

export const publicApiProtocols = ['REST', 'GRAPHQL', 'WEBHOOK', 'SDK'] as const;
export type PublicApiProtocol = (typeof publicApiProtocols)[number];

export const publicApiSdkLanguages = [
  'JAVASCRIPT',
  'TYPESCRIPT',
  'PYTHON',
  'JAVA',
  'PHP',
  'GO',
  'CSHARP',
  'DART',
  'SWIFT',
  'KOTLIN',
] as const;
export type PublicApiSdkLanguage = (typeof publicApiSdkLanguages)[number];

export const publicApiAuthModes = ['API_KEY', 'OAUTH2', 'SERVICE_TOKEN'] as const;
export type PublicApiAuthMode = (typeof publicApiAuthModes)[number];

export const biWidgetTypes = [
  'CHART',
  'PIVOT',
  'HEATMAP',
  'TREEMAP',
  'MAP',
  'GAUGE',
  'FORECAST',
] as const;
export type BiWidgetType = (typeof biWidgetTypes)[number];

export const biDashboardLayoutModes = ['GRID', 'FREEFORM', 'FOCUS_BOARD'] as const;
export type BiDashboardLayoutMode = (typeof biDashboardLayoutModes)[number];

export const workflowBuilderEventKeys = [
  'PURCHASE_ORDER_APPROVED',
  'PURCHASE_REQUEST_APPROVED',
  'INVOICE_OVERDUE',
  'STOCK_BELOW_THRESHOLD',
  'CONTRACT_EXPIRING',
] as const;
export type WorkflowBuilderEventKey = (typeof workflowBuilderEventKeys)[number];

export const workflowBuilderStepTypes = [
  'EMAIL',
  'WHATSAPP',
  'SLACK',
  'CREATE_INVOICE',
  'GENERATE_PDF',
  'UPLOAD_DRIVE',
  'NOTIFY_MANAGER',
  'CREATE_TASK',
  'WEBHOOK',
] as const;
export type WorkflowBuilderStepType = (typeof workflowBuilderStepTypes)[number];

export const workflowBuilderExecutionModes = ['SEQUENTIAL', 'PARALLEL', 'CONDITIONAL'] as const;
export type WorkflowBuilderExecutionMode = (typeof workflowBuilderExecutionModes)[number];

export const formBuilderArtifactTypes = [
  'FORM',
  'SURVEY',
  'APPROVAL',
  'CHECKLIST',
  'INSPECTION',
  'CUSTOM_MODULE',
] as const;
export type FormBuilderArtifactType = (typeof formBuilderArtifactTypes)[number];

export const formBuilderFieldTypes = [
  'SHORT_TEXT',
  'LONG_TEXT',
  'NUMBER',
  'DATE',
  'SELECT',
  'MULTI_SELECT',
  'CHECKBOX',
  'SIGNATURE',
  'PHOTO',
  'APPROVAL_STATUS',
] as const;
export type FormBuilderFieldType = (typeof formBuilderFieldTypes)[number];

export const formBuilderLayoutModes = ['SINGLE_COLUMN', 'TWO_COLUMN', 'STEPPER'] as const;
export type FormBuilderLayoutMode = (typeof formBuilderLayoutModes)[number];

export const reportBuilderBlockTypes = [
  'SELECT',
  'FILTER',
  'GROUP',
  'SORT',
  'JOIN',
  'EXPORT',
] as const;
export type ReportBuilderBlockType = (typeof reportBuilderBlockTypes)[number];

export const reportBuilderJoinTypes = ['INNER', 'LEFT', 'RIGHT'] as const;
export type ReportBuilderJoinType = (typeof reportBuilderJoinTypes)[number];

export const reportBuilderExportFormats = ['PDF', 'XLSX', 'CSV'] as const;
export type ReportBuilderExportFormat = (typeof reportBuilderExportFormats)[number];

export const lowCodeComponentTypes = [
  'TABLE',
  'BUTTON',
  'CHART',
  'MAP',
  'CALENDAR',
  'INPUT',
  'FORM',
  'TREE',
  'KANBAN',
  'GALLERY',
] as const;
export type LowCodeComponentType = (typeof lowCodeComponentTypes)[number];

export const lowCodeLayoutModes = ['CANVAS', 'MASTER_DETAIL', 'OPS_CONSOLE'] as const;
export type LowCodeLayoutMode = (typeof lowCodeLayoutModes)[number];

export const lowCodeSurfaceTargets = ['DESKTOP', 'TABLET', 'PORTAL'] as const;
export type LowCodeSurfaceTarget = (typeof lowCodeSurfaceTargets)[number];

export const dashboardBuilderWidgetTypes = [
  'CHART',
  'METRIC',
  'CARD',
  'GAUGE',
  'MAP',
  'TIMELINE',
  'CALENDAR',
  'KANBAN',
] as const;
export type DashboardBuilderWidgetType = (typeof dashboardBuilderWidgetTypes)[number];

export const dashboardBuilderLayoutModes = ['GRID', 'FOCUS_BOARD', 'OPS_WALL'] as const;
export type DashboardBuilderLayoutMode = (typeof dashboardBuilderLayoutModes)[number];

export const dashboardBuilderRefreshCadences = ['LIVE', 'HOURLY', 'DAILY'] as const;
export type DashboardBuilderRefreshCadence = (typeof dashboardBuilderRefreshCadences)[number];

export const ruleEngineFactTypes = [
  'STOCK_ON_HAND',
  'INVOICE_TOTAL',
  'PURCHASE_REQUEST_TOTAL',
  'LEAD_TIME_DAYS',
  'PAYMENT_DELAY_DAYS',
] as const;
export type RuleEngineFactType = (typeof ruleEngineFactTypes)[number];

export const ruleEngineOperators = [
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'EQUALS',
] as const;
export type RuleEngineOperator = (typeof ruleEngineOperators)[number];

export const ruleEngineActionTypes = [
  'CREATE_PURCHASE_REQUEST',
  'REQUIRE_DIRECTOR_APPROVAL',
  'SEND_MANAGER_ALERT',
  'CREATE_TASK',
  'ESCALATE_TO_FINANCE',
] as const;
export type RuleEngineActionType = (typeof ruleEngineActionTypes)[number];

export const ruleEngineEvaluationModes = ['REALTIME', 'SCHEDULED'] as const;
export type RuleEngineEvaluationMode = (typeof ruleEngineEvaluationModes)[number];

export const dashboardAudiences = [
  'EXECUTIVE',
  'CEO',
  'FINANCE',
  'INVENTORY',
  'WAREHOUSE',
  'SALES',
  'CRM',
  'HR',
  'MANUFACTURING',
] as const;
export type DashboardAudience = (typeof dashboardAudiences)[number];

export const dashboardTimeWindows = [
  'TODAY',
  'THIS_WEEK',
  'THIS_MONTH',
  'THIS_QUARTER',
  'YTD',
] as const;
export type DashboardTimeWindow = (typeof dashboardTimeWindows)[number];

export const dashboardSignalTones = ['HEALTHY', 'WATCH', 'AT_RISK', 'CRITICAL'] as const;
export type DashboardSignalTone = (typeof dashboardSignalTones)[number];

export const mobileCapabilityKeys = [
  'PWA',
  'OFFLINE_SYNC',
  'BARCODE',
  'QR',
  'CAMERA',
  'GPS',
  'PUSH_NOTIFICATION',
  'DARK_MODE',
  'TABLET_UI',
  'WAREHOUSE_UI',
] as const;
export type MobileCapabilityKey = (typeof mobileCapabilityKeys)[number];

export const mobileSurfaceTypes = ['PHONE', 'TABLET', 'WAREHOUSE_HANDHELD'] as const;
export type MobileSurfaceType = (typeof mobileSurfaceTypes)[number];

export const mobileCapabilityStatuses = ['READY', 'FOUNDATION', 'LIMITED', 'BLOCKED'] as const;
export type MobileCapabilityStatus = (typeof mobileCapabilityStatuses)[number];

export const offlineSyncStatuses = ['ONLINE', 'OFFLINE_BUFFERING', 'SYNCING', 'CONFLICT'] as const;
export type OfflineSyncStatus = (typeof offlineSyncStatuses)[number];

export const themeModes = ['LIGHT', 'DARK', 'SYSTEM'] as const;
export type ThemeMode = (typeof themeModes)[number];

export const integrationProviderCategories = [
  'PAYMENT',
  'SUITE',
  'MESSAGING',
  'STORAGE',
  'AI',
] as const;
export type IntegrationProviderCategory = (typeof integrationProviderCategories)[number];

export const integrationProviderKeys = [
  'STRIPE',
  'XENDIT',
  'MIDTRANS',
  'GOOGLE',
  'MICROSOFT',
  'WHATSAPP',
  'TELEGRAM',
  'SLACK',
  'DISCORD',
  'DROPBOX',
  'GOOGLE_DRIVE',
  'ONEDRIVE',
  'S3',
  'OPENAI',
  'CLAUDE',
  'GEMINI',
] as const;
export type IntegrationProviderKey = (typeof integrationProviderKeys)[number];

export const integrationConnectionStatuses = ['READY', 'FOUNDATION', 'LIMITED', 'BLOCKED'] as const;
export type IntegrationConnectionStatus = (typeof integrationConnectionStatuses)[number];

export const integrationAuthModes = [
  'API_KEY',
  'OAUTH2',
  'BOT_TOKEN',
  'ACCESS_KEY',
  'WEBHOOK_SIGNATURE',
  'SERVICE_ACCOUNT',
] as const;
export type IntegrationAuthMode = (typeof integrationAuthModes)[number];

export const platformWorkspaceAreas = ['TOPOLOGY', 'EXPERIENCE', 'IDENTITY_TRUST'] as const;
export type PlatformWorkspaceArea = (typeof platformWorkspaceAreas)[number];

export const platformCapabilityKeys = [
  'MULTI_COMPANY',
  'MULTI_BRANCH',
  'MULTI_WAREHOUSE',
  'MULTI_CURRENCY',
  'MULTI_LANGUAGE',
  'TIMEZONE',
  'WHITE_LABEL',
  'THEME_BUILDER',
  'MARKETPLACE',
  'PLUGIN_SYSTEM',
  'EXTENSION_SDK',
  'AUDIT_CENTER',
  'COMPLIANCE',
  'SSO',
  'OAUTH',
  'SAML',
] as const;
export type PlatformCapabilityKey = (typeof platformCapabilityKeys)[number];

export const platformCapabilityStatuses = ['READY', 'FOUNDATION', 'LIMITED', 'BLOCKED'] as const;
export type PlatformCapabilityStatus = (typeof platformCapabilityStatuses)[number];

export const aiWorkspaceAreas = [
  'COMMAND_CENTER',
  'FORECAST_RISK',
  'OPTIMIZATION',
  'DOCUMENT_INTELLIGENCE',
  'PERCEPTION',
  'ASSISTANTS',
] as const;
export type AiWorkspaceArea = (typeof aiWorkspaceAreas)[number];

export const aiWorkspaceCapabilityKeys = [
  'AI_COPILOT',
  'AI_DASHBOARD',
  'AI_CHAT',
  'PREDICTIVE_ANALYTICS',
  'DEMAND_FORECASTING',
  'FRAUD_DETECTION',
  'CASH_FLOW_PREDICTION',
  'AI_INVENTORY_OPTIMIZATION',
  'AI_PROCUREMENT_OPTIMIZATION',
  'AI_SALES_RECOMMENDATION',
  'AI_WAREHOUSE_OPTIMIZATION',
  'AI_DOCUMENT_OCR',
  'AI_INVOICE_EXTRACTION',
  'AI_RECEIPT_EXTRACTION',
  'AI_CONTRACT_ANALYSIS',
  'AI_VISION',
  'AI_VOICE_ASSISTANT',
  'AI_MEETING_SUMMARY',
] as const;
export type AiWorkspaceCapabilityKey = (typeof aiWorkspaceCapabilityKeys)[number];

export const aiWorkspaceCapabilityStatuses = ['READY', 'FOUNDATION', 'LIMITED', 'BLOCKED'] as const;
export type AiWorkspaceCapabilityStatus = (typeof aiWorkspaceCapabilityStatuses)[number];

export const analyticsWorkspaceAreas = [
  'DOMAIN_OPERATIONS',
  'ENTITY_INTELLIGENCE',
  'SEMANTIC_MODEL',
  'REALTIME',
] as const;
export type AnalyticsWorkspaceArea = (typeof analyticsWorkspaceAreas)[number];

export const analyticsWorkspaceCapabilityKeys = [
  'INVENTORY_ANALYTICS',
  'SALES_ANALYTICS',
  'PURCHASE_ANALYTICS',
  'ACCOUNTING_ANALYTICS',
  'HR_ANALYTICS',
  'MANUFACTURING_ANALYTICS',
  'BOOKING_ANALYTICS',
  'CRM_ANALYTICS',
  'CUSTOMER_ANALYTICS',
  'SUPPLIER_ANALYTICS',
  'WAREHOUSE_ANALYTICS',
  'FACT_TABLE',
  'DIMENSION',
  'OLAP',
  'CUBE',
  'REALTIME_ANALYTICS',
] as const;
export type AnalyticsWorkspaceCapabilityKey = (typeof analyticsWorkspaceCapabilityKeys)[number];

export const analyticsWorkspaceCapabilityStatuses = [
  'READY',
  'FOUNDATION',
  'LIMITED',
  'BLOCKED',
] as const;
export type AnalyticsWorkspaceCapabilityStatus =
  (typeof analyticsWorkspaceCapabilityStatuses)[number];

export const documentWorkspaceAreas = [
  'FILE_FORMATS',
  'BUSINESS_RECORDS',
  'GOVERNANCE_KNOWLEDGE',
] as const;
export type DocumentWorkspaceArea = (typeof documentWorkspaceAreas)[number];

export const documentWorkspaceCapabilityKeys = [
  'PDF_LIBRARY',
  'WORD_LIBRARY',
  'EXCEL_LIBRARY',
  'CONTRACT_LIBRARY',
  'INVOICE_LIBRARY',
  'COMPANY_SOP',
  'MANUAL_LIBRARY',
  'TRAINING_LIBRARY',
  'POLICY_LIBRARY',
] as const;
export type DocumentWorkspaceCapabilityKey = (typeof documentWorkspaceCapabilityKeys)[number];

export const documentWorkspaceCapabilityStatuses = [
  'READY',
  'FOUNDATION',
  'LIMITED',
  'BLOCKED',
] as const;
export type DocumentWorkspaceCapabilityStatus =
  (typeof documentWorkspaceCapabilityStatuses)[number];

export const salesOrderSourceTypes = [
  'DIRECT',
  'CRM_QUOTATION',
  'CONTRACT',
  'BACKORDER',
  'MANUAL',
] as const;
export type SalesOrderSourceType = (typeof salesOrderSourceTypes)[number];

export const salesOrderStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ALLOCATED',
  'PARTIALLY_DELIVERED',
  'DELIVERED',
  'PARTIALLY_INVOICED',
  'INVOICED',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
] as const;
export type SalesOrderStatus = (typeof salesOrderStatuses)[number];

export const deliveryOrderStatuses = [
  'DRAFT',
  'READY_TO_PICK',
  'PICKING',
  'PACKED',
  'DISPATCHED',
  'PARTIALLY_DELIVERED',
  'DELIVERED',
  'CANCELLED',
] as const;
export type DeliveryOrderStatus = (typeof deliveryOrderStatuses)[number];

export const shipmentStatuses = [
  'PLANNED',
  'READY',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED',
  'RETURNED',
  'CANCELLED',
] as const;
export type ShipmentStatus = (typeof shipmentStatuses)[number];

export const salesInvoiceStatuses = [
  'PENDING',
  'READY_TO_INVOICE',
  'PARTIALLY_INVOICED',
  'INVOICED',
  'OVERDUE',
  'PAID',
  'VOID',
  'CANCELLED',
] as const;
export type SalesInvoiceStatus = (typeof salesInvoiceStatuses)[number];

export const salesReturnStatuses = [
  'REQUESTED',
  'APPROVED',
  'INBOUND_PENDING',
  'RECEIVED',
  'INSPECTED',
  'CREDIT_ISSUED',
  'REFUNDED',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
] as const;
export type SalesReturnStatus = (typeof salesReturnStatuses)[number];

export const creditNoteStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ISSUED',
  'APPLIED',
  'VOID',
  'CANCELLED',
] as const;
export type CreditNoteStatus = (typeof creditNoteStatuses)[number];

export const discountRuleTypes = [
  'PERCENTAGE',
  'FIXED_AMOUNT',
  'TIERED',
  'BUY_X_GET_Y',
  'MANUAL_OVERRIDE',
] as const;
export type DiscountRuleType = (typeof discountRuleTypes)[number];

export const discountTargets = ['LINE', 'ORDER', 'CUSTOMER', 'PRICE_LIST'] as const;
export type DiscountTarget = (typeof discountTargets)[number];

export const taxCalculationModes = ['EXCLUSIVE', 'INCLUSIVE', 'ZERO_RATED', 'EXEMPT'] as const;
export type TaxCalculationMode = (typeof taxCalculationModes)[number];

export const priceListTypes = [
  'STANDARD',
  'CUSTOMER_SPECIFIC',
  'CHANNEL',
  'CAMPAIGN',
  'CONTRACT',
] as const;
export type PriceListType = (typeof priceListTypes)[number];

export const priceListStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED'] as const;
export type PriceListStatus = (typeof priceListStatuses)[number];

export const customerCreditRiskLevels = ['AVAILABLE', 'WATCHLIST', 'ON_HOLD', 'BLOCKED'] as const;
export type CustomerCreditRiskLevel = (typeof customerCreditRiskLevels)[number];

export const installmentPlanStatuses = [
  'DRAFT',
  'ACTIVE',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'DEFAULTED',
  'CANCELLED',
] as const;
export type InstallmentPlanStatus = (typeof installmentPlanStatuses)[number];

export const installmentFrequencies = ['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const;
export type InstallmentFrequency = (typeof installmentFrequencies)[number];

export const salesAnalyticsPeriods = [
  'TODAY',
  'THIS_WEEK',
  'THIS_MONTH',
  'THIS_QUARTER',
  'THIS_YEAR',
] as const;
export type SalesAnalyticsPeriod = (typeof salesAnalyticsPeriods)[number];

export const documentTypes = [
  'BOOKING',
  'INVOICE',
  'PAYMENT',
  'CUSTOMER',
  'PRODUCT',
  'SUPPLIER',
  'INVENTORY_RESERVATION',
  'OPENING_BALANCE',
  'INTERNAL_BARCODE',
  'WAREHOUSE',
  'INVENTORY_ALERT',
  'INVENTORY_MOVEMENT',
  'GOODS_RECEIPT',
  'GOODS_ISSUE',
  'STOCK_TRANSFER',
  'TRANSFER_SHIPMENT',
  'TRANSFER_RECEIPT',
  'STOCK_ADJUSTMENT',
  'STATUS_TRANSFER',
  'PUTAWAY_TASK',
  'PICKING_WAVE',
  'PICKING_TASK',
  'PACKING_SESSION',
  'DISPATCH',
  'WAREHOUSE_TASK',
  'STOCK_COUNT',
  'MOVEMENT_REVERSAL',
  'INVENTORY_ALLOCATION',
  'SCAN_SESSION',
  'PURCHASE_REQUEST',
  'REQUEST_FOR_QUOTATION',
  'SUPPLIER_QUOTATION',
  'VENDOR_COMPARISON',
  'PURCHASE_ORDER',
  'BLANKET_ORDER',
  'PURCHASE_CONTRACT',
  'PURCHASE_APPROVAL',
  'PURCHASE_RECEIPT',
  'PURCHASE_INVOICE_PREPARATION',
  'LEAD',
  'OPPORTUNITY',
  'DEAL',
  'SALES_ACTIVITY',
  'CALL_LOG',
  'SALES_QUOTATION',
  'SALES_TASK',
  'SALES_MEETING',
  'SALES_ORDER',
  'SALES_INVOICE',
  'DELIVERY_ORDER',
  'SHIPMENT',
  'SALES_RETURN',
  'CREDIT_NOTE',
  'PRICE_LIST',
  'INSTALLMENT_PLAN',
  'SUPPORT_TICKET',
  'DOWNLOAD_ASSET',
  'PORTAL_NOTIFICATION',
  'PORTAL_TRACKING_EVENT',
  'CHART_OF_ACCOUNT',
  'GENERAL_LEDGER',
  'JOURNAL_ENTRY',
  'POSTING_BATCH',
  'ACCOUNTING_VOUCHER',
  'BANK_ACCOUNT',
  'CASH_ACCOUNT',
  'BUDGET_PLAN',
  'FIXED_ASSET',
  'DEPRECIATION_RUN',
  'COST_CENTER',
  'FISCAL_YEAR',
  'CURRENCY',
  'EXCHANGE_RATE',
  'FINANCIAL_STATEMENT',
  'EMPLOYEE',
  'DEPARTMENT',
  'ATTENDANCE_ENTRY',
  'LEAVE_REQUEST',
  'PAYROLL_RUN',
  'SHIFT_SCHEDULE',
  'RECRUITMENT_CANDIDATE',
  'PERFORMANCE_REVIEW',
  'TRAINING_PROGRAM',
  'KPI_SCORECARD',
  'ORGANIZATION_CHART',
  'BILL_OF_MATERIAL',
  'PRODUCTION_ORDER',
  'WORK_ORDER',
  'ROUTING',
  'MACHINE',
  'MAINTENANCE_ORDER',
  'QUALITY_INSPECTION',
  'SCRAP_REPORT',
  'PRODUCTION_PLAN',
  'MRP_RUN',
  'CAPACITY_PLAN',
  'AI_CHAT_SESSION',
  'AI_SEARCH_QUERY',
  'AI_REPORT',
  'AI_FORECAST',
  'AI_RECOMMENDATION',
  'AI_AGENT_RUN',
  'APPROVAL_FLOW',
  'APPROVAL_REQUEST',
  'AUTOMATION_RULE',
  'AUTOMATION_TRIGGER',
  'AUTOMATION_CONDITION',
  'AUTOMATION_ACTION',
  'AUTOMATION_REMINDER',
  'AUTOMATION_WEBHOOK',
  'CRON_JOB',
  'DASHBOARD_SNAPSHOT',
  'DASHBOARD_BRIEFING',
  'DEVICE_SESSION',
  'OFFLINE_SYNC_BATCH',
  'PUSH_SUBSCRIPTION',
  'PWA_CONFIGURATION',
  'INTEGRATION_CONNECTION',
  'INTEGRATION_CREDENTIAL',
  'INTEGRATION_WEBHOOK',
  'PLATFORM_THEME_PROFILE',
  'MARKETPLACE_EXTENSION',
  'IDENTITY_PROVIDER_CONNECTION',
  'COMPLIANCE_POLICY',
  'PDF_DOCUMENT',
  'WORD_DOCUMENT',
  'EXCEL_DOCUMENT',
  'CONTRACT_DOCUMENT',
  'COMPANY_SOP_DOCUMENT',
  'MANUAL_DOCUMENT',
  'TRAINING_MATERIAL',
  'POLICY_DOCUMENT',
  'AI_OCR_RUN',
  'AI_EXTRACTION_JOB',
  'AI_CONTRACT_REVIEW',
  'AI_MEETING_BRIEF',
  'ANALYTICS_FACT_MODEL',
  'ANALYTICS_DIMENSION_MODEL',
  'ANALYTICS_CUBE_MODEL',
  'ANALYTICS_STREAM_PIPELINE',
] as const;
export type DocumentType = (typeof documentTypes)[number];

export const sequenceResetPeriods = ['NEVER', 'DAILY', 'MONTHLY', 'YEARLY'] as const;
export type SequenceResetPeriod = (typeof sequenceResetPeriods)[number];

const platformPermissions = [
  'organization:read',
  'organization:create',
  'organization:update',
  'organization:archive',
  'workspace:read',
  'workspace:create',
  'workspace:update',
  'workspace:archive',
  'membership:read',
  'membership:update',
  'membership:remove',
  'membership:suspend',
  'invitation:read',
  'invitation:create',
  'invitation:revoke',
  'role:read',
  'role:create',
  'role:update',
  'role:delete',
  'permission:read',
  'role-permission:update',
  'user:read',
  'user:update',
  'audit-log:read',
  'setting:read',
  'setting:update',
  'system-setting:read',
  'system-setting:update',
] as const;

export const bookingPermissions = [
  'customer:read',
  'customer:create',
  'customer:update',
  'customer:delete',
  'customer-group:read',
  'customer-group:create',
  'customer-group:update',
  'customer-group:delete',
  'location:read',
  'location:create',
  'location:update',
  'location:delete',
  'service-category:read',
  'service-category:create',
  'service-category:update',
  'service-category:delete',
  'service:read',
  'service:create',
  'service:update',
  'service:delete',
  'resource-group:read',
  'resource-group:create',
  'resource-group:update',
  'resource-group:delete',
  'resource:read',
  'resource:create',
  'resource:update',
  'resource:delete',
  'availability:read',
  'schedule:read',
  'schedule:create',
  'schedule:update',
  'schedule:delete',
  'booking:read',
  'booking:create',
  'booking:update',
  'booking:cancel',
  'booking:confirm',
  'booking:reschedule',
  'booking-hold:create',
  'booking-hold:read',
  'booking-hold:delete',
  'booking-note:read',
  'booking-note:create',
  'booking-note:delete',
  'pricing:read',
  'price-rule:read',
  'price-rule:create',
  'price-rule:update',
  'price-rule:delete',
  'promotion:read',
  'promotion:create',
  'promotion:update',
  'promotion:delete',
  'invoice:read',
  'invoice:create',
  'invoice:update',
  'invoice:void',
  'payment:read',
  'payment:create',
  'payment:update',
  'payment:verify',
  'check-in:create',
  'check-out:create',
  'booking-notification:read',
  'booking-notification:create',
  'booking-analytics:read',
  'document-sequence:read',
  'document-sequence:update',
] as const;

export const crmPermissions = [
  'lead:read',
  'lead:create',
  'lead:update',
  'lead:qualify',
  'lead:convert',
  'lead:archive',
  'opportunity:read',
  'opportunity:create',
  'opportunity:update',
  'opportunity:advance',
  'opportunity:close',
  'deal:read',
  'deal:create',
  'deal:update',
  'deal:advance',
  'deal:win',
  'deal:lose',
  'sales-activity:read',
  'sales-activity:create',
  'sales-activity:update',
  'sales-activity:complete',
  'sales-activity:cancel',
  'call-log:read',
  'call-log:create',
  'sales-email:read',
  'sales-email:create',
  'sales-email:send',
  'sales-whatsapp:read',
  'sales-whatsapp:create',
  'sales-whatsapp:send',
  'sales-funnel:read',
  'sales-quotation:read',
  'sales-quotation:create',
  'sales-quotation:update',
  'sales-quotation:send',
  'sales-quotation:convert',
  'sales-quotation:cancel',
  'sales-pipeline:read',
  'sales-pipeline:create',
  'sales-pipeline:update',
  'customer-timeline:read',
  'sales-task:read',
  'sales-task:create',
  'sales-task:update',
  'sales-task:complete',
  'sales-reminder:read',
  'sales-reminder:create',
  'sales-reminder:update',
  'sales-reminder:cancel',
  'sales-follow-up:read',
  'sales-follow-up:create',
  'sales-follow-up:update',
  'sales-follow-up:complete',
  'sales-meeting:read',
  'sales-meeting:create',
  'sales-meeting:update',
  'sales-meeting:complete',
  'sales-dashboard:read',
  'sales-dashboard:export',
] as const;

export const salesOperationsPermissions = [
  'sales-order:read',
  'sales-order:create',
  'sales-order:update',
  'sales-order:submit',
  'sales-order:approve',
  'sales-order:allocate',
  'sales-order:fulfill',
  'sales-order:invoice',
  'sales-order:cancel',
  'sales-order:close',
  'sales-order:read-price',
  'sales-invoice:read',
  'sales-invoice:create',
  'sales-invoice:issue',
  'sales-invoice:void',
  'delivery-order:read',
  'delivery-order:create',
  'delivery-order:update',
  'delivery-order:release',
  'delivery-order:dispatch',
  'delivery-order:cancel',
  'shipment:read',
  'shipment:create',
  'shipment:update',
  'shipment:dispatch',
  'shipment:confirm-delivery',
  'shipment:cancel',
  'sales-return:read',
  'sales-return:create',
  'sales-return:update',
  'sales-return:approve',
  'sales-return:receive',
  'sales-return:close',
  'sales-return:cancel',
  'credit-note:read',
  'credit-note:create',
  'credit-note:update',
  'credit-note:approve',
  'credit-note:issue',
  'credit-note:apply',
  'credit-note:void',
  'discount-engine:read',
  'discount-engine:evaluate',
  'discount-engine:manage',
  'tax-engine:read',
  'tax-engine:evaluate',
  'tax-engine:manage',
  'price-list:read',
  'price-list:create',
  'price-list:update',
  'price-list:activate',
  'price-list:archive',
  'customer-credit:read',
  'customer-credit:update',
  'customer-credit:approve',
  'customer-credit:override',
  'installment:read',
  'installment:create',
  'installment:update',
  'installment:approve',
  'installment:cancel',
  'sales-analytics:read',
  'sales-analytics:export',
] as const;

export const inventoryPermissions = [
  'product:read',
  'product:create',
  'product:update',
  'product:archive',
  'product:restore',
  'product:delete',
  'product:export',
  'product:import',
  'product:manage-price',
  'product:manage-cost',
  'product:manage-image',
  'product:manage-attachment',
  'product:manage-supplier',
  'product:manage-barcode',
  'product-category:read',
  'product-category:create',
  'product-category:update',
  'product-category:archive',
  'product-category:move',
  'brand:read',
  'brand:create',
  'brand:update',
  'brand:archive',
  'product-attribute:read',
  'product-attribute:create',
  'product-attribute:update',
  'product-attribute:archive',
  'product-variant:read',
  'product-variant:create',
  'product-variant:update',
  'product-variant:archive',
  'product-variant:manage-sku',
  'product-variant:manage-barcode',
  'uom:read',
  'uom:create',
  'uom:update',
  'uom:archive',
  'uom-conversion:manage',
  'supplier:read',
  'supplier:create',
  'supplier:update',
  'supplier:archive',
  'supplier:manage-product',
  'warehouse:read',
  'warehouse:create',
  'warehouse:update',
  'warehouse:archive',
  'warehouse-zone:manage',
  'storage-location:read',
  'storage-location:create',
  'storage-location:update',
  'storage-location:archive',
  'inventory:read',
  'inventory:read-cost',
  'inventory:read-all-warehouses',
  'inventory:reserve',
  'inventory:release-reservation',
  'inventory:manage-lot',
  'inventory:manage-serial',
  'inventory:opening-balance-create',
  'inventory:opening-balance-post',
  'inventory:opening-balance-cancel',
  'inventory:diagnostic-read',
  'inventory:export',
  'reorder-rule:read',
  'reorder-rule:create',
  'reorder-rule:update',
  'reorder-rule:archive',
  'inventory-alert:read',
  'inventory-alert:acknowledge',
  'inventory-alert:resolve',
  'inventory-alert:dismiss',
  'inventory-alert:run-check',
  'product-import:create',
  'product-import:read',
  'product-export:create',
  'inventory-export:create',
  'inventory-movement:read',
  'inventory-movement:create',
  'inventory-movement:update',
  'inventory-movement:submit',
  'inventory-movement:approve',
  'inventory-movement:post',
  'inventory-movement:cancel',
  'inventory-movement:reverse',
  'inventory-movement:read-cost',
  'inventory-movement:export',
  'goods-receipt:read',
  'goods-receipt:create',
  'goods-receipt:update',
  'goods-receipt:receive',
  'goods-receipt:inspect',
  'goods-receipt:post',
  'goods-receipt:cancel',
  'goods-issue:read',
  'goods-issue:create',
  'goods-issue:update',
  'goods-issue:submit',
  'goods-issue:approve',
  'goods-issue:allocate',
  'goods-issue:pick',
  'goods-issue:pack',
  'goods-issue:dispatch',
  'goods-issue:post',
  'goods-issue:cancel',
  'stock-transfer:read',
  'stock-transfer:create',
  'stock-transfer:update',
  'stock-transfer:submit',
  'stock-transfer:approve',
  'stock-transfer:allocate',
  'stock-transfer:ship',
  'stock-transfer:receive',
  'stock-transfer:complete',
  'stock-transfer:cancel',
  'stock-adjustment:read',
  'stock-adjustment:create',
  'stock-adjustment:update',
  'stock-adjustment:submit',
  'stock-adjustment:approve',
  'stock-adjustment:post',
  'stock-adjustment:cancel',
  'stock-adjustment:reverse',
  'inventory-allocation:read',
  'inventory-allocation:create',
  'inventory-allocation:release',
  'inventory-allocation:override',
  'inventory-allocation:manage-strategy',
  'putaway:read',
  'putaway:create',
  'putaway:assign',
  'putaway:start',
  'putaway:complete',
  'putaway:override-location',
  'picking:read',
  'picking:create',
  'picking:assign',
  'picking:start',
  'picking:pick',
  'picking:short-pick',
  'picking:complete',
  'picking:override',
  'packing:read',
  'packing:create',
  'packing:update',
  'packing:complete',
  'packing:cancel',
  'dispatch:read',
  'dispatch:create',
  'dispatch:complete',
  'dispatch:cancel',
  'warehouse-task:read',
  'warehouse-task:create',
  'warehouse-task:assign',
  'warehouse-task:update',
  'warehouse-task:complete',
  'warehouse-task:cancel',
  'stock-count:read',
  'stock-count:create',
  'stock-count:start',
  'stock-count:enter-count',
  'stock-count:submit',
  'stock-count:approve',
  'stock-count:post',
  'stock-count:cancel',
  'stock-count:override-freeze',
  'warehouse-scan:use',
  'warehouse-scan:history',
  'inventory-movement-report:read',
  'inventory-movement-report:export',
  'warehouse-productivity:read',
] as const;

export const procurementPermissions = [
  'purchase-request:read',
  'purchase-request:create',
  'purchase-request:update',
  'purchase-request:submit',
  'purchase-request:approve',
  'purchase-request:cancel',
  'rfq:read',
  'rfq:create',
  'rfq:update',
  'rfq:send',
  'rfq:close',
  'rfq:cancel',
  'supplier-quotation:read',
  'supplier-quotation:create',
  'supplier-quotation:update',
  'supplier-quotation:submit',
  'supplier-quotation:review',
  'supplier-quotation:award',
  'supplier-quotation:reject',
  'vendor-comparison:read',
  'vendor-comparison:create',
  'vendor-comparison:update',
  'vendor-comparison:approve',
  'vendor-comparison:decide',
  'purchase-order:read',
  'purchase-order:create',
  'purchase-order:update',
  'purchase-order:submit',
  'purchase-order:approve',
  'purchase-order:send',
  'purchase-order:cancel',
  'purchase-order:close',
  'purchase-order:read-cost',
  'blanket-order:read',
  'blanket-order:create',
  'blanket-order:update',
  'blanket-order:activate',
  'blanket-order:close',
  'blanket-order:cancel',
  'purchase-contract:read',
  'purchase-contract:create',
  'purchase-contract:update',
  'purchase-contract:activate',
  'purchase-contract:close',
  'purchase-contract:cancel',
  'purchase-approval:read',
  'purchase-approval:approve',
  'purchase-approval:reject',
  'purchase-approval:escalate',
  'purchase-receipt:read',
  'purchase-receipt:create',
  'purchase-receipt:receive',
  'purchase-invoice-prep:read',
  'purchase-invoice-prep:create',
  'purchase-invoice-prep:complete',
  'purchase-invoice-prep:cancel',
  'vendor-rating:read',
  'vendor-rating:update',
  'vendor-price-history:read',
  'vendor-lead-time:read',
  'purchase-analytics:read',
  'purchase-analytics:export',
] as const;

export const portalPermissions = [
  'portal-dashboard:read',
  'portal-booking:read',
  'portal-booking:reschedule',
  'portal-booking:cancel',
  'portal-order:read',
  'portal-invoice:read',
  'portal-payment:read',
  'portal-payment:create',
  'portal-profile:read',
  'portal-profile:update',
  'portal-notification:read',
  'portal-notification:update',
  'portal-download:read',
  'portal-download:generate',
  'portal-tracking:read',
  'support-center:read',
  'support-ticket:read',
  'support-ticket:create',
  'support-ticket:update',
  'support-ticket:respond',
  'support-ticket:resolve',
  'support-ticket:close',
] as const;

export const financePermissions = [
  'chart-of-account:read',
  'chart-of-account:create',
  'chart-of-account:update',
  'chart-of-account:archive',
  'general-ledger:read',
  'general-ledger:export',
  'journal-entry:read',
  'journal-entry:create',
  'journal-entry:update',
  'journal-entry:post',
  'journal-entry:reverse',
  'posting-batch:read',
  'posting-batch:create',
  'posting-batch:post',
  'posting-batch:reverse',
  'accounting-voucher:read',
  'accounting-voucher:create',
  'accounting-voucher:update',
  'accounting-voucher:approve',
  'accounting-voucher:post',
  'accounting-voucher:void',
  'bank-account:read',
  'bank-account:create',
  'bank-account:update',
  'bank-account:reconcile',
  'cash-account:read',
  'cash-account:create',
  'cash-account:update',
  'cash-account:reconcile',
  'budget-plan:read',
  'budget-plan:create',
  'budget-plan:update',
  'budget-plan:approve',
  'budget-plan:lock',
  'budget-plan:close',
  'fixed-asset:read',
  'fixed-asset:create',
  'fixed-asset:update',
  'fixed-asset:dispose',
  'depreciation-run:read',
  'depreciation-run:create',
  'depreciation-run:post',
  'depreciation-run:reverse',
  'cost-center:read',
  'cost-center:create',
  'cost-center:update',
  'cost-center:archive',
  'fiscal-year:read',
  'fiscal-year:create',
  'fiscal-year:update',
  'fiscal-year:open',
  'fiscal-year:close',
  'currency:read',
  'currency:create',
  'currency:update',
  'currency:archive',
  'exchange-rate:read',
  'exchange-rate:create',
  'exchange-rate:update',
  'exchange-rate:publish',
  'financial-statement:read',
  'financial-statement:export',
  'balance-sheet:read',
  'profit-loss:read',
  'cash-flow:read',
] as const;

export const hrPermissions = [
  'employee:read',
  'employee:create',
  'employee:update',
  'employee:archive',
  'department:read',
  'department:create',
  'department:update',
  'department:archive',
  'attendance:read',
  'attendance:create',
  'attendance:update',
  'attendance:approve',
  'attendance:export',
  'leave-request:read',
  'leave-request:create',
  'leave-request:update',
  'leave-request:submit',
  'leave-request:approve',
  'leave-request:reject',
  'leave-request:cancel',
  'payroll:read',
  'payroll:create',
  'payroll:update',
  'payroll:calculate',
  'payroll:approve',
  'payroll:post',
  'shift:read',
  'shift:create',
  'shift:update',
  'shift:publish',
  'shift:archive',
  'recruitment:read',
  'recruitment:create',
  'recruitment:update',
  'recruitment:advance',
  'recruitment:hire',
  'recruitment:reject',
  'performance:read',
  'performance:create',
  'performance:update',
  'performance:calibrate',
  'performance:complete',
  'training:read',
  'training:create',
  'training:update',
  'training:publish',
  'training:archive',
  'kpi:read',
  'kpi:create',
  'kpi:update',
  'kpi:approve',
  'kpi:close',
  'organization-chart:read',
  'organization-chart:update',
  'organization-chart:publish',
] as const;

export const manufacturingPermissions = [
  'bill-of-material:read',
  'bill-of-material:create',
  'bill-of-material:update',
  'bill-of-material:approve',
  'bill-of-material:archive',
  'production:read',
  'production:create',
  'production:update',
  'production:release',
  'production:close',
  'work-order:read',
  'work-order:create',
  'work-order:update',
  'work-order:start',
  'work-order:complete',
  'work-order:cancel',
  'routing:read',
  'routing:create',
  'routing:update',
  'routing:archive',
  'machine:read',
  'machine:create',
  'machine:update',
  'machine:assign',
  'machine:maintain',
  'maintenance:read',
  'maintenance:create',
  'maintenance:update',
  'maintenance:approve',
  'maintenance:complete',
  'quality-control:read',
  'quality-control:create',
  'quality-control:update',
  'quality-control:inspect',
  'quality-control:disposition',
  'scrap:read',
  'scrap:create',
  'scrap:update',
  'scrap:approve',
  'scrap:analyze',
  'production-planning:read',
  'production-planning:create',
  'production-planning:update',
  'production-planning:release',
  'production-planning:lock',
  'mrp:read',
  'mrp:create',
  'mrp:run',
  'mrp:release',
  'capacity-planning:read',
  'capacity-planning:create',
  'capacity-planning:update',
  'capacity-planning:balance',
  'capacity-planning:publish',
] as const;

export const aiPermissions = [
  'chat-erp:read',
  'chat-erp:create',
  'ask-inventory:read',
  'ask-inventory:create',
  'ask-finance:read',
  'ask-finance:create',
  'ask-crm:read',
  'ask-crm:create',
  'natural-language-search:read',
  'natural-language-search:query',
  'ai-report:read',
  'ai-report:create',
  'ai-report:export',
  'ai-forecast:read',
  'ai-forecast:create',
  'ai-forecast:approve',
  'ai-recommendation:read',
  'ai-recommendation:create',
  'ai-recommendation:approve',
  'ai-procurement:read',
  'ai-procurement:create',
  'ai-sales:read',
  'ai-sales:create',
  'ai-accounting:read',
  'ai-accounting:create',
  'ai-hr:read',
  'ai-hr:create',
  'ai-manufacturing:read',
  'ai-manufacturing:create',
  'ai-analytics:read',
  'ai-analytics:create',
  'ai-analytics:export',
  'ai-prompt-log:read',
] as const;

export const automationPermissions = [
  'approval-flow:read',
  'approval-flow:create',
  'approval-flow:update',
  'approval-flow:publish',
  'approval-request:read',
  'approval-request:create',
  'approval-request:approve',
  'approval-request:reject',
  'approval-request:escalate',
  'automation-rule:read',
  'automation-rule:create',
  'automation-rule:update',
  'automation-rule:publish',
  'automation-rule:pause',
  'automation-trigger:read',
  'automation-trigger:create',
  'automation-trigger:update',
  'automation-condition:read',
  'automation-condition:create',
  'automation-condition:update',
  'automation-action:read',
  'automation-action:create',
  'automation-action:update',
  'automation-reminder:read',
  'automation-reminder:create',
  'automation-reminder:update',
  'automation-reminder:send',
  'automation-webhook:read',
  'automation-webhook:create',
  'automation-webhook:update',
  'automation-webhook:deliver',
  'email-automation:read',
  'email-automation:create',
  'email-automation:send',
  'whatsapp-automation:read',
  'whatsapp-automation:create',
  'whatsapp-automation:send',
  'slack-automation:read',
  'slack-automation:create',
  'slack-automation:send',
  'discord-automation:read',
  'discord-automation:create',
  'discord-automation:send',
  'cron-job:read',
  'cron-job:create',
  'cron-job:update',
  'cron-job:run',
] as const;

export const dashboardPermissions = [
  'dashboard-workspace:read',
  'executive-dashboard:read',
  'ceo-dashboard:read',
  'finance-dashboard:read',
  'inventory-dashboard:read',
  'warehouse-dashboard:read',
  'crm-dashboard:read',
  'sales-ops-dashboard:read',
  'hr-dashboard:read',
  'manufacturing-dashboard:read',
  'dashboard-brief:create',
  'dashboard-brief:export',
] as const;

export const mobilePermissions = [
  'mobile-workspace:read',
  'pwa-config:read',
  'offline-sync:read',
  'offline-sync:queue',
  'barcode-scanner:use',
  'qr-scanner:use',
  'device-camera:use',
  'device-gps:use',
  'push-notification:subscribe',
  'dark-mode:read',
  'tablet-ui:read',
  'warehouse-mobile-ui:read',
] as const;

export const integrationPermissions = [
  'integration-workspace:read',
  'integration-provider:read',
  'integration-provider:configure',
  'integration-provider:test',
  'integration-provider:rotate-secret',
  'integration-provider:sync',
] as const;

export const platformWorkspacePermissions = [
  'platform-workspace:read',
  'company-network:read',
  'company-network:manage',
  'locale-config:read',
  'locale-config:manage',
  'branding:read',
  'branding:manage',
  'marketplace:read',
  'marketplace:manage',
  'plugin-system:read',
  'plugin-system:manage',
  'extension-sdk:read',
  'audit-center:read',
  'compliance-center:read',
  'identity-provider:read',
  'identity-provider:manage',
  'sso-config:read',
  'sso-config:manage',
] as const;

export const aiWorkspacePermissions = [
  'ai-workspace:read',
  'ai-dashboard:read',
  'ai-chat:read',
  'predictive-analytics:read',
  'demand-forecasting:read',
  'fraud-detection:read',
  'cash-flow-prediction:read',
  'inventory-optimization:read',
  'procurement-optimization:read',
  'sales-recommendation:read',
  'warehouse-optimization:read',
  'document-ocr:read',
  'invoice-extraction:read',
  'receipt-extraction:read',
  'contract-analysis:read',
  'voice-assistant:read',
  'meeting-summary:read',
] as const;

export const analyticsWorkspacePermissions = [
  'analytics-workspace:read',
  'inventory-analytics:read',
  'accounting-analytics:read',
  'hr-analytics:read',
  'manufacturing-analytics:read',
  'crm-analytics:read',
  'customer-analytics:read',
  'supplier-analytics:read',
  'warehouse-analytics:read',
  'fact-model:read',
  'fact-model:manage',
  'dimension-model:read',
  'dimension-model:manage',
  'olap-model:read',
  'olap-model:manage',
  'cube-model:read',
  'cube-model:manage',
  'realtime-analytics:read',
  'realtime-analytics:manage',
] as const;

export const documentWorkspacePermissions = [
  'document-workspace:read',
  'pdf-document:read',
  'word-document:read',
  'excel-document:read',
  'contract-document:read',
  'contract-document:manage',
  'invoice-document:read',
  'invoice-document:manage',
  'company-sop:read',
  'company-sop:manage',
  'manual-document:read',
  'manual-document:manage',
  'training-document:read',
  'training-document:manage',
  'policy-document:read',
  'policy-document:manage',
] as const;

export const initialPermissions = [
  ...platformPermissions,
  ...bookingPermissions,
  ...crmPermissions,
  ...salesOperationsPermissions,
  ...inventoryPermissions,
  ...procurementPermissions,
  ...portalPermissions,
  ...financePermissions,
  ...hrPermissions,
  ...manufacturingPermissions,
  ...aiPermissions,
  ...automationPermissions,
  ...dashboardPermissions,
  ...mobilePermissions,
  ...integrationPermissions,
  ...platformWorkspacePermissions,
  ...aiWorkspacePermissions,
  ...analyticsWorkspacePermissions,
  ...documentWorkspacePermissions,
] as const;

export type PermissionKey = (typeof initialPermissions)[number];

export const systemRoles = [
  'SUPER_ADMIN',
  'OWNER',
  'ADMIN',
  'MANAGER',
  'SALES_MANAGER',
  'SALES_REP',
  'FINANCE_MANAGER',
  'ACCOUNTANT',
  'TREASURY_OFFICER',
  'HR_MANAGER',
  'HR_SPECIALIST',
  'PAYROLL_OFFICER',
  'PRODUCTION_MANAGER',
  'PRODUCTION_PLANNER',
  'QUALITY_ENGINEER',
  'MAINTENANCE_LEAD',
  'AI_ADMIN',
  'AI_ANALYST',
  'AI_OPERATOR',
  'AUTOMATION_ADMIN',
  'AUTOMATION_MANAGER',
  'AUTOMATION_OPERATOR',
  'PROCUREMENT_MANAGER',
  'BUYER',
  'CUSTOMER_SUCCESS_MANAGER',
  'SUPPORT_AGENT',
  'WAREHOUSE_SUPERVISOR',
  'WAREHOUSE_OPERATOR',
  'STAFF',
  'VIEWER',
  'CUSTOMER_PORTAL_USER',
] as const;

export type SystemRole = (typeof systemRoles)[number];
