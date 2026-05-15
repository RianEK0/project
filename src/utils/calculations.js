export function cartSubtotal(item) {
  return Number(item.sellPrice || item.price || 0) * Number(item.qty || 0);
}

export function cartProfit(item) {
  const sellPrice = Number(item.sellPrice || item.price || 0);
  const costPrice = Number(item.costPrice || 0);
  return (sellPrice - costPrice) * Number(item.qty || 0);
}

export function calculateCartTotal(cart) {
  return cart.reduce((total, item) => total + cartSubtotal(item), 0);
}

export function calculateCartProfit(cart) {
  return cart.reduce((total, item) => total + cartProfit(item), 0);
}

export function validateCartStock(cart, products) {
  const errors = [];

  cart.forEach((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) {
      errors.push(`${item.name} tidak ditemukan di data barang.`);
      return;
    }

    if (Number(item.qty || 0) > Number(product.stock || 0)) {
      errors.push(`${item.name} stok tersedia ${product.stock}, diminta ${item.qty}.`);
    }
  });

  return errors;
}

export function getLowStockProducts(products, fallbackThreshold = 10) {
  return products
    .filter((product) => Number(product.stock || 0) <= Number(product.minStock || fallbackThreshold))
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
}

export function isSameDay(dateValue, comparison = new Date()) {
  const date = new Date(dateValue);
  const other = new Date(comparison);
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  );
}

export function isSameMonth(dateValue, comparison = new Date()) {
  const date = new Date(dateValue);
  const other = new Date(comparison);
  return date.getFullYear() === other.getFullYear() && date.getMonth() === other.getMonth();
}

export function summarizeTransactions(transactions) {
  return transactions.reduce(
    (summary, transaction) => {
      summary.revenue += Number(transaction.total || 0);
      summary.profit += Number(transaction.profit || 0);
      summary.count += 1;
      summary.itemsSold += (transaction.items || []).reduce((total, item) => total + Number(item.qty || 0), 0);
      return summary;
    },
    { revenue: 0, profit: 0, count: 0, itemsSold: 0 }
  );
}

export function getDashboardMetrics(data) {
  const products = data.products || [];
  const todayTransactions = (data.transactions || []).filter((transaction) => isSameDay(transaction.date));
  const todaySummary = summarizeTransactions(todayTransactions);
  const totalStock = products.reduce((total, product) => total + Number(product.stock || 0), 0);
  const stockCapital = products.reduce(
    (total, product) => total + Number(product.stock || 0) * Number(product.costPrice || 0),
    0
  );

  return {
    totalProducts: products.length,
    totalStock,
    lowStockProducts: getLowStockProducts(products, data.settings?.lowStockThreshold),
    revenueToday: todaySummary.revenue,
    transactionsToday: todaySummary.count,
    profitToday: todaySummary.profit,
    stockCapital
  };
}

export function getTopProducts(transactions, limit = 5) {
  const productMap = new Map();

  transactions.forEach((transaction) => {
    (transaction.items || []).forEach((item) => {
      const current = productMap.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        qty: 0,
        revenue: 0,
        profit: 0
      };

      current.qty += Number(item.qty || 0);
      current.revenue += Number(item.subtotal || 0);
      current.profit += Number(item.profit || 0);
      productMap.set(item.productId, current);
    });
  });

  return [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}

export function buildTransactionNumber(transactions) {
  const date = new Date();
  const dateCode = date.toISOString().slice(0, 10).replaceAll("-", "");
  const timeCode = date.toTimeString().slice(0, 8).replaceAll(":", "");
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `TRX-${dateCode}-${timeCode}-${suffix}`;
}

export function createReceiptText(transaction, storeName) {
  const lines = [
    storeName,
    transaction.number,
    new Date(transaction.date).toLocaleString("id-ID"),
    "",
    ...transaction.items.map(
      (item) =>
        `${item.name} ${item.qty} x ${Number(item.price || item.sellPrice || 0).toLocaleString("id-ID")} = ${Number(
          item.subtotal || 0
        ).toLocaleString("id-ID")}`
    ),
    "",
    `Total: Rp${Number(transaction.total || 0).toLocaleString("id-ID")}`,
    `Bayar: Rp${Number(transaction.payment || 0).toLocaleString("id-ID")}`,
    `Kembalian: Rp${Number(transaction.change || 0).toLocaleString("id-ID")}`,
    "",
    "Terima kasih"
  ];

  return lines.join("\n");
}
