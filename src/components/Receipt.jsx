import { createReceiptText } from "../utils/calculations.js";
import { downloadTextFile, formatDateTime, formatRupiah } from "../utils/format.js";

function Receipt({ transaction, storeName, onClose }) {
  const receiptText = createReceiptText(transaction, storeName);

  function saveReceipt() {
    downloadTextFile(`${transaction.number}.txt`, receiptText, "text/plain;charset=utf-8");
  }

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(receiptText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="receipt-modal">
        <div className="receipt-paper">
          <h2>{storeName}</h2>
          <p>{formatDateTime(transaction.date)}</p>
          <p>{transaction.number}</p>
          <div className="receipt-lines">
            {transaction.items.map((item) => (
              <div key={`${transaction.id}-${item.productId}`}>
                <span>
                  {item.name} {item.qty} x {formatRupiah(item.price)}
                </span>
                <strong>{formatRupiah(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="receipt-total">
            <span>Total</span>
            <strong>{formatRupiah(transaction.total)}</strong>
          </div>
          <div className="receipt-row">
            <span>Bayar</span>
            <strong>{formatRupiah(transaction.payment)}</strong>
          </div>
          <div className="receipt-row">
            <span>Kembalian</span>
            <strong>{formatRupiah(transaction.change)}</strong>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="primary-btn" onClick={onClose}>
            Transaksi Baru
          </button>
          <button className="ghost-btn" onClick={saveReceipt}>
            Simpan Struk
          </button>
          <button className="success-btn" onClick={shareWhatsApp}>
            Bagikan WhatsApp
          </button>
        </div>
      </section>
    </div>
  );
}

export default Receipt;
