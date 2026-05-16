import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogOut,
  Menu,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import seedData from '../data/dummy-data.json'

const fileUrlModules = import.meta.glob('../dummy_files/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const rawFileModules = {
  ...import.meta.glob('../dummy_files/*.csv', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
  ...import.meta.glob('../dummy_files/*.txt', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
}

const fileNameFromPath = (path) => path.split('/').pop()

const fileUrls = Object.fromEntries(
  Object.entries(fileUrlModules).map(([path, value]) => [fileNameFromPath(path), value]),
)

const rawFiles = Object.fromEntries(
  Object.entries(rawFileModules).map(([path, value]) => [fileNameFromPath(path), value]),
)

const archiveFiles = Object.keys(fileUrls).sort((a, b) => a.localeCompare(b))

const monthOrder = {
  januari: 1,
  februari: 2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12,
}

const moduleDefs = {
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Ringkasan pengawasan, dokumen, agenda, dan notifikasi aktif.',
    icon: LayoutDashboard,
  },
  pegawai: {
    id: 'pegawai',
    title: 'Pegawai',
    subtitle: 'Data aparatur, jabatan, unit, status, dan peran pengguna.',
    icon: Users,
    columns: ['id', 'nama', 'jabatan', 'unit', 'status', 'email', 'role'],
    idPrefix: 'PG',
  },
  unitKerja: {
    id: 'unitKerja',
    title: 'Unit Kerja',
    subtitle: 'Struktur organisasi Inspektorat Kota Depok.',
    icon: Building2,
    columns: ['id', 'nama', 'kategori', 'status', 'tahun'],
    idPrefix: 'UK',
  },
  users: {
    id: 'users',
    title: 'User',
    subtitle: 'Akun dummy dan pemetaan role based access.',
    icon: UserCog,
    columns: ['id', 'username', 'password', 'nama', 'role', 'status'],
    idPrefix: 'USR',
  },
  programKerja: {
    id: 'programKerja',
    title: 'Program Kerja',
    subtitle: 'Rencana kegiatan pengawasan per wilayah dan bulan.',
    icon: ClipboardList,
    columns: ['id', 'nama', 'wilayah', 'bulan', 'tahun', 'status', 'anggaran'],
    idPrefix: 'PK',
  },
  jadwalPemeriksaan: {
    id: 'jadwalPemeriksaan',
    title: 'Jadwal Pemeriksaan',
    subtitle: 'Agenda pemeriksaan dan penugasan tim lapangan.',
    icon: CalendarDays,
    columns: ['id', 'tanggal', 'waktu', 'kegiatan', 'tim', 'lokasi', 'status'],
    idPrefix: 'JD',
  },
  suratTugas: {
    id: 'suratTugas',
    title: 'Surat Tugas',
    subtitle: 'Penerbitan, review, approval, dan download surat tugas.',
    icon: ClipboardCheck,
    columns: ['id', 'kegiatan', 'tim', 'tanggal', 'status', 'file'],
    idPrefix: 'ST',
    fileField: 'file',
    approvable: true,
  },
  temuan: {
    id: 'temuan',
    title: 'Temuan',
    subtitle: 'Daftar temuan pemeriksaan, risiko, rekomendasi, dan status tindak lanjut.',
    icon: ListChecks,
    columns: ['id', 'judul', 'opd', 'risiko', 'status', 'rekomendasi'],
    idPrefix: 'TM',
    approvable: true,
  },
  tindakLanjut: {
    id: 'tindakLanjut',
    title: 'Tindak Lanjut',
    subtitle: 'Pemantauan bukti, PIC, deadline, dan penyelesaian tindak lanjut.',
    icon: CheckCircle2,
    columns: ['id', 'temuanId', 'opd', 'pic', 'deadline', 'status', 'bukti'],
    idPrefix: 'TL',
    fileField: 'bukti',
    approvable: true,
  },
  laporan: {
    id: 'laporan',
    title: 'Laporan Pemeriksaan',
    subtitle: 'Draft, review, finalisasi, dan download LHP.',
    icon: FileText,
    columns: ['id', 'judul', 'status', 'tanggal', 'file'],
    idPrefix: 'LHP',
    fileField: 'file',
    approvable: true,
  },
  suratMasuk: {
    id: 'suratMasuk',
    title: 'Surat Masuk',
    subtitle: 'Monitoring surat masuk, pengirim, status proses, dan arsip file.',
    icon: FileArchive,
    columns: ['id', 'perihal', 'pengirim', 'tanggal', 'status', 'file'],
    idPrefix: 'SM',
    fileField: 'file',
  },
  suratKeluar: {
    id: 'suratKeluar',
    title: 'Surat Keluar',
    subtitle: 'Surat keluar, status pengiriman, dan dokumen terlampir.',
    icon: Send,
    columns: ['id', 'perihal', 'tanggal', 'status', 'file'],
    idPrefix: 'SK',
    fileField: 'file',
  },
  dokumen: {
    id: 'dokumen',
    title: 'Arsip Dokumen',
    subtitle: 'File dummy, preview metadata, upload simulasi, dan download dokumen.',
    icon: FolderOpen,
    columns: ['id', 'nama', 'kategori', 'status', 'diunggahOleh', 'waktu', 'ukuran'],
    idPrefix: 'DOC',
    fileField: 'nama',
    approvable: true,
  },
  notifikasi: {
    id: 'notifikasi',
    title: 'Notifikasi',
    subtitle: 'Peringatan sistem dan tautan cepat ke target data.',
    icon: Bell,
    columns: ['id', 'tipe', 'pesan', 'target', 'status'],
    idPrefix: 'NTF',
  },
  logAktivitas: {
    id: 'logAktivitas',
    title: 'Log Aktivitas',
    subtitle: 'Riwayat perubahan, approval, download, dan upload dummy.',
    icon: Activity,
    columns: ['id', 'waktu', 'user', 'aktivitas', 'status'],
    idPrefix: 'LOG',
  },
  pengaturan: {
    id: 'pengaturan',
    title: 'Pengaturan',
    subtitle: 'Profil aplikasi, role access, dan preferensi tampilan dummy.',
    icon: Settings,
  },
}

const navSections = [
  { label: 'Dashboard', icon: LayoutDashboard, pages: ['dashboard'] },
  { label: 'Data Organisasi', icon: Building2, pages: ['pegawai', 'unitKerja', 'users'] },
  {
    label: 'Pengawasan',
    icon: ClipboardList,
    pages: ['programKerja', 'jadwalPemeriksaan', 'suratTugas', 'temuan', 'tindakLanjut'],
  },
  {
    label: 'Dokumen & Laporan',
    icon: FileArchive,
    pages: ['laporan', 'suratMasuk', 'suratKeluar', 'dokumen', 'notifikasi', 'logAktivitas'],
  },
  { label: 'Pengaturan', icon: Settings, pages: ['pengaturan'] },
]

const rolePages = {
  Admin: Object.keys(moduleDefs),
  Inspektur: [
    'dashboard',
    'jadwalPemeriksaan',
    'suratTugas',
    'laporan',
    'suratMasuk',
    'suratKeluar',
    'dokumen',
    'notifikasi',
    'logAktivitas',
    'pengaturan',
  ],
  Auditor: ['dashboard', 'temuan', 'tindakLanjut', 'dokumen', 'notifikasi', 'pengaturan'],
}

const dashboardCards = [
  {
    key: 'totalKegiatan',
    label: 'Total Kegiatan',
    page: 'programKerja',
    icon: ClipboardList,
    tone: 'navy',
    hint: 'Program pengawasan',
  },
  {
    key: 'temuanAktif',
    label: 'Temuan Aktif',
    page: 'temuan',
    status: 'Belum Ditindaklanjuti',
    icon: ListChecks,
    tone: 'rose',
    hint: 'Butuh tindak lanjut',
  },
  {
    key: 'tindakLanjutBelumSelesai',
    label: 'TL Belum Selesai',
    page: 'tindakLanjut',
    status: 'Belum Selesai',
    icon: CheckCircle2,
    tone: 'amber',
    hint: 'Deadline berjalan',
  },
  {
    key: 'laporanFinal',
    label: 'Laporan Final',
    page: 'laporan',
    status: 'Final',
    icon: FileText,
    tone: 'tosca',
    hint: 'Siap diarsipkan',
  },
  {
    key: 'dokumenMasuk',
    label: 'Dokumen Masuk',
    page: 'dokumen',
    icon: FolderOpen,
    tone: 'sky',
    hint: 'Arsip digital',
  },
]

const statusOptions = [
  'Aktif',
  'Nonaktif',
  'Draft',
  'Review',
  'Dalam Review',
  'Dalam Proses',
  'Diproses',
  'Terjadwal',
  'Baru',
  'Belum Selesai',
  'Belum Ditindaklanjuti',
  'Perlu Review',
  'Perlu Perbaikan',
  'Disetujui',
  'Terkirim',
  'Selesai',
  'Final',
]

const roleOptions = ['Admin', 'Inspektur', 'Auditor', 'Operator', 'Sekretaris', 'Irban Wilayah']
const riskOptions = ['Rendah', 'Sedang', 'Tinggi']

const chartColors = ['#16b6a2', '#0f3d67', '#f59e0b', '#e11d48', '#64748b']

function buildInitialData() {
  return {
    ...seedData,
    unitKerja: seedData.unitKerja.map((nama, index) => ({
      id: `UK-${String(index + 1).padStart(3, '0')}`,
      nama,
      kategori: nama.includes('Wilayah')
        ? 'Inspektur Pembantu'
        : nama.includes('Sub Bagian')
          ? 'Sub Bagian'
          : 'Struktural',
      status: 'Aktif',
      tahun: 2024,
    })),
    users: seedData.users.map((user, index) => ({
      id: `USR-${String(index + 1).padStart(3, '0')}`,
      ...user,
      status: 'Aktif',
    })),
    notifikasi: seedData.notifikasi.map((item) => ({
      ...item,
      status: 'Belum Dibaca',
    })),
    logAktivitas: seedData.logAktivitas.map((item, index) => ({
      id: `LOG-${String(index + 1).padStart(3, '0')}`,
      ...item,
      status: 'Tercatat',
    })),
  }
}

function App() {
  const [dataStore, setDataStore] = useState(() => buildInitialData())
  const [currentUser, setCurrentUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [expandedSections, setExpandedSections] = useState(['Dashboard', 'Data Organisasi', 'Pengawasan'])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tableFilters, setTableFilters] = useState({})
  const [modal, setModal] = useState(null)
  const [preview, setPreview] = useState(null)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((items) => [...items, { id, message, type }])
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id))
    }, 3200)
  }

  const addLog = (aktivitas) => {
    setDataStore((store) => ({
      ...store,
      logAktivitas: [
        {
          id: `LOG-${String(store.logAktivitas.length + 1).padStart(3, '0')}`,
          waktu: new Date().toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          user: currentUser?.nama || 'Sistem',
          aktivitas,
          status: 'Tercatat',
        },
        ...store.logAktivitas,
      ],
    }))
  }

  const canAccess = (pageId, user = currentUser) => {
    if (!user) return false
    return rolePages[user.role]?.includes(pageId)
  }

  const navigateTo = (pageId, filters = {}) => {
    if (!canAccess(pageId)) {
      addToast(`Akses ${currentUser?.role || 'user'} dibatasi untuk halaman ${moduleDefs[pageId]?.title}.`, 'warning')
      return
    }

    setActivePage(pageId)
    setSidebarOpen(false)

    if (Object.keys(filters).length > 0) {
      setTableFilters((prev) => ({
        ...prev,
        [pageId]: {
          ...defaultFilters,
          ...(prev[pageId] || {}),
          ...filters,
          page: 1,
        },
      }))
    }
  }

  const handleLogin = (username, password) => {
    const user = dataStore.users.find((item) => item.username === username && item.password === password)

    if (!user) {
      addToast('Username atau password dummy tidak sesuai.', 'error')
      return
    }

    setCurrentUser(user)
    setActivePage('dashboard')
    addToast(`Selamat datang, ${user.nama}.`, 'success')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setActivePage('dashboard')
    addToast('Sesi dummy ditutup.', 'info')
  }

  const openDetail = (pageId, row) => setModal({ type: 'detail', pageId, row })

  const openForm = (pageId, mode, row = null) => {
    const def = moduleDefs[pageId]
    const fields = def.columns || []
    const nextRow =
      row ||
      Object.fromEntries(
        fields.map((field) => [
          field,
          field === 'id'
            ? generateId(pageId, dataStore[pageId] || [])
            : field === 'status'
              ? defaultStatusForPage(pageId)
              : field === 'tahun'
                ? 2024
                : field === 'waktu'
                  ? 'Baru saja'
                  : '',
        ]),
      )

    if (mode !== 'detail' && !hasPermission(mode === 'add' ? 'add' : 'edit', pageId)) {
      addToast(`Role ${currentUser.role} tidak punya akses ${mode === 'add' ? 'tambah' : 'edit'} di modul ini.`, 'warning')
      return
    }

    setModal({ type: mode, pageId, row: nextRow })
  }

  const openDelete = (pageId, row) => {
    if (!hasPermission('delete', pageId)) {
      addToast(`Role ${currentUser.role} tidak punya akses hapus di modul ini.`, 'warning')
      return
    }

    setModal({ type: 'delete', pageId, row })
  }

  const saveRow = (pageId, row, mode) => {
    const key = getRowKey(row)

    setDataStore((store) => ({
      ...store,
      [pageId]:
        mode === 'add'
          ? [row, ...(store[pageId] || [])]
          : (store[pageId] || []).map((item) => (getRowKey(item) === key ? row : item)),
    }))

    addToast(`${moduleDefs[pageId].title} berhasil ${mode === 'add' ? 'ditambahkan' : 'disimpan'}.`)
    addLog(`${mode === 'add' ? 'menambahkan' : 'mengubah'} data ${moduleDefs[pageId].title} ${key}`)
    setModal(null)
  }

  const deleteRow = (pageId, row) => {
    const key = getRowKey(row)

    setDataStore((store) => ({
      ...store,
      [pageId]: (store[pageId] || []).filter((item) => getRowKey(item) !== key),
    }))

    addToast(`${moduleDefs[pageId].title} ${key} berhasil dihapus.`, 'success')
    addLog(`menghapus data ${moduleDefs[pageId].title} ${key}`)
    setModal(null)
  }

  const approveRow = (pageId, row) => {
    if (!hasPermission('approve', pageId)) {
      addToast(`Role ${currentUser.role} tidak punya akses approve di modul ini.`, 'warning')
      return
    }

    const nextStatus = approvalStatusForPage(pageId)
    const nextRow = { ...row, status: nextStatus }

    setDataStore((store) => ({
      ...store,
      [pageId]: (store[pageId] || []).map((item) => (getRowKey(item) === getRowKey(row) ? nextRow : item)),
    }))

    addToast(`${moduleDefs[pageId].title} ${getRowKey(row)} disetujui sebagai ${nextStatus}.`)
    addLog(`menyetujui ${moduleDefs[pageId].title} ${getRowKey(row)}`)
  }

  const handleDownload = (fileName, source = 'dokumen') => {
    if (!fileName) {
      addToast('Data ini belum memiliki nama file dummy.', 'warning')
      return
    }

    const url = fileUrls[fileName]
    const link = document.createElement('a')

    if (url) {
      link.href = url
      link.download = fileName
    } else {
      const blob = new Blob(
        [`Simulasi download file ${fileName}\nSumber data: ${source}\nInspektorat Kota Depok`],
        { type: 'text/plain;charset=utf-8' },
      )
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    }

    document.body.appendChild(link)
    link.click()
    link.remove()
    addToast(`Download dummy ${fileName} dimulai.`, 'success')
    addLog(`mengunduh file ${fileName}`)
  }

  const openPreview = (fileName, row = {}, sourcePage = 'dokumen') => {
    if (!fileName) {
      addToast('Nama file belum tersedia untuk preview.', 'warning')
      return
    }

    const ext = getExtension(fileName)
    const metadata = getFileMetadata(fileName, row, dataStore)
    setPreview({
      fileName,
      ext,
      url: fileUrls[fileName],
      raw: rawFiles[fileName],
      metadata: {
        ...metadata,
        sumber: moduleDefs[sourcePage]?.title || sourcePage,
      },
    })
    addToast(`Preview ${fileName} dibuka.`, 'info')
  }

  const clickNotification = (notification) => {
    setDataStore((store) => ({
      ...store,
      notifikasi: store.notifikasi.map((item) =>
        item.id === notification.id ? { ...item, status: 'Dibaca' } : item,
      ),
    }))

    const targetPage = resolveNotificationTarget(notification.target)
    if (targetPage && canAccess(targetPage)) {
      navigateTo(targetPage, { search: notification.target })
    } else {
      setModal({ type: 'detail', pageId: 'notifikasi', row: notification })
    }
  }

  const hasPermission = (action, pageId) => {
    if (!currentUser) return false
    if (currentUser.role === 'Admin') return true

    if (action === 'delete') return false
    if (action === 'approve') return currentUser.role === 'Inspektur' && moduleDefs[pageId]?.approvable

    if (currentUser.role === 'Inspektur') {
      return ['laporan', 'suratTugas', 'suratMasuk', 'suratKeluar', 'dokumen'].includes(pageId)
    }

    if (currentUser.role === 'Auditor') {
      return ['temuan', 'tindakLanjut', 'dokumen'].includes(pageId)
    }

    return false
  }

  if (!currentUser) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <ToastStack toasts={toasts} setToasts={setToasts} />
      </>
    )
  }

  const activeDef = moduleDefs[activePage]

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        activePage={activePage}
        canAccess={canAccess}
        expandedSections={expandedSections}
        navigateTo={navigateTo}
        setExpandedSections={setExpandedSections}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={currentUser}
      />

      <div className="lg:pl-72">
        <Header
          activeDef={activeDef}
          dataStore={dataStore}
          navigateTo={navigateTo}
          onLogout={handleLogout}
          setSidebarOpen={setSidebarOpen}
          user={currentUser}
        />

        <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          {activePage === 'dashboard' ? (
            <Dashboard
              dataStore={dataStore}
              navigateTo={navigateTo}
              openDetail={openDetail}
              openPreview={openPreview}
              setModal={setModal}
              user={currentUser}
            />
          ) : activePage === 'pengaturan' ? (
            <SettingsPage addToast={addToast} currentUser={currentUser} navigateTo={navigateTo} />
          ) : (
            <DataPage
              addToast={addToast}
              approveRow={approveRow}
              dataStore={dataStore}
              filters={tableFilters[activePage] || defaultFilters}
              hasPermission={hasPermission}
              onDelete={openDelete}
              onDownload={handleDownload}
              onEdit={(row) => openForm(activePage, 'edit', row)}
              onFilterChange={(next) =>
                setTableFilters((prev) => ({
                  ...prev,
                  [activePage]: {
                    ...(prev[activePage] || defaultFilters),
                    ...next,
                  },
                }))
              }
              onPreview={openPreview}
              onShowDetail={(row) => openDetail(activePage, row)}
              onAdd={() => openForm(activePage, 'add')}
              pageId={activePage}
              rows={dataStore[activePage] || []}
            />
          )}
        </main>
      </div>

      {modal && (
        <RecordModal
          dataStore={dataStore}
          modal={modal}
          onClose={() => setModal(null)}
          onDelete={deleteRow}
          onDownload={handleDownload}
          onPreview={openPreview}
          onSave={saveRow}
        />
      )}

      {preview && (
        <FilePreviewModal
          onClose={() => setPreview(null)}
          onDownload={handleDownload}
          preview={preview}
        />
      )}

      <ToastStack toasts={toasts} setToasts={setToasts} />
    </div>
  )
}

const defaultFilters = {
  search: '',
  status: 'Semua',
  year: 'Semua',
  page: 1,
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')

  const submit = (event) => {
    event.preventDefault()
    onLogin(username.trim(), password)
  }

  const quickFill = (nextUsername, nextPassword) => {
    setUsername(nextUsername)
    setPassword(nextPassword)
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex min-h-[42vh] flex-col justify-between bg-[linear-gradient(145deg,#061a2e_0%,#08243f_56%,#0b746c_100%)] p-6 text-white sm:p-10 lg:min-h-screen">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-navy-900 shadow-lg">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-tosca-100">Kota Depok</p>
              <h1 className="text-2xl font-bold sm:text-3xl">Inspektorat</h1>
            </div>
          </div>

          <div className="max-w-3xl py-10">
            <p className="mb-4 inline-flex rounded-md bg-white/12 px-3 py-1 text-sm font-semibold text-tosca-100">
              Sistem Manajemen Data
            </p>
            <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Pengawasan, laporan, agenda, dan arsip dalam satu dashboard kerja.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Aplikasi dummy interaktif untuk simulasi proses pemeriksaan, tindak lanjut, approval,
              dan pengelolaan dokumen Inspektorat Kota Depok.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
            {[
              ['admin', 'admin123', 'Akses semua modul'],
              ['inspektur', 'inspektur123', 'Approval dan laporan'],
              ['auditor', 'auditor123', 'Temuan, TL, dokumen'],
            ].map(([name, pass, desc]) => (
              <button
                className="focus-ring rounded-lg border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/18"
                key={name}
                onClick={() => quickFill(name, pass)}
                type="button"
              >
                <span className="block font-bold text-white">{name}</span>
                <span className="block text-xs text-slate-300">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-100 p-6 sm:p-10">
          <form className="w-full max-w-md rounded-lg bg-white p-6 shadow-panel sm:p-8" onSubmit={submit}>
            <div className="mb-7">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-navy-900 text-white">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-navy-950">Login Dummy</h2>
              <p className="mt-2 text-sm text-slate-600">
                Gunakan akun admin, inspektur, atau auditor untuk melihat pembatasan akses.
              </p>
            </div>

            <label className="mb-4 block">
              <span className="text-sm font-semibold text-slate-700">Username</span>
              <input
                className="focus-ring mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900"
                onChange={(event) => setUsername(event.target.value)}
                value={username}
              />
            </label>

            <label className="mb-6 block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                className="focus-ring mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            <button
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-3 font-bold text-white transition hover:bg-navy-800"
              type="submit"
            >
              <ShieldCheck className="h-5 w-5" />
              Masuk Dashboard
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function Sidebar({
  activePage,
  canAccess,
  expandedSections,
  navigateTo,
  setExpandedSections,
  sidebarOpen,
  setSidebarOpen,
  user,
}) {
  const toggleSection = (label, firstPage) => {
    setExpandedSections((items) =>
      items.includes(label) ? items.filter((item) => item !== label) : [...items, label],
    )

    if (firstPage) navigateTo(firstPage)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-navy-950/50 transition lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy-950 text-white shadow-2xl transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-tosca-500 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tosca-100">Inspektorat</p>
            <p className="font-bold leading-tight">Kota Depok</p>
          </div>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-sm font-semibold">{user.nama}</p>
          <p className="mt-1 inline-flex rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-tosca-100">
            {user.role}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => {
            const pages = section.pages.filter((page) => canAccess(page))
            if (pages.length === 0) return null
            const SectionIcon = section.icon
            const isExpanded = expandedSections.includes(section.label)

            if (pages.length === 1 && section.label === moduleDefs[pages[0]].title) {
              const pageId = pages[0]
              const PageIcon = moduleDefs[pageId].icon
              return (
                <button
                  className={navButtonClass(activePage === pageId)}
                  key={section.label}
                  onClick={() => navigateTo(pageId)}
                  type="button"
                >
                  <PageIcon className="h-5 w-5" />
                  <span>{moduleDefs[pageId].title}</span>
                </button>
              )
            }

            return (
              <div className="mb-2" key={section.label}>
                <button
                  className="focus-ring flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-bold text-slate-100 transition hover:bg-white/10"
                  onClick={() => toggleSection(section.label, pages[0])}
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <SectionIcon className="h-5 w-5 text-tosca-100" />
                    {section.label}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-1 pl-4">
                    {pages.map((pageId) => {
                      const PageIcon = moduleDefs[pageId].icon
                      return (
                        <button
                          className={navButtonClass(activePage === pageId)}
                          key={pageId}
                          onClick={() => navigateTo(pageId)}
                          type="button"
                        >
                          <PageIcon className="h-4 w-4" />
                          <span>{moduleDefs[pageId].title}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

function Header({ activeDef, dataStore, navigateTo, onLogout, setSidebarOpen, user }) {
  const unreadCount = dataStore.notifikasi.filter((item) => item.status !== 'Dibaca').length

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-navy-900 lg:hidden"
          onClick={() => setSidebarOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-tosca-700">Dashboard Pemerintahan</p>
          <h1 className="truncate text-xl font-bold text-navy-950 sm:text-2xl">{activeDef.title}</h1>
        </div>

        <button
          className="focus-ring relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-navy-900 transition hover:border-tosca-500 hover:text-tosca-700"
          onClick={() => navigateTo('notifikasi')}
          title="Notifikasi"
          type="button"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="hidden items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-navy-900 text-white">
            {user.nama.slice(0, 1)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">{user.nama}</p>
            <p className="text-xs font-semibold text-slate-500">{user.role}</p>
          </div>
        </div>

        <button
          className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          onClick={onLogout}
          title="Logout"
          type="button"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

function Dashboard({ dataStore, navigateTo, openDetail, openPreview, setModal, user }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardCards.map((card) => {
          const Icon = card.icon
          const value = dataStore.dashboard[card.key]
          return (
            <button
              className="focus-ring rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-tosca-500 hover:shadow-panel"
              key={card.key}
              onClick={() => navigateTo(card.page, card.status ? { status: card.status } : {})}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-lg ${cardToneClass(card.tone)}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </span>
              <span className="mt-4 block text-3xl font-bold text-navy-950">{value}</span>
              <span className="mt-1 block text-sm font-semibold text-slate-700">{card.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{card.hint}</span>
            </button>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <ChartPanel
          description="Klik grafik untuk membuka insight wilayah."
          icon={BarChart3}
          onClick={() =>
            setModal({
              type: 'chart',
              title: 'Progress Wilayah',
              rows: dataStore.dashboard.progressWilayah,
            })
          }
          title="Progress Wilayah"
        >
          <ResponsiveContainer height={280} width="100%">
            <BarChart data={dataStore.dashboard.progressWilayah} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="wilayah" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="selesai" fill="#16b6a2" name="Selesai" radius={[6, 6, 0, 0]} />
              <Bar dataKey="belum" fill="#f59e0b" name="Belum" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          description="Klik grafik untuk melihat komposisi status laporan."
          icon={FileSpreadsheet}
          onClick={() =>
            setModal({
              type: 'chart',
              title: 'Status Laporan',
              rows: dataStore.dashboard.statusLaporan,
            })
          }
          title="Status Laporan"
        >
          <ResponsiveContainer height={280} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={dataStore.dashboard.statusLaporan}
                dataKey="jumlah"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={4}
                nameKey="status"
              >
                {dataStore.dashboard.statusLaporan.map((entry, index) => (
                  <Cell fill={chartColors[index % chartColors.length]} key={entry.status} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartPanel
          description="Klik grafik untuk membuka rekap kegiatan bulanan."
          icon={Activity}
          onClick={() =>
            setModal({
              type: 'chart',
              title: 'Kegiatan Bulanan',
              rows: dataStore.dashboard.kegiatanBulanan,
            })
          }
          title="Kegiatan Bulanan"
        >
          <ResponsiveContainer height={260} width="100%">
            <LineChart data={dataStore.dashboard.kegiatanBulanan} margin={{ left: -16, right: 8 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                activeDot={{ r: 7 }}
                dataKey="jumlah"
                name="Kegiatan"
                stroke="#0f3d67"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <div className="grid gap-5">
          <Panel
            action={
              <button
                className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-navy-900 hover:border-tosca-500"
                onClick={() => navigateTo('jadwalPemeriksaan')}
                type="button"
              >
                Semua Agenda
              </button>
            }
            icon={CalendarDays}
            title="Agenda Terdekat"
          >
            <div className="space-y-3">
              {dataStore.jadwalPemeriksaan.map((agenda) => (
                <button
                  className="focus-ring flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-tosca-500 hover:bg-tosca-50"
                  key={agenda.id}
                  onClick={() => openDetail('jadwalPemeriksaan', agenda)}
                  type="button"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy-50 text-navy-900">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-slate-900">{agenda.kegiatan}</span>
                    <span className="block text-sm text-slate-500">
                      {agenda.tanggal} • {agenda.waktu} • {agenda.lokasi}
                    </span>
                  </span>
                  <StatusBadge status={agenda.status} />
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            action={
              <button
                className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-navy-900 hover:border-tosca-500"
                onClick={() => navigateTo('notifikasi')}
                type="button"
              >
                Semua Notifikasi
              </button>
            }
            icon={Bell}
            title="Notifikasi"
          >
            <div className="space-y-3">
              {dataStore.notifikasi.slice(0, 4).map((item) => (
                <button
                  className="focus-ring w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-tosca-500 hover:bg-slate-50"
                  key={item.id}
                  onClick={() => setModal({ type: 'detail', pageId: 'notifikasi', row: item })}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-900">{item.id}</span>
                    <StatusBadge status={item.tipe} />
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{item.pesan}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <Panel
        action={
          <button
            className="focus-ring flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-sm font-bold text-white hover:bg-navy-800"
            onClick={() => navigateTo('dokumen')}
            type="button"
          >
            <FolderOpen className="h-4 w-4" />
            Buka Arsip
          </button>
        }
        icon={FolderOpen}
        title="Dokumen Terbaru"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {dataStore.dokumen.map((doc) => (
            <button
              className="focus-ring rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-tosca-500 hover:bg-white"
              key={doc.id}
              onClick={() => openPreview(doc.nama, doc, 'dokumen')}
              type="button"
            >
              <div className="mb-3 flex items-center justify-between">
                <FileText className="h-5 w-5 text-navy-900" />
                <StatusBadge status={doc.status} />
              </div>
              <p className="line-clamp-2 min-h-10 text-sm font-bold text-slate-900">{doc.nama}</p>
              <p className="mt-2 text-xs text-slate-500">
                {doc.kategori} • {doc.ukuran}
              </p>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function DataPage({
  addToast,
  approveRow,
  dataStore,
  filters,
  hasPermission,
  onAdd,
  onDelete,
  onDownload,
  onEdit,
  onFilterChange,
  onPreview,
  onShowDetail,
  pageId,
  rows,
}) {
  const def = moduleDefs[pageId]
  const columns = def.columns || inferColumns(rows)
  const pageSize = 5

  const statusList = useMemo(() => {
    const statuses = rows.map((row) => row.status || row.tipe).filter(Boolean)
    return ['Semua', ...unique(statuses)]
  }, [rows])

  const yearList = useMemo(() => ['Semua', ...unique(rows.map(getRowYear).filter(Boolean)).sort()], [rows])

  const filteredRows = useMemo(() => {
    const search = filters.search.toLowerCase()
    return rows.filter((row) => {
      const matchesSearch = search.length === 0 || JSON.stringify(row).toLowerCase().includes(search)
      const matchesStatus =
        filters.status === 'Semua' || row.status === filters.status || row.tipe === filters.status
      const matchesYear = filters.year === 'Semua' || String(getRowYear(row)) === String(filters.year)
      return matchesSearch && matchesStatus && matchesYear
    })
  }, [filters, rows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(filters.page, totalPages)
  const pageRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    if (filters.page > totalPages) onFilterChange({ page: totalPages })
  }, [filters.page, onFilterChange, totalPages])

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy-900 text-white">
                <def.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-950">{def.title}</h2>
                <p className="text-sm text-slate-600">{def.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {pageId === 'dokumen' && (
              <button
                className="focus-ring flex items-center gap-2 rounded-lg border border-tosca-200 bg-tosca-50 px-3 py-2 text-sm font-bold text-tosca-700 transition hover:bg-tosca-100"
                onClick={onAdd}
                type="button"
              >
                <Upload className="h-4 w-4" />
                Upload Dummy
              </button>
            )}
            <button
              className="focus-ring flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-navy-800"
              onClick={onAdd}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_210px_170px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="focus-ring w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm"
              onChange={(event) => onFilterChange({ search: event.target.value, page: 1 })}
              placeholder={`Cari ${def.title.toLowerCase()}...`}
              value={filters.search}
            />
          </label>

          <label className="relative block">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              className="focus-ring w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm"
              onChange={(event) => onFilterChange({ status: event.target.value, page: 1 })}
              value={filters.status}
            >
              {statusList.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="relative block">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              className="focus-ring w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm"
              onChange={(event) => onFilterChange({ year: event.target.value, page: 1 })}
              value={filters.year}
            >
              {yearList.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {pageId === 'jadwalPemeriksaan' && <AgendaStrip rows={rows} onShowDetail={onShowDetail} />}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                    key={column}
                  >
                    {labelFor(column)}
                  </th>
                ))}
                <th className="sticky right-0 whitespace-nowrap bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pageRows.map((row) => (
                <tr
                  className="cursor-pointer transition hover:bg-tosca-50/60"
                  key={getRowKey(row)}
                  onClick={() => onShowDetail(row)}
                >
                  {columns.map((column) => {
                    const value = row[column]
                    const isFile = def.fileField === column
                    return (
                      <td className="max-w-[280px] px-4 py-3 text-sm text-slate-700" key={column}>
                        {column === 'status' || column === 'tipe' ? (
                          <StatusBadge status={value} />
                        ) : isFile ? (
                          <button
                            className="focus-ring inline-flex max-w-[260px] items-center gap-2 rounded-md border border-slate-200 px-2 py-1 text-left text-xs font-bold text-navy-900 hover:border-tosca-500 hover:bg-white"
                            onClick={(event) => {
                              event.stopPropagation()
                              onPreview(value, row, pageId)
                            }}
                            type="button"
                          >
                            <FileText className="h-4 w-4 flex-none text-tosca-700" />
                            <span className="truncate">{value || '-'}</span>
                          </button>
                        ) : (
                          <span className="line-clamp-2">{formatValue(value)}</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="sticky right-0 bg-white px-4 py-3">
                    <RowActions
                      canApprove={Boolean(def.approvable)}
                      hasFile={Boolean(def.fileField && row[def.fileField])}
                      hasPermission={hasPermission}
                      onApprove={() => approveRow(pageId, row)}
                      onDelete={() => onDelete(pageId, row)}
                      onDownload={() => onDownload(row[def.fileField], def.title)}
                      onEdit={() => onEdit(row)}
                      onPreview={() => onPreview(row[def.fileField], row, pageId)}
                      onShowDetail={() => onShowDetail(row)}
                      pageId={pageId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageRows.length === 0 && (
          <div className="px-4 py-14 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">Tidak ada data sesuai filter.</p>
            <button
              className="focus-ring mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-navy-900 hover:border-tosca-500"
              onClick={() => onFilterChange(defaultFilters)}
              type="button"
            >
              Reset Filter
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan {pageRows.length} dari {filteredRows.length} data
          </p>
          <div className="flex items-center gap-2">
            <button
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-navy-900 transition hover:border-tosca-500 disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => onFilterChange({ page: currentPage - 1 })}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-navy-900 transition hover:border-tosca-500 disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => onFilterChange({ page: currentPage + 1 })}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {pageId === 'dokumen' && (
        <ArchivePreviewGrid
          dataStore={dataStore}
          onDownload={(fileName) => onDownload(fileName, 'Arsip Dokumen')}
          onPreview={(fileName, row) => onPreview(fileName, row, pageId)}
        />
      )}

      {pageId === 'notifikasi' && (
        <Panel icon={Bell} title="Pusat Notifikasi Clickable">
          <div className="grid gap-3 md:grid-cols-2">
            {rows.map((notification) => (
              <button
                className="focus-ring rounded-lg border border-slate-200 p-4 text-left transition hover:border-tosca-500 hover:bg-tosca-50"
                key={notification.id}
                onClick={() => {
                  addToast(`Notifikasi ${notification.id} dibuka.`, 'info')
                  onShowDetail(notification)
                }}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge status={notification.tipe} />
                  <StatusBadge status={notification.status} />
                </div>
                <p className="mt-3 font-bold text-slate-900">{notification.pesan}</p>
                <p className="mt-1 text-sm text-slate-500">Target: {notification.target}</p>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

function AgendaStrip({ rows, onShowDetail }) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {rows.map((item) => (
        <button
          className="focus-ring rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-tosca-500 hover:shadow-panel"
          key={item.id}
          onClick={() => onShowDetail(item)}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <CalendarDays className="h-6 w-6 text-tosca-700" />
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-3 font-bold text-navy-950">{item.kegiatan}</p>
          <p className="mt-2 text-sm text-slate-500">
            {item.tanggal} pukul {item.waktu}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{item.lokasi}</p>
        </button>
      ))}
    </section>
  )
}

function ArchivePreviewGrid({ dataStore, onDownload, onPreview }) {
  return (
    <Panel
      action={<span className="rounded-md bg-tosca-50 px-3 py-1 text-sm font-bold text-tosca-700">{archiveFiles.length} file</span>}
      icon={FolderOpen}
      title="File Dummy Tersedia"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {archiveFiles.map((fileName) => {
          const metadata = getFileMetadata(fileName, {}, dataStore)
          return (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={fileName}>
              <button
                className="focus-ring flex w-full items-start gap-3 rounded-lg text-left"
                onClick={() => onPreview(fileName, metadata)}
                type="button"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-navy-900">
                  {getExtension(fileName) === 'csv' ? (
                    <FileSpreadsheet className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-bold text-slate-900">{fileName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {metadata.kategori || 'File dummy'} • {metadata.ukuran || 'Simulasi'}
                  </p>
                </div>
              </button>

              <div className="mt-4 flex gap-2">
                <button
                  className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-navy-900 hover:border-tosca-500"
                  onClick={() => onPreview(fileName, metadata)}
                  type="button"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-sm font-bold text-white hover:bg-navy-800"
                  onClick={() => onDownload(fileName)}
                  type="button"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function RowActions({
  canApprove,
  hasFile,
  onApprove,
  onDelete,
  onDownload,
  onEdit,
  onPreview,
  onShowDetail,
}) {
  return (
    <div className="flex items-center gap-1.5">
      <IconButton label="Detail" onClick={onShowDetail}>
        <Eye className="h-4 w-4" />
      </IconButton>
      <IconButton label="Edit" onClick={onEdit}>
        <Edit3 className="h-4 w-4" />
      </IconButton>
      <IconButton label="Hapus" onClick={onDelete} tone="danger">
        <Trash2 className="h-4 w-4" />
      </IconButton>
      {canApprove && (
        <IconButton label="Approve" onClick={onApprove} tone="success">
          <Check className="h-4 w-4" />
        </IconButton>
      )}
      {hasFile && (
        <>
          <IconButton label="Preview" onClick={onPreview} tone="info">
            <FileText className="h-4 w-4" />
          </IconButton>
          <IconButton label="Download" onClick={onDownload} tone="primary">
            <Download className="h-4 w-4" />
          </IconButton>
        </>
      )}
    </div>
  )
}

function IconButton({ children, label, onClick, tone = 'default' }) {
  const toneClass = {
    default: 'border-slate-200 text-slate-700 hover:border-navy-300 hover:bg-navy-50 hover:text-navy-900',
    danger: 'border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700',
    success: 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700',
    info: 'border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700',
    primary: 'border-navy-900 bg-navy-900 text-white hover:bg-navy-800',
  }[tone]

  return (
    <button
      className={`focus-ring grid h-9 w-9 place-items-center rounded-lg border transition ${toneClass}`}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

function RecordModal({ dataStore, modal, onClose, onDelete, onDownload, onPreview, onSave }) {
  const { pageId, row, type } = modal
  const def = moduleDefs[pageId]
  const [form, setForm] = useState(row || {})

  useEffect(() => {
    setForm(row || {})
  }, [row])

  if (type === 'chart') {
    return (
      <ModalShell onClose={onClose} size="lg" title={modal.title}>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <tbody className="divide-y divide-slate-100">
              {modal.rows.map((item, index) => (
                <tr key={`${modal.title}-${index}`}>
                  {Object.entries(item).map(([key, value]) => (
                    <td className="px-4 py-3 text-sm" key={key}>
                      <span className="block text-xs font-bold uppercase text-slate-400">{labelFor(key)}</span>
                      <span className="font-semibold text-slate-900">{formatValue(value)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModalShell>
    )
  }

  if (type === 'delete') {
    return (
      <ModalShell onClose={onClose} title="Konfirmasi Hapus">
        <div className="rounded-lg bg-rose-50 p-4 text-rose-900">
          <p className="font-bold">Hapus {def.title}?</p>
          <p className="mt-1 text-sm">
            Data <span className="font-bold">{getRowKey(row)}</span> akan dihapus dari state dummy aplikasi.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="focus-ring rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:border-slate-300"
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="focus-ring rounded-lg bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
            onClick={() => onDelete(pageId, row)}
            type="button"
          >
            Hapus
          </button>
        </div>
      </ModalShell>
    )
  }

  const isDetail = type === 'detail'
  const columns = def.columns || inferColumns([row])

  return (
    <ModalShell
      onClose={onClose}
      size={isDetail ? 'lg' : 'xl'}
      title={`${isDetail ? 'Detail' : type === 'add' ? 'Tambah' : 'Edit'} ${def.title}`}
    >
      {isDetail ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(row).map(([key, value]) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={key}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{labelFor(key)}</p>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {key === 'status' || key === 'tipe' ? <StatusBadge status={value} /> : formatValue(value)}
                </div>
              </div>
            ))}
          </div>

          {def.fileField && row[def.fileField] && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
              <button
                className="focus-ring flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-navy-900 hover:border-tosca-500"
                onClick={() => onPreview(row[def.fileField], row, pageId)}
                type="button"
              >
                <Eye className="h-4 w-4" />
                Preview File
              </button>
              <button
                className="focus-ring flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-sm font-bold text-white hover:bg-navy-800"
                onClick={() => onDownload(row[def.fileField], def.title)}
                type="button"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          )}
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(pageId, form, type)
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {columns.map((field) => (
              <FieldInput
                field={field}
                key={field}
                onChange={(value) => setForm((prev) => ({ ...prev, [field]: value }))}
                value={form[field] ?? ''}
              />
            ))}
          </div>

          {def.fileField && (
            <div className="rounded-lg border border-dashed border-tosca-300 bg-tosca-50 p-4">
              <p className="font-bold text-tosca-700">File dummy yang bisa dipilih</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {archiveFiles.map((fileName) => (
                  <button
                    className="focus-ring rounded-lg border border-tosca-200 bg-white px-3 py-2 text-xs font-bold text-navy-900 hover:border-tosca-500"
                    key={fileName}
                    onClick={() => setForm((prev) => ({ ...prev, [def.fileField]: fileName }))}
                    type="button"
                  >
                    {fileName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              className="focus-ring rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:border-slate-300"
              onClick={onClose}
              type="button"
            >
              Batal
            </button>
            <button
              className="focus-ring rounded-lg bg-navy-900 px-4 py-2 font-bold text-white hover:bg-navy-800"
              type="submit"
            >
              Simpan
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  )
}

function FilePreviewModal({ onClose, onDownload, preview }) {
  const csvRows = preview.ext === 'csv' ? parseCsv(preview.raw || '') : []

  return (
    <ModalShell onClose={onClose} size="xl" title={`Preview ${preview.fileName}`}>
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-navy-900">
              {preview.ext === 'csv' ? <FileSpreadsheet className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="break-words font-bold text-navy-950">{preview.fileName}</p>
              <p className="text-sm uppercase text-slate-500">{preview.ext || 'file'}</p>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(preview.metadata).map(([key, value]) => (
              <div className="flex justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm" key={key}>
                <span className="font-semibold text-slate-500">{labelFor(key)}</span>
                <span className="text-right font-bold text-slate-800">{formatValue(value)}</span>
              </div>
            ))}
          </div>

          <button
            className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-3 font-bold text-white hover:bg-navy-800"
            onClick={() => onDownload(preview.fileName, 'Preview Dokumen')}
            type="button"
          >
            <Download className="h-5 w-5" />
            Download File
          </button>
        </div>

        <div className="min-h-[360px] overflow-hidden rounded-lg border border-slate-200 bg-white">
          {preview.ext === 'pdf' ? (
            preview.url ? (
              <iframe className="h-[520px] w-full" src={preview.url} title={preview.fileName} />
            ) : (
              <PreviewFallback
                text="File PDF ini tercatat pada data dummy, tetapi file fisiknya tidak tersedia di folder dummy_files. Metadata tetap ditampilkan untuk simulasi preview."
              />
            )
          ) : preview.ext === 'csv' ? (
            <CsvPreview rows={csvRows} />
          ) : preview.ext === 'txt' ? (
            <div className="h-full whitespace-pre-wrap p-5 text-sm leading-7 text-slate-700">
              {preview.raw || 'Isi ringkas TXT tidak tersedia.'}
            </div>
          ) : (
            <PreviewFallback text="Format file belum dikenali untuk preview dummy." />
          )}
        </div>
      </div>
    </ModalShell>
  )
}

function CsvPreview({ rows }) {
  if (rows.length === 0) {
    return <PreviewFallback text="CSV dummy kosong atau belum tersedia." />
  }

  const headers = Object.keys(rows[0])

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500" key={header}>
                {labelFor(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td className="px-4 py-3 text-sm text-slate-700" key={header}>
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PreviewFallback({ text }) {
  return (
    <div className="grid min-h-[360px] place-items-center p-6 text-center">
      <div>
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  )
}

function SettingsPage({ addToast, currentUser, navigateTo }) {
  const roleCards = [
    { role: 'Admin', desc: 'Semua menu, semua aksi, hapus data, approval, dan pengaturan.', pages: rolePages.Admin },
    { role: 'Inspektur', desc: 'Approval, laporan, surat, dokumen, agenda, dan log aktivitas.', pages: rolePages.Inspektur },
    { role: 'Auditor', desc: 'Temuan, tindak lanjut, dokumen, dan notifikasi lapangan.', pages: rolePages.Auditor },
  ]

  return (
    <div className="space-y-5">
      <Panel icon={Settings} title="Profil Sistem">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ['Instansi', 'Inspektorat Kota Depok'],
            ['Mode', 'Dummy Interaktif React + Tailwind'],
            ['User Aktif', `${currentUser.nama} (${currentUser.role})`],
          ].map(([label, value]) => (
            <button
              className="focus-ring rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-tosca-500 hover:bg-white"
              key={label}
              onClick={() => addToast(`${label}: ${value}`, 'info')}
              type="button"
            >
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-1 font-bold text-navy-950">{value}</p>
            </button>
          ))}
        </div>
      </Panel>

      <Panel icon={ShieldCheck} title="Role Based Access Dummy">
        <div className="grid gap-4 lg:grid-cols-3">
          {roleCards.map((card) => (
            <button
              className={`focus-ring rounded-lg border p-4 text-left transition hover:border-tosca-500 ${
                currentUser.role === card.role ? 'border-tosca-500 bg-tosca-50' : 'border-slate-200 bg-white'
              }`}
              key={card.role}
              onClick={() => addToast(`Role ${card.role}: ${card.pages.length} halaman tersedia.`, 'info')}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-navy-950">{card.role}</h3>
                {currentUser.role === card.role && <StatusBadge status="Aktif" />}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.desc}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {card.pages.slice(0, 7).map((page) => (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600" key={page}>
                    {moduleDefs[page].title}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel icon={UserCog} title="Aksi Cepat">
        <div className="flex flex-wrap gap-3">
          {['dashboard', 'dokumen', 'notifikasi'].map((page) => (
            <button
              className="focus-ring rounded-lg bg-navy-900 px-4 py-3 font-bold text-white hover:bg-navy-800"
              key={page}
              onClick={() => navigateTo(page)}
              type="button"
            >
              Buka {moduleDefs[page].title}
            </button>
          ))}
          <button
            className="focus-ring rounded-lg border border-slate-200 px-4 py-3 font-bold text-navy-900 hover:border-tosca-500"
            onClick={() => addToast('Preferensi dummy tersimpan.', 'success')}
            type="button"
          >
            Simpan Preferensi
          </button>
        </div>
      </Panel>
    </div>
  )
}

function FieldInput({ field, onChange, value }) {
  const label = labelFor(field)
  const isLong = ['rekomendasi', 'pesan', 'aktivitas'].includes(field)

  if (field === 'status') {
    return (
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <select
          className="focus-ring mt-2 w-full rounded-lg border border-slate-200 px-3 py-3"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {statusOptions.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
    )
  }

  if (field === 'role') {
    return (
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <select
          className="focus-ring mt-2 w-full rounded-lg border border-slate-200 px-3 py-3"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {roleOptions.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </label>
    )
  }

  if (field === 'risiko') {
    return (
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <select
          className="focus-ring mt-2 w-full rounded-lg border border-slate-200 px-3 py-3"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {riskOptions.map((risk) => (
            <option key={risk}>{risk}</option>
          ))}
        </select>
      </label>
    )
  }

  if (isLong) {
    return (
      <label className="block md:col-span-2">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <textarea
          className="focus-ring mt-2 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-3"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      </label>
    )
  }

  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 w-full rounded-lg border border-slate-200 px-3 py-3"
        onChange={(event) => onChange(event.target.value)}
        type={field.includes('tanggal') || field === 'deadline' ? 'date' : 'text'}
        value={value}
      />
    </label>
  )
}

function ChartPanel({ children, description, icon: Icon, onClick, title }) {
  return (
    <button
      className="focus-ring rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-tosca-500 hover:shadow-panel"
      onClick={onClick}
      type="button"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy-50 text-navy-900">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-navy-950">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </div>
      <div className="pointer-events-none">{children}</div>
    </button>
  )
}

function Panel({ action = null, children, icon: Icon, title }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy-50 text-navy-900">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-navy-950">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ModalShell({ children, onClose, size = 'md', title }) {
  const sizeClass = {
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/65 p-4">
      <div className={`max-h-[92vh] w-full ${sizeClass} overflow-hidden rounded-lg bg-white shadow-2xl`}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-navy-950">{title}</h2>
          <button
            className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-73px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

function ToastStack({ setToasts, toasts }) {
  return (
    <div className="fixed right-4 top-4 z-[60] w-[min(360px,calc(100vw-2rem))] space-y-2">
      {toasts.map((toast) => (
        <div
          className={`flex items-start gap-3 rounded-lg border bg-white p-3 shadow-panel ${toastBorderClass(toast.type)}`}
          key={toast.id}
        >
          <div className={`mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-md ${toastIconClass(toast.type)}`}>
            {toast.type === 'error' ? <X className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </div>
          <p className="flex-1 text-sm font-semibold text-slate-800">{toast.message}</p>
          <button
            className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-bold ${statusClass(status)}`}>
      {formatValue(status)}
    </span>
  )
}

function getRowKey(row) {
  return row?.id || row?.username || row?.nama || row?.waktu || JSON.stringify(row)
}

function inferColumns(rows) {
  return Object.keys(rows[0] || {})
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)))
}

function getRowYear(row) {
  if (row.tahun) return row.tahun
  const dateValue = row.tanggal || row.deadline || row.waktu
  if (!dateValue) return ''
  const match = String(dateValue).match(/\b(20\d{2})\b/)
  return match?.[1] || ''
}

function generateId(pageId, rows) {
  const prefix = moduleDefs[pageId]?.idPrefix || 'ID'
  const nextNumber = rows.length + 1

  if (['suratTugas', 'suratMasuk', 'suratKeluar', 'laporan'].includes(pageId)) {
    return `${prefix}-${String(nextNumber).padStart(3, '0')}/INSP/2024`.replace('LHP-', 'LHP-')
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`
}

function defaultStatusForPage(pageId) {
  if (pageId === 'pegawai' || pageId === 'users' || pageId === 'unitKerja') return 'Aktif'
  if (pageId === 'notifikasi') return 'Belum Dibaca'
  if (pageId === 'logAktivitas') return 'Tercatat'
  return 'Draft'
}

function approvalStatusForPage(pageId) {
  if (pageId === 'laporan' || pageId === 'dokumen') return 'Final'
  if (pageId === 'tindakLanjut' || pageId === 'temuan') return 'Selesai'
  return 'Disetujui'
}

function getExtension(fileName) {
  return String(fileName || '').split('.').pop()?.toLowerCase() || ''
}

function getFileMetadata(fileName, row, dataStore) {
  const doc = dataStore.dokumen.find((item) => item.nama === fileName)
  const rowWithData = row && Object.keys(row).length > 0 ? row : null
  const knownRow =
    doc ||
    rowWithData ||
    dataStore.laporan.find((item) => item.file === fileName) ||
    dataStore.suratTugas.find((item) => item.file === fileName) ||
    dataStore.suratMasuk.find((item) => item.file === fileName) ||
    dataStore.suratKeluar.find((item) => item.file === fileName) ||
    dataStore.tindakLanjut.find((item) => item.bukti === fileName) ||
    {}

  return {
    nama: fileName,
    kategori: knownRow.kategori || knownRow.judul || knownRow.perihal || knownRow.kegiatan || 'File Dummy',
    status: knownRow.status || 'Tersedia',
    ukuran: knownRow.ukuran || (fileUrls[fileName] ? 'Tersedia di dummy_files' : 'Simulasi metadata'),
    diunggahOleh: knownRow.diunggahOleh || knownRow.pic || 'Sistem Dummy',
    waktu: knownRow.waktu || knownRow.tanggal || knownRow.deadline || 'Data dummy',
  }
}

function parseCsv(raw) {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map((item) => item.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((item) => item.trim())
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']))
  })
}

function resolveNotificationTarget(target) {
  const text = String(target).toLowerCase()
  if (text.startsWith('tl-')) return 'tindakLanjut'
  if (text.startsWith('lhp-')) return 'laporan'
  if (text.startsWith('st-')) return 'suratTugas'
  if (text.includes('surat masuk')) return 'suratMasuk'
  if (text.startsWith('tm-')) return 'temuan'
  return null
}

function labelFor(key) {
  const labels = {
    id: 'ID',
    opd: 'OPD',
    pic: 'PIC',
    lhp: 'LHP',
    temuanId: 'ID Temuan',
    diunggahOleh: 'Diunggah Oleh',
    role: 'Role',
    tipe: 'Tipe',
    url: 'URL',
  }

  return (
    labels[key] ||
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function navButtonClass(active) {
  return `focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
    active ? 'bg-tosca-500 text-white shadow-lg shadow-tosca-950/20' : 'text-slate-200 hover:bg-white/10 hover:text-white'
  }`
}

function cardToneClass(tone) {
  const tones = {
    navy: 'bg-navy-900 text-white',
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    tosca: 'bg-tosca-100 text-tosca-700',
    sky: 'bg-sky-100 text-sky-700',
  }
  return tones[tone] || tones.navy
}

function statusClass(status = '') {
  const value = String(status).toLowerCase()

  if (['final', 'selesai', 'disetujui', 'terkirim', 'success', 'aktif', 'dibaca'].includes(value)) {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (['review', 'dalam review', 'dalam proses', 'diproses', 'terjadwal', 'info', 'baru'].includes(value)) {
    return 'bg-sky-100 text-sky-700'
  }
  if (['draft', 'belum selesai', 'belum ditindaklanjuti', 'belum dibaca', 'warning'].includes(value)) {
    return 'bg-amber-100 text-amber-800'
  }
  if (['perlu perbaikan', 'perlu review', 'tinggi', 'error', 'nonaktif'].includes(value)) {
    return 'bg-rose-100 text-rose-700'
  }
  if (['sedang'].includes(value)) return 'bg-orange-100 text-orange-700'
  if (['rendah'].includes(value)) return 'bg-tosca-100 text-tosca-700'

  return 'bg-slate-100 text-slate-700'
}

function toastBorderClass(type) {
  const map = {
    success: 'border-emerald-200',
    error: 'border-rose-200',
    warning: 'border-amber-200',
    info: 'border-sky-200',
  }
  return map[type] || map.success
}

function toastIconClass(type) {
  const map = {
    success: 'bg-emerald-100 text-emerald-700',
    error: 'bg-rose-100 text-rose-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-sky-100 text-sky-700',
  }
  return map[type] || map.success
}

export default App
