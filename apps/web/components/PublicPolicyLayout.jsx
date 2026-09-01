import Link from "next/link";

export function PublicPolicyLayout({ eyebrow, title, updated = "15 Agustus 2026", children }) {
  const agency = process.env.NEXT_PUBLIC_AGENCY_NAME || "Inspektorat Kota Depok";
  const approved = process.env.NEXT_PUBLIC_POLICY_APPROVED === "true";
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4"><Link href="/" className="font-black text-brand-800">SIPADI</Link><Link href="/login" className="text-sm font-semibold text-brand-700">Masuk Pegawai</Link></div></header>
      <article className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{agency} · Diperbarui {updated}</p>
        {!approved ? <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"><strong>Draf tata kelola:</strong> wajib ditinjau dan disahkan Bagian Hukum, penanggung jawab SPBE, serta pejabat pelindungan data sebelum go-live.</div> : null}
        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-7">{children}</div>
      </article>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto max-w-4xl px-5 py-6 text-xs text-slate-500"><Link href="/" className="font-semibold text-brand-700">Kembali ke portal SIPADI</Link></div></footer>
    </main>
  );
}
