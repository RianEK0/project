import { useMemo, useState } from "react";
import { createReceiptText } from "../utils/calculations.js";
import { downloadTextFile, formatDateTime, formatNumber, formatRupiah, toDateInputValue } from "../utils/format.js";

function TransactionHistory({ transactions, stockMovements, storeName }) {
  const [mode, setMode] = useState("sales");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const filteredTransactions = useMemo(() => {
    const search = query.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesDate = !dateFilter || toDateInputValue(transaction.date) === dateFilter;
      const matchesSearch =
        !search ||
        transaction.number.toLowerCase().includes(search) ||
        transaction.items.some((item) => item.name.toLowerCase().includes(search));
      return matchesDate && matchesSearch;
    });
  }, [transactions, query, dateFilter]);

  const filteredMovements = useMemo(() => {
    const search = query.trim().toLowerCase();
    return stockMovements.filter((movement) => {
      const matchesMode = mode === "stock-in" ? movement.type === "in" : movement.type === "out";
      const matchesDate = !dateFilter || toDateInputValue(movement.date) === dateFilter;
      const matchesSearch =
        !search ||
        movement.productName.toLowerCase().includes(search) ||
        String(movement.note || "").toLowerCase().includes(search);
      return matchesMode && matchesDate && matchesSearch;
    });
  }, [stockMovements, mode, query, dateFilter]);

  function saveHistoricalReceipt(transaction) {
    const text = createReceiptText(transaction, storeName);
    downloadTextFile(`${transaction.number}.txt`, text, "text/plain;charset=utf-8");
  }

  return (
    <section className="page-stack">
      <section className="panel">
        <div className="segmented">
          <button className={mode === "sales" ? "active" : ""} onClick={() => setMode("sales")}>
            Penjualan
          </button>
          <button className={mode === "stock-in" ? "active" : ""} onClick={() => setMode("stock-in")}>
            Stok Masuk
          </button>
          <button className={mode === "stock-out" ? "active" : ""} onClick={() => setMode("stock-out")}>
            Stok Keluar
          </button>
        </div>

        <div className="filter-row">
          <input
            value={query}
            placeholder="Cari transaksi atau barang"
            onChange={(event) => setQuery(event.target.value)}
          />
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          <button className="ghost-btn" onClick={() => setDateFilter("")}>
            Semua
          </button>
        </div>
      </section>

      {mode === "sales" ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Riwayat Penjualan</h2>
            <span className="pill">{formatNumber(filteredTransactions.length)} transaksi</span>
          </div>
          <div className="history-list">
            {filteredTransactions.map((transaction) => (
              <article className="history-row" key={transaction.id}>
                <div>
                  <strong>{transaction.number}</strong>
                  <span>{formatDateTime(transaction.date)}</span>
                </div>
                <div>
                  <span>{formatNumber(transaction.items.length)} jenis barang</span>
                  <strong>{formatRupiah(transaction.total)}</strong>
                </div>
                <button className="ghost-btn" onClick={() => setSelectedTransaction(transaction)}>
                  Detail
                </button>
              </article>
            ))}
            {filteredTransactions.length === 0 && <p className="empty-state">Riwayat penjualan kosong.</p>}
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="section-heading">
            <h2>{mode === "stock-in" ? "Riwayat Stok Masuk" : "Riwayat Stok Keluar"}</h2>
            <span className="pill">{formatNumber(filteredMovements.length)} catatan</span>
          </div>
          <div className="history-list">
            {filteredMovements.map((movement) => (
              <article className="history-row" key={movement.id}>
                <div>
                  <strong>{movement.productName}</strong>
                  <span>{formatDateTime(movement.date)}</span>
                </div>
                <div>
                  <span>
                    {formatNumber(movement.previousStock)} ke {formatNumber(movement.nextStock)}
                  </span>
                  <strong>
                    {movement.type === "in" ? "+" : "-"}
                    {formatNumber(movement.qty)}
                  </strong>
                </div>
                <p>{movement.note || "-"}</p>
              </article>
            ))}
            {filteredMovements.length === 0 && <p className="empty-state">Riwayat stok kosong.</p>}
          </div>
        </section>
      )}

      {selectedTransaction && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <section className="receipt-modal">
            <div className="receipt-paper">
              <h2>{storeName}</h2>
              <p>{formatDateTime(selectedTransaction.date)}</p>
              <p>{selectedTransaction.number}</p>
              <div className="receipt-lines">
                {selectedTransaction.items.map((item) => (
                  <div key={`${selectedTransaction.id}-${item.productId}`}>
                    <span>
                      {item.name} {item.qty} x {formatRupiah(item.price)}
                    </span>
                    <strong>{formatRupiah(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="receipt-total">
                <span>Total</span>
                <strong>{formatRupiah(selectedTransaction.total)}</strong>
              </div>
              <div className="receipt-row">
                <span>Bayar</span>
                <strong>{formatRupiah(selectedTransaction.payment)}</strong>
              </div>
              <div className="receipt-row">
                <span>Kembalian</span>
                <strong>{formatRupiah(selectedTransaction.change)}</strong>
              </div>
            </div>
            <div className="receipt-actions">
              <button className="ghost-btn" onClick={() => setSelectedTransaction(null)}>
                Tutup
              </button>
              <button className="primary-btn" onClick={() => saveHistoricalReceipt(selectedTransaction)}>
                Simpan Struk
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default TransactionHistory;
