"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, BookOpen, Send, Users } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { formatDateTime } from "../../../lib/format";

function StatusBadgeLoan({ status }) {
  const styles = {
    "Menunggu Persetujuan": "bg-amber-50 text-amber-700 border-amber-200",
    "Disetujui": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Ditolak": "bg-red-50 text-red-700 border-red-200"
  };
  const icons = {
    "Menunggu Persetujuan": <Clock size={13} />,
    "Disetujui": <CheckCircle2 size={13} />,
    "Ditolak": <XCircle size={13} />
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {icons[status]}
      {status}
    </span>
  );
}

export default function PeminjamanPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-requests");
  const [myRequests, setMyRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [actionSuccess, setActionSuccess] = useState("");

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

  async function openReject(loan) {
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

  const pendingApprovals = approvals.filter(a => a.status === "Menunggu Persetujuan");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-700">Peminjaman Arsip</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Peminjaman & Akses Arsip</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola permohonan akses ke arsip yang memerlukan izin dari unit lain.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          {actionSuccess}
        </div>
      )}

      {/* Tabs */}
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
          {myRequests.filter(r => r.status === "Menunggu Persetujuan").length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {myRequests.filter(r => r.status === "Menunggu Persetujuan").length}
            </span>
          )}
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
          {pendingApprovals.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {pendingApprovals.length}
            </span>
          )}
        </button>
      </div>

      {/* My Requests Tab */}
      {activeTab === "my-requests" && (
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
                    <th className="px-4 py-3">Tanggal</th>
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
                        {req.notes || (req.status === "Disetujui" ? `Disetujui oleh ${req.approved_by_name || "-"}` : "-")}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatDateTime(req.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Permohonan Akses Masuk</h2>
            <p className="mt-0.5 text-xs text-slate-500">Permohonan dari pengguna lain untuk mengakses arsip di unit Anda.</p>
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
                    <th className="px-4 py-3">Tanggal</th>
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
                      <td className="px-4 py-3 text-slate-400">{formatDateTime(loan.updated_at)}</td>
                      <td className="px-4 py-3">
                        {loan.status === "Menunggu Persetujuan" ? (
                          <div className="flex gap-2">
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
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Reject Modal */}
      <Modal title="Tolak Permohonan Akses" open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <form onSubmit={submitReject} className="space-y-4">
          {rejectTarget && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Menolak permohonan <span className="font-semibold">{rejectTarget.requester_name}</span> untuk arsip&nbsp;
              <span className="font-semibold">"{rejectTarget.archive_title}"</span>.
            </div>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Alasan Penolakan <span className="text-slate-400">(opsional)</span>
            </span>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
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
    </div>
  );
}
