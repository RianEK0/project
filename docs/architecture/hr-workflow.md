# HR / People Operations Workflow Foundation

Fondasi HR / People Operations NovaERP menyiapkan workspace internal untuk people master, absensi, cuti, payroll, talent pipeline, pengembangan, dan struktur organisasi tanpa memecah domain ke sistem terpisah terlalu dini.

## Scope

- employee dan department master,
- attendance, leave, payroll, dan shift starter,
- recruitment pipeline foundation,
- performance review dan KPI scorecard starter,
- training catalog dan organization chart starter.

## Workflow

1. Candidate masuk ke recruitment pipeline sampai status hired.
2. Employee record dibentuk dan ditempatkan ke department, reporting line, dan shift context.
3. Attendance dan leave membentuk sinyal operasional harian untuk payroll cut-off.
4. Payroll merangkum kompensasi, allowance, deduction, dan approval sebelum handoff finance.
5. Performance, training, dan KPI menjadi loop pengembangan berkelanjutan.
6. Organization chart menyatukan struktur formal agar manager dan HR membaca ownership dengan cepat.

## Integration Boundaries

- `RolesModule`, `PermissionsModule`, dan tenant organization tetap menjadi sumber RBAC dan struktur akses.
- Payroll foundation pada sprint ini belum menghasilkan journal entry final; handoff finance tetap berada di bounded context `Finance`.
- Department dan organization chart tidak menggantikan `Organization` atau `Workspace`; keduanya hanya menambah struktur people operations di dalam tenant yang sama.

## Non-Goals

- statutory payroll filing,
- biometric attendance device integration production,
- applicant portal publik,
- performance calibration automation penuh,
- succession planning dan talent marketplace.
