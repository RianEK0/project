import { PublicPolicyLayout } from "../../components/PublicPolicyLayout";

export default function TermsPage() {
  return <PublicPolicyLayout eyebrow="Ketentuan layanan" title="Ketentuan Penggunaan SIPADI">
    <Section title="Pengguna berwenang">Akses internal hanya untuk pegawai atau pihak yang memperoleh penugasan resmi. Akun bersifat personal dan tidak boleh dipinjamkan.</Section>
    <Section title="Penggunaan yang diperbolehkan">Sistem digunakan hanya untuk tugas kedinasan sesuai role, unit, klasifikasi informasi, dan kewenangan pengguna.</Section>
    <Section title="Larangan">Dilarang mencoba melewati kontrol akses, memindai tanpa izin, mengunggah malware, membagikan kredensial/recovery code, menyalin data tanpa dasar, atau mengganggu ketersediaan layanan.</Section>
    <Section title="Pemantauan dan audit">Aktivitas dapat dicatat dan dipantau untuk keamanan, audit, penyelesaian insiden, serta kepatuhan. Penyalahgunaan dapat menyebabkan pencabutan akses dan tindak lanjut sesuai ketentuan.</Section>
    <Section title="Pelaporan insiden">Kehilangan perangkat, dugaan phishing, akses tidak sah, salah kirim, atau kebocoran data harus segera dilaporkan melalui kanal resmi keamanan instansi.</Section>
  </PublicPolicyLayout>;
}

function Section({ title, children }) { return <section><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-2">{children}</p></section>; }
