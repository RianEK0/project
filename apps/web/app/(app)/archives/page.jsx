"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, Download, Eye, FilePlus2, KeyRound, Lock, MapPin, MessageSquarePlus, Pencil, RotateCcw, Search, ShieldCheck, Trash2, Upload } from "lucide-react";
import Select from "react-select";
import dataJsonClassification from "../../../data/classification.json";
import { apiFetch, buildQuery, downloadFromApi } from "../../../lib/api";
import {
  ARCHIVE_CATEGORIES,
  ARCHIVE_STATUSES,
  DOCUMENT_TYPES,
  FILE_TYPES,
  SECURITY_LEVELS,
  canChooseArchiveUnit,
  canDeleteArchive,
  canDownloadArchive,
  canEditArchive,
  canUpdateArchiveStatus,
  canViewArchive
} from "../../../lib/constants";
import { formatBytes, formatDateTime } from "../../../lib/format";
import { useAuth } from "../../../components/AuthProvider";
import { EmptyState } from "../../../components/EmptyState";
import { FileTypeIcon } from "../../../components/FileTypeIcon";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../../../components/StatusBadge";

const classificationOptions = dataJsonClassification.map((item) => ({
  value: item.Id,
  label: `${item.Id} - ${item.Keterangan}`
}));

const getClassificationLabel = (code) => {
  const match = dataJsonClassification.find((item) => item.Id === code);
  return match ? `${match.Id} - ${match.Keterangan}` : code;
};

const defaultForm = {
  title: "",
  documentNumber: "",
  letterNumber: "",
  archiveDate: new Date().toISOString().split("T")[0],
  securityLevel: "Biasa",
  activeRetention: 0,
  inactiveRetention: 0,
  unitId: "",
  documentType: DOCUMENT_TYPES[0],
  fileType: "PDF",
  year: new Date().getFullYear(),
  status: "Draft",
  classification: classificationOptions[0]?.value || "",
  archiveCategory: "Arsip Aktif",
  lifecycleStatus: "Aktif",
  locationRoom: "",
  locationRack: "",
  locationBox: "",
  locationFolder: "",
  locationFileNumber: "",
  description: "",
  file: null
};

function isPastDate(dateValue) {
  if (!dateValue) return false;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dateValue < todayKey;
}

function formatLongDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("id-ID", { dateStyle: "long" });
}

function formatLocationValues(values = []) {
  return values.filter(Boolean).join(" | ") || "-";
}

function formatPhysicalLocation(archive) {
  const values = [
    archive?.location_room,
    archive?.location_rack,
    archive?.location_box,
    archive?.location_folder,
    archive?.location_file_number
  ];
  return formatLocationValues(values);
}

function formatLocationLog(entry, prefix = "new") {
  const values = [
    entry?.[`${prefix}_room`],
    entry?.[`${prefix}_rack`],
    entry?.[`${prefix}_box`],
    entry?.[`${prefix}_folder`],
    entry?.[`${prefix}_file_number`]
  ];
  return formatLocationValues(values);
}

export default function ArchivesPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [archives, setArchives] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    unitId: "",
    status: "",
    documentType: "",
    classification: "",
    archiveCategory: "",
    fileType: "",
    year: "",
    trash: searchParams.get("trash") || "",
    page: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [comment, setComment] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ status: "Terverifikasi", note: "" });

  // Loan / borrow request
  const [loanOpen, setLoanOpen] = useState(false);
  const [loanTarget, setLoanTarget] = useState(null);
  const [loanReason, setLoanReason] = useState("");
  const [loanStartDate, setLoanStartDate] = useState("");
  const [loanEndDate, setLoanEndDate] = useState("");
  const [loaning, setLoaning] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [movingLocation, setMovingLocation] = useState(false);
  const [locationForm, setLocationForm] = useState({
    locationRoom: "",
    locationRack: "",
    locationBox: "",
    locationFolder: "",
    locationFileNumber: "",
    notes: ""
  });
  const [stockOpen, setStockOpen] = useState(false);
  const [stocking, setStocking] = useState(false);
  const [stockForm, setStockForm] = useState({
    status: "Sesuai",
    notes: "",
    observedRoom: "",
    observedRack: "",
    observedBox: "",
    observedFolder: "",
    observedFileNumber: "",
    applyLocationUpdate: false
  });

  const searchParamString = searchParams.toString();

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({
      ...defaultForm,
      unitId: canChooseArchiveUnit(user) ? "" : user?.unitId || "",
      documentNumber: `SIPADI/${new Date().getFullYear()}/${Date.now().toString().slice(-5)}`
    });
    setFormOpen(true);
  }, [user]);

  useEffect(() => {
    apiFetch("/organization")
      .then((result) => setUnits(result.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParamString);
    const search = params.get("search") || "";
    const trash = params.get("trash") || "";
    const openNew = params.get("new") === "1";
    setFilters((current) => ({ ...current, search, trash, page: 1 }));
    if (openNew) openCreate();
  }, [searchParamString, openCreate]);

  const loadArchives = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch(`/archives${buildQuery({ ...filters, limit: 10 })}`);
      setArchives(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  const totalPages = useMemo(() => Math.max(Math.ceil((meta.total || 0) / meta.limit), 1), [meta]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));
  }

  function openEdit(archive) {
    setEditing(archive);
    setForm({
      title: archive.title || "",
      documentNumber: archive.document_number || "",
      letterNumber: archive.letter_number || "",
      archiveDate: archive.archive_date ? archive.archive_date.split("T")[0] : new Date().toISOString().split("T")[0],
      securityLevel: archive.security_level || "Biasa",
      activeRetention: archive.active_retention || 0,
      inactiveRetention: archive.inactive_retention || 0,
      unitId: archive.unit_id || "",
      documentType: archive.document_type || DOCUMENT_TYPES[0],
      fileType: archive.file_type || "PDF",
      year: archive.year || new Date().getFullYear(),
      status: archive.status || "Draft",
      classification: archive.classification || classificationOptions[0]?.value || "",
      archiveCategory: archive.archive_category || "Arsip Aktif",
      lifecycleStatus: archive.lifecycle_status || "Aktif",
      locationRoom: archive.location_room || "",
      locationRack: archive.location_rack || "",
      locationBox: archive.location_box || "",
      locationFolder: archive.location_folder || "",
      locationFileNumber: archive.location_file_number || "",
      description: archive.description || "",
      file: null
    });
    setFormOpen(true);
  }

  async function submitArchive(event) {
    event.preventDefault();
    if (form.fileType === "TIFF" && form.securityLevel !== "Rahasia") {
      setError("Arsip bertipe file TIFF wajib menggunakan tingkat keamanan 'Rahasia'");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "file") {
          if (value) payload.append("file", value);
        } else if (value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });

      await apiFetch(editing ? `/archives/${editing.id}` : "/archives", {
        method: editing ? "PUT" : "POST",
        body: payload
      });

      setFormOpen(false);
      await loadArchives();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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

      if (detail.deleted_at || (detail.security_level === "Rahasia" && detail.file_type !== "PDF")) {
        setPreviewUrl("");
        setPreviewLoading(false);
        setPreviewError("");
        return;
      }

      setPreviewLoading(true);
      setPreviewError("");
      setPreviewUrl("");

      try {
        const response = await apiFetch(`/archives/${detail.id}/preview`);
        const blob = await response.blob();

        if (!active) return;

        objectUrl = window.URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        if (active) {
          setPreviewError(err.message);
        }
      } finally {
        if (active) {
          setPreviewLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      active = false;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [detail?.id, detail?.updated_at, detail?.security_level, detail?.file_type, detail?.deleted_at, detailOpen]);

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

  async function submitVerify(event) {
    event.preventDefault();
    if (!verifyTarget) return;
    try {
      await apiFetch(`/archives/${verifyTarget.id}/verify`, {
        method: "POST",
        body: JSON.stringify(verifyForm)
      });
      setVerifyOpen(false);
      setVerifyTarget(null);
      await loadArchives();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteArchive(archive) {
    const confirmed = window.confirm(`Pindahkan arsip "${archive.title}" ke sampah?`);
    if (!confirmed) return;
    try {
      await apiFetch(`/archives/${archive.id}`, { method: "DELETE" });
      await loadArchives();
    } catch (err) {
      setError(err.message);
    }
  }

  async function restoreArchive(archive) {
    const confirmed = window.confirm(`Restore arsip "${archive.title}" dari sampah?`);
    if (!confirmed) return;
    try {
      await apiFetch(`/archives/${archive.id}/restore`, { method: "POST" });
      await loadArchives();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitLoanRequest(event) {
    event.preventDefault();
    if (!loanTarget || !loanReason.trim() || !loanStartDate || !loanEndDate) return;
    setLoaning(true);
    try {
      await apiFetch("/loans/request", {
        method: "POST",
        body: JSON.stringify({
          archiveId: loanTarget.id,
          reason: loanReason,
          loanDate: loanStartDate,
          loanDeadline: loanEndDate
        })
      });
      setLoanOpen(false);
      setLoanTarget(null);
      setLoanReason("");
      setLoanStartDate("");
      setLoanEndDate("");
      await loadArchives();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaning(false);
    }
  }

  function downloadImportTemplate() {
    const sample = [
      "title,document_number,document_type,unit_id,year,status,classification,archive_category,archive_date,security_level,active_retention,inactive_retention,lifecycle_status,location_room,location_rack,location_box,location_folder,location_file_number,description",
      'Contoh Arsip,SIPADI/2026/00001,Surat Masuk,1,2026,Draft,Internal,Arsip Aktif,2026-08-05,Biasa,2,3,Aktif,Ruang Arsip,Rak A,Box 01,Map Merah,BRK-001,"Contoh data import dari CSV"'
    ].join("\n");
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-import-arsip.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function submitImportSpreadsheet(event) {
    event.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("file", importFile);
      if (!importPreview) {
        const result = await apiFetch("/archives/import-preview", {
          method: "POST",
          body: payload
        });
        setImportPreview(result.data);
      } else {
        await apiFetch("/archives/import-spreadsheet", {
          method: "POST",
          body: payload
        });
        setImportOpen(false);
        setImportFile(null);
        setImportPreview(null);
        await loadArchives();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  async function submitLocationMove(event) {
    event.preventDefault();
    if (!detail) return;
    setMovingLocation(true);
    setError("");
    try {
      await apiFetch(`/archives/${detail.id}/move-location`, {
        method: "POST",
        body: JSON.stringify(locationForm)
      });
      setLocationOpen(false);
      await Promise.all([openDetail(detail.id), loadArchives()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setMovingLocation(false);
    }
  }

  async function submitStockOpname(event) {
    event.preventDefault();
    if (!detail) return;
    setStocking(true);
    setError("");
    try {
      await apiFetch(`/archives/${detail.id}/stock-opname`, {
        method: "POST",
        body: JSON.stringify(stockForm)
      });
      setStockOpen(false);
      await Promise.all([openDetail(detail.id), loadArchives()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setStocking(false);
    }
  }

  function openLocationModal() {
    if (!detail) return;
    setLocationForm({
      locationRoom: detail.location_room || "",
      locationRack: detail.location_rack || "",
      locationBox: detail.location_box || "",
      locationFolder: detail.location_folder || "",
      locationFileNumber: detail.location_file_number || "",
      notes: ""
    });
    setLocationOpen(true);
  }

  function openStockModal() {
    if (!detail) return;
    setStockForm({
      status: "Sesuai",
      notes: "",
      observedRoom: detail.location_room || "",
      observedRack: detail.location_rack || "",
      observedBox: detail.location_box || "",
      observedFolder: detail.location_folder || "",
      observedFileNumber: detail.location_file_number || "",
      applyLocationUpdate: false
    });
    setStockOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">Manajemen arsip</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Data Arsip</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta.total || 0} dokumen {filters.trash ? "di sampah" : "ditemukan"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilter("trash", "")}
            className={`focus-ring inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold ${
              !filters.trash ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            Arsip Aktif
          </button>
          <button
            type="button"
            onClick={() => updateFilter("trash", "1")}
            className={`focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold ${
              filters.trash ? "border-slate-300 bg-slate-100 text-slate-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <Trash2 size={16} />
            Sampah
          </button>
          {!filters.trash ? (
            <>
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Upload size={16} />
                Import CSV/Excel
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <FilePlus2 size={18} />
                Tambah Arsip
              </button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
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
          <FilterSelect label="Divisi" value={filters.unitId} onChange={(value) => updateFilter("unitId", value)}>
            <option value="">Semua divisi</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Status" value={filters.status} onChange={(value) => updateFilter("status", value)}>
            <option value="">Semua status</option>
            {ARCHIVE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Jenis" value={filters.documentType} onChange={(value) => updateFilter("documentType", value)}>
            <option value="">Semua jenis</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Kategori" value={filters.archiveCategory} onChange={(value) => updateFilter("archiveCategory", value)}>
            <option value="">Semua kategori</option>
            {ARCHIVE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.value}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="File" value={filters.fileType} onChange={(value) => updateFilter("fileType", value)}>
            <option value="">Semua file</option>
            {FILE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </FilterSelect>
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

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
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
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archives.map((archive) => {
                const mayView = canViewArchive(user, archive);
                const mayDownload = canDownloadArchive(user, archive);
                const mayEdit = canEditArchive(user, archive);
                const mayDelete = canDeleteArchive(user, archive);
                const mayUpdateStatus = canUpdateArchiveStatus(user, archive);

                return (
                  <tr key={archive.id} className="hover:bg-slate-50">
                    <td className="max-w-sm px-4 py-3">
                      <p className="font-semibold text-ink">{archive.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{archive.document_number} | {archive.year}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatPhysicalLocation(archive)}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{archive.unit_name}</td>
                    <td className="px-4 py-3 text-slate-600">{archive.document_type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600" title={getClassificationLabel(archive.classification)}>{archive.classification}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={archive.archive_category} />
                    </td>
                    <td className="px-4 py-3">
                      <FileTypeIcon type={archive.file_type} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={archive.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {mayView ? <IconButton label="Lihat" onClick={() => openDetail(archive.id)} icon={Eye} /> : null}
                        {archive.deleted_at ? null : mayEdit ? <IconButton label="Edit" onClick={() => openEdit(archive)} icon={Pencil} /> : null}
                        {!archive.deleted_at && mayDownload ? (
                          <IconButton
                            label="Download"
                            onClick={() => downloadFromApi(`/archives/${archive.id}/download`, `arsip-${archive.id}.${archive.file_type?.toLowerCase() || "txt"}`)}
                            icon={Download}
                          />
                        ) : null}
                        {!archive.deleted_at && mayUpdateStatus ? (
                          <IconButton
                            label="Verifikasi"
                            onClick={() => {
                              setVerifyTarget(archive);
                              setVerifyForm({ status: "Terverifikasi", note: "" });
                              setVerifyOpen(true);
                            }}
                            icon={ShieldCheck}
                          />
                        ) : null}
                        {archive.deleted_at ? (
                          mayDelete ? <IconButton label="Restore" onClick={() => restoreArchive(archive)} icon={RotateCcw} /> : null
                        ) : mayDelete ? (
                          <IconButton label="Hapus" onClick={() => deleteArchive(archive)} icon={Trash2} danger />
                        ) : null}
                        {/* Loan Request button for users without access */}
                        {!archive.deleted_at && !mayView && !mayDownload ? (
                          <div className="flex items-center gap-1.5">
                            {archive.loan_status === "Menunggu Persetujuan" ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                <Lock size={11} /> Menunggu Persetujuan
                              </span>
                            ) : archive.loan_status === "Ditolak" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setLoanTarget(archive);
                                  setLoanReason("");
                                  setLoanStartDate("");
                                  setLoanEndDate("");
                                  setLoanOpen(true);
                                }}
                                className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                              >
                                <Lock size={12} /> Ajukan Ulang
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setLoanTarget(archive);
                                  setLoanReason("");
                                  setLoanStartDate("");
                                  setLoanEndDate("");
                                  setLoanOpen(true);
                                }}
                                className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-brand-300 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                              >
                                <KeyRound size={12} /> Pinjam Arsip
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && archives.length === 0 ? <EmptyState title="Arsip tidak ditemukan" description="Coba ubah kata kunci atau filter arsip." /> : null}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Halaman {meta.page || 1} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={(meta.page || 1) <= 1}
              onClick={() => updateFilter("page", (meta.page || 1) - 1)}
              className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={(meta.page || 1) >= totalPages}
              onClick={() => updateFilter("page", (meta.page || 1) + 1)}
              className="focus-ring rounded-md border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>

      <Modal title={editing ? "Edit arsip" : "Tambah arsip"} open={formOpen} onClose={() => setFormOpen(false)} wide>
        <ArchiveForm
          form={form}
          setForm={setForm}
          units={units}
          submitting={saving}
          onSubmit={submitArchive}
          user={user}
        />
      </Modal>

      <Modal title="Import Arsip Massal CSV/Excel" open={importOpen} onClose={() => setImportOpen(false)}>
        <form onSubmit={submitImportSpreadsheet} className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Kolom penting minimal</p>
            <p className="mt-1 text-xs text-slate-500">Gunakan header: <code>title, document_number, document_type, unit_id</code>. File bisa berupa CSV, XLS, atau XLSX.</p>
            <button
              type="button"
              onClick={downloadImportTemplate}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download size={14} />
              Unduh Template CSV
            </button>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">File Import</span>
            <input
              type="file"
              accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => {
                setImportFile(event.target.files?.[0] || null);
                setImportPreview(null);
              }}
              className="focus-ring block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              required
            />
          </label>
          {importPreview ? (
            <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">Total Baris</p>
                  <p className="mt-1 font-bold text-ink">{importPreview.summary.totalRows}</p>
                </div>
                <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm">
                  <p className="text-xs font-semibold uppercase text-emerald-600">Valid</p>
                  <p className="mt-1 font-bold text-emerald-700">{importPreview.summary.validRows}</p>
                </div>
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm">
                  <p className="text-xs font-semibold uppercase text-red-600">Bermasalah</p>
                  <p className="mt-1 font-bold text-red-700">{importPreview.summary.invalidRows}</p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-left uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Baris</th>
                      <th className="px-3 py-2">Nomor</th>
                      <th className="px-3 py-2">Judul</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.preview.slice(0, 10).map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="px-3 py-2 text-slate-500">{row.rowNumber}</td>
                        <td className="px-3 py-2 text-slate-700">{row.normalized?.documentNumber || row.raw?.document_number || "-"}</td>
                        <td className="px-3 py-2 text-slate-700">{row.normalized?.title || row.raw?.title || "-"}</td>
                        <td className="px-3 py-2">
                          {row.errors.length === 0 ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Siap impor</span>
                          ) : (
                            <span className="inline-flex rounded-md bg-red-100 px-2 py-0.5 font-semibold text-red-700">{row.errors.join("; ")}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importPreview.summary.invalidRows > 0 ? (
                <p className="text-xs text-red-600">Masih ada baris bermasalah. Perbaiki file lalu unggah ulang untuk melanjutkan.</p>
              ) : (
                <p className="text-xs text-emerald-600">Preview valid. Anda bisa lanjut ke proses import penuh.</p>
              )}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setImportOpen(false);
                setImportFile(null);
                setImportPreview(null);
              }}
              className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={importing || !importFile || (importPreview && importPreview.summary.invalidRows > 0)}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              <Upload size={15} />
              {importing
                ? "Memproses..."
                : importPreview
                  ? "Konfirmasi Import"
                  : "Preview Import"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="Detail arsip" open={detailOpen} onClose={() => setDetailOpen(false)} wide>
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
              {!detail.deleted_at && canEditArchive(user, detail) ? (
                <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <button
                    type="button"
                    onClick={openLocationModal}
                    className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <MapPin size={15} />
                    Pindahkan Lokasi
                  </button>
                  <button
                    type="button"
                    onClick={openStockModal}
                    className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck size={15} />
                    Catat Stock Opname
                  </button>
                </div>
              ) : null}
              <dl className="grid gap-3 rounded-md border border-slate-200 p-4 text-sm sm:grid-cols-2">
                <Info label="Divisi" value={detail.unit_name} />
                <Info label="Jenis" value={detail.document_type} />
                <Info label="Klasifikasi" value={getClassificationLabel(detail.classification)} />
                <Info label="Kategori Arsip" value={detail.archive_category} />
                <Info label="Tingkat Keamanan" value={detail.security_level || "Biasa"} />
                <Info label="Nomor Surat" value={detail.letter_number || "-"} />
                <Info label="Tanggal Arsip" value={detail.archive_date ? new Date(detail.archive_date).toLocaleDateString("id-ID") : "-"} />
                <Info label="Lokasi Fisik" value={formatPhysicalLocation(detail)} />
                <Info label="Nomor BA Penyusutan" value={detail.disposal_ba_number || "-"} />
                <Info label="Draft BA Penyusutan" value={detail.pending_disposal_ba_number || "-"} />
                <Info label="Nomor BA Pemusnahan" value={detail.destruction_ba_number || "-"} />
                <Info label="Masa Retensi" value={`${detail.active_retention || 0} Thn Aktif / ${detail.inactive_retention || 0} Thn Inaktif`} />
                <Info label="Status Siklus Hidup" value={detail.lifecycle_status || "Aktif"} />
                <Info label="Tahun" value={detail.year} />
                <Info label="Pembuat" value={detail.creator_name} />
                <Info label="Ukuran file" value={formatBytes(detail.file_size)} />
              </dl>

              {/* Info Peminjaman (loan date & deadline) */}
              {detail.loan && ["Disetujui", "Dikembalikan"].includes(detail.loan.status) && (
                <div
                  className={`rounded-md border p-4 ${
                    detail.loan.status === "Dikembalikan"
                      ? "border-sky-200 bg-sky-50"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarClock
                      size={16}
                      className={detail.loan.status === "Dikembalikan" ? "text-sky-600" : "text-emerald-600"}
                    />
                    <span
                      className={`text-sm font-bold ${
                        detail.loan.status === "Dikembalikan" ? "text-sky-700" : "text-emerald-700"
                      }`}
                    >
                      {detail.loan.status === "Dikembalikan" ? "Riwayat Peminjaman" : "Informasi Peminjaman"}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className={`block text-xs font-semibold uppercase ${detail.loan.status === "Dikembalikan" ? "text-sky-600" : "text-emerald-600"}`}>Tanggal Peminjaman</span>
                      <span className={`mt-0.5 block font-medium ${detail.loan.status === "Dikembalikan" ? "text-sky-800" : "text-emerald-800"}`}>
                        {formatLongDate(detail.loan.loan_date)}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-xs font-semibold uppercase ${detail.loan.status === "Dikembalikan" ? "text-sky-600" : "text-emerald-600"}`}>Batas Peminjaman</span>
                      <span className={`mt-0.5 block font-medium ${
                        detail.loan.status === "Disetujui" && isPastDate(detail.loan.loan_deadline)
                          ? "text-red-600"
                          : detail.loan.status === "Dikembalikan"
                            ? "text-sky-800"
                            : "text-emerald-800"
                      }`}>
                        {formatLongDate(detail.loan.loan_deadline)}
                        {detail.loan.status === "Disetujui" && isPastDate(detail.loan.loan_deadline) && (
                          <span className="ml-1 text-xs text-red-500 font-semibold">(Sudah lewat)</span>
                        )}
                      </span>
                    </div>
                    {detail.loan.status === "Dikembalikan" ? (
                      <>
                        <div>
                          <span className="block text-xs font-semibold uppercase text-sky-600">Dikembalikan Pada</span>
                          <span className="mt-0.5 block text-sky-800 font-medium">
                            {detail.loan.returned_at ? formatDateTime(detail.loan.returned_at) : "-"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold uppercase text-sky-600">Dikembalikan Oleh</span>
                          <span className="mt-0.5 block text-sky-800 font-medium">
                            {detail.loan.returned_by_name || "-"}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                  {detail.loan.return_notes ? (
                    <div className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                      detail.loan.status === "Dikembalikan"
                        ? "border-sky-200 bg-white/70 text-sky-800"
                        : "border-emerald-200 bg-white/70 text-emerald-800"
                    }`}>
                      <span className="font-semibold">Catatan:</span> {detail.loan.return_notes}
                    </div>
                  ) : null}
                  {detail.loan.extension_id ? (
                    <div className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                      detail.loan.status === "Dikembalikan"
                        ? "border-sky-200 bg-white/70 text-sky-800"
                        : "border-emerald-200 bg-white/70 text-emerald-800"
                    }`}>
                      <span className="font-semibold">Perpanjangan terakhir:</span>{" "}
                      {detail.loan.extension_status === "Menunggu Persetujuan"
                        ? `menunggu persetujuan sampai ${formatLongDate(detail.loan.extension_requested_deadline)}`
                        : detail.loan.extension_status === "Disetujui"
                          ? `disetujui sampai ${formatLongDate(detail.loan.extension_requested_deadline)}`
                          : `ditolak${detail.loan.extension_reviewed_by_name ? ` oleh ${detail.loan.extension_reviewed_by_name}` : ""}`}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="rounded-md border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">
                  Riwayat Peminjaman Arsip
                </div>
                <div className="divide-y divide-slate-100">
                  {detail.loanHistory?.map((loanItem) => (
                    <div key={loanItem.id} className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={loanItem.status} />
                        <span className="font-semibold text-slate-700">{loanItem.requester_name}</span>
                        <span className="text-xs text-slate-400">{loanItem.requester_role}</span>
                      </div>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Periode Pinjam</p>
                          <p className="mt-1 text-slate-700">
                            {formatLongDate(loanItem.loan_date)} - {formatLongDate(loanItem.loan_deadline)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Hasil Akhir</p>
                          <p className="mt-1 text-slate-700">
                            {loanItem.status === "Dikembalikan"
                              ? `Dikembalikan${loanItem.returned_by_name ? ` oleh ${loanItem.returned_by_name}` : ""}`
                              : loanItem.status === "Disetujui"
                                ? `Masih aktif${loanItem.approved_by_name ? `, disetujui oleh ${loanItem.approved_by_name}` : ""}`
                                : loanItem.status === "Ditolak"
                                  ? `Ditolak${loanItem.approved_by_name ? ` oleh ${loanItem.approved_by_name}` : ""}`
                                  : "Menunggu persetujuan"}
                          </p>
                        </div>
                      </div>
                      {loanItem.extension_count > 0 ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Perpanjangan: {loanItem.extension_count} kali
                          {loanItem.extension_status ? `, status terakhir ${loanItem.extension_status.toLowerCase()}` : ""}
                          {loanItem.extension_requested_deadline ? ` sampai ${formatLongDate(loanItem.extension_requested_deadline)}` : ""}
                        </p>
                      ) : null}
                      {loanItem.notes ? <p className="mt-2 text-xs text-slate-500">Catatan approval: {loanItem.notes}</p> : null}
                      {loanItem.return_notes ? <p className="mt-1 text-xs text-slate-500">Catatan pengembalian: {loanItem.return_notes}</p> : null}
                      <p className="mt-2 text-xs text-slate-400">Dibuat {formatDateTime(loanItem.created_at)}</p>
                    </div>
                  ))}
                  {detail.loanHistory?.length === 0 ? (
                    <div className="px-4 py-5 text-sm text-slate-500">Belum ada riwayat peminjaman untuk arsip ini.</div>
                  ) : null}
                </div>
              </div>

              {/* Rahasia warning */}
              {detail.deleted_at ? (
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <Trash2 size={15} />
                  <span className="font-semibold">Arsip ini sedang berada di sampah dan belum dipulihkan.</span>
                </div>
              ) : null}

              {/* Rahasia warning */}
              {detail.security_level === "Rahasia" && (
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <Lock size={15} />
                  <span className="font-semibold">Dokumen Rahasia — Hanya dapat dilihat (view-only), tidak dapat diunduh.</span>
                </div>
              )}

              {/* Berita Acara Downloads */}
              {(detail.disposal_doc_path || detail.pending_disposal_doc_path || detail.destruction_doc_path) && (
                <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50/50 p-3 text-xs">
                  <span className="font-bold text-slate-500 w-full mb-1">Berita Acara Pendukung:</span>
                  {(detail.disposal_doc_path || detail.pending_disposal_doc_path) && (
                    <button
                      type="button"
                      onClick={() =>
                        downloadFromApi(
                          `/disposals/${detail.id}/download-disposal-ba`,
                          `BA-Penyusutan-${detail.disposal_ba_number || detail.id}.pdf`
                        )
                      }
                      className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 font-semibold text-brand-700 hover:bg-slate-50"
                    >
                      <Download size={13} className="mr-1" /> Unduh BA Penyusutan
                    </button>
                  )}
                  {detail.destruction_doc_path && (
                    <button
                      type="button"
                      onClick={() =>
                        downloadFromApi(
                          `/disposals/${detail.id}/download-ba`,
                          `BA-Pemusnahan-${detail.destruction_ba_number || detail.id}.pdf`
                        )
                      }
                      className="focus-ring inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 font-semibold text-red-700 hover:bg-slate-50"
                    >
                      <Download size={13} className="mr-1" /> Unduh BA Pemusnahan
                    </button>
                  )}
                </div>
              )}
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">File arsip</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{detail.file_original_name || `arsip-${detail.id}`}</p>
                  </div>
                  {!detail.deleted_at && detail.security_level !== "Rahasia" && (
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
                      Unduh
                    </button>
                  )}
                </div>
                <div className={`bg-slate-50 ${detail.security_level === "Rahasia" && detail.file_type !== "PDF" ? "h-[220px] relative" : "h-[420px]"}`}>
                  {detail.security_level === "Rahasia" && detail.file_type !== "PDF" ? (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500 bg-amber-50/20">
                      <Lock className="mb-2 h-8 w-8 text-amber-600 animate-pulse" />
                      <p className="font-semibold text-ink">Dokumen Rahasia</p>
                      <p className="mt-1 text-xs text-slate-500 max-w-sm">Dokumen ini bersifat rahasia. Sesuai kebijakan keamanan, akses pratinjau dan unduhan dinonaktifkan.</p>
                    </div>
                  ) : previewLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">Memuat file...</div>
                  ) : previewError ? (
                    <div className="flex h-full items-center justify-center p-6 text-sm text-red-600">{previewError}</div>
                  ) : previewUrl ? (
                    <object data={previewUrl} type={getPreviewMimeType(detail.file_type)} className="h-full w-full">
                      <div className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
                        Pratinjau file tidak tersedia.
                      </div>
                    </object>
                  ) : null}
                </div>
              </div>
              <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">{detail.description || "Tidak ada deskripsi."}</p>

              {/* Timeline Riwayat Siklus Hidup */}
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

            <div className="space-y-4">
              {!detail.deleted_at ? (
                <form onSubmit={submitComment} className="rounded-md border border-slate-200 p-4">
                  <label className="text-sm font-semibold text-ink">
                    Komentar
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      className="focus-ring mt-2 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
                      placeholder="Tulis komentar arsip"
                    />
                  </label>
                  <button
                    type="submit"
                    className="focus-ring mt-3 inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    <MessageSquarePlus size={17} />
                    Simpan Komentar
                  </button>
                </form>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Komentar dinonaktifkan untuk arsip yang sedang berada di sampah.
                </div>
              )}

              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">Log akses arsip</div>
                <div className="divide-y divide-slate-100">
                  {detail.accessLogs?.map((item) => (
                    <div key={item.id} className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                          {item.action}
                        </span>
                        <span className="text-xs text-slate-400">{formatDateTime(item.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{item.user_name || "Sistem"}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.user_role || item.entity}</p>
                    </div>
                  ))}
                  {detail.accessLogs?.length === 0 ? <div className="px-4 py-5 text-sm text-slate-500">Belum ada log akses.</div> : null}
                </div>
              </div>

              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">Riwayat perpindahan lokasi</div>
                <div className="divide-y divide-slate-100">
                  {detail.locationLogs?.map((item) => (
                    <div key={item.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                          Pindah lokasi
                        </span>
                        <span className="text-xs text-slate-400">{formatDateTime(item.created_at)}</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Dari</p>
                      <p className="mt-1 text-sm text-slate-700">{formatLocationLog(item, "old")}</p>
                      <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Ke</p>
                      <p className="mt-1 text-sm text-slate-700">{formatLocationLog(item, "new")}</p>
                      {item.notes ? <p className="mt-2 text-xs text-slate-500">{item.notes}</p> : null}
                      <p className="mt-1 text-xs text-slate-400">{item.moved_by_name || "Sistem"} | {item.moved_by_role || "-"}</p>
                    </div>
                  ))}
                  {detail.locationLogs?.length === 0 ? <div className="px-4 py-5 text-sm text-slate-500">Belum ada riwayat perpindahan lokasi.</div> : null}
                </div>
              </div>

              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">Riwayat stock opname</div>
                <div className="divide-y divide-slate-100">
                  {detail.stockOpnames?.map((item) => (
                    <div key={item.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-xs text-slate-400">{formatDateTime(item.created_at)}</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Lokasi teramati</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {formatLocationValues([
                          item.observed_room,
                          item.observed_rack,
                          item.observed_box,
                          item.observed_folder,
                          item.observed_file_number
                        ])}
                      </p>
                      {item.notes ? <p className="mt-2 text-xs text-slate-500">{item.notes}</p> : null}
                      <p className="mt-1 text-xs text-slate-400">{item.checked_by_name || "Sistem"} | {item.checked_by_role || "-"}</p>
                    </div>
                  ))}
                  {detail.stockOpnames?.length === 0 ? <div className="px-4 py-5 text-sm text-slate-500">Belum ada catatan stock opname.</div> : null}
                </div>
              </div>

              <div className="rounded-md border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">Komentar arsip</div>
                <div className="divide-y divide-slate-100">
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

      <Modal title="Verifikasi arsip" open={verifyOpen} onClose={() => setVerifyOpen(false)}>
        <form onSubmit={submitVerify} className="space-y-4">
          <FilterSelect label="Status" value={verifyForm.status} onChange={(value) => setVerifyForm((current) => ({ ...current, status: value }))}>
            {["Menunggu Review", "Terverifikasi", "Ditolak", "Diarsipkan"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan</span>
            <textarea
              value={verifyForm.note}
              onChange={(event) => setVerifyForm((current) => ({ ...current, note: event.target.value }))}
              className="focus-ring min-h-28 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Catatan verifikasi"
            />
          </label>
          <button type="submit" className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            <ShieldCheck size={17} />
            Simpan Verifikasi
          </button>
        </form>
      </Modal>

      <Modal title="Pindahkan Lokasi Arsip" open={locationOpen} onClose={() => setLocationOpen(false)}>
        <form onSubmit={submitLocationMove} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Ruangan</span>
              <input
                value={locationForm.locationRoom}
                onChange={(event) => setLocationForm((current) => ({ ...current, locationRoom: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Rak</span>
              <input
                value={locationForm.locationRack}
                onChange={(event) => setLocationForm((current) => ({ ...current, locationRack: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Box</span>
              <input
                value={locationForm.locationBox}
                onChange={(event) => setLocationForm((current) => ({ ...current, locationBox: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Map</span>
              <input
                value={locationForm.locationFolder}
                onChange={(event) => setLocationForm((current) => ({ ...current, locationFolder: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Nomor Berkas</span>
              <input
                value={locationForm.locationFileNumber}
                onChange={(event) => setLocationForm((current) => ({ ...current, locationFileNumber: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan</span>
            <textarea
              value={locationForm.notes}
              onChange={(event) => setLocationForm((current) => ({ ...current, notes: event.target.value }))}
              className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Catatan perpindahan lokasi"
            />
          </label>
          <button type="submit" disabled={movingLocation} className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <MapPin size={16} />
            {movingLocation ? "Menyimpan..." : "Simpan Lokasi"}
          </button>
        </form>
      </Modal>

      <Modal title="Catat Stock Opname" open={stockOpen} onClose={() => setStockOpen(false)}>
        <form onSubmit={submitStockOpname} className="space-y-4">
          <FilterSelect label="Status Pemeriksaan" value={stockForm.status} onChange={(value) => setStockForm((current) => ({ ...current, status: value }))}>
            {["Sesuai", "Tidak Sesuai Lokasi", "Tidak Ditemukan", "Rusak"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Ruangan Terlihat</span>
              <input
                value={stockForm.observedRoom}
                onChange={(event) => setStockForm((current) => ({ ...current, observedRoom: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Rak Terlihat</span>
              <input
                value={stockForm.observedRack}
                onChange={(event) => setStockForm((current) => ({ ...current, observedRack: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Box Terlihat</span>
              <input
                value={stockForm.observedBox}
                onChange={(event) => setStockForm((current) => ({ ...current, observedBox: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Map Terlihat</span>
              <input
                value={stockForm.observedFolder}
                onChange={(event) => setStockForm((current) => ({ ...current, observedFolder: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Nomor Berkas Terlihat</span>
              <input
                value={stockForm.observedFileNumber}
                onChange={(event) => setStockForm((current) => ({ ...current, observedFileNumber: event.target.value }))}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Catatan</span>
            <textarea
              value={stockForm.notes}
              onChange={(event) => setStockForm((current) => ({ ...current, notes: event.target.value }))}
              className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Catatan hasil pemeriksaan fisik"
            />
          </label>
          <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={stockForm.applyLocationUpdate}
              onChange={(event) => setStockForm((current) => ({ ...current, applyLocationUpdate: event.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            <span>Perbarui lokasi fisik arsip berdasarkan lokasi yang ditemukan pada stock opname ini.</span>
          </label>
          <button type="submit" disabled={stocking} className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <ShieldCheck size={16} />
            {stocking ? "Menyimpan..." : "Simpan Stock Opname"}
          </button>
        </form>
      </Modal>

      {/* Loan Request Modal */}
      <Modal title="Ajukan Permohonan Akses Arsip" open={loanOpen} onClose={() => setLoanOpen(false)}>
        <form onSubmit={submitLoanRequest} className="space-y-4">
          {loanTarget && (
            <div className="rounded-md border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
              <p className="font-semibold">{loanTarget.title}</p>
              <p className="mt-0.5 text-xs text-brand-500">{loanTarget.document_number} | {loanTarget.unit_name}</p>
            </div>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Alasan Peminjaman <span className="text-red-500">*</span></span>
            <textarea
              value={loanReason}
              onChange={(e) => setLoanReason(e.target.value)}
              className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Jelaskan keperluan Anda mengakses arsip ini..."
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tanggal Mulai Peminjaman <span className="text-red-500">*</span></span>
              <input
                type="date"
                value={loanStartDate}
                onChange={(e) => setLoanStartDate(e.target.value)}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Batas Selesai Peminjaman <span className="text-red-500">*</span></span>
              <input
                type="date"
                value={loanEndDate}
                onChange={(e) => setLoanEndDate(e.target.value)}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                required
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLoanOpen(false)}
              className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loaning || !loanReason.trim() || !loanStartDate || !loanEndDate}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              <KeyRound size={15} />
              {loaning ? "Mengirim..." : "Kirim Permohonan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
      >
        {children}
      </select>
    </label>
  );
}

function IconButton({ label, icon: Icon, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm ${
        danger ? "border-red-200 text-red-700 hover:bg-red-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-700">{value || "-"}</dd>
    </div>
  );
}

function ArchiveForm({ form, setForm, units, submitting, onSubmit, user }) {
  const unitLocked = !canChooseArchiveUnit(user);

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <TextInput label="Judul" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
      <TextInput
        label="Nomor Dokumen"
        value={form.documentNumber}
        onChange={(value) => setForm((current) => ({ ...current, documentNumber: value }))}
        required
      />
      <TextInput
        label="Nomor Surat"
        value={form.letterNumber}
        onChange={(value) => setForm((current) => ({ ...current, letterNumber: value }))}
      />
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tanggal Arsip</span>
        <input
          type="date"
          value={form.archiveDate}
          onChange={(event) => setForm((current) => ({ ...current, archiveDate: event.target.value }))}
          className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
        />
      </label>
      <FilterSelect label="Divisi" value={form.unitId} onChange={(value) => setForm((current) => ({ ...current, unitId: value }))}>
        <option value="">Pilih divisi</option>
        {units.map((unit) => (
          <option key={unit.id} value={unit.id} disabled={unitLocked && Number(unit.id) !== Number(user?.unitId)}>
            {unit.name}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect label="Jenis Dokumen" value={form.documentType} onChange={(value) => setForm((current) => ({ ...current, documentType: value }))}>
        {DOCUMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </FilterSelect>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase">
          Klasifikasi
        </label>
        <Select
          options={classificationOptions}
          value={classificationOptions.find((option) => option.value === form.classification) || null}
          onChange={(pilihan) => setForm((current) => ({ 
            ...current, 
            classification: pilihan ? pilihan.value : "" 
          }))}
          isSearchable={true}
          placeholder="Cari kode klasifikasi..."
          noOptionsMessage={() => "Kode tidak ditemukan"}
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: state.isFocused ? "#0d9488" : "#e2e8f0",
              boxShadow: state.isFocused ? "0 0 0 1px #0d9488" : "none",
              '&:hover': {
                borderColor: "#0d9488",
              },
              borderRadius: "0.375rem",
              minHeight: "2.5rem",
            }),
          }}
        />
      </div>
      <FilterSelect
        label="Tingkat Keamanan"
        value={form.securityLevel}
        onChange={(value) => setForm((current) => ({ ...current, securityLevel: value }))}
        disabled={form.fileType === "TIFF"}
      >
        {SECURITY_LEVELS.map((level) => {
          const isTiff = form.fileType === "TIFF";
          const isDisabled = isTiff ? level !== "Rahasia" : (level === "Rahasia" && !["TIFF", "PDF"].includes(form.fileType));
          return (
            <option key={level} value={level} disabled={isDisabled}>
              {level}
              {isTiff && level !== "Rahasia"
                ? " (TIFF wajib Rahasia)"
                : (level === "Rahasia" && !["TIFF", "PDF"].includes(form.fileType) ? " (hanya TIFF/PDF)" : "")}
            </option>
          );
        })}
      </FilterSelect>
      <TextInput
        label="Masa Retensi Aktif (Tahun)"
        value={form.activeRetention}
        onChange={(value) => setForm((current) => ({ ...current, activeRetention: value }))}
      />
      <TextInput
        label="Masa Retensi Inaktif (Tahun)"
        value={form.inactiveRetention}
        onChange={(value) => setForm((current) => ({ ...current, inactiveRetention: value }))}
      />
      <FilterSelect
        label="Status Siklus Hidup (ANRI)"
        value={form.lifecycleStatus}
        onChange={(value) => {
          let cat = "Arsip Aktif";
          if (value === "Inaktif") cat = "Arsip Inaktif";
          else if (value === "Statis") cat = "Arsip Statis";
          else if (["Usulan Pemusnahan", "Verifikasi Pemusnahan", "Disetujui Pemusnahan", "Musnah"].includes(value)) cat = "Arsip Musnah";

          setForm((current) => ({
            ...current,
            lifecycleStatus: value,
            archiveCategory: cat
          }));
        }}
      >
        {["Aktif", "Usulan Penyusutan", "Inaktif", "Statis", "Usulan Pemusnahan", "Verifikasi Pemusnahan", "Disetujui Pemusnahan", "Musnah"].map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Kategori Arsip"
        value={form.archiveCategory}
        onChange={(value) => {
          let lStatus = "Aktif";
          if (value === "Arsip Inaktif") lStatus = "Inaktif";
          else if (value === "Arsip Statis") lStatus = "Statis";
          else if (value === "Arsip Musnah") lStatus = "Musnah";

          setForm((current) => ({
            ...current,
            archiveCategory: value,
            lifecycleStatus: lStatus
          }));
        }}
      >
        {ARCHIVE_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.value}
          </option>
        ))}
      </FilterSelect>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600 md:col-span-2">
        {ARCHIVE_CATEGORIES.find((category) => category.value === form.archiveCategory)?.description}
      </div>
      <div className="md:col-span-2">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <MapPin size={14} />
          Lokasi Fisik Arsip
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <TextInput label="Ruangan" value={form.locationRoom} onChange={(value) => setForm((current) => ({ ...current, locationRoom: value }))} />
          <TextInput label="Rak" value={form.locationRack} onChange={(value) => setForm((current) => ({ ...current, locationRack: value }))} />
          <TextInput label="Box" value={form.locationBox} onChange={(value) => setForm((current) => ({ ...current, locationBox: value }))} />
          <TextInput label="Map" value={form.locationFolder} onChange={(value) => setForm((current) => ({ ...current, locationFolder: value }))} />
          <TextInput label="Nomor Berkas" value={form.locationFileNumber} onChange={(value) => setForm((current) => ({ ...current, locationFileNumber: value }))} />
        </div>
      </div>
      <FilterSelect label="Status" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))}>
        {ARCHIVE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Tipe File"
        value={form.fileType}
        onChange={(value) => setForm((current) => ({
          ...current,
          fileType: value,
          // Jika TIFF, paksa tingkat keamanan menjadi Rahasia
          securityLevel: value === "TIFF" ? "Rahasia" : (current.securityLevel === "Rahasia" && !["TIFF", "PDF"].includes(value) ? "Terbatas" : current.securityLevel)
        }))}
      >
        {FILE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </FilterSelect>
      <TextInput label="Tahun" value={form.year} onChange={(value) => setForm((current) => ({ ...current, year: value }))} required />
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Deskripsi</span>
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          className="focus-ring min-h-28 w-full rounded-md border border-slate-200 p-3 text-sm"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Upload file</span>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.tif,.tiff"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            if (file) {
              const extension = file.name.split('.').pop().toUpperCase();
              let matchedType = "";
              if (FILE_TYPES.includes(extension)) {
                matchedType = extension;
              } else if (extension === "TIF") {
                matchedType = "TIFF";
              } else if (extension === "JPEG") {
                matchedType = "JPG";
              }
              
              setForm((current) => {
                const newFileType = matchedType || current.fileType;
                return {
                  ...current,
                  file,
                  fileType: newFileType,
                  // Jika TIFF, paksa tingkat keamanan menjadi Rahasia
                  securityLevel: newFileType === "TIFF" ? "Rahasia" : (current.securityLevel === "Rahasia" && !["TIFF", "PDF"].includes(newFileType) ? "Terbatas" : current.securityLevel)
                };
              });
            } else {
              setForm((current) => ({ ...current, file: null }));
            }
          }}
          className="focus-ring block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <div className="flex justify-end md:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <FilePlus2 size={17} />
          {submitting ? "Menyimpan..." : "Simpan Arsip"}
        </button>
      </div>
    </form>
  );
}

function TextInput({ label, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="focus-ring h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
      />
    </label>
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
      return "application/octet-stream";
  }
}
