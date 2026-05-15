import { useEffect, useState } from "react";
import { parseImportedData, exportData } from "../utils/storage.js";
import { downloadTextFile, formatDateTime } from "../utils/format.js";

function BackupData({ data, settings, onImportData, onResetData, onUpdateSettings }) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold);
  const [importError, setImportError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setStoreName(settings.storeName);
    setLowStockThreshold(settings.lowStockThreshold);
  }, [settings]);

  function exportAllData() {
    downloadTextFile(
      `backup-kasir-warung-${new Date().toISOString().slice(0, 10)}.json`,
      exportData(data),
      "application/json"
    );
  }

  function importJsonFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const importedData = parseImportedData(String(reader.result || ""));
        setIsBusy(true);
        const success = await onImportData(importedData);
        setImportError(success ? "" : "Import gagal. Periksa koneksi dan Supabase.");
      } catch (error) {
        setImportError(error.message || "File backup tidak valid.");
      } finally {
        setIsBusy(false);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  async function confirmReset() {
    if (window.confirm("Reset semua data ke contoh awal?")) {
      setIsBusy(true);
      await onResetData();
      setIsBusy(false);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setIsBusy(true);
    await onUpdateSettings({
      storeName: storeName.trim() || "Kasir Warung Pintar",
      lowStockThreshold
    });
    setIsBusy(false);
  }

  return (
    <section className="split-layout">
      <section className="panel">
        <div className="section-heading">
          <h2>Pengaturan Toko</h2>
        </div>
        <form className="form-grid single" onSubmit={saveSettings}>
          <label>
            Nama Toko
            <input value={storeName} onChange={(event) => setStoreName(event.target.value)} />
          </label>
          <label>
            Batas Umum Stok Menipis
            <input
              value={lowStockThreshold}
              inputMode="numeric"
              onChange={(event) => setLowStockThreshold(event.target.value)}
            />
          </label>
          <button className="primary-btn full-width" disabled={isBusy}>
            {isBusy ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Backup Data</h2>
        </div>
        <div className="backup-stack">
          <button className="primary-btn full-width" onClick={exportAllData} disabled={isBusy}>
            Export Semua Data JSON
          </button>
          <label className="file-import">
            Import Data JSON
            <input type="file" accept="application/json,.json" onChange={importJsonFile} />
          </label>
          {importError && <p className="form-error">{importError}</p>}
          <button className="danger-btn full-width" onClick={confirmReset} disabled={isBusy}>
            {isBusy ? "Memproses..." : "Reset Data"}
          </button>
          <p className="data-note">Terakhir disimpan: {formatDateTime(data.updatedAt)}</p>
        </div>
      </section>
    </section>
  );
}

export default BackupData;
