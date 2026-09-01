"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { apiFetch, buildQuery, downloadFromApi } from "../../../lib/api";
import { formatDateTime } from "../../../lib/format";
import { useAuth } from "../../../components/AuthProvider";
import { EmptyState } from "../../../components/EmptyState";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [integrity, setIntegrity] = useState(null);
  const canViewAudit = ["Admin", "Inspektur"].includes(user?.role);

  const loadLogs = useCallback(async () => {
    if (!canViewAudit) return;
    setError("");
    try {
      const result = await apiFetch(`/audit-logs${buildQuery({ search, page: meta.page, limit: 10 })}`);
      setLogs(result.data);
      setMeta(result.meta);
      const integrityResult = await apiFetch("/audit-logs/integrity");
      setIntegrity(integrityResult.data);
    } catch (err) {
      setError(err.message);
    }
  }, [search, meta.page, canViewAudit]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (!canViewAudit) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <div className="flex items-center gap-3">
          <ShieldAlert size={22} />
          <div>
            <h1 className="text-base font-semibold">Akses terbatas</h1>
            <p className="mt-1 text-sm">Audit log hanya tersedia untuk Admin dan Inspektur.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">Audit log</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Aktivitas User</h1>
          <p className="mt-1 text-sm text-slate-500">{meta.total || 0} aktivitas tercatat</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={exporting === "csv"}
            onClick={async () => {
              setExporting("csv");
              try {
                await downloadFromApi(`/audit-logs/export${buildQuery({ search, format: "csv" })}`, `audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
              } catch (err) {
                setError(err.message);
              } finally {
                setExporting("");
              }
            }}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Download size={16} />
            {exporting === "csv" ? "Mengekspor CSV..." : "Export CSV"}
          </button>
          <button
            type="button"
            disabled={exporting === "json"}
            onClick={async () => {
              setExporting("json");
              try {
                await downloadFromApi(`/audit-logs/export${buildQuery({ search, format: "json" })}`, `audit-log-${new Date().toISOString().slice(0, 10)}.json`);
              } catch (err) {
                setError(err.message);
              } finally {
                setExporting("");
              }
            }}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Download size={16} />
            {exporting === "json" ? "Mengekspor JSON..." : "Export JSON"}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {integrity ? (
        <div className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${!integrity.valid ? "border-red-300 bg-red-50 text-red-800" : integrity.protected && !integrity.legacyUnsigned ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-300 bg-amber-50 text-amber-800"}`}>
          {integrity.valid && integrity.protected ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          <div>
            <p className="font-semibold">{!integrity.valid ? "Integritas audit bermasalah" : !integrity.protected ? "Audit lama belum memiliki perlindungan hash" : integrity.legacyUnsigned ? "Rantai audit baru valid; entri lama belum terlindungi" : "Rantai audit valid"}</p>
            <p className="text-xs">{integrity.signed || 0} entri ditandatangani · {integrity.legacyUnsigned || 0} entri lama belum ditandatangani{integrity.brokenAtId ? ` · putus pada ID ${integrity.brokenAtId}` : ""}</p>
          </div>
        </div>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Search</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm"
              placeholder="Cari aksi, entitas, atau user"
            />
          </span>
        </label>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Entitas</th>
                <th className="px-4 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{log.user_name || "Sistem"}</p>
                    <p className="text-xs text-slate-500">{log.user_role || "-"}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600">{log.entity} #{log.entity_id || "-"}</td>
                  <td className="max-w-md px-4 py-3 text-xs text-slate-500">{JSON.stringify(log.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 ? <EmptyState title="Audit log kosong" description="Aktivitas akan tercatat saat user menggunakan aplikasi." /> : null}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Halaman {meta.page || 1}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={(meta.page || 1) <= 1}
              onClick={() => setMeta((current) => ({ ...current, page: current.page - 1 }))}
              className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={(meta.page || 1) * (meta.limit || 10) >= (meta.total || 0)}
              onClick={() => setMeta((current) => ({ ...current, page: current.page + 1 }))}
              className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
