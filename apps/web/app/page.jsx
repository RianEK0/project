import Link from "next/link";
import Image from "next/image";
import { Archive, ExternalLink, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

const agency = process.env.NEXT_PUBLIC_AGENCY_NAME || "Inspektorat Kota Depok";
const policyApproved = process.env.NEXT_PUBLIC_POLICY_APPROVED === "true";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f7f6] text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Image src="/logo_depok.png" alt="Logo Kota Depok" width={44} height={44} className="h-11 w-11 object-contain" priority />
            <div><p className="text-lg font-black text-brand-800">SIPADI</p><p className="text-xs text-slate-500">{agency}</p></div>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            <LockKeyhole size={17} /> Masuk Pegawai
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-28">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100">Sistem Pemerintahan Berbasis Elektronik</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Pengelolaan arsip dan disposisi digital yang aman, tertib, dan akuntabel.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-brand-100">SIPADI mendukung proses pengarsipan internal dengan kontrol akses berbasis peran, jejak audit, autentikasi berlapis, dan perlindungan dokumen.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-brand-900 hover:bg-brand-50"><LockKeyhole size={18} /> Akses Sistem</Link>
              <Link href="/security-information" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"><ShieldCheck size={18} /> Informasi Keamanan</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-200">Ruang akses</p>
            <div className="mt-4 space-y-4">
              <Feature icon={Archive} title="Arsip terkelola" text="Klasifikasi, retensi, peminjaman, penyusutan, dan pemusnahan tercatat." />
              <Feature icon={ShieldCheck} title="Keamanan berlapis" text="MFA, passkey, pemindaian upload, dan pemantauan kejadian keamanan." />
              <Feature icon={FileCheck2} title="Dapat diaudit" text="Aktivitas penting dicatat dalam rantai audit yang dapat diverifikasi." />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {agency}. {policyApproved ? "Layanan resmi pemerintahan." : "Portal praproduksi—belum untuk layanan resmi."}</p>
          <nav className="flex flex-wrap gap-4"><Link href="/privacy" className="hover:text-brand-700">Kebijakan Privasi</Link><Link href="/terms" className="hover:text-brand-700">Ketentuan Penggunaan</Link><Link href="/security-information" className="hover:text-brand-700">Pelaporan Keamanan</Link></nav>
        </div>
      </footer>
    </main>
  );
}

function Feature({ icon: Icon, title, text }) {
  return <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-100"><Icon size={20} /></span><div><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-brand-100/80">{text}</p></div></div>;
}
