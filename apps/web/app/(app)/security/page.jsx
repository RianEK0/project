"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Ban, Bug, CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { useAuth } from "../../../components/AuthProvider";
import { apiFetch, buildQuery } from "../../../lib/api";
import { formatDateTime } from "../../../lib/format";
import { EmptyState } from "../../../components/EmptyState";
import { apiFetchWithPasskeyStepUp } from "../../../lib/passkeyStepUp";

const SECURITY_ROLES = new Set(["Admin", "Inspektur"]);
const severityStyle = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-slate-100 text-slate-700"
};

function StatCard({ icon: Icon, label, value, tone = "text-brand-700" }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={20} className={tone} />
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value ?? 0}</p>
    </div>
  );
}

export default function SecurityPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [egressHolds, setEgressHolds] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0 });
  const [filters, setFilters] = useState({ severity: "", status: "open" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadSecurityData = useCallback(async () => {
    if (!SECURITY_ROLES.has(user?.role)) return;
    setLoading(true);
    setError("");
    try {
      const [summaryResult, eventsResult, approvalsResult, holdsResult] = await Promise.all([
        apiFetch("/security/summary"),
        apiFetch(`/security/events${buildQuery({ ...filters, page: meta.page, limit: 15 })}`),
        apiFetch("/security/approvals?status=pending"),
        apiFetch("/security/egress-holds")
      ]);
      setSummary(summaryResult.data);
      setEvents(eventsResult.data);
      setMeta(eventsResult.meta);
      setApprovals(approvalsResult.data || []);
      setEgressHolds((holdsResult.data || []).filter((hold) => !hold.released_at && new Date(hold.blocked_until) > new Date()));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, meta.page, user?.role]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  async function updateEventStatus(id, status) {
    setUpdatingId(id);
    setError("");
    try {
      await apiFetch(`/security/events/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await loadSecurityData();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function decideApproval(approval, decision) {
    const reason = window.prompt(
      decision === "approved" ? "Masukkan alasan persetujuan:" : "Masukkan alasan penolakan:"
    );
    if (!reason || reason.trim().length < 10) {
      setError("Catatan keputusan minimal 10 karakter.");
      return;
    }
    setUpdatingId(`approval-${approval.id}`);
    setError("");
    try {
      await apiFetchWithPasskeyStepUp(`/security/approvals/${approval.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, reason: reason.trim() })
      }, "approve-critical-operation");
      await loadSecurityData();
    } catch (decisionError) {
      setError(decisionError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function releaseEgressHold(hold) {
    const reason = window.prompt("Masukkan alasan pelepasan blokir data:");
    if (!reason || reason.trim().length < 10) {
      setError("Alasan pelepasan minimal 10 karakter.");
      return;
    }
    setUpdatingId(`hold-${hold.id}`);
    setError("");
    try {
      await apiFetchWithPasskeyStepUp(`/security/egress-holds/${hold.id}/release`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() })
      }, "release-data-egress-hold");
      await loadSecurityData();
    } catch (releaseError) {
      setError(releaseError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (!SECURITY_ROLES.has(user?.role)) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <div className="flex items-center gap-3">
          <ShieldAlert size={22} />
          <div>
            <h1 className="font-semibold">Akses terbatas</h1>
            <p className="mt-1 text-sm">Pusat keamanan hanya tersedia untuk Admin dan Inspektur.</p>
          </div>
        </div>
      </div>
    );
  }

  const totals = summary?.totals || {};

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">Pertahanan anti-hack</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Pusat Keamanan</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau serangan, blokir otomatis, honeypot, dan status antivirus.</p>
        </div>
        <button
          type="button"
          onClick={loadSecurityData}
          disabled={loading}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Muat ulang
        </button>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {summary && Number(summary.controlReadiness?.passkey_ready || 0) < 2 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Dual control belum siap: minimal dua pejabat aktif (Admin/Inspektur) harus mendaftarkan passkey sebelum operasi kritis dapat disetujui.
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Activity} label="Insiden 24 jam" value={totals.last_24_hours} />
        <StatCard icon={ShieldAlert} label="Prioritas tinggi terbuka" value={totals.urgent_open} tone="text-red-600" />
        <StatCard icon={Ban} label="IP diblokir saat ini" value={summary?.activeBlocks?.length} tone="text-orange-600" />
        <StatCard icon={Ban} label="Akses data ditahan" value={totals.active_egress_holds} tone="text-red-600" />
        <StatCard
          icon={summary?.antivirus?.configured ? ShieldCheck : Bug}
          label="Antivirus upload"
          value={summary?.antivirus?.configured ? "Aktif" : summary?.antivirus?.required ? "Wajib / offline" : "Belum aktif"}
          tone={summary?.antivirus?.configured ? "text-emerald-600" : "text-amber-600"}
        />
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-ink">Approval Operasi Kritis</h2>
          <p className="mt-1 text-xs text-slate-500">Pemohon dan penyetuju wajib berbeda. Persetujuan memakai passkey dan hanya dapat digunakan satu kali.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tiket</th><th className="px-4 py-3">Operasi</th><th className="px-4 py-3">Pemohon</th><th className="px-4 py-3">Alasan</th><th className="px-4 py-3">Kedaluwarsa</th><th className="px-4 py-3">Keputusan</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvals.map((approval) => (
                <tr key={approval.id} className="align-top">
                  <td className="px-4 py-3 font-mono text-xs">#{approval.id}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{approval.action}</td>
                  <td className="px-4 py-3 text-slate-600">{approval.requester_name}<span className="block text-xs text-slate-400">{approval.requester_role}</span></td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">{approval.request_reason}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(approval.expires_at)}</td>
                  <td className="px-4 py-3">
                    {Number(approval.requested_by) === Number(user?.id) ? (
                      <span className="text-xs font-semibold text-amber-700">
                        Menunggu pejabat lain
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button type="button" disabled={updatingId === `approval-${approval.id}`} onClick={() => decideApproval(approval, "approved")} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><CheckCircle2 size={14} /> Setujui</button>
                        <button type="button" disabled={updatingId === `approval-${approval.id}`} onClick={() => decideApproval(approval, "rejected")} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50"><XCircle size={14} /> Tolak</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && approvals.length === 0 ? <EmptyState title="Tidak ada approval tertunda" description="Semua operasi kritis telah diputuskan atau belum ada permintaan baru." /> : null}
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-ink">Penahanan Eksfiltrasi Data</h2>
          <p className="mt-1 text-xs text-slate-500">Download dan ekspor berlebih ditahan otomatis. Pelepasan wajib oleh Admin lain dengan passkey.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Pengguna</th><th className="px-4 py-3">Pemicu</th><th className="px-4 py-3">Volume</th><th className="px-4 py-3">Ditahan sampai</th><th className="px-4 py-3">Tindakan</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {egressHolds.map((hold) => (
                <tr key={hold.id} className="align-top">
                  <td className="px-4 py-3 font-semibold text-ink">{hold.user_name}<span className="block text-xs font-normal text-slate-400">{hold.user_role}</span></td>
                  <td className="px-4 py-3 text-slate-600">{hold.reason}</td>
                  <td className="px-4 py-3 text-slate-600">{hold.event_count} aktivitas</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(hold.blocked_until)}</td>
                  <td className="px-4 py-3">
                    {Number(hold.user_id) !== Number(user?.id) ? (
                      <button type="button" disabled={updatingId === `hold-${hold.id}`} onClick={() => releaseEgressHold(hold)} className="rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50">Lepas blokir</button>
                    ) : <span className="text-xs text-slate-500">Perlu Admin lain</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && egressHolds.length === 0 ? <EmptyState title="Tidak ada akses data yang ditahan" description="Belum ada pola download atau ekspor yang melewati batas otomatis." /> : null}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Severity</span>
            <select
              value={filters.severity}
              onChange={(event) => {
                setFilters((current) => ({ ...current, severity: event.target.value }));
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Semua severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</span>
            <select
              value={filters.status}
              onChange={(event) => {
                setFilters((current) => ({ ...current, status: event.target.value }));
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Semua status</option>
              <option value="open">Open</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Insiden</th>
                <th className="px-4 py-3">Sumber</th>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="align-top hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(event.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{event.event_type}</p>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${severityStyle[event.severity] || severityStyle.low}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{event.ip_address}</p>
                    <p className="mt-1 text-xs text-slate-400">{event.user_name || "Tidak terautentikasi"}</p>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">
                    <p className="break-all">{event.method || "-"} {event.path || "-"}</p>
                    <p className="mt-1 break-all text-xs text-slate-400">ID: {event.request_id || "-"}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold capitalize text-slate-700">{event.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-44 gap-2">
                      {event.status === "open" ? (
                        <button
                          type="button"
                          disabled={updatingId === event.id}
                          onClick={() => updateEventStatus(event.id, "reviewed")}
                          className="focus-ring rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
                        >
                          Review
                        </button>
                      ) : null}
                      {event.status !== "resolved" ? (
                        <button
                          type="button"
                          disabled={updatingId === event.id}
                          onClick={() => updateEventStatus(event.id, "resolved")}
                          className="focus-ring rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Selesaikan
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && events.length === 0 ? <EmptyState title="Tidak ada insiden" description="Tidak ada event yang cocok dengan filter saat ini." /> : null}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">{meta.total || 0} insiden · halaman {meta.page || 1}</p>
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
              disabled={(meta.page || 1) * (meta.limit || 15) >= (meta.total || 0)}
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
