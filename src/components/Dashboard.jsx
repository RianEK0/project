import { getDashboardMetrics } from "../utils/calculations.js";
import { formatNumber, formatRupiah } from "../utils/format.js";

function Dashboard({ data, onNavigate }) {
  const metrics = getDashboardMetrics(data);

  return (
    <section className="page-stack">
      <div className="metric-grid">
        <article className="metric-card">
          <span>Total Barang</span>
          <strong>{formatNumber(metrics.totalProducts)}</strong>
        </article>
        <article className="metric-card">
          <span>Total Stok</span>
          <strong>{formatNumber(metrics.totalStock)}</strong>
        </article>
        <article className="metric-card warning">
          <span>Stok Menipis</span>
          <strong>{formatNumber(metrics.lowStockProducts.length)}</strong>
        </article>
        <article className="metric-card success">
          <span>Omzet Hari Ini</span>
          <strong>{formatRupiah(metrics.revenueToday)}</strong>
        </article>
        <article className="metric-card">
          <span>Transaksi Hari Ini</span>
          <strong>{formatNumber(metrics.transactionsToday)}</strong>
        </article>
        <article className="metric-card success">
          <span>Laba Kotor Hari Ini</span>
          <strong>{formatRupiah(metrics.profitToday)}</strong>
        </article>
        <article className="metric-card">
          <span>Nilai Modal Stok</span>
          <strong>{formatRupiah(metrics.stockCapital)}</strong>
        </article>
      </div>

      <div className="split-layout">
        <section className="panel">
          <div className="section-heading">
            <h2>Barang Stok Menipis</h2>
            <button className="ghost-btn" onClick={() => onNavigate("stock-in")}>
              Stok Masuk
            </button>
          </div>
          <div className="list-stack">
            {metrics.lowStockProducts.length === 0 && <p className="empty-state">Tidak ada stok menipis.</p>}
            {metrics.lowStockProducts.slice(0, 8).map((product) => (
              <div className="stock-row" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                </div>
                <b>
                  {formatNumber(product.stock)} {product.unit}
                </b>
              </div>
            ))}
          </div>
        </section>

        <section className="panel action-panel">
          <h2>Akses Cepat</h2>
          <button className="primary-btn full-width" onClick={() => onNavigate("cashier")}>
            Buka Kasir
          </button>
          <button className="success-btn full-width" onClick={() => onNavigate("products")}>
            Tambah Barang
          </button>
          <button className="danger-btn full-width" onClick={() => onNavigate("stock-out")}>
            Stok Keluar
          </button>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
