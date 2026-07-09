"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Archive,
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Users,
  X,
  FileDown,
  Trash,
  Bell
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { apiFetch } from "../lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/archives", label: "Arsip", icon: Archive },
  { href: "/dispositions", label: "Disposisi", icon: ClipboardList },
  { href: "/organization", label: "Organisasi", icon: Network },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/penyusutan", label: "Pemeliharaan & Penyusutan", icon: FileDown },
  { href: "/pemusnahan", label: "Pemusnahan", icon: Trash },
  { href: "/peminjaman", label: "Peminjaman", icon: FileText },
  { href: "/audit-logs", label: "Audit Log", icon: ShieldCheck, roles: ["Admin", "Inspektur", "Sekretaris", "Umpeg"] },
  { href: "/users", label: "Kelola Pengguna", icon: Users, roles: ["Admin", "Inspektur", "Sekretaris", "Umpeg"] }
];

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [notiOpen, setNotiOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await apiFetch("/notifications");
      setNotifications(result.data || []);
    } catch (err) {
      console.error("Gagal memuat notifikasi", err);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // SSE real-time notifications
  useEffect(() => {
    if (!user) return;

    // Muat notifikasi awal
    fetchNotifications();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const token = typeof window !== "undefined" ? localStorage.getItem("sipadi_token") : null;
    if (!token) return;

    let es;
    let reconnectTimer;

    function connect() {
      es = new EventSource(`${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`);

      es.onmessage = (event) => {
        try {
          const notif = JSON.parse(event.data);
          // Tambah ke state hanya jika punya id (bukan heartbeat)
          if (notif.id) {
            setNotifications((prev) => {
              const exists = prev.some((n) => n.id === notif.id);
              if (exists) return prev;
              return [notif, ...prev];
            });
          }
        } catch {
          // ignore parse error
        }
      };

      es.onerror = () => {
        es.close();
        // Auto-reconnect setelah 5 detik
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (es) es.close();
    };
  }, [user, fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  async function markAllAsRead() {
    try {
      await apiFetch("/notifications/read-all", { method: "PUT" });
      setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  }

  async function markAsRead(id) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PUT" });
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  }

  const visibleNav = useMemo(() => {
    if (!user) return [];
    return navItems.filter((item) => !item.roles || item.roles.includes(user.role));
  }, [user]);

  function submitSearch(event) {
    event.preventDefault();
    const value = globalSearch.trim();
    router.push(value ? `/archives?search=${encodeURIComponent(value)}` : "/archives");
    setMobileOpen(false);
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4">
        <div className="rounded-md border border-slate-200 bg-white px-5 py-4 shadow-soft">Memuat SIPADI...</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex gap-1.5 shrink-0">
              <img
                src="/logo_depok.png"
                alt="Logo Kota Depok"
                className="h-9 w-9 rounded object-contain"
              />
              <img
                src="/logo-inspektorat.jpg"
                alt="Logo Inspektorat"
                className="h-9 w-9 rounded object-contain"
              />
            </div>
            <span>
              <span className="block text-lg font-bold text-ink">SIPADI</span>
              <span className="block text-xs text-slate-500">Inspektorat Kota Depok</span>
            </span>
          </Link>
          <button
            type="button"
            className="focus-ring rounded-md p-2 text-slate-500 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <div className="mb-3 rounded-md bg-slate-50 p-3">
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="mt-1 text-xs text-slate-500">{user.role} | {user.unitName || "Unit belum diatur"}</p>
          </div>
          <button
            type="button"
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Tutup overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="focus-ring rounded-md p-2 text-slate-600 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <form onSubmit={submitSearch} className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-ink placeholder:text-slate-400"
                placeholder="Cari nama arsip atau nomor dokumen"
              />
            </form>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotiOpen(!notiOpen)}
                className="focus-ring relative rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                aria-label="Notifikasi"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notiOpen && (
                <>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="fixed inset-0 z-40 cursor-default bg-transparent outline-none"
                    onClick={() => setNotiOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 rounded-md border border-slate-200 bg-white py-2 shadow-lg z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-2">
                      <span className="text-xs font-bold text-slate-700">Notifikasi</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-brand-600 hover:underline"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">Tidak ada notifikasi.</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.id);
                              setNotiOpen(false);
                              if (n.entity_id) {
                                router.push(`/archives?search=${encodeURIComponent(n.entity_id)}`);
                              }
                            }}
                            className={`cursor-pointer px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                              !n.is_read ? "bg-brand-50/50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                              {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-brand-600"></span>}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-600 leading-normal">{n.message}</p>
                            <span className="mt-1 block text-[10px] text-slate-400">
                              {new Date(n.created_at).toLocaleDateString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 sm:flex">
              <FileText size={17} />
              <span>{user.role}</span>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
