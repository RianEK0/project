import { useEffect, useMemo, useState } from "react";
import { cleanNumberInput, formatNumber } from "../utils/format.js";

function StockOut({ products, onSaveMovement, onNavigate }) {
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId);

  useEffect(() => {
    if (!products.length) return;
    if (!productId || !products.some((product) => product.id === productId)) {
      setProductId(products[0].id);
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
      note
    });
    setIsSaving(false);

    if (success) {
      setQty("");
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
          placeholder="Cari barang untuk stok keluar"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="picker-list">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              className={product.id === productId ? "picker-row active" : "picker-row"}
              onClick={() => setProductId(product.id)}
            >
              <strong>{product.name}</strong>
              <span>
                Stok {formatNumber(product.stock)} {product.unit}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Stok Keluar</h2>
          <button className="ghost-btn" onClick={() => onNavigate("stock-in")}>
            Stok Masuk
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
            Jumlah Keluar
            <input value={qty} inputMode="numeric" onChange={(event) => setQty(event.target.value)} required />
          </label>
          <label>
            Alasan
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Rusak, hilang, dipakai, dll" />
          </label>
          <button className="danger-btn full-width" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Stok Keluar"}
          </button>
        </form>
      </section>
    </section>
  );
}

export default StockOut;
