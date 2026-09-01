"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock3, FileText, FolderClock, Inbox } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { EmptyState } from "../../../components/EmptyState";
import { formatDateTime } from "../../../lib/format";

const loanTypes = new Set([
  "request_loan",
  "loan_approved",
  "loan_rejected",
  "loan_returned",
  "loan_extension_requested",
  "loan_extension_approved",
  "loan_extension_rejected",
  "loan_due_h3",
  "loan_due_h1",
  "loan_overdue"
]);

const retentionTypes = new Set([
  "retensi_habis",
  "siap_susut",
  "siap_musnah",
  "retensi_inaktif_habis",
  "menunggu_persetujuan_penyusutan",
  "penyusutan_menunggu_persetujuan_akhir",
  "penyusutan_selesai",
  "menunggu_verifikasi_pemusnahan"
]);

function getNotificationHref(notification) {
  if (notification.type === "disposition_created") {
    return "/dispositions";
  }

  if (loanTypes.has(notification.type)) {
    return "/peminjaman";
  }

  if (retentionTypes.has(notification.type) && notification.entity_id) {
    return `/archives?search=${encodeURIComponent(notification.entity_id)}`;
  }

  return "/dashboard";
}

function getFilterMatches(filter, notification) {
  if (filter === "unread") return !notification.is_read;
  if (filter === "loan") return loanTypes.has(notification.type);
  if (filter === "retention") return retentionTypes.has(notification.type);
  if (filter === "disposition") return notification.type === "disposition_created";
  return true;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch("/notifications");
      setNotifications(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => getFilterMatches(filter, item));
  }, [filter, notifications]);

  const counts = useMemo(() => ({
    unread: notifications.filter((item) => !item.is_read).length,
    loan: notifications.filter((item) => loanTypes.has(item.type)).length,
    retention: notifications.filter((item) => retentionTypes.has(item.type)).length,
    disposition: notifications.filter((item) => item.type === "disposition_created").length
  }), [notifications]);

  async function markAsRead(notificationId) {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: "PUT" });
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function markAllAsRead() {
    try {
      await apiFetch("/notifications/read-all", { method: "PUT" });
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      setError(err.message);
    }
  }

  async function openNotification(notification) {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    router.push(getNotificationHref(notification));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-700">Notifikasi</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Inbox Notifikasi</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau reminder peminjaman, retensi arsip, dan disposisi dari satu halaman.</p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <CheckCheck size={16} />
          Tandai Semua Dibaca
        </button>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} icon={Inbox} label={`Semua (${notifications.length})`} />
          <FilterButton active={filter === "unread"} onClick={() => setFilter("unread")} icon={Clock3} label={`Belum Dibaca (${counts.unread})`} />
          <FilterButton active={filter === "loan"} onClick={() => setFilter("loan")} icon={FileText} label={`Peminjaman (${counts.loan})`} />
          <FilterButton active={filter === "retention"} onClick={() => setFilter("retention")} icon={FolderClock} label={`Retensi (${counts.retention})`} />
          <FilterButton active={filter === "disposition"} onClick={() => setFilter("disposition")} icon={Bell} label={`Disposisi (${counts.disposition})`} />
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-ink">Daftar Notifikasi</h2>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">Memuat...</div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title="Tidak ada notifikasi"
            description="Belum ada item yang cocok dengan filter yang dipilih."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between ${
                  !notification.is_read ? "bg-brand-50/40" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.is_read ? "bg-slate-300" : "bg-brand-600"}`} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{notification.title}</p>
                        {!notification.is_read ? (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">Baru</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                      <p className="mt-2 text-xs text-slate-400">{formatDateTime(notification.created_at)}</p>
                    </div>
                  </div>
                </button>
                {!notification.is_read ? (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="focus-ring shrink-0 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Tandai Dibaca
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
