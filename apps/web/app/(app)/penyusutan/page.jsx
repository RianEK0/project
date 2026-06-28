"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Clock, Eye, AlertTriangle, FileDown, ShieldCheck, Download, MessageSquarePlus } from "lucide-react";
import { apiFetch, downloadFromApi } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../../../components/StatusBadge";
import { FileTypeIcon } from "../../../components/FileTypeIcon";
import { formatDateTime, formatBytes } from "../../../lib/format";

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-700">{value || "-"}</dd>
    </div>
  );
}

function getPreviewMimeType(type) {
  switch (String(type || "").toUpperCase()) {
    case "PDF":
      return "application/pdf";
    case "DOC":
      return "application/msword";
    case "DOCX":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "XLS":
      return "application/vnd.ms-excel";
    case "XLSX":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "JPG":
    case "JPEG":
      return "image/jpeg";
    case "PNG":
      return "image/png";
    default:
      return "text/plain";
  }
}

export default function PenyusutanPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ eligiblePenyusutan: [], proposedPenyusutan: [], logs: [] });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("proposed"); // "proposed" or "eligible"

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Details Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [comment, setComment] = useState("");
  
  // Propose Modal
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposeNotes, setProposeNotes] = useState("");
  const [proposing, setProposing] = useState(false);

  // Review Modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewApproved, setReviewApproved] = useState(true);
  const [reviewCategory, setReviewCategory] = useState("Arsip Inaktif"); // "Arsip Inaktif", "Arsip Statis", "Arsip Musnah"
  const [reviewBaNumber, setReviewBaNumber] = useState("");
  const [reviewDoc, setReviewDoc] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const loadData = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [disposalRes, organizationRes] = await Promise.all([
        apiFetch("/disposals"),
        apiFetch("/organization")
      ]);
      setData(disposalRes || { eligiblePenyusutan: [], proposedPenyusutan: [], logs: [] });
      setUnits(organizationRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load document preview URL in detail modal
  useEffect(() => {
    let active = true;
    let objectUrl = "";

    async function loadPreview() {
      if (!detailOpen || !detail?.id) {
        setPreviewUrl("");
        setPreviewLoading(false);
        setPreviewError("");
        return;
      }

      setPreviewLoading(true);
      setPreviewError("");
      setPreviewUrl("");

      try {
        const response = await apiFetch(`/archives/${detail.id}/download`);
        const blob = await response.blob();
        if (!active) return;
        objectUrl = window.URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        if (active) setPreviewError(err.message);
      } finally {
        if (active) setPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      active = false;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [detail?.id, detailOpen]);

  async function openDetail(archiveId) {
    setError("");
    try {
      const result = await apiFetch(`/archives/${archiveId}`);
      setDetail(result.data);
      setDetailOpen(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!detail || !comment.trim()) return;
    try {
      await apiFetch(`/archives/${detail.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ comment })
      });
      setComment("");
      await openDetail(detail.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePropose(event) {
    event.preventDefault();
    if (!detail) return;
    setProposing(true);
    try {
      await apiFetch(`/disposals/${detail.id}/propose`, {
        method: "POST",
        body: JSON.stringify({ notes: proposeNotes })
      });
      setProposeOpen(false);
      setProposeNotes("");
      setDetailOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setProposing(false);
    }
  }

  async function handleReview(event) {
    event.preventDefault();
    if (!detail) return;
    setReviewing(true);
    try {
      const payload = new FormData();
      payload.append("notes", reviewNotes);
      payload.append("isApproved", reviewApproved);
      payload.append("targetCategory", reviewCategory);
      payload.append("baNumber", reviewBaNumber);
      if (reviewDoc) {
        payload.append("disposal_doc", reviewDoc);
      }

      await apiFetch(`/disposals/${detail.id}/review`, {
        method: "POST",
        body: payload
      });
      setReviewOpen(false);
      setReviewNotes("");
      setReviewBaNumber("");
      setReviewDoc(null);
      setDetailOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewing(false);
    }
  }

  function triggerPropose() {
    if (!detail) return;
    setProposeNotes(`Mengusulkan penyusutan untuk arsip "${detail.title}". Retensi aktif telah habis.`);
    setProposeOpen(true);
  }

  function triggerReview() {
    if (!detail) return;
    setReviewNotes("");
    setReviewApproved(true);
    setReviewCategory("Arsip Inaktif");
    setReviewBaNumber("");
    setReviewDoc(null);
    setReviewOpen(true);
  }

  // Filter datasets based on Search, Unit, and Category
  const filteredEligible = useMemo(() => {
    return (data.eligiblePenyusutan || []).filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.document_number.toLowerCase().includes(search.toLowerCase());
      const matchUnit = filterUnit === "" || Number(item.unit_id) === Number(filterUnit);
      return matchSearch && matchUnit;
    });
  }, [data.eligiblePenyusutan, search, filterUnit]);

  const filteredProposed = useMemo(() => {
    return (data.proposedPenyusutan || []).filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.document_number.toLowerCase().includes(search.toLowerCase());
      const matchUnit = filterUnit === "" || Number(item.unit_id) === Number(filterUnit);
      const matchCategory = filterCategory === "" || item.archive_category === filterCategory;
      return matchSearch && matchUnit && matchCategory;
    });
  }, [data.proposedPenyusutan, search, filterUnit, filterCategory]);

  const isManager = user && ["Admin", "Inspektur", "Sekretaris"].includes(user.role);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-700">Manajemen Siklus Hidup</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Penyusutan Arsip</h1>
        <p className="mt-1 text-sm text-slate-500">Mereduksi arsip aktif yang telah melewati retensi ke arsip inaktif, statis, atau pemusnahan.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Filter Control Box */}
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="Cari judul atau nomor dokumen"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Divisi</span>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Semua divisi</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </label>
          {activeTab === "proposed" && (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Kategori Arsip</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Semua kategori</option>
                <option value="Arsip Aktif">Arsip Aktif</option>
                <option value="Arsip Inaktif">Arsip Inaktif</option>
                <option value="Arsip Statis">Arsip Statis</option>
              </select>
            </label>
          )}
        </div>
      </section>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("proposed")}
          className={`px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "proposed" ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-ink"
          }`}
        >
          Usulan & Histori ({filteredProposed.length})
        </button>
        <button
          onClick={() => setActiveTab("eligible")}
          className={`px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "eligible" ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-ink"
          }`}
        >
          Siap Disusutkan ({filteredEligible.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">Memuat data penyusutan...</div>
      ) : activeTab === "eligible" ? (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Arsip</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Tanggal Arsip</th>
                  <th className="px-4 py-3">Masa Retensi Aktif</th>
                  <th className="px-4 py-3">Batas Aktif</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEligible.map((archive) => (
                  <tr key={archive.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{archive.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{archive.document_number}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{archive.unit_name}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(archive.archive_date).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3 text-slate-600">{archive.active_retention} Tahun</td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      {new Date(archive.active_end_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openDetail(archive.id)}
                        className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Eye size={13} className="mr-1" /> Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDetail(archive);
                          triggerPropose();
                        }}
                        className="focus-ring inline-flex h-8 items-center justify-center rounded-md bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
                      >
                        <FileDown size={13} className="mr-1" /> Usulkan
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEligible.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      Tidak ada arsip yang melewati masa retensi aktif.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Arsip</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Kategori Sekarang</th>
                  <th className="px-4 py-3">Status Siklus Hidup</th>
                  <th className="px-4 py-3">Tanggal Update</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProposed.map((archive) => (
                  <tr key={archive.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{archive.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{archive.document_number}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{archive.unit_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {archive.archive_category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        archive.lifecycle_status === 'Usulan Penyusutan' ? 'bg-amber-100 text-amber-800' :
                        archive.lifecycle_status === 'Inaktif' ? 'bg-indigo-100 text-indigo-800' :
                        archive.lifecycle_status === 'Statis' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {archive.lifecycle_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(archive.updated_at)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openDetail(archive.id)}
                        className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Eye size={13} className="mr-1" /> Detail / Aksi
                      </button>
                      {archive.lifecycle_status === "Usulan Penyusutan" && isManager && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetail(archive);
                            triggerReview();
                          }}
                          className="focus-ring inline-flex h-8 items-center justify-center rounded-md bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700"
                        >
                          <ShieldCheck size={13} className="mr-1" /> Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredProposed.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      Belum ada usulan penyusutan yang diajukan.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Main Details Modal (Identical to Archives Page) */}
      <Modal title="Detail Arsip & Siklus Hidup" open={detailOpen} onClose={() => setDetailOpen(false)} wide>
        {detail ? (
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={detail.status} />
                  <FileTypeIcon type={detail.file_type} />
                </div>
                <h2 className="mt-3 text-xl font-bold text-ink">{detail.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{detail.document_number}</p>
              </div>

              {/* Action Buttons Integrated directly inside Details Modal */}
              <div className="flex flex-wrap gap-2.5 rounded-md border border-brand-100 bg-brand-50/30 p-3">
                <span className="text-xs font-bold text-slate-500 w-full mb-1">Aksi Lifecycle Tersedia:</span>
                {detail.lifecycle_status === "Aktif" && (
                  <button
                    type="button"
                    onClick={triggerPropose}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    <FileDown size={14} className="mr-1.5" />
                    Usulkan Penyusutan Arsip
                  </button>
                )}
                {detail.lifecycle_status === "Usulan Penyusutan" && isManager && (
                  <button
                    type="button"
                    onClick={triggerReview}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-md bg-amber-600 px-4 text-xs font-bold text-white hover:bg-amber-700"
                  >
                    <ShieldCheck size={14} className="mr-1.5" />
                    Review & Tentukan Keputusan
                  </button>
                )}
                {detail.disposal_doc_path && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadFromApi(
                        `/disposals/${detail.id}/download-disposal-ba`,
                        `BA-Penyusutan-${detail.disposal_ba_number || detail.id}.pdf`
                      )
                    }
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-4 text-xs font-bold text-brand-700 bg-white hover:bg-slate-50"
                  >
                    <Download size={14} className="mr-1.5" />
                    Unduh Berita Acara Penyusutan
                  </button>
                )}
                {(!detail.lifecycle_status || detail.lifecycle_status === "Inaktif" || detail.lifecycle_status === "Statis" || detail.lifecycle_status === "Musnah") && !detail.disposal_doc_path && (
                  <span className="text-xs text-slate-500 italic">Tidak ada tindakan lanjutan penyusutan yang dapat dilakukan.</span>
                )}
              </div>

              <dl className="grid gap-3 rounded-md border border-slate-200 p-4 text-sm sm:grid-cols-2">
                <Info label="Divisi" value={detail.unit_name} />
                <Info label="Jenis" value={detail.document_type} />
                <Info label="Klasifikasi" value={detail.classification} />
                <Info label="Kategori Arsip" value={detail.archive_category} />
                <Info label="Tingkat Keamanan" value={detail.security_level || "Biasa"} />
                <Info label="Nomor Surat" value={detail.letter_number || "-"} />
                <Info label="Tanggal Arsip" value={detail.archive_date ? new Date(detail.archive_date).toLocaleDateString("id-ID") : "-"} />
                <Info label="Nomor BA Penyusutan" value={detail.disposal_ba_number || "-"} />
                <Info label="Masa Retensi" value={`${detail.active_retention || 0} Thn Aktif / ${detail.inactive_retention || 0} Thn Inaktif`} />
                <Info label="Status Siklus Hidup" value={detail.lifecycle_status || "Aktif"} />
                <Info label="Tahun" value={detail.year} />
                <Info label="Pembuat" value={detail.creator_name} />
                <Info label="Ukuran file" value={formatBytes(detail.file_size)} />
              </dl>

              {/* Document Preview */}
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">File arsip</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{detail.file_original_name || `arsip-${detail.id}`}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadFromApi(
                        `/archives/${detail.id}/download`,
                        detail.file_original_name || `arsip-${detail.id}.${detail.file_type?.toLowerCase() || "txt"}`
                      )
                    }
                    className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download size={17} />
                    Unduh File
                  </button>
                </div>
                <div className="h-[280px] bg-slate-50">
                  {previewLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">Memuat file...</div>
                  ) : previewError ? (
                    <div className="flex h-full items-center justify-center p-6 text-sm text-red-600">{previewError}</div>
                  ) : previewUrl ? (
                    <object data={previewUrl} type={getPreviewMimeType(detail.file_type)} className="h-full w-full">
                      <div className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
                        Pratinjau file tidak tersedia. Gunakan tombol unduh.
                      </div>
                    </object>
                  ) : null}
                </div>
              </div>
              <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">{detail.description || "Tidak ada deskripsi."}</p>

              {/* Visual Lifecycle Timeline */}
              <div className="rounded-md border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">
                  Riwayat Siklus Hidup Arsip (Standar ANRI)
                </div>
                <div className="p-4">
                  {detail.lifecycleLogs && detail.lifecycleLogs.length > 0 ? (
                    <div className="relative border-l-2 border-slate-100 pl-5 space-y-4">
                      {detail.lifecycleLogs.map((log) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-brand-600 ring-4 ring-white" />
                          <div className="text-xs font-semibold text-slate-400">
                            {new Date(log.action_date).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </div>
                          <div className="mt-1 text-sm font-bold text-ink">{log.stage}</div>
                          {log.notes && <p className="mt-0.5 text-xs text-slate-600">{log.notes}</p>}
                          <div className="mt-0.5 text-[10px] text-slate-400">
                            Petugas: {log.officer_name || "Sistem"} ({log.officer_role || "-"})
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">Belum ada riwayat siklus hidup.</div>
                  )}
                </div>
              </div>

              {/* Disposition Log */}
              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">Riwayat disposisi</div>
                <div className="divide-y divide-slate-100">
                  {detail.dispositions?.map((disposition) => (
                    <div key={disposition.id} className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={disposition.status} />
                        <span className="text-slate-500">{formatDateTime(disposition.created_at)}</span>
                      </div>
                      <p className="mt-2 text-slate-700">{disposition.note}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {disposition.from_user_name} ke {disposition.to_user_name || disposition.to_unit_name}
                      </p>
                    </div>
                  ))}
                  {detail.dispositions?.length === 0 ? <div className="px-4 py-5 text-sm text-slate-500">Belum ada disposisi.</div> : null}
                </div>
              </div>
            </div>

            {/* Comments Thread (Right Column) */}
            <div className="space-y-4">
              <form onSubmit={submitComment} className="rounded-md border border-slate-200 p-4">
                <label className="text-sm font-semibold text-ink">
                  Komentar
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="focus-ring mt-2 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
                    placeholder="Tulis komentar baru untuk arsip ini..."
                  />
                </label>
                <button
                  type="submit"
                  className="focus-ring mt-3 inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <MessageSquarePlus size={17} />
                  Kirim Komentar
                </button>
              </form>

              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">Komentar arsip</div>
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                  {detail.comments?.map((item) => (
                    <div key={item.id} className="px-4 py-3">
                      <p className="text-sm text-slate-700">{item.comment}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.user_name || "User"} | {formatDateTime(item.created_at)}
                      </p>
                    </div>
                  ))}
                  {detail.comments?.length === 0 ? <div className="px-4 py-5 text-sm text-slate-500">Belum ada komentar.</div> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Propose Modal */}
      <Modal title="Usulkan Penyusutan Arsip" open={proposeOpen} onClose={() => setProposeOpen(false)}>
        {detail && (
          <form onSubmit={handlePropose} className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Arsip</p>
              <p className="text-sm font-bold text-ink">{detail.title}</p>
              <p className="text-xs text-slate-500">{detail.document_number}</p>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan Usulan</span>
              <textarea
                value={proposeNotes}
                onChange={(e) => setProposeNotes(e.target.value)}
                className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
                placeholder="Masukkan alasan atau catatan penyusutan"
                required
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProposeOpen(false)}
                className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={proposing}
                className="focus-ring rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {proposing ? "Mengirim..." : "Kirim Usulan"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal title="Review Usulan Penyusutan" open={reviewOpen} onClose={() => setReviewOpen(false)}>
        {detail && (
          <form onSubmit={handleReview} className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Arsip</p>
              <p className="text-sm font-bold text-ink">{detail.title}</p>
              <p className="text-xs text-slate-500">{detail.document_number}</p>
            </div>
            
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase text-slate-500">Persetujuan</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="isApproved"
                    checked={reviewApproved === true}
                    onChange={() => setReviewApproved(true)}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Setujui Penyusutan
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="isApproved"
                    checked={reviewApproved === false}
                    onChange={() => setReviewApproved(false)}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Tolak Usulan
                </label>
              </div>
            </div>

            {reviewApproved && (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tindak Lanjut / Kategori Baru</span>
                  <select
                    value={reviewCategory}
                    onChange={(e) => setReviewCategory(e.target.value)}
                    className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="Arsip Inaktif">Menjadi Arsip Inaktif</option>
                    <option value="Arsip Statis">Menjadi Arsip Statis (Permanen)</option>
                    <option value="Arsip Musnah">Diusulkan Musnah</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Nomor Berita Acara Penyusutan</span>
                  <input
                    type="text"
                    value={reviewBaNumber}
                    onChange={(e) => setReviewBaNumber(e.target.value)}
                    className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                    placeholder="Masukkan Nomor BA Penyusutan/Pemindahan"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Upload Berita Acara (PDF/Doc)</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setReviewDoc(e.target.files?.[0] || null)}
                    className="focus-ring block w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
                  />
                </label>
              </>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan Review</span>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
                placeholder="Masukkan catatan keputusan review"
                required
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={reviewing}
                className="focus-ring rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {reviewing ? "Memproses..." : "Simpan Keputusan"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
