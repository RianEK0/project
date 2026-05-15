import { useEffect, useState } from "react";
import { calculateCartTotal } from "../utils/calculations.js";
import { cleanNumberInput, formatRupiah } from "../utils/format.js";

const quickPayments = [10000, 20000, 50000, 100000];

function PaymentPanel({ cart, onCompletePayment }) {
  const total = calculateCartTotal(cart);
  const [payment, setPayment] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const change = payment - total;
  const canPay = cart.length > 0 && total > 0 && payment >= total && !isPaying;

  useEffect(() => {
    if (!cart.length) setPayment(0);
  }, [cart.length]);

  async function submitPayment(event) {
    event.preventDefault();
    setIsPaying(true);
    const success = await onCompletePayment(payment);
    if (success) setPayment(0);
    setIsPaying(false);
  }

  return (
    <section className="panel payment-panel">
      <div className="section-heading">
        <h2>Pembayaran</h2>
      </div>

      <form onSubmit={submitPayment} className="payment-form">
        <label>
          Uang Bayar
          <input
            value={payment ? payment : ""}
            inputMode="numeric"
            placeholder="0"
            onChange={(event) => setPayment(cleanNumberInput(event.target.value))}
          />
        </label>

        <div className="quick-grid">
          <button type="button" onClick={() => setPayment(total)} disabled={!total}>
            Pas
          </button>
          {quickPayments.map((amount) => (
            <button key={amount} type="button" onClick={() => setPayment(amount)}>
              {formatRupiah(amount)}
            </button>
          ))}
        </div>

        <div className={change < 0 ? "change-box danger" : "change-box"}>
          <span>{change < 0 ? "Kurang" : "Kembalian"}</span>
          <strong>{formatRupiah(Math.abs(change || 0))}</strong>
        </div>

        <button className="success-btn full-width checkout-btn" disabled={!canPay}>
          {isPaying ? "Memproses..." : "Bayar / Selesaikan"}
        </button>
      </form>
    </section>
  );
}

export default PaymentPanel;
