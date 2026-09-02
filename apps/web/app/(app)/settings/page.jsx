"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Copy, Download, Fingerprint, KeyRound, MonitorSmartphone, RefreshCw, Save, ShieldCheck, ShieldOff, Trash2, UserRound } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { apiFetch } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";

const STEP_UP_LABELS = {
  "backup-export": "Ekspor backup",
  "backup-restore": "Restore backup",
  "confidential-archive-access": "Akses arsip Rahasia",
  "privileged-user-management": "Pengelolaan akun istimewa",
  "reset-mfa": "Reset MFA",
  "unlock-account": "Buka kunci akun"
};

export default function SettingsPage() {
  const { user, updateUser, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [mfaStatus, setMfaStatus] = useState(null);
  const [mfaSetup, setMfaSetup] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [mfaForm, setMfaForm] = useState({ currentPassword: "", code: "" });
  const [mfaAction, setMfaAction] = useState("");
  const [passkeys, setPasskeys] = useState([]);
  const [passkeyForm, setPasskeyForm] = useState({ name: "Perangkat utama", currentPassword: "" });
  const [passkeyAction, setPasskeyAction] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionPolicy, setSessionPolicy] = useState(null);
  const [sessionPassword, setSessionPassword] = useState("");
  const [sessionAction, setSessionAction] = useState("");

  const loadMfaStatus = useCallback(async () => {
    try {
      const result = await apiFetch("/auth/mfa/status");
      setMfaStatus(result.data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadPasskeys = useCallback(async () => {
    try {
      const result = await apiFetch("/auth/passkeys");
      setPasskeys(result.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const result = await apiFetch("/auth/sessions");
      setSessions(result.data || []);
      setSessionPolicy(result.policy || null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadMfaStatus();
    loadPasskeys();
    loadSessions();
  }, [loadMfaStatus, loadPasskeys, loadSessions]);

  async function revokeOtherSessions(event) {
    event.preventDefault();
    setSessionAction("all");
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch("/auth/sessions/revoke-others", {
        method: "POST",
        body: JSON.stringify({ currentPassword: sessionPassword })
      });
      setSessionPassword("");
      await loadSessions();
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSessionAction("");
    }
  }

  async function revokeSession(session) {
    if (!sessionPassword) {
      setError("Masukkan password saat ini sebelum mencabut sesi perangkat.");
      return;
    }
    if (!window.confirm("Cabut akses sesi perangkat ini?")) return;
    setSessionAction(`session-${session.id}`);
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch(`/auth/sessions/${session.id}`, {
        method: "DELETE",
        body: JSON.stringify({ currentPassword: sessionPassword })
      });
      setSessionPassword("");
      await loadSessions();
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSessionAction("");
    }
  }

  async function registerPasskey(event) {
    event.preventDefault();
    setPasskeyAction("register");
    setError("");
    setSuccess("");
    try {
      const optionsResult = await apiFetch("/auth/passkeys/registration/options", {
        method: "POST",
        body: JSON.stringify({ currentPassword: passkeyForm.currentPassword })
      });
      const attestation = await startRegistration({ optionsJSON: optionsResult.data.options });
      const result = await apiFetch("/auth/passkeys/registration/verify", {
        method: "POST",
        body: JSON.stringify({
          ceremonyToken: optionsResult.data.ceremonyToken,
          name: passkeyForm.name,
          response: attestation
        })
      });
      updateUser(result.user);
      setPasskeyForm({ name: "Perangkat utama", currentPassword: "" });
      await Promise.all([loadPasskeys(), loadMfaStatus(), loadSessions()]);
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setPasskeyAction("");
    }
  }

  async function removePasskey(item) {
    if (!passkeyForm.currentPassword) {
      setError("Masukkan password saat ini sebelum menghapus passkey.");
      return;
    }
    if (!window.confirm(`Hapus passkey "${item.name}"?`)) return;
    setPasskeyAction(`remove-${item.id}`);
    setError("");
    try {
      const result = await apiFetch(`/auth/passkeys/${item.id}`, {
        method: "DELETE",
        body: JSON.stringify({ currentPassword: passkeyForm.currentPassword })
      });
      updateUser(result.user);
      setPasskeyForm((current) => ({ ...current, currentPassword: "" }));
      await Promise.all([loadPasskeys(), loadMfaStatus(), loadSessions()]);
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setPasskeyAction("");
    }
  }

  async function beginMfaSetup(event) {
    event.preventDefault();
    setMfaAction("setup");
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch("/auth/mfa/setup", {
        method: "POST",
        body: JSON.stringify({ currentPassword: mfaForm.currentPassword })
      });
      setMfaSetup(result.data);
      setSuccess("Scan QR lalu masukkan kode authenticator untuk menyelesaikan aktivasi.");
    } catch (err) {
      setError(err.message);
    } finally {
      setMfaAction("");
    }
  }

  async function enableMfa(event) {
    event.preventDefault();
    setMfaAction("enable");
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch("/auth/mfa/enable", {
        method: "POST",
        body: JSON.stringify({ code: mfaForm.code })
      });
      updateUser(result.user);
      setRecoveryCodes(result.recoveryCodes || []);
      setMfaSetup(null);
      setMfaForm({ currentPassword: "", code: "" });
      await Promise.all([loadMfaStatus(), loadSessions()]);
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setMfaAction("");
    }
  }

  async function regenerateRecoveryCodes(event) {
    event.preventDefault();
    setMfaAction("regenerate");
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch("/auth/mfa/recovery-codes/regenerate", {
        method: "POST",
        body: JSON.stringify(mfaForm)
      });
      setRecoveryCodes(result.recoveryCodes || []);
      setMfaForm({ currentPassword: "", code: "" });
      await Promise.all([loadMfaStatus(), loadSessions()]);
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setMfaAction("");
    }
  }

  async function disableMfa(event) {
    event.preventDefault();
    setMfaAction("disable");
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch("/auth/mfa/disable", {
        method: "POST",
        body: JSON.stringify(mfaForm)
      });
      updateUser(result.user);
      setRecoveryCodes([]);
      setMfaForm({ currentPassword: "", code: "" });
      await Promise.all([loadMfaStatus(), loadSessions()]);
      setSuccess(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setMfaAction("");
    }
  }

  function recoveryText() {
    return ["SIPADI - Recovery Code MFA", "Simpan di lokasi offline yang aman.", "", ...recoveryCodes].join("\n");
  }

  function downloadRecoveryCodes() {
    const url = URL.createObjectURL(new Blob([recoveryText()], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "sipadi-mfa-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function submitProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm)
      });
      updateUser(result.user);
      setSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Konfirmasi password baru tidak sama.");
      return;
    }

    setSavingPassword(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      await Promise.all([refreshUser(), loadSessions()]);
      setSuccess("Password berhasil diperbarui.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-700">Akun</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-slate-500">Perbarui profil, password, dan perlindungan MFA akun SIPADI Anda.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      {user?.passwordChangeRequired ? <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"><strong>Password awal wajib diganti.</strong> Fitur lain tetap dikunci sampai Anda membuat password pribadi yang baru.</div> : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <UserRound size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">Profil Saya</h2>
              <p className="text-xs text-slate-500">Nama tampilan, username, dan email login.</p>
            </div>
          </div>
          <form onSubmit={submitProfile} className="space-y-4">
            <Input label="Nama" value={profileForm.name} onChange={(value) => setProfileForm((current) => ({ ...current, name: value }))} />
            <Input label="Username" value={profileForm.username} onChange={(value) => setProfileForm((current) => ({ ...current, username: value }))} />
            <Input label="Email" type="email" value={profileForm.email} onChange={(value) => setProfileForm((current) => ({ ...current, email: value }))} />
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-700">{user?.role}</span>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              <Save size={16} />
              {savingProfile ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <KeyRound size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">Ubah Password</h2>
              <p className="text-xs text-slate-500">Gunakan password baru yang berbeda dari sebelumnya.</p>
            </div>
          </div>
          <form onSubmit={submitPassword} className="space-y-4">
            <Input
              label="Password Saat Ini"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
            />
            <Input
              label="Password Baru"
              type="password"
              minLength={12}
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
            />
            <Input
              label="Konfirmasi Password Baru"
              type="password"
              minLength={12}
              value={passwordForm.confirmPassword}
              onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
            />
            <button
              type="submit"
              disabled={savingPassword}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              {savingPassword ? "Memperbarui..." : "Perbarui Password"}
            </button>
          </form>
        </section>
      </div>

      <section className={`rounded-md border bg-white p-5 shadow-sm ${user?.mfaSetupRequired ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-md ${mfaStatus?.enabled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">Autentikasi Dua Faktor (MFA)</h2>
              <p className="text-xs text-slate-500">Gunakan aplikasi authenticator yang mendukung TOTP.</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mfaStatus?.enabled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {mfaStatus?.enabled ? "Aktif" : mfaStatus?.required ? "Wajib diaktifkan" : "Belum aktif"}
          </span>
        </div>

        {user?.mfaSetupRequired ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Role Anda wajib menggunakan MFA. Fitur lain dikunci sampai aktivasi selesai.
          </div>
        ) : null}

        {!mfaStatus?.totpEnabled && !mfaSetup ? (
          <form onSubmit={beginMfaSetup} className="mt-5 max-w-md space-y-4">
            <Input label="Konfirmasi Password Saat Ini" type="password" value={mfaForm.currentPassword} onChange={(value) => setMfaForm((current) => ({ ...current, currentPassword: value }))} />
            <button type="submit" disabled={Boolean(mfaAction)} className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              <ShieldCheck size={16} />
              {mfaAction === "setup" ? "Menyiapkan..." : "Mulai Aktivasi MFA"}
            </button>
          </form>
        ) : null}

        {mfaSetup ? (
          <form onSubmit={enableMfa} className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
            <div className="rounded-md border border-slate-200 bg-white p-2">
              <Image src={mfaSetup.qrCodeDataUrl} alt="QR code aktivasi MFA SIPADI" width={240} height={240} unoptimized className="mx-auto h-60 w-60" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">1. Scan QR dengan aplikasi authenticator.</p>
                <p className="mt-2 text-xs text-slate-500">Kunci manual (jangan dibagikan):</p>
                <code className="mt-1 block break-all rounded bg-slate-100 px-3 py-2 text-xs text-slate-700">{mfaSetup.manualKey}</code>
              </div>
              <Input label="2. Kode 6 Digit" value={mfaForm.code} onChange={(value) => setMfaForm((current) => ({ ...current, code: value }))} />
              <button type="submit" disabled={Boolean(mfaAction)} className="focus-ring inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                <ShieldCheck size={16} />
                {mfaAction === "enable" ? "Memverifikasi..." : "Aktifkan MFA"}
              </button>
            </div>
          </form>
        ) : null}

        {mfaStatus?.totpEnabled ? (
          <form onSubmit={regenerateRecoveryCodes} className="mt-5 max-w-xl space-y-4">
            <p className="text-sm text-slate-600">
              Recovery code tersisa: <strong>{mfaStatus.recoveryCodesRemaining}</strong>. Membuat kode baru akan membatalkan seluruh kode lama.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Password Saat Ini" type="password" value={mfaForm.currentPassword} onChange={(value) => setMfaForm((current) => ({ ...current, currentPassword: value }))} />
              <Input label="Kode Authenticator / Recovery" value={mfaForm.code} onChange={(value) => setMfaForm((current) => ({ ...current, code: value }))} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={Boolean(mfaAction)} className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                <RefreshCw size={16} /> {mfaAction === "regenerate" ? "Membuat..." : "Buat Recovery Code Baru"}
              </button>
              {!mfaStatus.required ? (
                <button type="button" onClick={disableMfa} disabled={Boolean(mfaAction)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                  <ShieldOff size={16} /> {mfaAction === "disable" ? "Menonaktifkan..." : "Nonaktifkan MFA"}
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        {recoveryCodes.length ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-800">Simpan sekarang — kode ini hanya ditampilkan satu kali.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {recoveryCodes.map((code) => <code key={code} className="rounded bg-white px-3 py-2 text-center text-sm font-semibold tracking-wide text-slate-800">{code}</code>)}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => navigator.clipboard.writeText(recoveryText())} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Copy size={14} /> Salin</button>
              <button type="button" onClick={downloadRecoveryCodes} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Download size={14} /> Unduh</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className={`rounded-md border bg-white p-5 shadow-sm ${user?.passkeySetupRequired ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700"><Fingerprint size={21} /></span>
            <div>
              <h2 className="text-base font-semibold text-ink">Passkey / Security Key</h2>
              <p className="text-xs text-slate-500">Autentikasi WebAuthn yang tahan phishing menggunakan biometrik, PIN perangkat, atau security key.</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${passkeys.length ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {passkeys.length ? `${passkeys.length} passkey aktif` : mfaStatus?.passkeyRequired ? "Wajib didaftarkan" : "Belum aktif"}
          </span>
        </div>

        {user?.passkeySetupRequired ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Role Anda wajib memiliki passkey. Fitur lain tetap dikunci sampai pendaftaran selesai.
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <form onSubmit={registerPasskey} className="space-y-4 rounded-md border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Daftarkan perangkat baru</h3>
            <Input label="Nama Perangkat" value={passkeyForm.name} onChange={(value) => setPasskeyForm((current) => ({ ...current, name: value }))} />
            <Input label="Password Saat Ini" type="password" value={passkeyForm.currentPassword} onChange={(value) => setPasskeyForm((current) => ({ ...current, currentPassword: value }))} />
            <button type="submit" disabled={Boolean(passkeyAction)} className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              <Fingerprint size={16} /> {passkeyAction === "register" ? "Menghubungkan..." : "Daftarkan Passkey"}
            </button>
            <p className="text-xs text-slate-500">Gunakan HTTPS dan domain produksi yang sama. Browser akan meminta biometrik, PIN, atau security key.</p>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Perangkat terdaftar</h3>
            {passkeys.length ? passkeys.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.device_type || "Authenticator"} · {item.backed_up ? "tersinkronisasi" : "perangkat tunggal"}</p>
                  <p className="mt-1 text-xs text-slate-400">Terakhir dipakai: {item.last_used_at ? new Date(item.last_used_at).toLocaleString("id-ID") : "belum pernah"}</p>
                </div>
                <button type="button" onClick={() => removePasskey(item)} disabled={Boolean(passkeyAction)} className="rounded-md border border-red-200 p-2 text-red-700 hover:bg-red-50 disabled:opacity-50" aria-label={`Hapus ${item.name}`} title="Hapus passkey">
                  <Trash2 size={16} />
                </button>
              </div>
            )) : (
              <div className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">Belum ada passkey terdaftar.</div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700"><MonitorSmartphone size={21} /></span>
          <div>
            <h2 className="text-base font-semibold text-ink">Sesi dan Perangkat Aktif</h2>
            <p className="text-xs text-slate-500">Sesi dicatat server-side dan dapat dicabut walaupun cookie/JWT telah tersalin.</p>
            {sessionPolicy ? <p className="mt-1 text-xs text-slate-400">Maksimum {sessionPolicy.maximumActiveSessions} sesi · idle {sessionPolicy.idleTimeoutMinutes} menit · batas absolut {sessionPolicy.absoluteTimeoutHours} jam</p> : null}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-md border border-slate-200 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{session.is_current ? "Perangkat ini" : "Sesi lain"}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${session.is_current ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{(session.auth_methods || []).join(" + ") || "password"}</span>
              </div>
              <p className="mt-1 break-all text-xs text-slate-500">{session.user_agent || "Perangkat tidak dikenal"}</p>
              <p className="mt-1 text-xs text-slate-400">IP {session.ip_address || "-"} · aktif {new Date(session.last_seen_at).toLocaleString("id-ID")}</p>
              {session.step_up_action && session.step_up_at ? (
                <p className="mt-1 text-xs font-medium text-brand-700">
                  Step-up: {STEP_UP_LABELS[session.step_up_action] || session.step_up_action} · {new Date(session.step_up_at).toLocaleString("id-ID")}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-slate-400">Dibuat {new Date(session.created_at).toLocaleString("id-ID")} · idle berakhir {new Date(session.idle_expires_at).toLocaleString("id-ID")} · batas akhir {new Date(session.expires_at).toLocaleString("id-ID")}</p>
              {!session.is_current ? (
                <button
                  type="button"
                  onClick={() => revokeSession(session)}
                  disabled={Boolean(sessionAction)}
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {sessionAction === `session-${session.id}` ? "Mencabut..." : "Cabut Sesi Ini"}
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {sessions.filter((session) => !session.is_current).length ? (
          <form onSubmit={revokeOtherSessions} className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1"><Input label="Password untuk Cabut Sesi Lain" type="password" value={sessionPassword} onChange={setSessionPassword} /></div>
            <button type="submit" disabled={Boolean(sessionAction)} className="focus-ring h-10 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
              {sessionAction === "all" ? "Mencabut..." : "Cabut Semua Sesi Lain"}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, minLength }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
        required
      />
    </label>
  );
}
