-- CreateEnum
CREATE TYPE "ProductCategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UomCategory" AS ENUM ('QUANTITY', 'WEIGHT', 'LENGTH', 'AREA', 'VOLUME', 'TIME', 'PACKAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "UomDimension" AS ENUM ('EACH', 'MASS', 'LENGTH', 'AREA', 'VOLUME', 'TIME', 'CUSTOM');

-- CreateEnum
CREATE TYPE "UomStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RoundingMode" AS ENUM ('UP', 'DOWN', 'HALF_UP', 'HALF_DOWN', 'HALF_EVEN');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'CONSUMABLE', 'SERVICE_LINKED', 'RENTAL_ITEM', 'ASSET', 'BUNDLE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InventoryTrackingType" AS ENUM ('NONE', 'QUANTITY', 'LOT', 'SERIAL');

-- CreateEnum
CREATE TYPE "ProductAttributeDataType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'MULTI_SELECT', 'COLOR');

-- CreateEnum
CREATE TYPE "ProductAttributeDisplayType" AS ENUM ('INPUT', 'DROPDOWN', 'RADIO', 'CHECKBOX', 'COLOR_SWATCH');

-- CreateEnum
CREATE TYPE "ProductAttributeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductVariantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BarcodeType" AS ENUM ('EAN_8', 'EAN_13', 'UPC_A', 'UPC_E', 'CODE_39', 'CODE_128', 'ITF', 'QR', 'INTERNAL');

-- CreateEnum
CREATE TYPE "BarcodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductAttachmentType" AS ENUM ('MANUAL', 'SPECIFICATION', 'CERTIFICATE', 'WARRANTY', 'SAFETY_DATA', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductTagStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductBundlePricingMode" AS ENUM ('FIXED', 'SUM_COMPONENTS', 'SUM_COMPONENTS_WITH_DISCOUNT');

-- CreateEnum
CREATE TYPE "ProductBundleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductSupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('MAIN', 'BRANCH', 'TRANSIT', 'RETURNS', 'QUARANTINE', 'VIRTUAL', 'CONSIGNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WarehouseZoneType" AS ENUM ('RECEIVING', 'STORAGE', 'PICKING', 'PACKING', 'DISPATCH', 'RETURNS', 'QUARANTINE', 'COLD_STORAGE', 'HAZARDOUS', 'HIGH_VALUE', 'OTHER');

-- CreateEnum
CREATE TYPE "WarehouseZoneStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StorageLocationType" AS ENUM ('FLOOR', 'AISLE', 'RACK', 'SHELF', 'BIN', 'PALLET', 'ROOM', 'VIRTUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "StorageLocationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InventoryItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InventoryBalanceStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'QUARANTINE', 'DAMAGED', 'EXPIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "InventoryLotStatus" AS ENUM ('ACTIVE', 'QUARANTINE', 'RELEASED', 'BLOCKED', 'EXPIRED', 'DEPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InventorySerialStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'ISSUED', 'IN_TRANSIT', 'QUARANTINE', 'DAMAGED', 'RETURNED', 'LOST', 'SCRAPPED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InventorySerialCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'DAMAGED', 'REFURBISHED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "InventoryReservationSourceType" AS ENUM ('BOOKING', 'SALES_ORDER', 'RENTAL', 'INTERNAL', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryReservationStatus" AS ENUM ('PENDING', 'ACTIVE', 'PARTIALLY_FULFILLED', 'FULFILLED', 'RELEASED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReorderRuleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InventoryAlertType" AS ENUM ('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRING_SOON', 'EXPIRED', 'NEGATIVE_STOCK', 'SERIAL_MISMATCH', 'LOT_BLOCKED', 'LOCATION_CAPACITY', 'DATA_INCONSISTENCY');

-- CreateEnum
CREATE TYPE "InventoryAlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InventoryAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "InventoryOpeningBalanceStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryLedgerEntryType" AS ENUM ('OPENING_BALANCE', 'RESERVATION_CREATED', 'RESERVATION_RELEASED', 'RESERVATION_FULFILLED', 'MANUAL_INITIALIZATION', 'SYSTEM_CORRECTION', 'FUTURE_RECEIPT', 'FUTURE_ISSUE', 'FUTURE_TRANSFER');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('UPLOADED', 'PARSED', 'VALIDATED', 'PREVIEW_READY', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExportJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'PRODUCT';
ALTER TYPE "DocumentType" ADD VALUE 'SUPPLIER';
ALTER TYPE "DocumentType" ADD VALUE 'INVENTORY_RESERVATION';
ALTER TYPE "DocumentType" ADD VALUE 'OPENING_BALANCE';
ALTER TYPE "DocumentType" ADD VALUE 'INTERNAL_BARCODE';
ALTER TYPE "DocumentType" ADD VALUE 'WAREHOUSE';
ALTER TYPE "DocumentType" ADD VALUE 'INVENTORY_ALERT';

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "parentId" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "icon" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductCategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "countryCode" TEXT,
    "status" "BrandStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "UomCategory" NOT NULL,
    "dimension" "UomDimension" NOT NULL,
    "precision" INTEGER NOT NULL DEFAULT 2,
    "isBaseUnit" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "status" "UomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitConversion" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "fromUomId" UUID NOT NULL,
    "toUomId" UUID NOT NULL,
    "multiplier" DECIMAL(18,6) NOT NULL,
    "divisor" DECIMAL(18,6) NOT NULL,
    "roundingMode" "RoundingMode" NOT NULL DEFAULT 'HALF_UP',
    "precision" INTEGER NOT NULL DEFAULT 2,
    "isBidirectional" BOOLEAN NOT NULL DEFAULT false,
    "status" "UomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UnitConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "workspaceId" UUID,
    "categoryId" UUID,
    "brandId" UUID,
    "productType" "ProductType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "inventoryTracking" "InventoryTrackingType" NOT NULL DEFAULT 'NONE',
    "valuationMethodPlaceholder" TEXT,
    "defaultUomId" UUID NOT NULL,
    "purchaseUomId" UUID,
    "salesUomId" UUID,
    "taxCategory" TEXT,
    "taxRate" DECIMAL(5,2),
    "taxInclusive" BOOLEAN NOT NULL DEFAULT false,
    "baseCost" DECIMAL(18,2),
    "basePrice" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "weight" DECIMAL(18,4),
    "weightUomId" UUID,
    "length" DECIMAL(18,4),
    "width" DECIMAL(18,4),
    "height" DECIMAL(18,4),
    "dimensionUomId" UUID,
    "volume" DECIMAL(18,4),
    "volumeUomId" UUID,
    "requiresSerialTracking" BOOLEAN NOT NULL DEFAULT false,
    "requiresLotTracking" BOOLEAN NOT NULL DEFAULT false,
    "tracksExpiration" BOOLEAN NOT NULL DEFAULT false,
    "shelfLifeDays" INTEGER,
    "allowNegativeStock" BOOLEAN NOT NULL DEFAULT false,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "isPurchasable" BOOLEAN NOT NULL DEFAULT true,
    "isSellable" BOOLEAN NOT NULL DEFAULT true,
    "isRentable" BOOLEAN NOT NULL DEFAULT false,
    "isConsumable" BOOLEAN NOT NULL DEFAULT false,
    "isReturnable" BOOLEAN NOT NULL DEFAULT true,
    "isBundle" BOOLEAN NOT NULL DEFAULT false,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "dataType" "ProductAttributeDataType" NOT NULL,
    "displayType" "ProductAttributeDisplayType" NOT NULL,
    "isVariantAttribute" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isFilterable" BOOLEAN NOT NULL DEFAULT false,
    "isSearchable" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductAttributeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeValue" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "attributeId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "code" TEXT,
    "colorHex" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductAttributeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "internalCode" TEXT,
    "status" "ProductVariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "barcodePrimary" TEXT,
    "attributeCombinationKey" TEXT,
    "defaultUomId" UUID NOT NULL,
    "purchaseUomId" UUID,
    "salesUomId" UUID,
    "costPrice" DECIMAL(18,2),
    "sellingPrice" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "weight" DECIMAL(18,4),
    "weightUomId" UUID,
    "length" DECIMAL(18,4),
    "width" DECIMAL(18,4),
    "height" DECIMAL(18,4),
    "dimensionUomId" UUID,
    "volume" DECIMAL(18,4),
    "volumeUomId" UUID,
    "imageUrl" TEXT,
    "reorderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "allowNegativeStock" BOOLEAN,
    "allowBackorder" BOOLEAN,
    "metadata" JSONB,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantAttributeValue" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "productAttributeId" UUID NOT NULL,
    "productAttributeValueId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariantAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBarcode" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID,
    "productVariantId" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "barcodeType" "BarcodeType" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "BarcodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductBarcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttachment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID,
    "type" "ProductAttachmentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "description" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "status" "ProductTagStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTagAssignment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBundle" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "pricingMode" "ProductBundlePricingMode" NOT NULL,
    "allowComponentSubstitution" BOOLEAN NOT NULL DEFAULT false,
    "explodeOnReservation" BOOLEAN NOT NULL DEFAULT true,
    "status" "ProductBundleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBundleItem" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "componentVariantId" UUID NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "uomId" UUID NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "supplierNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "email" CITEXT,
    "phoneNumber" TEXT,
    "websiteUrl" TEXT,
    "taxNumber" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT,
    "contactPerson" TEXT,
    "paymentTermsDays" INTEGER,
    "currency" TEXT,
    "rating" DECIMAL(5,2),
    "notes" TEXT,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSupplier" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID,
    "supplierId" UUID NOT NULL,
    "supplierSku" TEXT,
    "supplierProductName" TEXT,
    "purchaseUomId" UUID NOT NULL,
    "conversionFactor" DECIMAL(18,6) NOT NULL,
    "minimumOrderQuantity" DECIMAL(18,4),
    "leadTimeDays" INTEGER,
    "lastPurchasePrice" DECIMAL(18,2),
    "currency" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" "ProductSupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "workspaceId" UUID,
    "locationId" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "warehouseType" "WarehouseType" NOT NULL,
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT,
    "contactName" TEXT,
    "phoneNumber" TEXT,
    "email" CITEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "allowNegativeStock" BOOLEAN NOT NULL DEFAULT false,
    "requiresBinLocation" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseZone" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "zoneType" "WarehouseZoneType" NOT NULL,
    "description" TEXT,
    "temperatureMin" DECIMAL(10,2),
    "temperatureMax" DECIMAL(10,2),
    "status" "WarehouseZoneStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WarehouseZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "warehouseZoneId" UUID,
    "parentId" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "barcode" TEXT,
    "locationType" "StorageLocationType" NOT NULL,
    "aisle" TEXT,
    "rack" TEXT,
    "shelf" TEXT,
    "bin" TEXT,
    "capacityQuantity" DECIMAL(18,4),
    "capacityWeight" DECIMAL(18,4),
    "weightUomId" UUID,
    "isPickable" BOOLEAN NOT NULL DEFAULT true,
    "isReceivable" BOOLEAN NOT NULL DEFAULT true,
    "isQuarantine" BOOLEAN NOT NULL DEFAULT false,
    "isDamaged" BOOLEAN NOT NULL DEFAULT false,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" "StorageLocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "trackingType" "InventoryTrackingType" NOT NULL,
    "defaultWarehouseId" UUID,
    "defaultStorageLocationId" UUID,
    "stockingUomId" UUID NOT NULL,
    "allowNegativeStock" BOOLEAN NOT NULL DEFAULT false,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "safetyStock" DECIMAL(18,4),
    "minimumStock" DECIMAL(18,4),
    "maximumStock" DECIMAL(18,4),
    "reorderPoint" DECIMAL(18,4),
    "reorderQuantity" DECIMAL(18,4),
    "leadTimeDays" INTEGER,
    "status" "InventoryItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryBalance" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "balanceKey" TEXT NOT NULL,
    "warehouseId" UUID NOT NULL,
    "storageLocationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "lotId" UUID,
    "inventoryStatus" "InventoryBalanceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "onHandQuantity" DECIMAL(18,4) NOT NULL,
    "reservedQuantity" DECIMAL(18,4) NOT NULL,
    "availableQuantity" DECIMAL(18,4) NOT NULL,
    "damagedQuantity" DECIMAL(18,4) NOT NULL,
    "quarantineQuantity" DECIMAL(18,4) NOT NULL,
    "incomingQuantity" DECIMAL(18,4) NOT NULL,
    "outgoingQuantity" DECIMAL(18,4) NOT NULL,
    "uomId" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "lastMovementAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "supplierId" UUID,
    "manufactureDate" DATE,
    "receivedDate" TIMESTAMP(3),
    "expirationDate" DATE,
    "status" "InventoryLotStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySerial" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "lotId" UUID,
    "warehouseId" UUID NOT NULL,
    "storageLocationId" UUID NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "InventorySerialStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "InventorySerialCondition" NOT NULL DEFAULT 'NEW',
    "receivedAt" TIMESTAMP(3),
    "manufacturedAt" TIMESTAMP(3),
    "expirationDate" DATE,
    "warrantyUntil" DATE,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InventorySerial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryReservation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "warehouseId" UUID,
    "storageLocationId" UUID,
    "productId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "lotId" UUID,
    "serialId" UUID,
    "sourceType" "InventoryReservationSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "reservationNumber" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "uomId" UUID NOT NULL,
    "status" "InventoryReservationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "expiresAt" TIMESTAMP(3),
    "reservedById" UUID,
    "releasedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReorderRule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "minimumStock" DECIMAL(18,4) NOT NULL,
    "reorderPoint" DECIMAL(18,4) NOT NULL,
    "reorderQuantity" DECIMAL(18,4) NOT NULL,
    "maximumStock" DECIMAL(18,4),
    "safetyStock" DECIMAL(18,4),
    "leadTimeDays" INTEGER,
    "preferredSupplierId" UUID,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReorderRuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReorderRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAlert" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "warehouseId" UUID,
    "productId" UUID,
    "productVariantId" UUID,
    "lotId" UUID,
    "alertType" "InventoryAlertType" NOT NULL,
    "severity" "InventoryAlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InventoryAlertStatus" NOT NULL DEFAULT 'OPEN',
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedById" UUID,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" UUID,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryOpeningBalance" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "openingNumber" TEXT NOT NULL,
    "warehouseId" UUID NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "status" "InventoryOpeningBalanceStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "postedAt" TIMESTAMP(3),
    "postedById" UUID,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryOpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryOpeningBalanceItem" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "openingBalanceId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "storageLocationId" UUID NOT NULL,
    "lotId" UUID,
    "serialId" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "uomId" UUID NOT NULL,
    "unitCost" DECIMAL(18,2),
    "currency" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryOpeningBalanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLedgerEntry" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "storageLocationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "lotId" UUID,
    "serialId" UUID,
    "entryType" "InventoryLedgerEntryType" NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "quantityDelta" DECIMAL(18,4) NOT NULL,
    "reservedDelta" DECIMAL(18,4) NOT NULL,
    "unitCost" DECIMAL(18,2),
    "currency" TEXT,
    "balanceAfter" DECIMAL(18,4),
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "actorUserId" UUID,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "importType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'UPLOADED',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "successRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "errorFileUrl" TEXT,
    "uploadedById" UUID,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "exportType" TEXT NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "status" "ExportJobStatus" NOT NULL DEFAULT 'QUEUED',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "filters" JSONB,
    "requestedById" UUID,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductCategory_organizationId_status_idx" ON "ProductCategory"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProductCategory_parentId_idx" ON "ProductCategory"("parentId");

-- CreateIndex
CREATE INDEX "ProductCategory_path_idx" ON "ProductCategory"("path");

-- CreateIndex
CREATE INDEX "ProductCategory_deletedAt_idx" ON "ProductCategory"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_organizationId_slug_key" ON "ProductCategory"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_organizationId_code_key" ON "ProductCategory"("organizationId", "code");

-- CreateIndex
CREATE INDEX "Brand_organizationId_status_idx" ON "Brand"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Brand_organizationId_name_idx" ON "Brand"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Brand_deletedAt_idx" ON "Brand"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_organizationId_slug_key" ON "Brand"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_organizationId_code_key" ON "Brand"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_code_key" ON "UnitOfMeasure"("code");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_organizationId_status_idx" ON "UnitOfMeasure"("organizationId", "status");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_deletedAt_idx" ON "UnitOfMeasure"("deletedAt");

-- CreateIndex
CREATE INDEX "UnitConversion_fromUomId_toUomId_idx" ON "UnitConversion"("fromUomId", "toUomId");

-- CreateIndex
CREATE INDEX "UnitConversion_deletedAt_idx" ON "UnitConversion"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UnitConversion_organizationId_fromUomId_toUomId_key" ON "UnitConversion"("organizationId", "fromUomId", "toUomId");

-- CreateIndex
CREATE INDEX "Product_organizationId_status_idx" ON "Product"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Product_organizationId_categoryId_idx" ON "Product"("organizationId", "categoryId");

-- CreateIndex
CREATE INDEX "Product_organizationId_brandId_idx" ON "Product"("organizationId", "brandId");

-- CreateIndex
CREATE INDEX "Product_organizationId_name_idx" ON "Product"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_code_key" ON "Product"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_slug_key" ON "Product"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "ProductAttribute_organizationId_status_idx" ON "ProductAttribute"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProductAttribute_deletedAt_idx" ON "ProductAttribute"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttribute_organizationId_code_key" ON "ProductAttribute"("organizationId", "code");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_organizationId_status_idx" ON "ProductAttributeValue"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_deletedAt_idx" ON "ProductAttributeValue"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeValue_attributeId_value_key" ON "ProductAttributeValue"("attributeId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeValue_attributeId_code_key" ON "ProductAttributeValue"("attributeId", "code");

-- CreateIndex
CREATE INDEX "ProductVariant_organizationId_productId_idx" ON "ProductVariant"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "ProductVariant_organizationId_status_idx" ON "ProductVariant"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProductVariant_organizationId_sku_idx" ON "ProductVariant"("organizationId", "sku");

-- CreateIndex
CREATE INDEX "ProductVariant_barcodePrimary_idx" ON "ProductVariant"("barcodePrimary");

-- CreateIndex
CREATE INDEX "ProductVariant_deletedAt_idx" ON "ProductVariant"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_organizationId_sku_key" ON "ProductVariant"("organizationId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_organizationId_internalCode_key" ON "ProductVariant"("organizationId", "internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_attributeCombinationKey_key" ON "ProductVariant"("productId", "attributeCombinationKey");

-- CreateIndex
CREATE INDEX "ProductVariantAttributeValue_organizationId_productAttribut_idx" ON "ProductVariantAttributeValue"("organizationId", "productAttributeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantAttributeValue_variant_attribute_key" ON "ProductVariantAttributeValue"("productVariantId", "productAttributeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantAttributeValue_variant_value_key" ON "ProductVariantAttributeValue"("productVariantId", "productAttributeValueId");

-- CreateIndex
CREATE INDEX "ProductBarcode_productVariantId_isPrimary_idx" ON "ProductBarcode"("productVariantId", "isPrimary");

-- CreateIndex
CREATE INDEX "ProductBarcode_deletedAt_idx" ON "ProductBarcode"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBarcode_organizationId_barcode_key" ON "ProductBarcode"("organizationId", "barcode");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_productVariantId_sortOrder_idx" ON "ProductImage"("productVariantId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_deletedAt_idx" ON "ProductImage"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductAttachment_productId_type_idx" ON "ProductAttachment"("productId", "type");

-- CreateIndex
CREATE INDEX "ProductAttachment_productVariantId_type_idx" ON "ProductAttachment"("productVariantId", "type");

-- CreateIndex
CREATE INDEX "ProductAttachment_deletedAt_idx" ON "ProductAttachment"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductTag_organizationId_status_idx" ON "ProductTag"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProductTag_deletedAt_idx" ON "ProductTag"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTag_organizationId_slug_key" ON "ProductTag"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "ProductTagAssignment_organizationId_tagId_idx" ON "ProductTagAssignment"("organizationId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTagAssignment_productId_tagId_key" ON "ProductTagAssignment"("productId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundle_productId_key" ON "ProductBundle"("productId");

-- CreateIndex
CREATE INDEX "ProductBundle_organizationId_status_idx" ON "ProductBundle"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProductBundle_deletedAt_idx" ON "ProductBundle"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductBundleItem_organizationId_componentVariantId_idx" ON "ProductBundleItem"("organizationId", "componentVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundleItem_bundleId_componentVariantId_key" ON "ProductBundleItem"("bundleId", "componentVariantId");

-- CreateIndex
CREATE INDEX "Supplier_organizationId_status_idx" ON "Supplier"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Supplier_organizationId_name_idx" ON "Supplier"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Supplier_deletedAt_idx" ON "Supplier"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_organizationId_supplierNumber_key" ON "Supplier"("organizationId", "supplierNumber");

-- CreateIndex
CREATE INDEX "ProductSupplier_organizationId_status_idx" ON "ProductSupplier"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProductSupplier_productVariantId_idx" ON "ProductSupplier"("productVariantId");

-- CreateIndex
CREATE INDEX "ProductSupplier_deletedAt_idx" ON "ProductSupplier"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSupplier_supplierId_productId_productVariantId_key" ON "ProductSupplier"("supplierId", "productId", "productVariantId");

-- CreateIndex
CREATE INDEX "Warehouse_organizationId_status_idx" ON "Warehouse"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Warehouse_organizationId_locationId_idx" ON "Warehouse"("organizationId", "locationId");

-- CreateIndex
CREATE INDEX "Warehouse_workspaceId_idx" ON "Warehouse"("workspaceId");

-- CreateIndex
CREATE INDEX "Warehouse_deletedAt_idx" ON "Warehouse"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_organizationId_code_key" ON "Warehouse"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_organizationId_slug_key" ON "Warehouse"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "WarehouseZone_organizationId_status_idx" ON "WarehouseZone"("organizationId", "status");

-- CreateIndex
CREATE INDEX "WarehouseZone_deletedAt_idx" ON "WarehouseZone"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseZone_warehouseId_code_key" ON "WarehouseZone"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "StorageLocation_warehouseId_status_idx" ON "StorageLocation"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "StorageLocation_warehouseZoneId_idx" ON "StorageLocation"("warehouseZoneId");

-- CreateIndex
CREATE INDEX "StorageLocation_deletedAt_idx" ON "StorageLocation"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StorageLocation_warehouseId_code_key" ON "StorageLocation"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "StorageLocation_organizationId_barcode_key" ON "StorageLocation"("organizationId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_productVariantId_key" ON "InventoryItem"("productVariantId");

-- CreateIndex
CREATE INDEX "InventoryItem_organizationId_status_idx" ON "InventoryItem"("organizationId", "status");

-- CreateIndex
CREATE INDEX "InventoryItem_deletedAt_idx" ON "InventoryItem"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryBalance_balanceKey_key" ON "InventoryBalance"("balanceKey");

-- CreateIndex
CREATE INDEX "InventoryBalance_organizationId_warehouseId_productVariantI_idx" ON "InventoryBalance"("organizationId", "warehouseId", "productVariantId");

-- CreateIndex
CREATE INDEX "InventoryBalance_organizationId_storageLocationId_productVa_idx" ON "InventoryBalance"("organizationId", "storageLocationId", "productVariantId");

-- CreateIndex
CREATE INDEX "InventoryBalance_lotId_idx" ON "InventoryBalance"("lotId");

-- CreateIndex
CREATE INDEX "InventoryBalance_availableQuantity_idx" ON "InventoryBalance"("availableQuantity");

-- CreateIndex
CREATE INDEX "InventoryBalance_lastMovementAt_idx" ON "InventoryBalance"("lastMovementAt");

-- CreateIndex
CREATE INDEX "InventoryLot_organizationId_productVariantId_idx" ON "InventoryLot"("organizationId", "productVariantId");

-- CreateIndex
CREATE INDEX "InventoryLot_expirationDate_idx" ON "InventoryLot"("expirationDate");

-- CreateIndex
CREATE INDEX "InventoryLot_status_idx" ON "InventoryLot"("status");

-- CreateIndex
CREATE INDEX "InventoryLot_deletedAt_idx" ON "InventoryLot"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLot_organizationId_productVariantId_lotNumber_key" ON "InventoryLot"("organizationId", "productVariantId", "lotNumber");

-- CreateIndex
CREATE INDEX "InventorySerial_organizationId_productVariantId_idx" ON "InventorySerial"("organizationId", "productVariantId");

-- CreateIndex
CREATE INDEX "InventorySerial_warehouseId_idx" ON "InventorySerial"("warehouseId");

-- CreateIndex
CREATE INDEX "InventorySerial_storageLocationId_idx" ON "InventorySerial"("storageLocationId");

-- CreateIndex
CREATE INDEX "InventorySerial_status_idx" ON "InventorySerial"("status");

-- CreateIndex
CREATE INDEX "InventorySerial_expirationDate_idx" ON "InventorySerial"("expirationDate");

-- CreateIndex
CREATE INDEX "InventorySerial_deletedAt_idx" ON "InventorySerial"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySerial_organizationId_serialNumber_key" ON "InventorySerial"("organizationId", "serialNumber");

-- CreateIndex
CREATE INDEX "InventoryReservation_organizationId_sourceType_sourceId_idx" ON "InventoryReservation"("organizationId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "InventoryReservation_productVariantId_idx" ON "InventoryReservation"("productVariantId");

-- CreateIndex
CREATE INDEX "InventoryReservation_status_idx" ON "InventoryReservation"("status");

-- CreateIndex
CREATE INDEX "InventoryReservation_expiresAt_idx" ON "InventoryReservation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryReservation_organizationId_reservationNumber_key" ON "InventoryReservation"("organizationId", "reservationNumber");

-- CreateIndex
CREATE INDEX "ReorderRule_organizationId_warehouseId_idx" ON "ReorderRule"("organizationId", "warehouseId");

-- CreateIndex
CREATE INDEX "ReorderRule_productVariantId_idx" ON "ReorderRule"("productVariantId");

-- CreateIndex
CREATE INDEX "ReorderRule_status_idx" ON "ReorderRule"("status");

-- CreateIndex
CREATE INDEX "ReorderRule_deletedAt_idx" ON "ReorderRule"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReorderRule_warehouseId_productVariantId_key" ON "ReorderRule"("warehouseId", "productVariantId");

-- CreateIndex
CREATE INDEX "InventoryAlert_organizationId_status_idx" ON "InventoryAlert"("organizationId", "status");

-- CreateIndex
CREATE INDEX "InventoryAlert_alertType_idx" ON "InventoryAlert"("alertType");

-- CreateIndex
CREATE INDEX "InventoryAlert_severity_idx" ON "InventoryAlert"("severity");

-- CreateIndex
CREATE INDEX "InventoryAlert_detectedAt_idx" ON "InventoryAlert"("detectedAt");

-- CreateIndex
CREATE INDEX "InventoryOpeningBalance_warehouseId_status_idx" ON "InventoryOpeningBalance"("warehouseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryOpeningBalance_organizationId_openingNumber_key" ON "InventoryOpeningBalance"("organizationId", "openingNumber");

-- CreateIndex
CREATE INDEX "InventoryOpeningBalanceItem_openingBalanceId_idx" ON "InventoryOpeningBalanceItem"("openingBalanceId");

-- CreateIndex
CREATE INDEX "InventoryOpeningBalanceItem_productVariantId_idx" ON "InventoryOpeningBalanceItem"("productVariantId");

-- CreateIndex
CREATE INDEX "InventoryLedgerEntry_organizationId_productVariantId_occurr_idx" ON "InventoryLedgerEntry"("organizationId", "productVariantId", "occurredAt");

-- CreateIndex
CREATE INDEX "InventoryLedgerEntry_referenceType_referenceId_idx" ON "InventoryLedgerEntry"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "InventoryLedgerEntry_warehouseId_idx" ON "InventoryLedgerEntry"("warehouseId");

-- CreateIndex
CREATE INDEX "InventoryLedgerEntry_storageLocationId_idx" ON "InventoryLedgerEntry"("storageLocationId");

-- CreateIndex
CREATE INDEX "InventoryLedgerEntry_lotId_idx" ON "InventoryLedgerEntry"("lotId");

-- CreateIndex
CREATE INDEX "InventoryLedgerEntry_serialId_idx" ON "InventoryLedgerEntry"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLedgerEntry_organizationId_idempotencyKey_key" ON "InventoryLedgerEntry"("organizationId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "ImportJob_organizationId_status_idx" ON "ImportJob"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ImportJob_createdAt_idx" ON "ImportJob"("createdAt");

-- CreateIndex
CREATE INDEX "ExportJob_organizationId_status_idx" ON "ExportJob"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ExportJob_createdAt_idx" ON "ExportJob"("createdAt");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitOfMeasure" ADD CONSTRAINT "UnitOfMeasure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_fromUomId_fkey" FOREIGN KEY ("fromUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_toUomId_fkey" FOREIGN KEY ("toUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_defaultUomId_fkey" FOREIGN KEY ("defaultUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_purchaseUomId_fkey" FOREIGN KEY ("purchaseUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_salesUomId_fkey" FOREIGN KEY ("salesUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_weightUomId_fkey" FOREIGN KEY ("weightUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_dimensionUomId_fkey" FOREIGN KEY ("dimensionUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_volumeUomId_fkey" FOREIGN KEY ("volumeUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_defaultUomId_fkey" FOREIGN KEY ("defaultUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_purchaseUomId_fkey" FOREIGN KEY ("purchaseUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_salesUomId_fkey" FOREIGN KEY ("salesUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_weightUomId_fkey" FOREIGN KEY ("weightUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_dimensionUomId_fkey" FOREIGN KEY ("dimensionUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_volumeUomId_fkey" FOREIGN KEY ("volumeUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValue" ADD CONSTRAINT "ProductVariantAttributeValue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValue" ADD CONSTRAINT "ProductVariantAttributeValue_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValue" ADD CONSTRAINT "ProductVariantAttributeValue_productAttributeId_fkey" FOREIGN KEY ("productAttributeId") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttributeValue" ADD CONSTRAINT "ProductVariantAttributeValue_productAttributeValueId_fkey" FOREIGN KEY ("productAttributeValueId") REFERENCES "ProductAttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBarcode" ADD CONSTRAINT "ProductBarcode_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBarcode" ADD CONSTRAINT "ProductBarcode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBarcode" ADD CONSTRAINT "ProductBarcode_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttachment" ADD CONSTRAINT "ProductAttachment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttachment" ADD CONSTRAINT "ProductAttachment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttachment" ADD CONSTRAINT "ProductAttachment_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagAssignment" ADD CONSTRAINT "ProductTagAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagAssignment" ADD CONSTRAINT "ProductTagAssignment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagAssignment" ADD CONSTRAINT "ProductTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundle" ADD CONSTRAINT "ProductBundle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundle" ADD CONSTRAINT "ProductBundle_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "ProductBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_componentVariantId_fkey" FOREIGN KEY ("componentVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSupplier" ADD CONSTRAINT "ProductSupplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSupplier" ADD CONSTRAINT "ProductSupplier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSupplier" ADD CONSTRAINT "ProductSupplier_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSupplier" ADD CONSTRAINT "ProductSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSupplier" ADD CONSTRAINT "ProductSupplier_purchaseUomId_fkey" FOREIGN KEY ("purchaseUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseZone" ADD CONSTRAINT "WarehouseZone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseZone" ADD CONSTRAINT "WarehouseZone_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_warehouseZoneId_fkey" FOREIGN KEY ("warehouseZoneId") REFERENCES "WarehouseZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_weightUomId_fkey" FOREIGN KEY ("weightUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_defaultWarehouseId_fkey" FOREIGN KEY ("defaultWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_defaultStorageLocationId_fkey" FOREIGN KEY ("defaultStorageLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_stockingUomId_fkey" FOREIGN KEY ("stockingUomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySerial" ADD CONSTRAINT "InventorySerial_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySerial" ADD CONSTRAINT "InventorySerial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySerial" ADD CONSTRAINT "InventorySerial_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySerial" ADD CONSTRAINT "InventorySerial_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySerial" ADD CONSTRAINT "InventorySerial_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySerial" ADD CONSTRAINT "InventorySerial_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_serialId_fkey" FOREIGN KEY ("serialId") REFERENCES "InventorySerial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderRule" ADD CONSTRAINT "ReorderRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderRule" ADD CONSTRAINT "ReorderRule_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderRule" ADD CONSTRAINT "ReorderRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderRule" ADD CONSTRAINT "ReorderRule_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderRule" ADD CONSTRAINT "ReorderRule_preferredSupplierId_fkey" FOREIGN KEY ("preferredSupplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalance" ADD CONSTRAINT "InventoryOpeningBalance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalance" ADD CONSTRAINT "InventoryOpeningBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalanceItem" ADD CONSTRAINT "InventoryOpeningBalanceItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalanceItem" ADD CONSTRAINT "InventoryOpeningBalanceItem_openingBalanceId_fkey" FOREIGN KEY ("openingBalanceId") REFERENCES "InventoryOpeningBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalanceItem" ADD CONSTRAINT "InventoryOpeningBalanceItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalanceItem" ADD CONSTRAINT "InventoryOpeningBalanceItem_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalanceItem" ADD CONSTRAINT "InventoryOpeningBalanceItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalanceItem" ADD CONSTRAINT "InventoryOpeningBalanceItem_serialId_fkey" FOREIGN KEY ("serialId") REFERENCES "InventorySerial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOpeningBalanceItem" ADD CONSTRAINT "InventoryOpeningBalanceItem_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLedgerEntry" ADD CONSTRAINT "InventoryLedgerEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLedgerEntry" ADD CONSTRAINT "InventoryLedgerEntry_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLedgerEntry" ADD CONSTRAINT "InventoryLedgerEntry_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLedgerEntry" ADD CONSTRAINT "InventoryLedgerEntry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLedgerEntry" ADD CONSTRAINT "InventoryLedgerEntry_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLedgerEntry" ADD CONSTRAINT "InventoryLedgerEntry_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLedgerEntry" ADD CONSTRAINT "InventoryLedgerEntry_serialId_fkey" FOREIGN KEY ("serialId") REFERENCES "InventorySerial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
