import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { createDefaultData, createId, defaultProducts } from "./storage.js";

const watchedTables = ["app_settings", "products", "transactions", "transaction_items", "stock_movements"];

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.");
  }
}

function assertResult(result, fallbackMessage = "Operasi database gagal.") {
  if (result.error) {
    throw new Error(result.error.message || fallbackMessage);
  }
  return result.data;
}

function fromProduct(row) {
  return {
    id: row.id,
    name: row.name,
    barcode: row.barcode || "",
    category: row.category || "Umum",
    stock: Number(row.stock || 0),
    costPrice: Number(row.cost_price || 0),
    sellPrice: Number(row.sell_price || 0),
    unit: row.unit || "pcs",
    minStock: Number(row.min_stock || 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toProduct(product) {
  return {
    id: product.id || createId("prd"),
    name: product.name,
    barcode: product.barcode ? String(product.barcode).trim() : null,
    category: product.category || "Umum",
    stock: Number(product.stock || 0),
    cost_price: Number(product.costPrice || 0),
    sell_price: Number(product.sellPrice || 0),
    unit: product.unit || "pcs",
    min_stock: Number(product.minStock || 10),
    updated_at: new Date().toISOString()
  };
}

function fromSettings(row) {
  return {
    storeName: row?.store_name || "Kasir Warung Pintar",
    lowStockThreshold: Number(row?.low_stock_threshold || 10)
  };
}

function toSettings(settings) {
  return {
    id: "default",
    store_name: settings.storeName || "Kasir Warung Pintar",
    low_stock_threshold: Number(settings.lowStockThreshold || 10),
    updated_at: new Date().toISOString()
  };
}

function fromStockMovement(row) {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    productId: row.product_id,
    productName: row.product_name,
    qty: Number(row.qty || 0),
    previousStock: Number(row.previous_stock || 0),
    nextStock: Number(row.next_stock || 0),
    note: row.note || "",
    costPrice: Number(row.cost_price || 0)
  };
}

function fromTransaction(row, items) {
  return {
    id: row.id,
    number: row.number,
    date: row.date,
    total: Number(row.total || 0),
    payment: Number(row.payment || 0),
    change: Number(row.change_amount || 0),
    profit: Number(row.profit || 0),
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      barcode: item.barcode || "",
      unit: item.unit || "pcs",
      qty: Number(item.qty || 0),
      price: Number(item.price || 0),
      costPrice: Number(item.cost_price || 0),
      subtotal: Number(item.subtotal || 0),
      profit: Number(item.profit || 0)
    }))
  };
}

function toTransactionRow(transaction) {
  return {
    id: transaction.id,
    number: transaction.number,
    date: transaction.date,
    total: Number(transaction.total || 0),
    payment: Number(transaction.payment || 0),
    change_amount: Number(transaction.change || 0),
    profit: Number(transaction.profit || 0)
  };
}

function toTransactionItemRows(transaction) {
  return (transaction.items || []).map((item) => ({
    transaction_id: transaction.id,
    product_id: item.productId || null,
    name: item.name,
    barcode: item.barcode || null,
    unit: item.unit || "pcs",
    qty: Number(item.qty || 0),
    price: Number(item.price || item.sellPrice || 0),
    cost_price: Number(item.costPrice || 0),
    subtotal: Number(item.subtotal || 0),
    profit: Number(item.profit || 0)
  }));
}

function toStockMovementRow(movement) {
  return {
    id: movement.id || createId(movement.type === "in" ? "stin" : "stout"),
    type: movement.type,
    date: movement.date || new Date().toISOString(),
    product_id: movement.productId,
    product_name: movement.productName,
    qty: Number(movement.qty || 0),
    previous_stock: Number(movement.previousStock || 0),
    next_stock: Number(movement.nextStock || 0),
    note: movement.note || "",
    cost_price: Number(movement.costPrice || 0)
  };
}

export async function fetchCloudData() {
  requireSupabase();

  const [settingsResult, productsResult, transactionsResult, itemsResult, movementsResult] = await Promise.all([
    supabase.from("app_settings").select("*").eq("id", "default").maybeSingle(),
    supabase.from("products").select("*").order("name", { ascending: true }),
    supabase.from("transactions").select("*").order("date", { ascending: false }),
    supabase.from("transaction_items").select("*"),
    supabase.from("stock_movements").select("*").order("date", { ascending: false })
  ]);

  const settings = assertResult(settingsResult, "Gagal mengambil pengaturan.");
  const products = assertResult(productsResult, "Gagal mengambil produk.");
  const transactions = assertResult(transactionsResult, "Gagal mengambil transaksi.");
  const transactionItems = assertResult(itemsResult, "Gagal mengambil item transaksi.");
  const stockMovements = assertResult(movementsResult, "Gagal mengambil riwayat stok.");

  const itemsByTransaction = transactionItems.reduce((map, item) => {
    const list = map.get(item.transaction_id) || [];
    list.push(item);
    map.set(item.transaction_id, list);
    return map;
  }, new Map());

  return {
    version: 2,
    settings: fromSettings(settings),
    products: products.map(fromProduct),
    transactions: transactions.map((transaction) =>
      fromTransaction(transaction, itemsByTransaction.get(transaction.id) || [])
    ),
    stockMovements: stockMovements.map(fromStockMovement),
    updatedAt: new Date().toISOString()
  };
}

export async function saveCloudProduct(product) {
  requireSupabase();
  const row = toProduct(product);
  const result = await supabase.from("products").upsert(row, { onConflict: "id" }).select().single();
  return fromProduct(assertResult(result, "Gagal menyimpan barang."));
}

export async function deleteCloudProduct(productId) {
  requireSupabase();
  assertResult(await supabase.from("products").delete().eq("id", productId), "Gagal menghapus barang.");
}

export async function saveCloudSettings(settings) {
  requireSupabase();
  assertResult(
    await supabase.from("app_settings").upsert(toSettings(settings), { onConflict: "id" }),
    "Gagal menyimpan pengaturan."
  );
}

export async function completeCloudTransaction(transaction) {
  requireSupabase();
  return assertResult(
    await supabase.rpc("complete_sale", { p_transaction: transaction }),
    "Gagal menyelesaikan transaksi."
  );
}

export async function saveCloudStockMovement(movement) {
  requireSupabase();
  return assertResult(
    await supabase.rpc("record_stock_movement", { p_movement: movement }),
    "Gagal menyimpan stok."
  );
}

export async function replaceCloudData(nextData) {
  requireSupabase();

  const transactions = nextData.transactions || [];
  const transactionRows = transactions.map(toTransactionRow);
  const transactionItemRows = transactions.flatMap(toTransactionItemRows);
  const products = (nextData.products || []).map(toProduct);
  const movements = (nextData.stockMovements || []).map(toStockMovementRow);

  assertResult(await supabase.from("transaction_items").delete().not("id", "is", null), "Gagal membersihkan item transaksi.");
  assertResult(await supabase.from("transactions").delete().not("id", "is", null), "Gagal membersihkan transaksi.");
  assertResult(await supabase.from("stock_movements").delete().not("id", "is", null), "Gagal membersihkan stok.");
  assertResult(await supabase.from("products").delete().not("id", "is", null), "Gagal membersihkan barang.");

  assertResult(
    await supabase.from("app_settings").upsert(toSettings(nextData.settings || createDefaultData().settings), {
      onConflict: "id"
    }),
    "Gagal menyimpan pengaturan impor."
  );

  if (products.length) {
    assertResult(await supabase.from("products").insert(products), "Gagal mengimpor barang.");
  }

  if (transactionRows.length) {
    assertResult(await supabase.from("transactions").insert(transactionRows), "Gagal mengimpor transaksi.");
  }

  if (transactionItemRows.length) {
    assertResult(await supabase.from("transaction_items").insert(transactionItemRows), "Gagal mengimpor item transaksi.");
  }

  if (movements.length) {
    assertResult(await supabase.from("stock_movements").insert(movements), "Gagal mengimpor riwayat stok.");
  }
}

export async function resetCloudData() {
  await replaceCloudData({
    ...createDefaultData(),
    products: defaultProducts
  });
}

export function subscribeCloudChanges(onChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = watchedTables.reduce(
    (currentChannel, table) =>
      currentChannel.on("postgres_changes", { event: "*", schema: "public", table }, () => onChange(table)),
    supabase.channel("kasir-warung-pintar-sync")
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
