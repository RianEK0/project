export const defaultProducts = [
  {
    id: "prd-indomie-goreng",
    name: "Indomie Goreng",
    barcode: "089686010203",
    category: "Makanan",
    stock: 34,
    costPrice: 2800,
    sellPrice: 3500,
    unit: "pcs",
    minStock: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-kopi-kapal-api",
    name: "Kopi Sachet Kapal Api",
    barcode: "899100210001",
    category: "Minuman",
    stock: 38,
    costPrice: 1000,
    sellPrice: 1500,
    unit: "sachet",
    minStock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-gula-pasir",
    name: "Gula Pasir 1kg",
    barcode: "",
    category: "Sembako",
    stock: 15,
    costPrice: 12000,
    sellPrice: 15000,
    unit: "kg",
    minStock: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prd-minyak-goreng",
    name: "Minyak Goreng 1L",
    barcode: "8992763123456",
    category: "Sembako",
    stock: 8,
    costPrice: 14000,
    sellPrice: 16000,
    unit: "botol",
    minStock: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function createId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultData() {
  return {
    version: 1,
    settings: {
      storeName: "Kasir Warung Pintar",
      lowStockThreshold: 10
    },
    products: defaultProducts,
    transactions: [],
    stockMovements: [],
    updatedAt: new Date().toISOString()
  };
}

export function exportData(data) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: "Kasir Warung Pintar",
      data
    },
    null,
    2
  );
}

export function parseImportedData(fileText) {
  const parsed = JSON.parse(fileText);
  const imported = parsed.data || parsed;

  if (!Array.isArray(imported.products)) {
    throw new Error("File tidak berisi data produk yang valid.");
  }

  return {
    ...createDefaultData(),
    ...imported,
    settings: {
      ...createDefaultData().settings,
      ...(imported.settings || {})
    },
    products: imported.products,
    transactions: Array.isArray(imported.transactions) ? imported.transactions : [],
    stockMovements: Array.isArray(imported.stockMovements) ? imported.stockMovements : []
  };
}
