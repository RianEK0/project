# Platform Workspace

## Scope

Platform workspace menjadi control plane enterprise NovaERP untuk capability tenant topology, tenant experience, dan identity trust. Sprint ini menyiapkan:

- multi company, multi branch, dan multi warehouse control lane,
- multi currency, multi language, dan timezone readiness lane,
- white label dan theme builder starter,
- marketplace, plugin system, dan extension SDK governance lane,
- audit center, compliance, SSO, OAuth, dan SAML readiness lane,
- no-code form builder untuk form, survey, approval, checklist, inspection, dan custom module,
- low-code app builder ala Retool untuk membangun internal tools dengan komponen visual,
- global enterprise planner untuk rollout 1.000 company, 10.000 branch, 100.000 user, dan unlimited enterprise surfaces,
- enterprise cloud workbench untuk subscription, billing, usage, tenant, region, backup, restore, monitoring, audit, security, CDN, storage, queue, worker, dan scaling,
- DevOps platform untuk Docker, Kubernetes, Helm, Terraform, GitHub Actions, GitLab CI, monitoring, Grafana, Prometheus, ELK, Sentry, dan OpenTelemetry,
- enterprise security workbench untuk zero trust, MFA, passkey, SSO, OAuth, SAML, device management, IP restriction, audit center, compliance, encryption, dan secrets vault,
- plugin marketplace untuk paket vertikal eksternal dengan install satu klik,
- public API workbench untuk REST, GraphQL, webhook, dan SDK multi-language,
- NovaOS workbench untuk workflow studio, AI studio, extension marketplace, theme builder, white label, event bus, API gateway, real-time collaboration, feature flags, observability center, dan tenant migration.

## Design Notes

- Workspace `/app/platform` menjadi titik masuk tunggal untuk enterprise admin tanpa menggandakan module organisasi, settings, auth, audit log, integrations, atau low-code runtime domain.
- Preview API dipisah menjadi topology, experience, dan identity agar area readiness bisa berkembang per lane tanpa memecah workspace menjadi banyak module kecil.
- Shared contract menyiapkan capability key, area, status, permission, dan document type untuk evolusi company network, branding profile, extension registry, serta identity provider connection.
- Detail route per capability diarahkan ke domain yang relevan seperti organization, warehouse, finance, audit, integrations, dan developer surfaces agar platform workspace tetap menjadi control surface, bukan workspace transaksi baru.

## Frontend Shape

- `/app/platform`
- `/app/platform/multi-company`
- `/app/platform/multi-branch`
- `/app/platform/multi-warehouse`
- `/app/platform/multi-currency`
- `/app/platform/multi-language`
- `/app/platform/timezone`
- `/app/platform/white-label`
- `/app/platform/theme-builder`
- `/app/platform/marketplace`
- `/app/platform/plugin-system`
- `/app/platform/extension-sdk`
- `/app/platform/audit-center`
- `/app/platform/compliance`
- `/app/platform/sso`
- `/app/platform/oauth`
- `/app/platform/saml`
- `/app/platform/form-builder`
- `/app/platform/low-code-builder`
- `/app/platform/global-enterprise`
- `/app/platform/enterprise-cloud`
- `/app/platform/devops-platform`
- `/app/platform/enterprise-security`
- `/app/platform/plugin-marketplace`
- `/app/platform/public-api`
- `/app/platform/nova-os`

## API Shape

- `GET /api/v1/platform-workspace`
- `GET /api/v1/platform-workspace/topology-preview`
- `GET /api/v1/platform-workspace/experience-preview`
- `GET /api/v1/platform-workspace/identity-preview`
- `GET /api/v1/form-builder`
- `POST /api/v1/form-builder/preview`
- `GET /api/v1/low-code-builder`
- `POST /api/v1/low-code-builder/preview`
- `GET /api/v1/global-enterprise`
- `POST /api/v1/global-enterprise/preview`
- `GET /api/v1/enterprise-cloud`
- `POST /api/v1/enterprise-cloud/preview`
- `GET /api/v1/devops-platform`
- `POST /api/v1/devops-platform/preview`
- `GET /api/v1/enterprise-security`
- `POST /api/v1/enterprise-security/preview`
- `GET /api/v1/plugin-marketplace`
- `POST /api/v1/plugin-marketplace/install-preview`
- `GET /api/v1/public-api`
- `POST /api/v1/public-api/access-preview`
- `GET /api/v1/nova-os`
- `POST /api/v1/nova-os/preview`
