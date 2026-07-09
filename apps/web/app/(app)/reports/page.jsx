"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Calendar,
  CalendarClock,
  FolderArchive,
  BookOpen,
  Archive,
  RefreshCw,
  ShieldCheck,
  Lock,
  Unlock,
  LockOpen
} from "lucide-react";
import { apiFetch, buildQuery, downloadFromApi } from "../../../lib/api";
import { ARCHIVE_CATEGORIES, ARCHIVE_STATUSES, DOCUMENT_TYPES, FILE_TYPES } from "../../../lib/constants";
import { StatusBadge } from "../../../components/StatusBadge";
import { FileTypeIcon } from "../../../components/FileTypeIcon";

function StatCard({ label, value, icon: Icon, tone = "brand", description = "" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 border-brand-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100"
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{value ?? 0}</p>
          {description && <p className="mt-1 text-[10px] text-slate-400 font-medium">{description}</p>}
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tones[tone] || tones.brand}`}>
          <Icon size={18} className="shrink-0" />
        </span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all-archives"); // "all-archives" or "archiving-recap"
  const [filters, setFilters] = useState({
    search: "",
    unitId: "",
    status: "",
    documentType: "",
    archiveCategory: "",
    fileType: "",
    year: "",
    retentionStatus: ""
  });
  const [units, setUnits] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    apiFetch("/organization")
      .then((result) => setUnits(result.data))
      .catch((err) => setError(err.message));
  }, []);

  const loadReport = useCallback(async () => {
    setError("");
    setReport(null);
    try {
      const endpoint = activeTab === "all-archives" ? "/reports/archives" : "/reports/archiving-recap";
      const queryParams = { ...filters };
      if (activeTab === "archiving-recap") {
        queryParams.status = "Diarsipkan";
      }
      const result = await apiFetch(`${endpoint}${buildQuery(queryParams)}`);
      setReport(result);
    } catch (err) {
      setError(err.message);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  async function exportReport(format) {
    setExporting(format);
    setError("");
    try {
      const queryParams = { ...filters, format };
      if (activeTab === "archiving-recap") {
        queryParams.status = "Diarsipkan";
      }
      await downloadFromApi(
        `/reports/archives/export${buildQuery(queryParams)}`,
        `laporan-arsip-sipadi.${format === "pdf" ? "pdf" : "xls"}`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting("");
    }
  }

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const summary = report?.summary || {};
  const statusRows = [
    ["Draft", summary.draft],
    ["Menunggu Review", summary.waiting_review],
    ["Terverifikasi", summary.verified],
    ["Ditolak", summary.rejected],
    ["Diarsipkan", summary.archived]
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">Laporan</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Laporan & Rekap Arsip</h1>
          <p className="mt-1 text-sm text-slate-500">Ekspor PDF dan Excel berdasarkan filter aktif.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportReport("pdf")}
            disabled={Boolean(exporting)}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <FileText size={17} />
            PDF
          </button>
          <button
            type="button"
            onClick={() => exportReport("xls")}
            disabled={Boolean(exporting)}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <FileSpreadsheet size={17} />
            Excel
          </button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("all-archives")}
          className={`flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "all-archives"
              ? "border border-b-white border-slate-200 bg-white text-brand-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FolderArchive size={15} />
          Laporan Semua Arsip
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("archiving-recap")}
          className={`flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "archiving-recap"
              ? "border border-b-white border-slate-200 bg-white text-brand-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen size={15} />
          Rekap Pengarsipan (Diarsipkan)
        </button>
      </div>

      {/* Filters section */}
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label className="md:col-span-2 xl:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm"
                placeholder="Nama atau nomor dokumen"
              />
            </span>
          </label>
          <Select label="Divisi" value={filters.unitId} onChange={(value) => updateFilter("unitId", value)}>
            <option value="">Semua divisi</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </Select>
          {activeTab === "all-archives" ? (
            <Select label="Status" value={filters.status} onChange={(value) => updateFilter("status", value)}>
              <option value="">Semua status</option>
              {ARCHIVE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          ) : (
            <div className="flex flex-col justify-end pb-0.5">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-400">Status</span>
              <span className="flex h-10 w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                Diarsipkan
              </span>
            </div>
          )}
          <Select label="Jenis" value={filters.documentType} onChange={(value) => updateFilter("documentType", value)}>
            <option value="">Semua jenis</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Select label="Kategori" value={filters.archiveCategory} onChange={(value) => updateFilter("archiveCategory", value)}>
            <option value="">Semua kategori</option>
            {ARCHIVE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.value}
              </option>
            ))}
          </Select>
          <Select label="File" value={filters.fileType} onChange={(value) => updateFilter("fileType", value)}>
            <option value="">Semua file</option>
            {FILE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Select label="Masa Retensi" value={filters.retentionStatus} onChange={(value) => updateFilter("retentionStatus", value)}>
            <option value="">Semua</option>
            <option value="active_expired">Retensi Aktif Habis</option>
            <option value="inactive_expired">Retensi Inaktif Habis</option>
          </Select>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tahun</span>
            <input
              value={filters.year}
              onChange={(event) => updateFilter("year", event.target.value)}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="2026"
            />
          </label>
        </div>
      </section>

      {/* Tab Contents */}
      {activeTab === "all-archives" ? (
        <>
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Status dokumen</h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  <Download size={14} />
                  {summary.total || 0} total
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {statusRows.map(([status, value]) => {
                  const percent = summary.total ? Math.round((Number(value || 0) / Number(summary.total)) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <StatusBadge status={status} />
                        <span className="font-semibold text-ink">{value || 0}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-md bg-slate-100">
                        <div className="h-full rounded-md bg-brand-600" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-ink">Arsip per divisi</h2>
              <div className="mt-4 space-y-2">
                {(report?.byUnit || []).map((unit) => (
                  <div key={unit.unit_name} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{unit.unit_name}</span>
                    <span className="font-bold text-ink">{unit.total}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold text-ink">Preview laporan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Dokumen</th>
                    <th className="px-4 py-3">Divisi</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Klasifikasi</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(report?.data || []).map((archive) => (
                    <tr key={archive.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{archive.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{archive.document_number} | {archive.year}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{archive.unit_name}</td>
                      <td className="px-4 py-3 text-slate-600">{archive.document_type}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{archive.classification}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={archive.archive_category} />
                      </td>
                      <td className="px-4 py-3">
                        <FileTypeIcon type={archive.file_type} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={archive.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        // Archiving Recap tab view
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard label="Total Diarsipkan" value={report?.stats?.total_archived} icon={BookOpen} tone="brand" description="Status Diarsipkan" />
            <StatCard label="Diarsipkan Bulan Ini" value={report?.stats?.archived_this_month} icon={Calendar} tone="emerald" />
            <StatCard label="Diarsipkan Tahun Ini" value={report?.stats?.archived_this_year} icon={CalendarClock} tone="blue" />
            <StatCard label="Arsip Aktif" value={report?.stats?.archived_aktif} icon={Archive} tone="indigo" />
            <StatCard label="Arsip Inaktif" value={report?.stats?.archived_inaktif} icon={RefreshCw} tone="amber" />
            <StatCard label="Arsip Statis" value={report?.stats?.archived_statis} icon={ShieldCheck} tone="indigo" />
            <StatCard label="Tingkat Biasa" value={report?.stats?.security_biasa} icon={LockOpen} tone="slate" />
            <StatCard label="Tingkat Terbatas" value={report?.stats?.security_terbatas} icon={Unlock} tone="amber" />
            <StatCard label="Tingkat Rahasia" value={report?.stats?.security_rahasia} icon={Lock} tone="red" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Per Unit */}
            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-4">Diarsipkan per Unit</h2>
              <div className="space-y-3.5">
                {(report?.byUnit || []).slice(0, 5).map((row, i) => {
                  const maxVal = Math.max(...(report?.byUnit || []).map(r => r.total), 1);
                  const pct = (row.total / maxVal) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span className="truncate max-w-[240px]" title={row.unit_name}>{row.unit_name}</span>
                        <span className="text-slate-800 font-bold">{row.total} Arsip</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {(!report?.byUnit || report.byUnit.length === 0) && (
                  <div className="text-center py-6 text-xs text-slate-400">Tidak ada data unit.</div>
                )}
              </div>
            </section>

            {/* Per Jenis Dokumen */}
            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-4">Diarsipkan per Jenis Dokumen</h2>
              <div className="space-y-3.5">
                {(report?.byType || []).slice(0, 5).map((row, i) => {
                  const maxVal = Math.max(...(report?.byType || []).map(r => r.total), 1);
                  const pct = (row.total / maxVal) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span className="truncate max-w-[240px]" title={row.document_type}>{row.document_type}</span>
                        <span className="text-slate-800 font-bold">{row.total} Arsip</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {(!report?.byType || report.byType.length === 0) && (
                  <div className="text-center py-6 text-xs text-slate-400">Tidak ada data jenis dokumen.</div>
                )}
              </div>
            </section>

            {/* Per Tipe File */}
            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-4">Diarsipkan per Tipe File</h2>
              <div className="space-y-3.5">
                {(report?.byFileType || []).slice(0, 5).map((row, i) => {
                  const maxVal = Math.max(...(report?.byFileType || []).map(r => r.total), 1);
                  const pct = (row.total / maxVal) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{row.file_type}</span>
                        <span className="text-slate-800 font-bold">{row.total} Arsip</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {(!report?.byFileType || report.byFileType.length === 0) && (
                  <div className="text-center py-6 text-xs text-slate-400">Tidak ada data tipe file.</div>
                )}
              </div>
            </section>

            {/* Per Tahun */}
            <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-4">Diarsipkan per Tahun</h2>
              <div className="space-y-3.5">
                {(report?.byYear || []).slice(0, 5).map((row, i) => {
                  const maxVal = Math.max(...(report?.byYear || []).map(r => r.total), 1);
                  const pct = (row.total / maxVal) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Tahun {row.year}</span>
                        <span className="text-slate-800 font-bold">{row.total} Arsip</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {(!report?.byYear || report.byYear.length === 0) && (
                  <div className="text-center py-6 text-xs text-slate-400">Tidak ada data tahun.</div>
                )}
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Preview Rekap Pengarsipan</h2>
              <span className="text-xs text-slate-500 font-semibold uppercase">{report?.data?.length || 0} Arsip ditampilkan</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Dokumen</th>
                    <th className="px-4 py-3">Divisi</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Klasifikasi</th>
                    <th className="px-4 py-3">Keamanan</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Verifikator</th>
                    <th className="px-4 py-3">Tanggal Arsip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(report?.data || []).map((archive) => (
                    <tr key={archive.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{archive.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{archive.document_number} | {archive.year}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{archive.unit_name}</td>
                      <td className="px-4 py-3 text-slate-600">{archive.document_type}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{archive.classification}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                          archive.security_level === "Rahasia"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : archive.security_level === "Terbatas"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          {archive.security_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={archive.archive_category} />
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600">{archive.verifier_name || "-"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {archive.updated_at ? new Date(archive.updated_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                    </tr>
                  ))}
                  {(!report?.data || report.data.length === 0) && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">Tidak ada dokumen yang diarsipkan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
        {children}
      </select>
    </label>
  );
}
