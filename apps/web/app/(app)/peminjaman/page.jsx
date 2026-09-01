"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, Clock, XCircle, BookOpen, Send, Users } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { formatDateTime } from "../../../lib/format";

function formatLoanDate(value, options = { day: "2-digit", month: "short", year: "numeric" }) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", options);
}

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function StatusBadgeLoan({ status }) {
  const styles = {
    "Menunggu Persetujuan": "bg-amber-50 text-amber-700 border-amber-200",
    Disetujui: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Ditolak: "bg-red-50 text-red-700 border-red-200",
    Dikembalikan: "bg-sky-50 text-sky-700 border-sky-200"
  };
  const icons = {
    "Menunggu Persetujuan": <Clock size={13} />,
    Disetujui: <CheckCircle2 size={13} />,
    Ditolak: <XCircle size={13} />,
    Dikembalikan: <BookOpen size={13} />
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function isLoanOverdue(loan) {
  return loan.status === "Disetujui" && loan.loan_deadline && loan.loan_deadline < getTodayKey();
}

function hasPendingExtension(loan) {
  return loan.extension_status === "Menunggu Persetujuan";
}

function LoanExtensionInfo({ loan }) {
  if (!loan.extension_id) return null;

  if (loan.extension_status === "Menunggu Persetujuan") {
    return (
      <p className="text-xs text-amber-600">
        Perpanjangan diajukan sampai {formatLoanDate(loan.extension_requested_deadline)}.
      </p>
    );
  }

  if (loan.extension_status === "Disetujui") {
    return (
      <p className="text-xs text-emerald-600">
        Perpanjangan terakhir disetujui sampai {formatLoanDate(loan.extension_requested_deadline)}.
      </p>
    );
  }

  return (
    <div className="space-y-0.5 text-xs text-red-600">
      <p>
        Perpanjangan terakhir ditolak
        {loan.extension_reviewed_by_name ? ` oleh ${loan.extension_reviewed_by_name}` : ""}.
      </p>
      {loan.extension_review_notes ? <p className="text-slate-500">{loan.extension_review_notes}</p> : null}
    </div>
  );
}

function LoanNotes({ loan }) {
  if (loan.status === "Dikembalikan") {
    return (
      <div className="space-y-1">
        <p>{loan.returned_by_name ? `Dikembalikan oleh ${loan.returned_by_name}` : "Sudah dikembalikan"}</p>
        {loan.returned_at ? <p className="text-xs text-slate-400">{formatDateTime(loan.returned_at)}</p> : null}
        {loan.return_notes ? <p className="text-xs text-slate-500">{loan.return_notes}</p> : null}
        <LoanExtensionInfo loan={loan} />
      </div>
    );
  }

  if (loan.status === "Disetujui") {
    return (
      <div className="space-y-1">
        <p>{`Disetujui oleh ${loan.approved_by_name || "-"}`}</p>
        <LoanExtensionInfo loan={loan} />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span>{loan.notes || "-"}</span>
      <LoanExtensionInfo loan={loan} />
    </div>
  );
}

export default function PeminjamanPage() {
  const [activeTab, setActiveTab] = useState("my-requests");
  const [myRequests, setMyRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [returnOpen, setReturnOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [returning, setReturning] = useState(false);

  const [extensionOpen, setExtensionOpen] = useState(false);
  const [extensionTarget, setExtensionTarget] = useState(null);
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionDeadline, setExtensionDeadline] = useState("");
  const [extending, setExtending] = useState(false);

  const [rejectExtensionOpen, setRejectExtensionOpen] = useState(false);
  const [rejectExtensionTarget, setRejectExtensionTarget] = useState(null);
  const [rejectExtensionNotes, setRejectExtensionNotes] = useState("");
  const [rejectingExtension, setRejectingExtension] = useState(false);

  const loadData = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [myRes, approvalRes] = await Promise.all([
        apiFetch("/loans/my-requests"),
        apiFetch("/loans/approvals")
      ]);
      setMyRequests(myRes.data || []);
      setApprovals(approvalRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleApprove(loan) {
    try {
      await apiFetch(`/loans/${loan.id}/approve`, { method: "POST" });
      setActionSuccess(`Permohonan dari ${loan.requester_name} untuk arsip "${loan.archive_title}" berhasil disetujui.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function openReject(loan) {
    setRejectTarget(loan);
    setRejectNotes("");
    setRejectOpen(true);
  }

  async function submitReject(event) {
    event.preventDefault();
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await apiFetch(`/loans/${rejectTarget.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes: rejectNotes })
      });
      setRejectOpen(false);
      setRejectTarget(null);
      setActionSuccess(`Permohonan dari ${rejectTarget.requester_name} berhasil ditolak.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRejecting(false);
    }
  }

  function openReturn(loan) {
    setReturnTarget(loan);
    setReturnNotes("");
    setReturnOpen(true);
  }

  async function submitReturn(event) {
    event.preventDefault();
    if (!returnTarget) return;
    setReturning(true);
    try {
      await apiFetch(`/loans/${returnTarget.id}/return`, {
        method: "POST",
        body: JSON.stringify({ notes: returnNotes })
      });
      setReturnOpen(false);
      setReturnTarget(null);
      setActionSuccess(`Arsip "${returnTarget.archive_title}" berhasil ditandai sudah dikembalikan.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setReturning(false);
    }
  }

  function openExtensionRequest(loan) {
    setExtensionTarget(loan);
    setExtensionReason("");
    setExtensionDeadline("");
    setExtensionOpen(true);
  }

  async function submitExtensionRequest(event) {
    event.preventDefault();
    if (!extensionTarget) return;
    setExtending(true);
    try {
      await apiFetch(`/loans/${extensionTarget.id}/request-extension`, {
        method: "POST",
        body: JSON.stringify({
          reason: extensionReason,
          requestedDeadline: extensionDeadline
        })
      });
      setExtensionOpen(false);
      setExtensionTarget(null);
      setActionSuccess(`Permintaan perpanjangan untuk arsip "${extensionTarget.archive_title}" berhasil dikirim.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setExtending(false);
    }
  }

  async function handleApproveExtension(loan) {
    try {
      await apiFetch(`/loans/extensions/${loan.extension_id}/approve`, { method: "POST" });
      setActionSuccess(`Perpanjangan peminjaman untuk arsip "${loan.archive_title}" berhasil disetujui.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function openRejectExtension(loan) {
    setRejectExtensionTarget(loan);
    setRejectExtensionNotes("");
    setRejectExtensionOpen(true);
  }

  async function submitRejectExtension(event) {
    event.preventDefault();
    if (!rejectExtensionTarget) return;
    setRejectingExtension(true);
    try {
      await apiFetch(`/loans/extensions/${rejectExtensionTarget.extension_id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes: rejectExtensionNotes })
      });
      setRejectExtensionOpen(false);
      setRejectExtensionTarget(null);
      setActionSuccess(`Perpanjangan peminjaman untuk arsip "${rejectExtensionTarget.archive_title}" berhasil ditolak.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRejectingExtension(false);
    }
  }

  const pendingApprovals = approvals.filter(
    (loan) => loan.status === "Menunggu Persetujuan" || (loan.status === "Disetujui" && hasPendingExtension(loan))
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-700">Peminjaman Arsip</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Peminjaman & Akses Arsip</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola permohonan akses, perpanjangan deadline, dan pengembalian arsip.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {actionSuccess ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          {actionSuccess}
        </div>
      ) : null}

      <div className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("my-requests")}
          className={`flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "my-requests"
              ? "border border-b-white border-slate-200 bg-white text-brand-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Send size={15} />
          Permohonan Saya
          {myRequests.filter((item) => item.status === "Menunggu Persetujuan").length > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {myRequests.filter((item) => item.status === "Menunggu Persetujuan").length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("approvals")}
          className={`flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "approvals"
              ? "border border-b-white border-slate-200 bg-white text-brand-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users size={15} />
          Permohonan Masuk
          {pendingApprovals.length > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {pendingApprovals.length}
            </span>
          ) : null}
        </button>
      </div>

      {activeTab === "my-requests" ? (
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Permohonan Akses yang Saya Ajukan</h2>
          </div>
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">Memuat...</div>
          ) : myRequests.length === 0 ? (
            <EmptyState
              title="Belum ada permohonan"
              description="Anda belum pernah mengajukan permohonan akses ke arsip manapun."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Arsip</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Alasan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-4 py-3">Tanggal Peminjaman</th>
                    <th className="px-4 py-3">Batas Peminjaman</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="max-w-xs px-4 py-3">
                        <p className="font-semibold text-ink">{req.archive_title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{req.archive_document_number}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{req.archive_unit_name}</td>
                      <td className="max-w-xs px-4 py-3 text-slate-600">
                        <p className="line-clamp-2">{req.reason}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadgeLoan status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <LoanNotes loan={req} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {req.loan_date ? (
                          <div className="flex items-center gap-1.5">
                            <CalendarClock size={13} className="shrink-0 text-emerald-500" />
                            <span className="text-xs font-medium">{formatLoanDate(req.loan_date)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {req.loan_deadline ? (
                          <div className={`flex items-center gap-1.5 ${isLoanOverdue(req) ? "text-red-600" : "text-slate-600"}`}>
                            <CalendarClock size={13} className="shrink-0" />
                            <span className="text-xs font-medium">
                              {formatLoanDate(req.loan_deadline)}
                              {isLoanOverdue(req) ? (
                                <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">Lewat</span>
                              ) : null}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {req.status === "Disetujui" ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openExtensionRequest(req)}
                              disabled={hasPendingExtension(req)}
                              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CalendarClock size={13} />
                              {hasPendingExtension(req) ? "Extend Pending" : "Minta Extend"}
                            </button>
                            <button
                              type="button"
                              onClick={() => openReturn(req)}
                              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                            >
                              <BookOpen size={13} />
                              Tandai Kembali
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "approvals" ? (
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Permohonan Akses Masuk</h2>
            <p className="mt-0.5 text-xs text-slate-500">Permohonan baru dan permintaan perpanjangan yang perlu Anda tinjau.</p>
          </div>
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">Memuat...</div>
          ) : approvals.length === 0 ? (
            <EmptyState
              title="Tidak ada permohonan masuk"
              description="Belum ada permohonan akses arsip yang perlu Anda tinjau."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Arsip</th>
                    <th className="px-4 py-3">Pemohon</th>
                    <th className="px-4 py-3">Alasan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-4 py-3">Tanggal Peminjaman</th>
                    <th className="px-4 py-3">Batas Peminjaman</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvals.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50">
                      <td className="max-w-xs px-4 py-3">
                        <p className="font-semibold text-ink">{loan.archive_title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{loan.archive_document_number}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{loan.requester_name}</p>
                        <p className="text-xs text-slate-400">{loan.requester_role}</p>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-slate-600">
                        <p className="line-clamp-2">{loan.reason}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadgeLoan status={loan.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <LoanNotes loan={loan} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {loan.loan_date ? (
                          <div className="flex items-center gap-1.5">
                            <CalendarClock size={13} className="shrink-0 text-emerald-500" />
                            <span className="text-xs font-medium">{formatLoanDate(loan.loan_date)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {loan.loan_deadline ? (
                          <div className={`flex items-center gap-1.5 ${isLoanOverdue(loan) ? "text-red-600" : "text-slate-600"}`}>
                            <CalendarClock size={13} className="shrink-0" />
                            <span className="text-xs font-medium">
                              {formatLoanDate(loan.loan_deadline)}
                              {isLoanOverdue(loan) ? (
                                <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">Lewat</span>
                              ) : null}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {loan.status === "Menunggu Persetujuan" ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(loan)}
                              className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 size={13} />
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => openReject(loan)}
                              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={13} />
                              Tolak
                            </button>
                          </div>
                        ) : loan.status === "Disetujui" ? (
                          <div className="flex flex-wrap gap-2">
                            {hasPendingExtension(loan) ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveExtension(loan)}
                                  className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                                >
                                  <CheckCircle2 size={13} />
                                  Setujui Extend
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRejectExtension(loan)}
                                  className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                >
                                  <XCircle size={13} />
                                  Tolak Extend
                                </button>
                              </>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => openReturn(loan)}
                              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                            >
                              <BookOpen size={13} />
                              Tandai Kembali
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      <Modal title="Tolak Permohonan Akses" open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <form onSubmit={submitReject} className="space-y-4">
          {rejectTarget ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Menolak permohonan <span className="font-semibold">{rejectTarget.requester_name}</span> untuk arsip{" "}
              <span className="font-semibold">&quot;{rejectTarget.archive_title}&quot;</span>.
            </div>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Alasan Penolakan <span className="text-slate-400">(opsional)</span>
            </span>
            <textarea
              value={rejectNotes}
              onChange={(event) => setRejectNotes(event.target.value)}
              className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Tuliskan alasan penolakan..."
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={rejecting}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              <XCircle size={15} />
              {rejecting ? "Menolak..." : "Konfirmasi Tolak"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="Tandai Arsip Sudah Dikembalikan" open={returnOpen} onClose={() => setReturnOpen(false)}>
        <form onSubmit={submitReturn} className="space-y-4">
          {returnTarget ? (
            <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
              <p className="font-semibold">{returnTarget.archive_title}</p>
              <p className="mt-1 text-xs text-sky-600">
                {returnTarget.requester_name ? `Pemohon: ${returnTarget.requester_name}` : "Permohonan Anda"}
              </p>
            </div>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Catatan Pengembalian <span className="text-slate-400">(opsional)</span>
            </span>
            <textarea
              value={returnNotes}
              onChange={(event) => setReturnNotes(event.target.value)}
              className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Tambahkan kondisi arsip atau catatan singkat pengembalian..."
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReturnOpen(false)}
              className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={returning}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              <BookOpen size={15} />
              {returning ? "Menyimpan..." : "Konfirmasi Pengembalian"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="Minta Perpanjangan Peminjaman" open={extensionOpen} onClose={() => setExtensionOpen(false)}>
        <form onSubmit={submitExtensionRequest} className="space-y-4">
          {extensionTarget ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <p className="font-semibold">{extensionTarget.archive_title}</p>
              <p className="mt-1 text-xs text-amber-600">
                Deadline saat ini: {formatLoanDate(extensionTarget.loan_deadline, { dateStyle: "long" })}
              </p>
            </div>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tanggal Perpanjangan Baru</span>
            <input
              type="date"
              value={extensionDeadline}
              onChange={(event) => setExtensionDeadline(event.target.value)}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Alasan Perpanjangan</span>
            <textarea
              value={extensionReason}
              onChange={(event) => setExtensionReason(event.target.value)}
              className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Jelaskan alasan Anda perlu tambahan waktu..."
              required
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setExtensionOpen(false)}
              className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={extending || !extensionReason.trim() || !extensionDeadline}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              <CalendarClock size={15} />
              {extending ? "Mengirim..." : "Kirim Perpanjangan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="Tolak Perpanjangan Peminjaman" open={rejectExtensionOpen} onClose={() => setRejectExtensionOpen(false)}>
        <form onSubmit={submitRejectExtension} className="space-y-4">
          {rejectExtensionTarget ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <p className="font-semibold">{rejectExtensionTarget.archive_title}</p>
              <p className="mt-1 text-xs text-amber-600">
                Permintaan hingga {formatLoanDate(rejectExtensionTarget.extension_requested_deadline, { dateStyle: "long" })}
              </p>
            </div>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Catatan Penolakan <span className="text-slate-400">(opsional)</span>
            </span>
            <textarea
              value={rejectExtensionNotes}
              onChange={(event) => setRejectExtensionNotes(event.target.value)}
              className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm"
              placeholder="Tuliskan alasan penolakan perpanjangan..."
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectExtensionOpen(false)}
              className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={rejectingExtension}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              <XCircle size={15} />
              {rejectingExtension ? "Menyimpan..." : "Konfirmasi Tolak"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
