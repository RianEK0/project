import { PublicPolicyLayout } from "../../components/PublicPolicyLayout";

export default function PrivacyPage() {
  return <PublicPolicyLayout eyebrow="Tata kelola data" title="Kebijakan Privasi SIPADI">
    <Section title="Ruang lingkup">Kebijakan ini menjelaskan pemrosesan data dalam SIPADI, termasuk data akun pegawai, unit kerja, metadata arsip, aktivitas akses, kejadian keamanan, dan data lain yang sah dimasukkan oleh instansi.</Section>
    <Section title="Tujuan dan dasar pemrosesan">Data diproses untuk pelaksanaan tugas pemerintahan, pengelolaan arsip dan disposisi, pengamanan sistem, audit, pemenuhan kewajiban hukum, dan kesinambungan layanan. Pemrosesan harus mempunyai dasar yang terdokumentasi oleh pengendali data instansi.</Section>
    <Section title="Pengumpulan minimum">SIPADI menerapkan prinsip pembatasan tujuan dan minimalisasi data. Pengguna dilarang memasukkan data pribadi atau arsip yang tidak diperlukan, tidak berwenang, atau melampaui klasifikasi aksesnya.</Section>
    <Section title="Penyimpanan dan keamanan">Data dilindungi dengan kontrol akses berbasis peran, autentikasi berlapis, enkripsi, pencatatan audit, pemantauan keamanan, backup terenkripsi, dan prosedur respons insiden. Tidak ada sistem yang dapat dijamin bebas risiko sepenuhnya.</Section>
    <Section title="Retensi dan penghapusan">Masa simpan mengikuti Jadwal Retensi Arsip, peraturan perundang-undangan, kebutuhan audit, dan kebijakan resmi instansi. Penghapusan dilakukan melalui proses berwenang dan tercatat.</Section>
    <Section title="Hak dan pertanyaan">Permintaan akses, koreksi, keberatan, atau informasi pemrosesan disampaikan melalui kanal resmi instansi. Identitas pemohon akan diverifikasi sebelum data diberikan atau diubah.</Section>
  </PublicPolicyLayout>;
}

function Section({ title, children }) { return <section><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-2">{children}</p></section>; }
