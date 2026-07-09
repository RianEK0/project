"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn, UserRound, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(identifier, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4 py-12 overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-300/30 blur-[100px] pointer-events-none" />
      
      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft md:grid-cols-12">
        {/* Left Side: Identity & Institution branding */}
        <div className="relative flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-8 md:p-12 text-white min-h-[460px] md:min-h-[580px] md:col-span-5 overflow-hidden">
          {/* Subtle Overlay Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          
          {/* Top Header Logo */}
          <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 w-fit">
            <img
              src="/logo_depok.png"
              alt="Logo Kota Depok"
              className="h-8 w-8 object-contain"
            />
            <div className="text-left">
              <p className="text-[9px] font-bold tracking-widest text-brand-200 uppercase leading-none">Pemerintah</p>
              <p className="text-xs font-black text-white uppercase tracking-wider">Kota Depok</p>
            </div>
          </div>

          {/* Main Content (Inspektorat Logo & Text) */}
          <div className="relative z-10 my-auto flex flex-col items-center text-center py-6">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white/5 p-3 backdrop-blur-sm border border-white/20 shadow-2xl transition-transform duration-500 hover:scale-105">
              <div className="absolute inset-0.5 rounded-full bg-white p-2.5 shadow-inner">
                <img
                  src="/logo-inspektorat.jpg"
                  alt="Logo Inspektorat"
                  className="h-full w-full object-contain rounded-full"
                />
              </div>
            </div>
            
            <h1 className="mt-6 text-2xl font-black uppercase tracking-wider text-white">
              Inspektorat
            </h1>
            <div className="mt-2 h-[2px] w-12 rounded bg-brand-300" />
            <p className="mt-4 text-xs font-semibold tracking-widest text-brand-200/90 uppercase">
              SIPADI V2
            </p>
            <p className="mt-1.5 text-sm font-medium text-brand-100/80 max-w-[240px]">
              Sistem Pengarsipan & Disposisi Digital
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 text-center md:text-left border-t border-white/10 pt-4 mt-auto">
            <span className="text-[10px] font-bold tracking-widest text-brand-300/80 uppercase">
              Inspektorat Kota Depok
            </span>
          </div>
        </div>

        {/* Right Side: Form controls */}
        <form onSubmit={handleSubmit} className="flex flex-col justify-center p-8 sm:p-12 md:p-16 md:col-span-7 bg-white">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Portal Resmi
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-800">
              Selamat Datang
            </h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Silakan masuk dengan akun Anda untuk mengelola arsip dan disposisi surat secara digital.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Email atau Username
              </label>
              <div className="relative group">
                <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors duration-200" size={18} />
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400"
                  placeholder="Ketik email atau username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Password
              </label>
              <div className="relative group">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors duration-200" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full h-12 pl-11 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400"
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-shake">
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold">Gagal masuk: </span>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Masuk ke Sistem</span>
              </>
            )}
          </button>

          <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
            Hak Cipta &copy; {new Date().getFullYear()} Inspektorat Kota Depok. <br className="sm:hidden" /> Seluruh Hak Cipta Dilindungi.
          </p>
        </form>
      </section>
    </main>
  );
}

