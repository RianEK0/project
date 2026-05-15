import { useEffect, useState } from "react";
import BarcodeScanner from "./BarcodeScanner.jsx";
import { cleanNumberInput } from "../utils/format.js";

const emptyProduct = {
  name: "",
  barcode: "",
  category: "Umum",
  stock: 0,
  costPrice: 0,
  sellPrice: 0,
  unit: "pcs",
  minStock: 10
};

function ProductForm({ product, draftBarcode, onSaveProduct, onCancel }) {
  const [form, setForm] = useState(emptyProduct);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm(product);
      return;
    }

    setForm({
      ...emptyProduct,
      barcode: draftBarcode || ""
    });
  }, [product, draftBarcode]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!form.name.trim()) return;

    setIsSaving(true);
    const success = await onSaveProduct({
      ...form,
      name: form.name.trim(),
      stock: cleanNumberInput(form.stock),
      costPrice: cleanNumberInput(form.costPrice),
      sellPrice: cleanNumberInput(form.sellPrice),
      minStock: cleanNumberInput(form.minStock)
    });
    setIsSaving(false);

    if (success) {
      setForm(emptyProduct);
      onCancel();
    }
  }

  return (
    <section className="panel product-form-panel">
      <div className="section-heading">
        <h2>{product ? "Edit Barang" : "Tambah Barang"}</h2>
        <button className="ghost-btn" onClick={onCancel}>
          Tutup
        </button>
      </div>

      <form className="form-grid" onSubmit={submitForm}>
        <label className="span-2">
          Nama Barang
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        </label>

        <label>
          Barcode
          <div className="input-with-button">
            <input value={form.barcode} onChange={(event) => updateField("barcode", event.target.value)} />
            <button type="button" className="ghost-btn" onClick={() => setScannerOpen(true)}>
              Scan
            </button>
          </div>
        </label>

        <label>
          Kategori
          <input value={form.category} onChange={(event) => updateField("category", event.target.value)} />
        </label>

        <label>
          Stok
          <input
            value={form.stock}
            inputMode="numeric"
            onChange={(event) => updateField("stock", event.target.value)}
          />
        </label>

        <label>
          Satuan
          <input value={form.unit} onChange={(event) => updateField("unit", event.target.value)} />
        </label>

        <label>
          Harga Modal
          <input
            value={form.costPrice}
            inputMode="numeric"
            onChange={(event) => updateField("costPrice", event.target.value)}
          />
        </label>

        <label>
          Harga Jual
          <input
            value={form.sellPrice}
            inputMode="numeric"
            onChange={(event) => updateField("sellPrice", event.target.value)}
          />
        </label>

        <label>
          Batas Stok Menipis
          <input
            value={form.minStock}
            inputMode="numeric"
            onChange={(event) => updateField("minStock", event.target.value)}
          />
        </label>

        <div className="form-actions span-2">
          <button className="success-btn" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : product ? "Simpan Perubahan" : "Tambah Barang"}
          </button>
          <button type="button" className="ghost-btn" onClick={onCancel}>
            Batal
          </button>
        </div>
      </form>

      {scannerOpen && (
        <BarcodeScanner
          onDetected={(barcode) => updateField("barcode", barcode)}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </section>
  );
}

export default ProductForm;
