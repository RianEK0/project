import { PublicPolicyLayout } from "../../components/PublicPolicyLayout";

export default function SecurityInformationPage() {
  const contact = process.env.NEXT_PUBLIC_SECURITY_CONTACT || "kanal resmi CSIRT/Diskominfo instansi";
  return <PublicPolicyLayout eyebrow="Keamanan siber" title="Pelaporan Kerentanan dan Insiden">
    <section><h2 className="text-lg font-bold text-slate-900">Kanal pelaporan</h2><p className="mt-2">Laporkan secara privat melalui <strong>{contact}</strong>. Sertakan URL/versi terdampak, dampak, langkah reproduksi aman, waktu kejadian, dan bukti yang sudah disanitasi.</p></section>
    <section><h2 className="text-lg font-bold text-slate-900">Jangan dikirim</h2><p className="mt-2">Jangan mengirim password, token, recovery code, kunci enkripsi, data pribadi, atau dokumen arsip asli. Jangan mempublikasikan detail kerentanan sebelum mitigasi dan koordinasi selesai.</p></section>
    <section><h2 className="text-lg font-bold text-slate-900">Batas pengujian</h2><p className="mt-2">Pengujian tanpa izin tertulis, denial-of-service, persistence, social engineering, perubahan/penghapusan data, dan pengambilan data nyata tidak diperbolehkan.</p></section>
    <section><h2 className="text-lg font-bold text-slate-900">Respons</h2><p className="mt-2">Laporan akan ditriase berdasarkan dampak dan bukti. Pelapor dapat diminta menggunakan kanal terenkripsi untuk koordinasi lanjutan.</p></section>
  </PublicPolicyLayout>;
}
