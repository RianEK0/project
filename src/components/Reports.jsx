import { useMemo } from "react";
import { getTopProducts, isSameDay, isSameMonth, summarizeTransactions } from "../utils/calculations.js";
import { downloadTextFile, formatNumber, formatRupiah } from "../utils/format.js";

function transactionsToCsv(transactions) {
  const rows = [["Nomor", "Tanggal", "Barang", "Jumlah", "Subtotal", "Total", "Laba Kotor"]];
  transactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      rows.push([
        transaction.number,
        new Date(transaction.date).toLocaleString("id-ID"),
        item.name,
        item.qty,
        item.subtotal,
        transaction.total,
        item.profit
      ]);
    });
  });

  return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
}

function Reports({ transactions }) {
  const todayTransactions = useMemo(() => transactions.filter((transaction) => isSameDay(transaction.date)), [transactions]);
  const monthTransactions = useMemo(() => transactions.filter((transaction) => isSameMonth(transaction.date)), [transactions]);
  const today = summarizeTransactions(todayTransactions);
  const month = summarizeTransactions(monthTransactions);
  const topProducts = getTopProducts(monthTransactions, 8);

  function exportJson() {
    downloadTextFile(
      `laporan-kasir-warung-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ today, month, topProducts, transactions: monthTransactions }, null, 2),
      "application/json"
    );
  }

  function exportCsv() {
    downloadTextFile(
      `laporan-kasir-warung-${new Date().toISOString().slice(0, 10)}.csv`,
      transactionsToCsv(monthTransactions),
      "text/csv;charset=utf-8"
    );
  }

  return (
    <section className="page-stack">
      <div className="metric-grid">
        <article className="metric-card success">
          <span>Omzet Harian</span>
          <strong>{formatRupiah(today.revenue)}</strong>
        </article>
        <article className="metric-card">
          <span>Transaksi Harian</span>
          <strong>{formatNumber(today.count)}</strong>
        </article>
        <article className="metric-card success">
          <span>Laba Kotor Harian</span>
          <strong>{formatRupiah(today.profit)}</strong>
        </article>
        <article className="metric-card success">
          <span>Omzet Bulanan</span>
          <strong>{formatRupiah(month.revenue)}</strong>
        </article>
        <article className="metric-card">
          <span>Total Barang Terjual</span>
          <strong>{formatNumber(month.itemsSold)}</strong>
        </article>
        <article className="metric-card success">
          <span>Laba Kotor Bulanan</span>
          <strong>{formatRupiah(month.profit)}</strong>
        </article>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>Barang Paling Laku</h2>
          <div className="button-group">
            <button className="ghost-btn" onClick={exportJson}>
              Export JSON
            </button>
            <button className="ghost-btn" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>
        <div className="top-products">
          {topProducts.map((product, index) => (
            <article className="rank-row" key={product.productId}>
              <b>{index + 1}</b>
              <div>
                <strong>{product.name}</strong>
                <span>
                  {formatNumber(product.qty)} terjual · {formatRupiah(product.revenue)}
                </span>
              </div>
              <strong>{formatRupiah(product.profit)}</strong>
            </article>
          ))}
          {topProducts.length === 0 && <p className="empty-state">Belum ada barang terjual bulan ini.</p>}
        </div>
      </section>
    </section>
  );
}

export default Reports;
