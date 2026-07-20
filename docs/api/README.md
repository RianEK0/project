# API Documentation

Dokumen ini adalah panduan manusia untuk seluruh surface API utama Enterprise HRIS. Untuk schema machine-readable, lihat [openapi.yaml](openapi.yaml).

## Base URL

- Local native: `http://localhost:8000/api/v1`
- Docker via Nginx: `http://localhost:8000/api/v1`

Health endpoint Laravel berada di luar prefix API:

- `GET /up`

## API Standards

### Content Type

- Request: `application/json`
- Response: `application/json`

Untuk upload file, gunakan `multipart/form-data`.

### Authentication

Endpoint private menggunakan header:

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### Response Envelope

Format umum:

```json
{
  "message": "Request completed successfully.",
  "data": {},
  "meta": {}
}
```

### Pagination

Collection endpoint mendukung:

- `page`
- `per_page`

Response `meta` umumnya berisi:

- `current_page`
- `last_page`
- `per_page`
- `total`
- `search`
- `sort`
- `filters`

### Filtering, Sorting, Search

Konvensi yang dipakai:

- Search: `search=<keyword>`
- Sorting: `sort_by=<field>&sort_direction=asc|desc`
- Filtering: parameter query per endpoint, misalnya `status`, `employee_id`, `stage`, dan seterusnya

### Common Status Codes

- `200 OK`
- `201 Created`
- `202 Accepted`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
- `429 Too Many Requests`

## Authentication Endpoints

### Public Auth

- `GET /auth/captcha`
  - Generate captcha untuk login atau forgot password
- `POST /auth/login`
  - Login dengan email, password, captcha
- `POST /auth/login/2fa`
  - Verifikasi challenge two factor login
- `POST /auth/refresh`
  - Rotasi refresh token dan issue access token baru
- `POST /auth/forgot-password`
  - Kirim reset password link
- `POST /auth/reset-password`
  - Reset password menggunakan token
- `GET /auth/email/verify/{id}/{hash}`
  - Verifikasi email lewat signed URL

### Protected Auth

- `GET /auth/me`
  - Profil user aktif
- `POST /auth/logout`
  - Logout session saat ini
- `POST /auth/email/verification-notification`
  - Kirim ulang email verification
- `GET /auth/sessions`
  - List active session user
- `DELETE /auth/sessions/others`
  - Revoke semua session selain session saat ini
- `DELETE /auth/sessions/{sessionId}`
  - Revoke session tertentu
- `GET /auth/login-history`
  - List riwayat login
- `POST /auth/two-factor/setup`
  - Mulai setup 2FA
- `POST /auth/two-factor/confirm`
  - Konfirmasi setup 2FA dengan TOTP code
- `DELETE /auth/two-factor`
  - Disable 2FA dengan password dan code/recovery code
- `POST /auth/change-password`
  - Ubah password

## Dashboard

- `GET /dashboard`
  - Executive dashboard summary

## Access Control

- `GET /access-control`
  - Overview role, permission, dan user access
- `PUT /access-control/roles/{role}/permissions`
  - Sinkronisasi permission pada role
- `PUT /access-control/users/{user}/roles`
  - Sinkronisasi role pada user

## Workforce

- `GET /departments`
  - Department directory
- `GET /employees/lookups`
  - Lookup data untuk employee form
- `GET /employees/{employee}/audit-logs`
  - Audit log spesifik employee
- `POST /employees/{employee}/documents`
  - Upload dokumen employee
- `DELETE /employees/{employee}/documents/{document}`
  - Hapus dokumen employee
- `GET /employees`
  - List employee
- `POST /employees`
  - Create employee
- `GET /employees/{employee}`
  - Detail employee
- `PUT /employees/{employee}`
  - Full update employee
- `PATCH /employees/{employee}`
  - Partial update employee
- `DELETE /employees/{employee}`
  - Archive employee

### Workforce Common Filters

- `department_id`
- `branch_id`
- `employment_status`
- `employment_type`
- `manager_id`

### Workforce Common Sorts

- `employee_number`
- `full_name`
- `hire_date`
- `employment_status`
- `created_at`

## Organization

- `GET /organization/structure`
  - Full organization structure
- `GET /organization/lookups`
  - Lookup hierarchy data
- `POST /organization/units`
  - Create company/branch/department/division/section/position unit
- `GET /teams`
  - Team list
- `POST /teams`
  - Create team

## Leave

- `GET /leave-types`
  - Leave type catalog
- `GET /leave-overview`
  - Leave workspace overview
- `GET /leave-calendar`
  - Leave calendar and holiday timeline
- `GET /leave-requests`
  - List leave requests
- `POST /leave-requests`
  - Submit leave request
- `GET /approvals/inbox`
  - Pending leave approval inbox
- `POST /leave-requests/{leaveRequest}/approve`
  - Approve leave request
- `POST /leave-requests/{leaveRequest}/reject`
  - Reject leave request

### Leave Common Filters

- `status`
- `employee_id`
- `leave_type_id`
- `start_date`
- `end_date`

## Attendance

- `GET /attendance/overview`
  - Attendance workspace overview
- `GET /attendance/lookups`
  - Lookup for employees, shifts, holidays
- `GET /attendance`
  - Attendance records list
- `GET /attendance/report`
  - Attendance report summary and paginated records
- `POST /attendance/clock-in`
  - Clock in
- `POST /attendance/clock-out`
  - Clock out
- `POST /attendance/manual`
  - Manual attendance entry
- `GET /attendance/corrections`
  - List correction request
- `POST /attendance/corrections`
  - Submit correction request
- `GET /attendance/approvals`
  - Pending correction approvals
- `POST /attendance/corrections/{correction}/approve`
  - Approve correction
- `POST /attendance/corrections/{correction}/reject`
  - Reject correction
- `GET /attendance/shifts`
  - List shift config
- `POST /attendance/shifts`
  - Save shift config
- `POST /attendance/shift-assignments`
  - Assign shift to employee
- `GET /attendance/holidays`
  - List holiday config
- `POST /attendance/holidays`
  - Save holiday config

### Attendance Common Filters

- `employee_id`
- `shift_id`
- `status`
- `start_date`
- `end_date`
- `late_only`
- `holiday_only`
- `weekend_only`

## Payroll

- `GET /payroll/overview`
  - Payroll workspace overview
- `GET /payroll/lookups`
  - Payroll lookup data
- `GET /payroll/runs`
  - List payroll run
- `POST /payroll/runs`
  - Generate payroll run
- `GET /payroll/runs/{payrollRun}`
  - Detail payroll run
- `POST /payroll/runs/{payrollRun}/approve`
  - Approve payroll run
- `POST /payroll/runs/{payrollRun}/reject`
  - Reject payroll run
- `GET /payroll/runs/{payrollRun}/export/pdf`
  - Export payroll run PDF
- `GET /payroll/runs/{payrollRun}/export/excel`
  - Export payroll run Excel
- `GET /payroll/approvals`
  - Payroll approval inbox
- `GET /payroll/payslips`
  - Payslip list
- `PUT /payroll/items/{payrollItem}`
  - Update payroll item adjustment
- `GET /payroll/payslips/{payrollItem}/pdf`
  - Download individual payslip PDF

## Recruitment

- `GET /recruitment/overview`
  - Recruitment dashboard summary
- `GET /recruitment/lookups`
  - Recruitment lookup data
- `GET /recruitment/vacancies`
  - List vacancy
- `POST /recruitment/vacancies`
  - Create vacancy
- `GET /recruitment/candidates`
  - List candidates
- `POST /recruitment/candidates`
  - Create candidate
- `POST /recruitment/candidates/{candidate}/update`
  - Legacy update route for candidate
- `PUT /recruitment/candidates/{candidate}`
  - Update candidate
- `PATCH /recruitment/candidates/{candidate}`
  - Partial update candidate
- `GET /recruitment/applications`
  - List applications
- `GET /recruitment/applications/{application}`
  - Application detail
- `POST /recruitment/applications/{application}/update`
  - Legacy update route for application
- `PUT /recruitment/applications/{application}`
  - Update application
- `PATCH /recruitment/applications/{application}`
  - Partial update application
- `GET /recruitment/interviews/schedule`
  - Interview schedule list
- `POST /recruitment/applications/{application}/interviews`
  - Schedule interview
- `POST /recruitment/applications/{application}/assessments`
  - Record assessment
- `POST /recruitment/applications/{application}/hire`
  - Hire candidate and convert to employee

## Performance

- `GET /performance/overview`
  - Performance summary
- `GET /performance/lookups`
  - Performance lookup data
- `GET /performance/cycles`
  - List cycles
- `POST /performance/cycles`
  - Create cycle
- `GET /performance/goals`
  - List goals
- `POST /performance/goals`
  - Create goal
- `POST /performance/goals/{goal}/update`
  - Legacy update route for goal
- `PUT /performance/goals/{goal}`
  - Update goal
- `PATCH /performance/goals/{goal}`
  - Partial update goal
- `GET /performance/reviews`
  - List reviews
- `GET /performance/reviews/{review}`
  - Review detail
- `POST /performance/reviews`
  - Create review
- `POST /performance/reviews/{review}/employee-review`
  - Submit employee review
- `POST /performance/reviews/{review}/manager-review`
  - Submit manager review
- `POST /performance/reviews/{review}/feedback`
  - Record 360 feedback or stakeholder feedback

## IT Assets

- `GET /assets/overview`
  - Asset workspace overview
- `GET /assets/lookups`
  - Asset lookup data
- `GET /assets`
  - List assets
- `POST /assets`
  - Create asset
- `GET /assets/{asset}`
  - Asset detail
- `POST /assets/{asset}/assignments`
  - Assign asset
- `POST /assets/assignments/{assignment}/return`
  - Return asset
- `POST /assets/{asset}/maintenance`
  - Record maintenance

## Notifications

- `GET /notifications/overview`
  - Notification center overview
- `GET /notifications/lookups`
  - Notification lookup data
- `GET /notifications/inbox`
  - List user inbox notifications
- `POST /notifications/inbox/read-all`
  - Mark all inbox notifications as read
- `POST /notifications/inbox/{notification}/read`
  - Mark single notification as read
- `GET /notifications/deliveries`
  - Delivery log
- `PUT /notifications/channels/{channelConfig}`
  - Update notification channel config
- `POST /notifications/broadcast`
  - Broadcast workspace notification

## Governance

- `GET /audit-logs`
  - System audit log list

## Example Collection Query

```http
GET /api/v1/employees?search=nadia&department_id=1&sort_by=hire_date&sort_direction=desc&per_page=10&page=1
Authorization: Bearer <access_token>
Accept: application/json
```

## Example Auth Login Request

```json
{
  "email": "rafi.saputra@enterprise-hris.local",
  "password": "Password123!",
  "captcha_id": "01K0....",
  "captcha_answer": "493821"
}
```

## Notes

- Beberapa update route mempertahankan endpoint legacy `POST .../update` untuk kompatibilitas klien lama.
- Route matrix pada dokumen ini mengikuti file `backend/routes/api.php` yang aktif saat dokumentasi diperbarui pada Monday, July 20, 2026.
