# ERD

The ERD below summarizes the core database relationships in Enterprise HRIS. The diagrams are split by domain to keep them readable.

## Identity and Access

```mermaid
erDiagram
    USERS ||--o{ ROLE_USER : has
    ROLES ||--o{ ROLE_USER : assigned_to
    ROLES ||--o{ PERMISSION_ROLE : grants
    PERMISSIONS ||--o{ PERMISSION_ROLE : linked_to
    USERS ||--o{ AUTH_SESSIONS : owns
    AUTH_SESSIONS ||--o{ AUTH_REFRESH_TOKENS : rotates
    USERS ||--o{ LOGIN_HISTORIES : records
    USERS ||--o{ PASSWORD_HISTORIES : keeps

    USERS {
        bigint id PK
        string name
        string email UK
        string status
        timestamp email_verified_at
        timestamp locked_until
    }

    ROLES {
        bigint id PK
        string name UK
        string label
    }

    PERMISSIONS {
        bigint id PK
        string code UK
        string group
        string label
    }

    AUTH_SESSIONS {
        string id PK
        bigint user_id FK
        string device_name
        boolean remember
        timestamp expires_at
    }
```

## Workforce and Organization

```mermaid
erDiagram
    COMPANIES ||--o{ BRANCHES : owns
    BRANCHES ||--o{ DEPARTMENTS : contains
    DEPARTMENTS ||--o{ DIVISIONS : contains
    DIVISIONS ||--o{ SECTIONS : contains
    DIVISIONS ||--o{ POSITIONS : offers
    SECTIONS ||--o{ POSITIONS : refines
    DEPARTMENTS ||--o{ TEAMS : owns
    USERS ||--o| EMPLOYEES : linked_account
    BRANCHES ||--o{ EMPLOYEES : assigns
    DEPARTMENTS ||--o{ EMPLOYEES : groups
    DIVISIONS ||--o{ EMPLOYEES : maps
    SECTIONS ||--o{ EMPLOYEES : maps
    POSITIONS ||--o{ EMPLOYEES : positions
    TEAMS ||--o{ EMPLOYEES : teams
    EMPLOYEES ||--o{ EMPLOYEES : manages
    EMPLOYEES ||--o{ EMPLOYEE_SALARY_HISTORIES : salary_history
    EMPLOYEES ||--o{ EMPLOYEE_CONTRACTS : contract_history
    EMPLOYEES ||--o{ EMPLOYEE_DOCUMENTS : documents

    EMPLOYEES {
        bigint id PK
        string employee_number UK
        bigint user_id FK
        bigint branch_id FK
        bigint department_id FK
        bigint division_id FK
        bigint section_id FK
        bigint position_id FK
        bigint team_id FK
        bigint manager_id FK
        string employment_type
        string employment_status
    }
```

## Leave and Attendance

```mermaid
erDiagram
    EMPLOYEES ||--o{ LEAVE_BALANCES : has
    LEAVE_TYPES ||--o{ LEAVE_BALANCES : budgeted_by
    EMPLOYEES ||--o{ LEAVE_REQUESTS : submits
    LEAVE_TYPES ||--o{ LEAVE_REQUESTS : categorizes
    LEAVE_REQUESTS ||--o{ LEAVE_APPROVALS : routes
    USERS ||--o{ LEAVE_APPROVALS : acts

    ATTENDANCE_SHIFTS ||--o{ ATTENDANCE_SHIFT_ASSIGNMENTS : assigned
    EMPLOYEES ||--o{ ATTENDANCE_SHIFT_ASSIGNMENTS : receives
    EMPLOYEES ||--o{ ATTENDANCE_RECORDS : owns
    ATTENDANCE_SHIFTS ||--o{ ATTENDANCE_RECORDS : applies
    ATTENDANCE_HOLIDAYS ||--o{ ATTENDANCE_RECORDS : marks
    ATTENDANCE_RECORDS ||--o{ ATTENDANCE_CORRECTIONS : corrected_by
    EMPLOYEES ||--o{ ATTENDANCE_CORRECTIONS : requests

    LEAVE_REQUESTS {
        bigint id PK
        bigint employee_id FK
        bigint leave_type_id FK
        string status
        date start_date
        date end_date
    }

    ATTENDANCE_RECORDS {
        bigint id PK
        bigint employee_id FK
        bigint attendance_shift_id FK
        bigint attendance_holiday_id FK
        date attendance_date
        string status
    }
```

## Payroll, Recruitment, Performance, Assets, Notifications

```mermaid
erDiagram
    PAYROLL_RUNS ||--o{ PAYROLL_ITEMS : contains
    PAYROLL_RUNS ||--o{ PAYROLL_RUN_APPROVALS : routes
    EMPLOYEES ||--o{ PAYROLL_ITEMS : paid_to
    USERS ||--o{ PAYROLL_RUN_APPROVALS : approves

    RECRUITMENT_VACANCIES ||--o{ RECRUITMENT_APPLICATIONS : receives
    RECRUITMENT_CANDIDATES ||--o{ RECRUITMENT_APPLICATIONS : submits
    RECRUITMENT_APPLICATIONS ||--o{ RECRUITMENT_INTERVIEWS : schedules
    RECRUITMENT_APPLICATIONS ||--o{ RECRUITMENT_ASSESSMENTS : evaluates
    RECRUITMENT_APPLICATIONS ||--o| EMPLOYEES : converts_to

    PERFORMANCE_CYCLES ||--o{ PERFORMANCE_GOALS : contains
    PERFORMANCE_CYCLES ||--o{ PERFORMANCE_REVIEWS : contains
    EMPLOYEES ||--o{ PERFORMANCE_GOALS : owns
    EMPLOYEES ||--o{ PERFORMANCE_REVIEWS : reviewed
    PERFORMANCE_REVIEWS ||--o{ PERFORMANCE_FEEDBACK : collects

    IT_ASSETS ||--o{ IT_ASSET_ASSIGNMENTS : assigned
    IT_ASSETS ||--o{ IT_ASSET_MAINTENANCES : maintained
    EMPLOYEES ||--o{ IT_ASSET_ASSIGNMENTS : receives

    USERS ||--o{ NOTIFICATIONS : receives
    NOTIFICATION_CHANNEL_CONFIGS ||--o{ NOTIFICATION_DELIVERY_LOGS : drives
    USERS ||--o{ NOTIFICATION_DELIVERY_LOGS : targets

    PAYROLL_ITEMS {
        bigint id PK
        bigint payroll_run_id FK
        bigint employee_id FK
        decimal gross_amount
        decimal net_amount
    }

    RECRUITMENT_APPLICATIONS {
        bigint id PK
        bigint recruitment_candidate_id FK
        bigint recruitment_vacancy_id FK
        string stage
        string status
    }
```

## Governance and Cross-Cutting Audit

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOGS : acts

    AUDIT_LOGS {
        bigint id PK
        bigint actor_id FK
        string action
        string auditable_type
        bigint auditable_id
        string ip_address
        json old_values
        json new_values
        string user_agent
    }
```

## Notes

- `notifications` uses Laravel's built-in notifiable pattern, so its relationship is polymorphic.
- `audit_logs` is also polymorphic through the `auditable_type` and `auditable_id` pair.
- Framework tables such as `jobs`, `cache`, `failed_jobs`, and `sessions` are not shown in full above because they are not core HRIS domain tables, even though they still exist in the project schema.
