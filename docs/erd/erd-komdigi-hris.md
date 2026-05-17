# ERD Database Komdigi HRIS

## Entity Relationship Diagram

```mermaid
erDiagram
    ROLE ||--o{ USER : has
    DIREKTORAT ||--o{ DIVISI : contains
    DIREKTORAT ||--o{ USER : has
    DIVISI ||--o{ USER : has
    USER ||--o{ ATTENDANCE : records
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ ACTIVITY_LOG : creates
    DIREKTORAT ||--o{ PROJECT : owns
    DIVISI ||--o{ PROJECT : owns
    USER ||--o{ PROJECT_MEMBER : assigned
    PROJECT ||--o{ PROJECT_MEMBER : contains

    ROLE {
        int id PK
        string name
    }

    DIREKTORAT {
        int id PK
        string name
        string color
    }

    DIVISI {
        int id PK
        string name
        int direktoratId FK
    }

    USER {
        int id PK
        string name
        string email
        string password
        string position
        string photo
        string faceDescriptor
        datetime faceEnrolledAt
        int roleId FK
        int direktoratId FK
        int divisiId FK
        float lat
        float lng
        datetime lastActive
        datetime createdAt
        datetime updatedAt
    }

    ATTENDANCE {
        int id PK
        int userId FK
        datetime timeIn
        datetime timeOut
        string photoIn
        string photoOut
        float lat
        float lng
        string status
        boolean isValid
        string note
        datetime createdAt
        datetime updatedAt
    }

    NOTIFICATION {
        int id PK
        string title
        string message
        string type
        boolean isRead
        int userId FK
        string roleScope
        string meta
        datetime createdAt
        datetime updatedAt
    }

    ACTIVITY_LOG {
        int id PK
        string action
        string description
        string entityType
        int entityId
        int userId FK
        datetime createdAt
    }

    PROJECT {
        int id PK
        string name
        string description
        datetime startDate
        datetime endDate
        string status
        int progress
        int direktoratId FK
        int divisiId FK
        datetime createdAt
        datetime updatedAt
    }

    PROJECT_MEMBER {
        int id PK
        int userId FK
        int projectId FK
    }
```

## Penjelasan Relasi

- `Role` ke `User`: satu role dapat dimiliki banyak user.
- `Direktorat` ke `Divisi`: satu direktorat memiliki banyak divisi.
- `Direktorat` ke `User`: satu direktorat memiliki banyak user.
- `Divisi` ke `User`: satu divisi memiliki banyak user.
- `User` ke `Attendance`: satu user memiliki banyak data absensi.
- `User` ke `Notification`: user dapat menerima banyak notifikasi.
- `User` ke `ActivityLog`: aktivitas user dicatat dalam banyak log.
- `Project` ke `ProjectMember`: satu proyek memiliki banyak anggota.
- `User` ke `ProjectMember`: satu user dapat bergabung di banyak proyek.

## Catatan Desain

- `faceDescriptor` menyimpan data biometrik wajah untuk proses pencocokan saat absensi.
- `roleScope` pada notifikasi dipakai untuk broadcast notifikasi berdasarkan role.
- `meta` dipakai untuk data tambahan yang fleksibel, misalnya ID absensi bermasalah.
