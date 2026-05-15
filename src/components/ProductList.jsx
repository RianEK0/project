import { useEffect, useMemo, useState } from "react";
import ProductForm from "./ProductForm.jsx";
import { formatNumber, formatRupiah } from "../utils/format.js";

function ProductList({ products, draftBarcode, onClearDraftBarcode, onSaveProduct, onDeleteProduct }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (draftBarcode) {
      setEditingProduct(null);
      setShowForm(true);
    }
  }, [draftBarcode]);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return products;

    return products.filter((product) =>
      [product.name, product.barcode, product.category].some((field) => String(field || "").toLowerCase().includes(search))
    );
  }, [products, query]);

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
    onClearDraftBarcode();
  }

  function confirmDelete(product) {
    if (window.confirm(`Hapus ${product.name}?`)) {
      onDeleteProduct(product.id);
    }
  }

  return (
    <section className="page-stack">
      {showForm ? (
        <ProductForm
          product={editingProduct}
          draftBarcode={draftBarcode}
          onSaveProduct={onSaveProduct}
          onCancel={closeForm}
        />
      ) : (
        <div className="section-actions">
          <button className="success-btn" onClick={() => setShowForm(true)}>
            Tambah Barang
          </button>
        </div>
      )}

      <section className="panel">
        <div className="section-heading">
          <h2>Daftar Barang</h2>
          <span className="pill">{formatNumber(filteredProducts.length)} barang</span>
        </div>

        <input
          className="search-input"
          value={query}
          placeholder="Cari nama, barcode, kategori"
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="product-table">
          {filteredProducts.map((product) => (
            <article className="product-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <span>
                  {product.category} · {product.barcode || "Tanpa barcode"}
                </span>
              </div>
              <div>
                <span>Stok</span>
                <strong>
                  {formatNumber(product.stock)} {product.unit}
                </strong>
              </div>
              <div>
                <span>Modal</span>
                <strong>{formatRupiah(product.costPrice)}</strong>
              </div>
              <div>
                <span>Jual</span>
                <strong>{formatRupiah(product.sellPrice)}</strong>
              </div>
              <div className="row-actions">
                <button
                  className="ghost-btn"
                  onClick={() => {
                    setEditingProduct(product);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button className="danger-btn" onClick={() => confirmDelete(product)}>
                  Hapus
                </button>
              </div>
            </article>
          ))}
          {filteredProducts.length === 0 && <p className="empty-state">Barang tidak ditemukan.</p>}
        </div>
      </section>
    </section>
  );
}

export default ProductList;
