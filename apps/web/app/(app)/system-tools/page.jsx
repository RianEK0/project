"use client";

import { useState } from "react";
import { Database, Download, RefreshCcw, ShieldAlert } from "lucide-react";
import { apiFetchWithPasskeyStepUp, downloadWithPasskeyStepUp } from "../../../lib/passkeyStepUp";
import { useAuth } from "../../../components/AuthProvider";

export default function SystemToolsPage() {
  const { user } = useAuth();
  const [restoreFile, setRestoreFile] = useState(null);
  const [restorePassword, setRestorePassword] = useState("");
  const [restoreConfirmation, setRestoreConfirmation] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (user?.role !== "Admin") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <div className="flex items-center gap-3">
          <ShieldAlert size={22} />
          <div>
            <h1 className="text-base font-semibold">Akses terbatas</h1>
            <p className="mt-1 text-sm">Backup dan restore hanya tersedia untuk Admin.</p>
          </div>
        </div>
      </div>
    );
  }

  async function handleRestore(event) {
    event.preventDefault();
    if (!restoreFile) return;

    setError("");
    setMessage("");
    setLoading("restore");

    try {
      const payload = new FormData();
      payload.append("file", restoreFile);
      payload.append("currentPassword", restorePassword);
      payload.append("confirmation", restoreConfirmation);
      const result = await apiFetchWithPasskeyStepUp("/system/backup/restore", {
        method: "POST",
        body: payload
      }, "backup-restore");
      setMessage(`Restore selesai. ${result.data?.totalRows || 0} baris data dipulihkan.`);
      setRestoreFile(null);
      setRestorePassword("");
      setRestoreConfirmation("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-700">Tools sistem</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Backup & Restore Data</h1>
        <p className="mt-1 text-sm text-slate-500">Backup SIPADI dilindungi AES-256-GCM dan setiap operasi wajib dikonfirmasi dengan passkey khusus untuk tindakan tersebut.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-brand-50 p-2 text-brand-700">
              <Database size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink">Export Backup</h2>
              <p className="mt-1 text-sm text-slate-500">Unduh seluruh data dalam satu file .sipadi terenkripsi. Simpan kunci enkripsi terpisah dari file backup.</p>
              <button
                type="button"
                disabled={loading === "export"}
                onClick={async () => {
                  setError("");
                  setMessage("");
                  setLoading("export");
                  try {
                    await downloadWithPasskeyStepUp(
                      "/system/backup/export",
                      `sipadi-backup-${new Date().toISOString().slice(0, 10)}.sipadi`,
                      "backup-export"
                    );
                    setMessage("File backup berhasil diunduh.");
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setLoading("");
                  }
                }}
                className="focus-ring mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                <Download size={16} />
                {loading === "export" ? "Konfirmasi passkey..." : "Unduh Backup Terenkripsi"}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleRestore} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-amber-50 p-2 text-amber-700">
              <RefreshCcw size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink">Restore Backup</h2>
              <p className="mt-1 text-sm text-slate-500">Restore meminta konfirmasi passkey, memverifikasi autentikasi file, lalu mengganti data aktif dengan isi backup.</p>
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Pastikan Anda memakai file backup SIPADI yang valid. Langkah ini bersifat menggantikan data aktif.
              </div>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">File Backup SIPADI</span>
                <input
                  type="file"
                  accept=".sipadi,.json,application/octet-stream,application/json"
                  onChange={(event) => setRestoreFile(event.target.files?.[0] || null)}
                  className="focus-ring block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Password Admin Saat Ini</span>
                <input type="password" value={restorePassword} onChange={(event) => setRestorePassword(event.target.value)} className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm" required />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Ketik RESTORE SIPADI</span>
                <input value={restoreConfirmation} onChange={(event) => setRestoreConfirmation(event.target.value)} className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-mono" required />
              </label>
              <button
                type="submit"
                disabled={loading === "restore" || !restoreFile || restoreConfirmation !== "RESTORE SIPADI"}
                className="focus-ring mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCcw size={16} />
                {loading === "restore" ? "Menjalankan restore..." : "Mulai Restore"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
