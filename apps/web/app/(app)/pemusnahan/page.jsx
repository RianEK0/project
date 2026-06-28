"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Clock, Eye, AlertOctagon, ShieldCheck, Download, Trash, MessageSquarePlus, FileText, UploadCloud } from "lucide-react";
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

export default function PemusnahanPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ eligiblePemusnahan: [], proposedPemusnahan: [], logs: [] });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pipeline"); // "pipeline", "eligible", "destroyed"

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("");

  // Details Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [comment, setComment] = useState("");

  // Modals States for Actions
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposeNotes, setProposeNotes] = useState("");
  const [proposing, setProposing] = useState(false);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [verifyApproved, setVerifyApproved] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [approveApproved, setApproveApproved] = useState(true);
  const [approving, setApproving] = useState(false);

  const [destroyOpen, setDestroyOpen] = useState(false);
  const [destroyForm, setDestroyForm] = useState({
    baNumber: "",
    destructionDate: new Date().toISOString().split("T")[0],
    method: "Pencacahan (Shredding)",
    officer: "",
    destructionDoc: null,
    destructionPhoto: null
  });
  const [destroying, setDestroying] = useState(false);

  const loadData = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [disposalRes, organizationRes] = await Promise.all([
        apiFetch("/disposals"),
        apiFetch("/organization")
      ]);
      setData(disposalRes || { eligiblePemusnahan: [], proposedPemusnahan: [], logs: [] });
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
      await apiFetch(`/disposals/${detail.id}/propose-destruction`, {
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

  async function handleVerify(event) {
    event.preventDefault();
    if (!detail) return;
    setVerifying(true);
    try {
      await apiFetch(`/disposals/${detail.id}/verify-destruction`, {
        method: "POST",
        body: JSON.stringify({ notes: verifyNotes, isApproved: verifyApproved })
      });
      setVerifyOpen(false);
      setVerifyNotes("");
      setDetailOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  }

  async function handleApprove(event) {
    event.preventDefault();
    if (!detail) return;
    setApproving(true);
    try {
      await apiFetch(`/disposals/${detail.id}/approve-destruction`, {
        method: "POST",
        body: JSON.stringify({ notes: approveNotes, isApproved: approveApproved })
      });
      setApproveOpen(false);
      setApproveNotes("");
      setDetailOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(false);
    }
  }

  async function handleDestroy(event) {
    event.preventDefault();
    if (!detail) return;
    setDestroying(true);
    try {
      const payload = new FormData();
      payload.append("baNumber", destroyForm.baNumber);
      payload.append("destructionDate", destroyForm.destructionDate);
      payload.append("method", destroyForm.method);
      payload.append("officer", destroyForm.officer);
      if (destroyForm.destructionDoc) payload.append("destruction_doc", destroyForm.destructionDoc);
      if (destroyForm.destructionPhoto) payload.append("destruction_photo", destroyForm.destructionPhoto);

      await apiFetch(`/disposals/${detail.id}/destroy`, {
        method: "POST",
        body: payload
      });
      setDestroyOpen(false);
      setDestroyForm({
        baNumber: "",
        destructionDate: new Date().toISOString().split("T")[0],
        method: "Pencacahan (Shredding)",
        officer: "",
        destructionDoc: null,
        destructionPhoto: null
      });
      setDetailOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDestroying(false);
    }
  }

  function triggerPropose() {
    if (!detail) return;
    setProposeNotes(`Mengusulkan pemusnahan fisik untuk arsip "${detail.title}". Retensi inaktif telah berakhir.`);
    setProposeOpen(true);
  }

  function triggerVerify() {
    if (!detail) return;
    setVerifyNotes("");
    setVerifyApproved(true);
    setVerifyOpen(true);
  }

  function triggerApprove() {
    if (!detail) return;
    setApproveNotes("");
    setApproveApproved(true);
    setApproveOpen(true);
  }

  function triggerDestroy() {
    if (!detail) return;
    setDestroyForm((f) => ({ ...f, officer: user?.name || "" }));
    setDestroyOpen(true);
  }

  // Filter datasets
  const activePipeline = useMemo(() => {
    return (data.proposedPemusnahan || []).filter((a) => a.lifecycle_status !== "Musnah");
  }, [data.proposedPemusnahan]);

  const destroyedList = useMemo(() => {
    return (data.proposedPemusnahan || []).filter((a) => a.lifecycle_status === "Musnah");
  }, [data.proposedPemusnahan]);

  const filteredEligible = useMemo(() => {
    return (data.eligiblePemusnahan || []).filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.document_number.toLowerCase().includes(search.toLowerCase());
      const matchUnit = filterUnit === "" || Number(item.unit_id) === Number(filterUnit);
      return matchSearch && matchUnit;
    });
  }, [data.eligiblePemusnahan, search, filterUnit]);

  const filteredPipeline = useMemo(() => {
    return activePipeline.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.document_number.toLowerCase().includes(search.toLowerCase());
      const matchUnit = filterUnit === "" || Number(item.unit_id) === Number(filterUnit);
      return matchSearch && matchUnit;
    });
  }, [activePipeline, search, filterUnit]);

  const filteredDestroyed = useMemo(() => {
    return destroyedList.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.document_number.toLowerCase().includes(search.toLowerCase()) ||
        (item.destruction_ba_number && item.destruction_ba_number.toLowerCase().includes(search.toLowerCase()));
      const matchUnit = filterUnit === "" || Number(item.unit_id) === Number(filterUnit);
      return matchSearch && matchUnit;
    });
  }, [destroyedList, search, filterUnit]);

  const isVerifier = user && ["Admin", "Sekretaris", "Sub Bag", "Irban Wilayah"].includes(user.role);
  const isInspektur = user && ["Admin", "Inspektur"].includes(user.role);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-700">Manajemen Siklus Hidup</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Pemusnahan Arsip</h1>
        <p className="mt-1 text-sm text-slate-500">Pemusnahan fisik arsip tidak bernilai guna sejarah yang telah melewati masa retensi inaktif sesuai persetujuan ANRI dan Kepala Inspektorat.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Filter Control Box */}
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="Cari judul, nomor BA, atau nomor dokumen"
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
        </div>
      </section>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "pipeline" ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-ink"
          }`}
        >
          Proses Pemusnahan ({filteredPipeline.length})
        </button>
        <button
          onClick={() => setActiveTab("eligible")}
          className={`px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "eligible" ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-ink"
          }`}
        >
          Siap Dimusnahkan ({filteredEligible.length})
        </button>
        <button
          onClick={() => setActiveTab("destroyed")}
          className={`px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "destroyed" ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-ink"
          }`}
        >
          Arsip Dimusnahkan ({filteredDestroyed.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">Memuat data pemusnahan...</div>
      ) : activeTab === "eligible" ? (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Arsip</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Tanggal Arsip</th>
                  <th className="px-4 py-3">Retensi Gabungan</th>
                  <th className="px-4 py-3">Batas Inaktif</th>
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
                    <td className="px-4 py-3 text-slate-600">
                      {archive.active_retention + archive.inactive_retention} Tahun ({archive.active_retention} Aktif + {archive.inactive_retention} Inaktif)
                    </td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      {new Date(archive.inactive_end_date).toLocaleDateString("id-ID")}
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
                        className="focus-ring inline-flex h-8 items-center justify-center rounded-md bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        <Trash size={13} className="mr-1" /> Usulkan
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEligible.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      Tidak ada arsip inaktif yang melewati batas retensi inaktif.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : activeTab === "destroyed" ? (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Arsip (Metadata Histori)</th>
                  <th className="px-4 py-3">No. Berita Acara</th>
                  <th className="px-4 py-3">Tanggal Musnah</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3">Petugas</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDestroyed.map((archive) => (
                  <tr key={archive.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{archive.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">No Dok: {archive.document_number}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">Klasifikasi: {archive.classification} | Divisi: {archive.unit_name}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{archive.destruction_ba_number || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {archive.destruction_date ? new Date(archive.destruction_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{archive.destruction_method || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{archive.destruction_officer || "-"}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openDetail(archive.id)}
                        className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Eye size={13} className="mr-1" /> Detail
                      </button>
                      {archive.destruction_doc_path ? (
                        <button
                          type="button"
                          onClick={() => downloadFromApi(`/disposals/${archive.id}/download-ba`, `BA-Pemusnahan-${archive.destruction_ba_number}.pdf`)}
                          className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                        >
                          <Download size={13} className="mr-1" /> Unduh BA
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Tidak ada file</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredDestroyed.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      Belum ada arsip yang dimusnahkan.
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
                  <th className="px-4 py-3">Status Pipeline</th>
                  <th className="px-4 py-3">Tanggal Update</th>
                  <th className="px-4 py-3 text-right">Aksi Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPipeline.map((archive) => (
                  <tr key={archive.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{archive.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{archive.document_number}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{archive.unit_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        archive.lifecycle_status === 'Usulan Pemusnahan' ? 'bg-amber-100 text-amber-800' :
                        archive.lifecycle_status === 'Verifikasi Pemusnahan' ? 'bg-indigo-100 text-indigo-800' :
                        archive.lifecycle_status === 'Disetujui Pemusnahan' ? 'bg-blue-100 text-blue-800' :
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

                      {archive.lifecycle_status === "Usulan Pemusnahan" && isVerifier && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetail(archive);
                            triggerVerify();
                          }}
                          className="focus-ring inline-flex h-8 items-center justify-center rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          Verifikasi
                        </button>
                      )}

                      {archive.lifecycle_status === "Verifikasi Pemusnahan" && isInspektur && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetail(archive);
                            triggerApprove();
                          }}
                          className="focus-ring inline-flex h-8 items-center justify-center rounded-md bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          Persetujuan
                        </button>
                      )}

                      {archive.lifecycle_status === "Disetujui Pemusnahan" && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetail(archive);
                            triggerDestroy();
                          }}
                          className="focus-ring inline-flex h-8 items-center justify-center rounded-md bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Input BA
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPipeline.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                      Tidak ada usulan pemusnahan dalam proses.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Main Details Modal (Identical to Archives Page) */}
      <Modal title="Detail Arsip & Siklus Pemusnahan" open={detailOpen} onClose={() => setDetailOpen(false)} wide>
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
              <div className="flex flex-wrap gap-2.5 rounded-md border border-red-100 bg-red-50/20 p-3">
                <span className="text-xs font-bold text-slate-500 w-full mb-1">Aksi Pemusnahan Tersedia:</span>
                {detail.lifecycle_status === "Inaktif" && (
                  <button
                    type="button"
                    onClick={triggerPropose}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
                  >
                    <Trash size={14} className="mr-1.5" />
                    Usulkan Pemusnahan Arsip
                  </button>
                )}
                {detail.lifecycle_status === "Usulan Pemusnahan" && isVerifier && (
                  <button
                    type="button"
                    onClick={triggerVerify}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    <ShieldCheck size={14} className="mr-1.5" />
                    Verifikasi Usulan Pemusnahan
                  </button>
                )}
                {detail.lifecycle_status === "Verifikasi Pemusnahan" && isInspektur && (
                  <button
                    type="button"
                    onClick={triggerApprove}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    <ShieldCheck size={14} className="mr-1.5" />
                    Persetujuan Kepala Inspektorat
                  </button>
                )}
                {detail.lifecycle_status === "Disetujui Pemusnahan" && (
                  <button
                    type="button"
                    onClick={triggerDestroy}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
                  >
                    <UploadCloud size={14} className="mr-1.5" />
                    Input Berita Acara Pemusnahan
                  </button>
                )}
                {detail.lifecycle_status === "Musnah" && (
                  <div className="w-full space-y-2 text-xs">
                    <p className="font-bold text-slate-800">Data Pemusnahan Fisik:</p>
                    <div className="grid gap-2 sm:grid-cols-2 rounded border border-slate-200 bg-white p-2">
                      <div><span className="text-slate-400">No. BA:</span> {detail.destruction_ba_number}</div>
                      <div><span className="text-slate-400">Tanggal:</span> {detail.destruction_date ? new Date(detail.destruction_date).toLocaleDateString("id-ID") : "-"}</div>
                      <div><span className="text-slate-400">Metode:</span> {detail.destruction_method}</div>
                      <div><span className="text-slate-400">Petugas:</span> {detail.destruction_officer}</div>
                    </div>
                    {detail.destruction_doc_path && (
                      <button
                        type="button"
                        onClick={() => downloadFromApi(`/disposals/${detail.id}/download-ba`, `BA-Pemusnahan-${detail.destruction_ba_number}.pdf`)}
                        className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-slate-200 px-3 font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        <Download size={13} className="mr-1" /> Unduh Berita Acara
                      </button>
                    )}
                  </div>
                )}
                {(!detail.lifecycle_status || (detail.lifecycle_status === "Aktif" || detail.lifecycle_status === "Statis")) && (
                  <span className="text-xs text-slate-500 italic">Arsip aktif/statis tidak berada dalam alur pemusnahan.</span>
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
                <Info label="Masa Retensi" value={`${detail.active_retention || 0} Thn Aktif / ${detail.inactive_retention || 0} Thn Inaktif`} />
                <Info label="Status Siklus Hidup" value={detail.lifecycle_status || "Aktif"} />
                <Info label="Tahun" value={detail.year} />
                <Info label="Pembuat" value={detail.creator_name} />
                <Info label="Ukuran file" value={formatBytes(detail.file_size)} />
              </dl>

              {/* Document Preview (Not shown for already destroyed archives to protect privacy, but shown for logs metadata) */}
              {detail.lifecycle_status !== "Musnah" ? (
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
              ) : (
                <div className="rounded-md border border-red-200 bg-red-50/50 p-4 text-xs text-red-800">
                  <div className="flex items-center gap-2">
                    <AlertOctagon size={16} />
                    <span className="font-bold">File Fisik & Elektronik Telah Dimusnahkan</span>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-600">Sesuai dengan peraturan kearsipan ANRI, file media elektronik telah dihapus permanen dari server. Metadata tetap disimpan sebagai histori pemusnahan.</p>
                </div>
              )}

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
      <Modal title="Usulkan Pemusnahan" open={proposeOpen} onClose={() => setProposeOpen(false)}>
        {detail && (
          <form onSubmit={handlePropose} className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Arsip Inaktif</p>
              <p className="text-sm font-bold text-ink">{detail.title}</p>
              <p className="text-xs text-slate-500">{detail.document_number}</p>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan Pemusnahan</span>
              <textarea
                value={proposeNotes}
                onChange={(e) => setProposeNotes(e.target.value)}
                className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
                placeholder="Tulis alasan pemusnahan arsip inaktif ini"
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
                className="focus-ring rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {proposing ? "Mengirim..." : "Kirim Usulan"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal title="Verifikasi Usulan Pemusnahan" open={verifyOpen} onClose={() => setVerifyOpen(false)}>
        {detail && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Usulan Arsip</p>
              <p className="text-sm font-bold text-ink">{detail.title}</p>
              <p className="text-xs text-slate-500">{detail.document_number}</p>
            </div>
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase text-slate-500">Keputusan Verifikasi</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="verifyApproved"
                    checked={verifyApproved === true}
                    onChange={() => setVerifyApproved(true)}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Setujui Verifikasi (Lanjut ke Kepala Inspektorat)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="verifyApproved"
                    checked={verifyApproved === false}
                    onChange={() => setVerifyApproved(false)}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Tolak Usulan (Kembalikan ke Inaktif)
                </label>
              </div>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan Verifikasi</span>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
                placeholder="Catatan hasil verifikasi berkas"
                required
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerifyOpen(false)}
                className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={verifying}
                className="focus-ring rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {verifying ? "Memproses..." : "Simpan Verifikasi"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal title="Persetujuan Kepala Inspektorat" open={approveOpen} onClose={() => setApproveOpen(false)}>
        {detail && (
          <form onSubmit={handleApprove} className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Usulan Arsip</p>
              <p className="text-sm font-bold text-ink">{detail.title}</p>
              <p className="text-xs text-slate-500">{detail.document_number}</p>
            </div>
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase text-slate-500">Persetujuan Kepala</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="approveApproved"
                    checked={approveApproved === true}
                    onChange={() => setApproveApproved(true)}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Berikan Persetujuan Pemusnahan
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="approveApproved"
                    checked={approveApproved === false}
                    onChange={() => setApproveApproved(false)}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Tolak Usulan (Kembalikan ke Inaktif)
                </label>
              </div>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan Kepala Inspektorat</span>
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
                placeholder="Masukkan catatan instruksi persetujuan pemusnahan"
                required
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setApproveOpen(false)}
                className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={approving}
                className="focus-ring rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {approving ? "Memproses..." : "Simpan Persetujuan"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Destroy Modal */}
      <Modal title="Input Berita Acara & Eksekusi Pemusnahan" open={destroyOpen} onClose={() => setDestroyOpen(false)} wide>
        {detail && (
          <form onSubmit={handleDestroy} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase text-slate-400">Arsip yang akan Dimusnahkan</p>
              <p className="text-base font-bold text-red-700">{detail.title}</p>
              <p className="text-xs text-slate-500">{detail.document_number}</p>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Nomor Berita Acara</span>
              <input
                type="text"
                value={destroyForm.baNumber}
                onChange={(e) => setDestroyForm((f) => ({ ...f, baNumber: e.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                placeholder="Masukkan Nomor BA Pemusnahan"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tanggal Pemusnahan</span>
              <input
                type="date"
                value={destroyForm.destructionDate}
                onChange={(e) => setDestroyForm((f) => ({ ...f, destructionDate: e.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Metode Pemusnahan</span>
              <select
                value={destroyForm.method}
                onChange={(e) => setDestroyForm((f) => ({ ...f, method: e.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="Pencacahan (Shredding)">Pencacahan (Shredding)</option>
                <option value="Pembakaran (Incineration)">Pembakaran (Incineration)</option>
                <option value="Peleburan (Chemical Disintegration)">Peleburan (Chemical Disintegration)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Petugas Pelaksana</span>
              <input
                type="text"
                value={destroyForm.officer}
                onChange={(e) => setDestroyForm((f) => ({ ...f, officer: e.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                placeholder="Nama Petugas"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Upload Dokumen BA (PDF/Doc)</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setDestroyForm((f) => ({ ...f, destructionDoc: e.target.files?.[0] || null }))}
                className="focus-ring block w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Upload Foto Bukti Pemusnahan (JPG/PNG)</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setDestroyForm((f) => ({ ...f, destructionPhoto: e.target.files?.[0] || null }))}
                className="focus-ring block w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
                required
              />
            </label>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setDestroyOpen(false)}
                className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={destroying}
                className="focus-ring rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {destroying ? "Memproses Pemusnahan..." : "Eksekusi Pemusnahan"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
