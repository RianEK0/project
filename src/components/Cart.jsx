import { cartSubtotal, calculateCartTotal } from "../utils/calculations.js";
import { formatNumber, formatRupiah } from "../utils/format.js";

function Cart({ cart, products, onChangeQty, onRemoveItem }) {
  const total = calculateCartTotal(cart);

  return (
    <section className="panel cart-panel">
      <div className="section-heading">
        <h2>Keranjang</h2>
        <span className="pill">{formatNumber(cart.length)} item</span>
      </div>

      <div className="cart-list">
        {cart.length === 0 && <p className="empty-state">Keranjang kosong.</p>}
        {cart.map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          const maxStock = Number(product?.stock || 0);

          return (
            <article className="cart-item" key={item.productId}>
              <div className="cart-item-main">
                <strong>{item.name}</strong>
                <span>
                  {formatRupiah(item.sellPrice)} / {item.unit} · Stok {formatNumber(maxStock)}
                </span>
              </div>
              <div className="qty-control">
                <button onClick={() => onChangeQty(item.productId, item.qty - 1)} aria-label="Kurangi jumlah">
                  -
                </button>
                <input
                  value={item.qty}
                  inputMode="numeric"
                  onChange={(event) => onChangeQty(item.productId, event.target.value)}
                  aria-label={`Jumlah ${item.name}`}
                />
                <button onClick={() => onChangeQty(item.productId, item.qty + 1)} aria-label="Tambah jumlah">
                  +
                </button>
              </div>
              <strong className="subtotal">{formatRupiah(cartSubtotal(item))}</strong>
              <button className="icon-danger" onClick={() => onRemoveItem(item.productId)} aria-label="Hapus item">
                x
              </button>
            </article>
          );
        })}
      </div>

      <div className="total-bar">
        <span>Total</span>
        <strong>{formatRupiah(total)}</strong>
      </div>
    </section>
  );
}

export default Cart;
