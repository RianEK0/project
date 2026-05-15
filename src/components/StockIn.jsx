import { useEffect, useMemo, useState } from "react";
import { cleanNumberInput, formatNumber, formatRupiah } from "../utils/format.js";

function StockIn({ products, onSaveMovement, onNavigate }) {
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [qty, setQty] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId);

  useEffect(() => {
    if (!products.length) return;
    if (!productId || !products.some((product) => product.id === productId)) {
      setProductId(products[0].id);
      setCostPrice(products[0].costPrice || "");
    }
  }, [products, productId]);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products
      .filter((product) =>
        [product.name, product.barcode, product.category].some((field) => String(field || "").toLowerCase().includes(search))
      )
      .slice(0, 10);
  }, [products, query]);

  async function submitMovement(event) {
    event.preventDefault();
    setIsSaving(true);
    const success = await onSaveMovement({
      productId,
      qty: cleanNumberInput(qty),
      costPrice: cleanNumberInput(costPrice),
      note
    });
    setIsSaving(false);

    if (success) {
      setQty("");
      setCostPrice("");
      setNote("");
    }
  }

  return (
    <section className="split-layout">
      <section className="panel">
        <div className="section-heading">
          <h2>Pilih Barang</h2>
        </div>
        <input
          className="search-input"
          value={query}
          placeholder="Cari barang untuk stok masuk"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="picker-list">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              className={product.id === productId ? "picker-row active" : "picker-row"}
              onClick={() => {
                setProductId(product.id);
                setCostPrice(product.costPrice || "");
              }}
            >
              <strong>{product.name}</strong>
              <span>
                Stok {formatNumber(product.stock)} {product.unit} · {formatRupiah(product.costPrice)}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Stok Masuk</h2>
          <button className="ghost-btn" onClick={() => onNavigate("stock-out")}>
            Stok Keluar
          </button>
        </div>
        {selectedProduct && (
          <div className="selected-product">
            <strong>{selectedProduct.name}</strong>
            <span>
              Stok saat ini {formatNumber(selectedProduct.stock)} {selectedProduct.unit}
            </span>
          </div>
        )}

        <form className="form-grid single" onSubmit={submitMovement}>
          <label>
            Jumlah Masuk
            <input value={qty} inputMode="numeric" onChange={(event) => setQty(event.target.value)} required />
          </label>
          <label>
            Harga Modal Baru
            <input value={costPrice} inputMode="numeric" onChange={(event) => setCostPrice(event.target.value)} />
          </label>
          <label>
            Catatan
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Belanja grosir, retur, dll" />
          </label>
          <button className="success-btn full-width" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Stok Masuk"}
          </button>
        </form>
      </section>
    </section>
  );
}

export default StockIn;
