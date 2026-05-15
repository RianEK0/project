import { useMemo, useState } from "react";
import BarcodeScanner from "./BarcodeScanner.jsx";
import Cart from "./Cart.jsx";
import PaymentPanel from "./PaymentPanel.jsx";
import { calculateCartTotal } from "../utils/calculations.js";
import { cleanNumberInput, formatNumber, formatRupiah } from "../utils/format.js";

function playScanSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.12);
  } catch {
    window.navigator.vibrate?.(70);
  }
}

function Cashier({
  products,
  cart,
  onAddToCart,
  onChangeQty,
  onRemoveItem,
  onCompletePayment,
  onAddNewProduct
}) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [unknownBarcode, setUnknownBarcode] = useState("");
  const total = calculateCartTotal(cart);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products.slice(0, 8);
    return products
      .filter((product) =>
        [product.name, product.barcode, product.category].some((field) => String(field || "").toLowerCase().includes(query))
      )
      .slice(0, 20);
  }, [products, search]);

  function addProduct(product) {
    const success = onAddToCart(product, 1);
    if (success) {
      setUnknownBarcode("");
      playScanSound();
      window.navigator.vibrate?.(60);
    }
  }

  function handleBarcode(barcodeValue) {
    const barcode = String(barcodeValue || "").trim();
    if (!barcode) return;

    const product = products.find((item) => item.barcode && item.barcode === barcode);
    if (!product) {
      setUnknownBarcode(barcode);
      return;
    }

    addProduct(product);
  }

  function submitManualBarcode(event) {
    event.preventDefault();
    handleBarcode(manualBarcode);
    setManualBarcode("");
  }

  return (
    <section className="cashier-layout">
      <div className="cashier-main">
        <section className="cashier-hero">
          <div>
            <span>Total Belanja</span>
            <strong>{formatRupiah(total)}</strong>
          </div>
          <button className="scan-button" onClick={() => setScannerOpen(true)}>
            Scan Barcode
          </button>
        </section>

        {unknownBarcode && (
          <div className="alert danger-alert">
            <strong>Barang belum terdaftar</strong>
            <span>Barcode {unknownBarcode}</span>
            <button className="danger-btn" onClick={() => onAddNewProduct(unknownBarcode)}>
              Tambah Barang Baru
            </button>
          </div>
        )}

        <section className="panel">
          <div className="section-heading">
            <h2>Input Cepat</h2>
          </div>
          <form className="inline-form" onSubmit={submitManualBarcode}>
            <input
              value={manualBarcode}
              inputMode="numeric"
              placeholder="Scan/input barcode"
              onChange={(event) => setManualBarcode(event.target.value)}
            />
            <button className="primary-btn">Tambah</button>
          </form>
          <input
            className="search-input"
            value={search}
            placeholder="Cari nama, barcode, kategori"
            onChange={(event) => setSearch(event.target.value)}
          />
        </section>

        <section className="product-quick-grid">
          {filteredProducts.map((product) => (
            <button
              className={product.stock <= Number(product.minStock || 0) ? "product-tile low" : "product-tile"}
              key={product.id}
              onClick={() => addProduct(product)}
              disabled={Number(product.stock || 0) <= 0}
            >
              <strong>{product.name}</strong>
              <span>{formatRupiah(product.sellPrice)}</span>
              <small>
                Stok {formatNumber(product.stock)} {product.unit}
              </small>
            </button>
          ))}
        </section>
      </div>

      <aside className="cashier-side">
        <Cart cart={cart} products={products} onChangeQty={onChangeQty} onRemoveItem={onRemoveItem} />
        <PaymentPanel cart={cart} onCompletePayment={onCompletePayment} />
      </aside>

      {scannerOpen && <BarcodeScanner onDetected={handleBarcode} onClose={() => setScannerOpen(false)} />}
    </section>
  );
}

export default Cashier;
