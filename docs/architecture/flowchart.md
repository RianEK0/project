# Flowchart

Dokumen ini merangkum alur sistem utama dalam bentuk Mermaid flowchart.

## System Request Flow

```mermaid
flowchart LR
    User[User Browser or Mobile Web] --> Frontend[React Frontend]
    Frontend --> Nginx[Nginx Gateway]
    Nginx --> Laravel[Laravel API]
    Laravel --> Postgres[(PostgreSQL)]
    Laravel --> Redis[(Redis)]
    Laravel --> Mailpit[Mailpit or SMTP]
    Laravel --> Queue[Queue Worker]
    Laravel --> Scheduler[Scheduler]
    Queue --> Mailpit
    Queue --> Postgres
    Scheduler --> Laravel
```

## Authentication and Session Flow

```mermaid
flowchart TD
    Start[User opens login page] --> Captcha[Request CAPTCHA]
    Captcha --> Submit[Submit email, password, captcha]
    Submit --> CheckCreds{Credentials valid?}
    CheckCreds -- No --> Reject[Return 422 and record login failure]
    CheckCreds -- Yes --> CheckVerify{Email verified?}
    CheckVerify -- No --> SendVerify[Send verification email and return 403]
    CheckVerify -- Yes --> Check2FA{2FA enabled?}
    Check2FA -- No --> IssueTokens[Issue access token, refresh token, auth session]
    Check2FA -- Yes --> Challenge[Return 2FA challenge]
    Challenge --> Verify2FA[Submit TOTP or recovery code]
    Verify2FA --> TwoFactorValid{2FA valid?}
    TwoFactorValid -- No --> Fail2FA[Record failure and return 422]
    TwoFactorValid -- Yes --> IssueTokens
    IssueTokens --> Access[Access protected API]
    Access --> Refresh[Refresh token rotation]
    Access --> Logout[Logout or revoke session]
```

## Workforce and Approval Flow

```mermaid
flowchart TD
    HR[HR or System Admin] --> EmployeeCreate[Create or update employee]
    EmployeeCreate --> AuditEmp[Write audit log]
    EmployeeCreate --> NotifyEmp[Queue employee notification]

    Employee[Employee] --> LeaveReq[Submit leave request]
    LeaveReq --> LeaveApproval1[Manager approval stage]
    LeaveApproval1 --> LeaveApproval2[HR approval stage]
    LeaveApproval2 --> LeaveBalance[Update leave balance]
    LeaveApproval2 --> LeaveAudit[Write audit log]
    LeaveApproval2 --> LeaveNotify[Send approval notification]

    Employee --> AttendanceClock[Clock in or out]
    AttendanceClock --> AttendanceStore[Store attendance record]
    AttendanceStore --> AttendanceAudit[Write audit log]
    AttendanceStore --> AttendanceReport[Attendance overview and reporting]
```

## Recruitment to Hiring Flow

```mermaid
flowchart TD
    Recruiter[Recruitment Officer] --> Vacancy[Create vacancy]
    Vacancy --> Candidate[Register candidate]
    Candidate --> Application[Create application]
    Application --> Interview[Schedule interview]
    Interview --> Assessment[Record assessment]
    Assessment --> Offer[Move to offer stage]
    Offer --> Hire[Hire candidate]
    Hire --> EmployeeRecord[Create employee record]
    EmployeeRecord --> SalaryContract[Create salary and contract history]
    SalaryContract --> AuditRecruitment[Write audit log]
```

## Payroll Flow

```mermaid
flowchart TD
    PayrollOfficer[Payroll Officer] --> Run[Generate payroll run]
    Run --> Items[Create payroll items]
    Items --> ApprovalHR[HR approval]
    ApprovalHR --> ApprovalAdmin[Super admin approval]
    ApprovalAdmin --> Payslip[Payslip available]
    Payslip --> ExportPDF[Export PDF]
    Payslip --> ExportExcel[Export Excel]
    Run --> PayrollAudit[Write audit log]
```
