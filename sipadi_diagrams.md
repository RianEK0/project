# Dokumentasi Diagram Sistem SIPADI V2

Dokumen ini berisi gambar diagram dan kode sumber Mermaid untuk arsitektur sistem, use case, activity diagram, sequence diagram, dan Entity Relationship Diagram (ERD) dari sistem **SIPADI V2** (Sistem Pengarsipan dan Disposisi Inspektorat).

> [!NOTE]
> Diagram ditampilkan langsung oleh GitHub dari kode Mermaid. Versi gambar yang sudah tersedia disimpan di direktori `diagrams/`.

---

## 1. Arsitektur Sistem (System Architecture)

### Kode Sumber Mermaid:
```mermaid
graph TD
    User[Web Browser User]

    subgraph FE [Frontend Layer - Next.js]
        Pages[React Components and Pages]
        State[State Cookies and JWT]
    end

    subgraph BE [Backend Layer - Express.js]
        Router[Router API Endpoints]
        Middleware[Middlewares Auth Validation Upload]
        Services[Services Audit Notification Export]
    end

    subgraph DB [Data and Storage Layer]
        Postgres[PostgreSQL Database]
        LocalStorage[Local Directory Uploads]
    end

    User --> Pages
    Pages --> Router
    Router --> Middleware
    Middleware --> Services
    Services --> Postgres
    Middleware --> LocalStorage
```

---

## 2. Use Case Diagram

### Gambar Diagram:
![Use Case Diagram](./diagrams/use_case_diagram.png)

### Kode Sumber Mermaid:
```mermaid
flowchart LR
    subgraph Actors [Aktor]
        Admin["Admin Sistem"]
        Verifikator["Verifikator (Inspektur/Sekretaris)"]
        Staff["Staff (Pencipta Arsip)"]
        Anggota["Anggota/Sub Bag (Penerima)"]
    end

    subgraph System ["Sistem SIPADI V2"]
        UC_Login(["Login / Autentikasi"])
        UC_Dashboard(["Monitoring Dashboard"])
        UC_Org(["Kelola Unit Organisasi"])
        UC_Users(["Kelola Data User"])
        UC_Upload(["Unggah & Buat Arsip Baru"])
        UC_Verify(["Verifikasi & Review Arsip"])
        UC_Comment(["Berikan Komentar Arsip"])
        UC_Disp(["Buat Disposisi Surat"])
        UC_UpdateDisp(["Update Status Disposisi"])
        UC_HistoryDisp(["Lihat Riwayat Disposisi"])
        UC_Loan(["Ajukan Peminjaman Arsip"])
        UC_ApproveLoan(["Persetujuan Peminjaman"])
        UC_Disposal(["Penyusutan & Pemusnahan Arsip"])
        UC_Report(["Cetak Laporan (PDF/Excel)"])
        UC_Audit(["Lihat Audit Logs"])
    end

    Admin --> UC_Login
    Admin --> UC_Org
    Admin --> UC_Users
    Admin --> UC_Audit

    Staff --> UC_Login
    Staff --> UC_Dashboard
    Staff --> UC_Upload
    Staff --> UC_Comment
    Staff --> UC_Loan

    Verifikator --> UC_Login
    Verifikator --> UC_Dashboard
    Verifikator --> UC_Verify
    Verifikator --> UC_Disp
    Verifikator --> UC_ApproveLoan
    Verifikator --> UC_Report
    Verifikator --> UC_Disposal

    Anggota --> UC_Login
    Anggota --> UC_Dashboard
    Anggota --> UC_UpdateDisp
    Anggota --> UC_HistoryDisp
    Anggota --> UC_Loan
```

---

## 3. Activity Diagram Login

### Kode Sumber Mermaid:
```mermaid
flowchart TD
    Start([Mulai]) --> Input[User input username/email dan password]
    Input --> ClientVal{Validasi Form di Frontend}

    ClientVal -- "Tidak Valid" --> ShowErrorFE[Tampilkan error format input]
    ShowErrorFE --> Input

    ClientVal -- "Valid" --> PostAPI[Kirim POST request ke /api/auth/login]
    PostAPI --> CheckDb{Cari user di Database & user.is_active = TRUE}

    CheckDb -- "Tidak Ditemukan / Tidak Aktif" --> Resp401[Kembalikan HTTP 401: Email/username salah]
    CheckDb -- "Ditemukan" --> CheckPass{Bcrypt compare password}

    CheckPass -- "Tidak Cocok" --> Resp401
    CheckPass -- "Cocok" --> GenJWT[Buat JWT Token & Set Sesi User]

    Resp401 --> ShowErrorBE[Tampilkan pesan error di layar login]
    ShowErrorBE --> Input

    GenJWT --> WriteLog[Tulis aktivitas LOGIN ke audit_logs]
    WriteLog --> ReturnToken[Kembalikan HTTP 200 dengan Token & Profil User]
    ReturnToken --> SetCookie[Simpan token di client cookie/localStorage]
    SetCookie --> Redirect[Redirect user ke Dashboard]
    Redirect --> End([Selesai])
```

---

## 4. Activity Diagram Arsip (Archive Management Workflow)

### Kode Sumber Mermaid:
```mermaid
flowchart TD
    Start([Mulai]) --> StaffInput[Staff isi form metadata arsip & upload file]
    StaffInput --> CheckSecurity{Pemeriksaan Aturan Keamanan & File}

    CheckSecurity -- "Rahasia tetapi file bukan PDF/TIFF" --> BlockUpload[Tampilkan error: Rahasia wajib PDF/TIFF]
    BlockUpload --> StaffInput

    CheckSecurity -- "File TIFF tetapi status bukan Rahasia" --> ForceSecret[Tampilkan error: File TIFF wajib Rahasia]
    ForceSecret --> StaffInput

    CheckSecurity -- "Valid" --> SaveFile[Simpan file ke direktori uploads/]
    SaveFile --> InsertDb[Simpan data ke tabel archives dengan status 'Menunggu Review']
    InsertDb --> AuditCreate[Catat ke audit_logs & buat Notifikasi Baru]

    AuditCreate --> WaitVerify[Menunggu Verifikasi Pimpinan / Verifikator]
    WaitVerify --> LeaderReview{Verifikator meninjau dokumen}

    LeaderReview -- "Tolak Dokumen" --> Reject[Update status arsip ke 'Ditolak']
    Reject --> NotifyCreatorReject[Kirim notifikasi penolakan ke pembuat arsip]
    NotifyCreatorReject --> StaffInput

    LeaderReview -- "Setujui Dokumen" --> Verify[Update status arsip ke 'Terverifikasi']
    Verify --> NotifyCreatorApprove[Kirim notifikasi persetujuan ke pembuat arsip]
    NotifyCreatorApprove --> End([Selesai])
```

---

## 5. Activity Diagram Disposisi (Disposition Workflow)

### Gambar Diagram:
![Activity Diagram Disposisi](./diagrams/activity_diagram_disposisi.png)

### Kode Sumber Mermaid:
```mermaid
flowchart TD
    Start([Mulai]) --> ViewArchive[Pimpinan lihat list arsip terverifikasi]
    ViewArchive --> OpenForm[Pimpinan pilih arsip & buka form disposisi]
    OpenForm --> FillForm[Isi tujuan user/unit, catatan instruksi, deadline]
    FillForm --> Submit[Kirim disposisi]

    Submit --> CheckRecipient{Tujuan user atau unit terisi?}
    CheckRecipient -- "Tidak" --> FormError[Tampilkan error: Pilih tujuan user/unit]
    FormError --> FillForm

    CheckRecipient -- "Ya" --> SaveDb[Simpan data ke tabel dispositions status 'Dikirim']
    SaveDb --> SaveHistory[Simpan riwayat awal ke disposition_history status 'Dikirim']
    SaveHistory --> CreateNotif[Buat Notifikasi Baru untuk Penerima]
    CreateNotif --> WriteAudit[Pencatatan log ke audit_logs]

    WriteAudit --> RecipientRead[Penerima terima notifikasi & buka detail disposisi]
    RecipientRead --> UpdateRead[Update status disposisi menjadi 'Dibaca' & catat riwayat]

    UpdateRead --> RecipientProcess[Penerima mulai mengerjakan tugas disposisi]
    RecipientProcess --> UpdateProcess[Update status disposisi menjadi 'Diproses' & catat riwayat]

    UpdateProcess --> RecipientDone[Penerima menyelesaikan tugas disposisi & isi catatan selesai]
    RecipientDone --> UpdateDone[Update status disposisi menjadi 'Selesai' & catat riwayat]
    UpdateDone --> End([Selesai])
```

---

## 6. Sequence Diagram Login

### Gambar Diagram:
![Sequence Diagram Login](./diagrams/sequence_diagram_login.png)

### Kode Sumber Mermaid:
```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Browser)
    participant Client as Next.js (Client Page)
    participant API as Express API Server (/login)
    participant DB as PostgreSQL Database
    participant Bcrypt as Bcrypt Utility
    participant Audit as Audit Log Service

    User->>Client: Input Username/Email & Password
    User->>Client: Klik tombol "Masuk"
    Client->>Client: Validasi skema input (Zod)

    Client->>API: HTTP POST /api/auth/login { identifier, password }
    API->>DB: Query user berdasarkan username/email (LOWER)
    DB-->>API: Data User (id, password_hash, role, unit_id, is_active)

    alt User tidak ditemukan atau nonaktif
        API-->>Client: HTTP 401 "Email/username atau password salah"
        Client-->>User: Tampilkan error "Gagal Masuk"
    else User aktif
        API->>Bcrypt: Compare (password, password_hash)
        Bcrypt-->>API: Match (True / False)

        alt Password tidak cocok
            API-->>Client: HTTP 401 "Email/username atau password salah"
            Client-->>User: Tampilkan error "Gagal Masuk"
        else Password cocok
            API->>API: Generate JWT Token (sub = user.id, role = user.role)
            API->>Audit: logActivity(LOGIN, user.id)
            Audit->>DB: INSERT INTO audit_logs
            DB-->>Audit: OK
            API-->>Client: HTTP 200 { token, userProfile }
            Client->>Client: Simpan token & userProfile di Cookies
            Client->>User: Redirect ke /dashboard
        end
    end
```

---

## 7. Sequence Diagram Disposisi (Disposition Flow)

### Gambar Diagram:
![Sequence Diagram Disposisi](./diagrams/sequence_diagram_disposisi.png)

### Kode Sumber Mermaid:
```mermaid
sequenceDiagram
    autonumber
    actor Leader as Pimpinan (Inspektur)
    participant Client as Next.js Client
    participant API as Express API Server (/dispositions)
    participant DB as PostgreSQL Database
    participant Notif as Notification Service
    actor Recipient as Penerima (Sub Bag/Staff)

    Leader->>Client: Pilih arsip terverifikasi & klik "Disposisi"
    Leader->>Client: Isi form (Pilih Target User/Unit, Catatan, Deadline)
    Leader->>Client: Kirim Form Disposisi

    Client->>API: HTTP POST /api/dispositions { archiveId, toUserId/toUnitId, note, deadline }
    API->>API: Validasi input & verifikasi hak akses arsip

    API->>DB: INSERT INTO dispositions (status: 'Dikirim')
    DB-->>API: Return disposition_id

    API->>DB: INSERT INTO disposition_history (status: 'Dikirim')
    DB-->>API: OK

    API->>Notif: createNotification(target, 'Disposisi Baru', message)
    Notif->>DB: INSERT INTO notifications
    DB-->>Notif: OK

    API->>DB: INSERT INTO audit_logs (CREATE, disposition, id)
    DB-->>API: OK

    API-->>Client: HTTP 201 { disposition, message: "Disposisi berhasil dikirim" }
    Client-->>Leader: Tampilkan notifikasi "Disposisi terkirim"

    Note over Recipient: Penerima melihat notifikasi disposisi
    Recipient->>Client: Klik notifikasi disposisi / buka detail
    Client->>API: HTTP PATCH /api/dispositions/:id/status { status: 'Dibaca' }
    API->>DB: UPDATE dispositions status = 'Dibaca'
    API->>DB: INSERT INTO disposition_history (status: 'Dibaca')
    API-->>Client: HTTP 200 (Status Updated)
```

---

## 8. Entity Relationship Diagram (ERD)

### Gambar Diagram:
![ERD Database](./diagrams/erd_database.png)

### Kode Sumber Mermaid:
```mermaid
erDiagram
    organization_units ||--o{ organization_units : "parent_id"
    organization_units ||--o{ users : "unit_id"
    organization_units ||--o{ archives : "unit_id"
    organization_units ||--o{ dispositions : "to_unit_id"

    users ||--o{ archives : "created_by"
    users ||--o{ archives : "verified_by"
    users ||--o{ archive_comments : "user_id"
    users ||--o{ dispositions : "from_user_id"
    users ||--o{ dispositions : "to_user_id"
    users ||--o{ disposition_history : "user_id"
    users ||--o{ audit_logs : "user_id"
    users ||--o{ archive_lifecycle_logs : "officer_id"
    users ||--o{ notifications : "user_id"
    users ||--o{ archive_loans : "user_id"
    users ||--o{ archive_loans : "approved_by"

    archives ||--o{ archive_comments : "archive_id"
    archives ||--o{ dispositions : "archive_id"
    archives ||--o{ archive_lifecycle_logs : "archive_id"
    archives ||--o{ archive_loans : "archive_id"

    dispositions ||--o{ disposition_history : "disposition_id"

    organization_units {
        int id PK
        varchar name
        varchar code UK
        int parent_id FK
        varchar unit_type
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    users {
        int id PK
        varchar name
        varchar username UK
        varchar email UK
        text password_hash
        varchar role
        int unit_id FK
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    archives {
        int id PK
        varchar title
        varchar document_number UK
        int unit_id FK
        varchar document_type
        varchar file_type
        int year
        varchar status
        varchar classification
        varchar archive_category
        text description
        text file_path
        text file_original_name
        int file_size
        int created_by FK
        int verified_by FK
        timestamptz verified_at
        varchar letter_number
        date archive_date
        varchar security_level
        int active_retention
        int inactive_retention
        varchar lifecycle_status
        varchar destruction_ba_number
        date destruction_date
        varchar destruction_method
        varchar destruction_officer
        text destruction_doc_path
        text destruction_photo_path
        timestamptz created_at
        timestamptz updated_at
    }

    archive_comments {
        int id PK
        int archive_id FK
        int user_id FK
        text comment
        timestamptz created_at
    }

    dispositions {
        int id PK
        int archive_id FK
        int from_user_id FK
        int to_user_id FK
        int to_unit_id FK
        text note
        date deadline
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    disposition_history {
        int id PK
        int disposition_id FK
        varchar status
        text note
        int user_id FK
        timestamptz created_at
    }

    audit_logs {
        int id PK
        int user_id FK
        varchar action
        varchar entity
        int entity_id
        jsonb metadata
        timestamptz created_at
    }

    archive_lifecycle_logs {
        int id PK
        int archive_id FK
        varchar stage
        timestamptz action_date
        int officer_id FK
        text notes
        boolean is_approved
        timestamptz created_at
    }

    notifications {
        int id PK
        int user_id FK
        varchar title
        text message
        varchar type
        int entity_id
        boolean is_read
        timestamptz created_at
    }

    archive_loans {
        int id PK
        int archive_id FK
        int user_id FK
        text reason
        varchar status
        text notes
        int approved_by FK
        timestamptz approved_at
        date loan_date
        date loan_deadline
        timestamptz created_at
        timestamptz updated_at
    }
```
