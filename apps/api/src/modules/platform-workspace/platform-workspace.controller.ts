import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  platformCapabilityKeys,
  platformCapabilityStatuses,
  platformWorkspaceAreas,
} from '@nova/shared-types';

import { PlatformExperienceService } from './platform-experience.service';
import { PlatformIdentityService } from './platform-identity.service';
import { PlatformTopologyService } from './platform-topology.service';

@ApiTags('Platform Workspace')
@Controller({
  path: 'platform-workspace',
  version: '1',
})
export class PlatformWorkspaceController {
  constructor(
    private readonly platformTopologyService: PlatformTopologyService,
    private readonly platformExperienceService: PlatformExperienceService,
    private readonly platformIdentityService: PlatformIdentityService,
  ) {}

  @Get()
  getWorkspace() {
    return {
      capabilities: platformCapabilityKeys,
      areas: platformWorkspaceAreas,
      statuses: platformCapabilityStatuses,
      cards: [
        {
          id: 'topology',
          label: 'Topology',
          route: '/app/platform/multi-company',
          description:
            'Multi-company, branch, warehouse, currency, language, timezone, and global-scale rollout controls for enterprise tenant shape.',
        },
        {
          id: 'experience',
          label: 'Experience',
          route: '/app/platform/white-label',
          description:
            'White label, theme builder, marketplace, plugin system, extension SDK, and one-click plugin distribution as governed customization rails.',
        },
        {
          id: 'identity-trust',
          label: 'Identity And Trust',
          route: '/app/platform/audit-center',
          description:
            'Audit center, compliance, SSO, OAuth, and SAML readiness for enterprise security posture.',
        },
      ],
      relatedRoutes: [
        { label: 'Form Builder', route: '/app/platform/form-builder' },
        { label: 'Low Code Builder', route: '/app/platform/low-code-builder' },
        { label: 'Global Enterprise', route: '/app/platform/global-enterprise' },
        { label: 'Enterprise Cloud', route: '/app/platform/enterprise-cloud' },
        { label: 'DevOps Platform', route: '/app/platform/devops-platform' },
        { label: 'Enterprise Security', route: '/app/platform/enterprise-security' },
        { label: 'Plugin Marketplace', route: '/app/platform/plugin-marketplace' },
        { label: 'Public API', route: '/app/platform/public-api' },
        { label: 'NovaOS', route: '/app/platform/nova-os' },
        { label: 'Organization', route: '/app/organization' },
        { label: 'Workspaces', route: '/app/workspaces' },
        { label: 'Warehouses', route: '/app/warehouses' },
        { label: 'Currencies', route: '/app/finance/currencies' },
        { label: 'Audit Logs', route: '/app/audit-logs' },
        { label: 'Integrations', route: '/app/integrations' },
      ],
    };
  }

  @Get('topology-preview')
  getTopologyPreview() {
    return this.platformTopologyService.previewReadiness({
      controlsExpected: 6,
      companyScopePct: 88,
      branchCoveragePct: 84,
      warehouseCoveragePct: 91,
      localeCoveragePct: 79,
      controls: [
        {
          key: 'MULTI_COMPANY',
          label: 'Multi Company',
          readinessPct: 90,
          policyReady: true,
          routeCount: 4,
          primaryUseCase:
            'Support multiple legal entities with isolated defaults and reporting scope.',
          nextFocus:
            'Formalize cross-company shared service policies before opening 1,000-company global rollout packs.',
        },
        {
          key: 'MULTI_BRANCH',
          label: 'Multi Branch',
          readinessPct: 88,
          policyReady: true,
          routeCount: 4,
          primaryUseCase: 'Operate branches with local operational defaults and route visibility.',
          nextFocus:
            'Add branch-level policy and approval templates for 10,000-branch provisioning waves.',
        },
        {
          key: 'MULTI_WAREHOUSE',
          label: 'Multi Warehouse',
          readinessPct: 92,
          policyReady: true,
          routeCount: 4,
          primaryUseCase: 'Coordinate multiple warehouses inside tenant topology and planning.',
          nextFocus: 'Extend warehouse default packs for unlimited warehouse and store rollout.',
        },
        {
          key: 'MULTI_CURRENCY',
          label: 'Multi Currency',
          readinessPct: 79,
          policyReady: true,
          routeCount: 3,
          primaryUseCase: 'Prepare pricing, finance, and settlement for global tenant operations.',
          nextFocus:
            'Tighten document-level currency guardrails across order and procurement flows as unlimited currency catalogs expand.',
        },
        {
          key: 'MULTI_LANGUAGE',
          label: 'Multi Language',
          readinessPct: 74,
          policyReady: true,
          routeCount: 3,
          primaryUseCase: 'Enable multilingual shell and tenant-facing experience.',
          nextFocus:
            'Add dictionary and fallback policy for unlimited language packs on high-traffic operational surfaces.',
        },
        {
          key: 'TIMEZONE',
          label: 'Timezone',
          readinessPct: 80,
          policyReady: true,
          routeCount: 4,
          primaryUseCase: 'Keep scheduling, reporting, and audit times consistent across regions.',
          nextFocus:
            'Propagate timezone defaults into reporting, automation, and public API surfaces.',
        },
      ],
    });
  }

  @Get('experience-preview')
  getExperiencePreview() {
    return this.platformExperienceService.previewReadiness({
      controlsExpected: 5,
      brandingCoveragePct: 74,
      marketplaceReadinessPct: 58,
      extensionGovernancePct: 67,
      controls: [
        {
          key: 'WHITE_LABEL',
          label: 'White Label',
          readinessPct: 78,
          governanceReady: true,
          routeCount: 2,
          primaryUseCase:
            'Customize tenant brand, naming, and delivery shell without forking the product.',
          nextFocus:
            'Add tenant brand pack validation before enabling self-serve white label edits.',
        },
        {
          key: 'THEME_BUILDER',
          label: 'Theme Builder',
          readinessPct: 71,
          governanceReady: true,
          routeCount: 2,
          primaryUseCase: 'Tune visual tokens and shell presentation per tenant or partner.',
          nextFocus: 'Expand token presets and preview coverage for dashboard and portal surfaces.',
        },
        {
          key: 'MARKETPLACE',
          label: 'Marketplace',
          readinessPct: 72,
          governanceReady: true,
          routeCount: 4,
          primaryUseCase: 'Surface approved add-ons and connectors for tenant discovery.',
          nextFocus:
            'Define publishing review, pricing policy, and one-click install guardrails before exposing a broader public plugin catalog.',
        },
        {
          key: 'PLUGIN_SYSTEM',
          label: 'Plugin System',
          readinessPct: 78,
          governanceReady: true,
          routeCount: 4,
          primaryUseCase: 'Allow governed extensions to add behavior and control surfaces.',
          nextFocus:
            'Harden sandbox and permission manifest review before opening plugin publishing to external developers.',
        },
        {
          key: 'EXTENSION_SDK',
          label: 'Extension SDK',
          readinessPct: 76,
          governanceReady: true,
          routeCount: 4,
          primaryUseCase:
            'Give partners a guided SDK and public API contract for approved extensions and marketplace apps.',
          nextFocus:
            'Finalize packaging, signing, REST/GraphQL docs, and webhook event governance before opening public developer access alongside plugin publishing.',
        },
      ],
    });
  }

  @Get('identity-preview')
  getIdentityPreview() {
    return this.platformIdentityService.previewReadiness({
      controlsExpected: 5,
      auditCoveragePct: 83,
      complianceCoveragePct: 68,
      federationCoveragePct: 74,
      controls: [
        {
          key: 'AUDIT_CENTER',
          label: 'Audit Center',
          readinessPct: 86,
          federationReady: true,
          routeCount: 2,
          primaryUseCase: 'Centralize sensitive action review, export, and retention posture.',
          nextFocus: 'Add more curated views for high-risk platform changes.',
        },
        {
          key: 'COMPLIANCE',
          label: 'Compliance',
          readinessPct: 67,
          federationReady: true,
          routeCount: 2,
          primaryUseCase:
            'Track policy readiness for regulated or security-conscious enterprise tenants.',
          nextFocus:
            'Map additional control evidence across integrations, automation, and AI surfaces.',
        },
        {
          key: 'SSO',
          label: 'SSO',
          readinessPct: 79,
          federationReady: true,
          routeCount: 3,
          primaryUseCase: 'Deliver enterprise identity federation for workforce access.',
          nextFocus: 'Finish tenant onboarding checklist and fallback login policy.',
        },
        {
          key: 'OAUTH',
          label: 'OAuth',
          readinessPct: 76,
          federationReady: true,
          routeCount: 3,
          primaryUseCase: 'Support delegated auth for suites, plugins, and partner apps.',
          nextFocus: 'Tighten token rotation and consent visibility across provider connections.',
        },
        {
          key: 'SAML',
          label: 'SAML',
          readinessPct: 63,
          federationReady: false,
          routeCount: 2,
          primaryUseCase: 'Enable enterprise identity providers that rely on SAML federation.',
          nextFocus:
            'Complete metadata exchange, certificate rotation, and failback guidance before opening rollout.',
        },
      ],
    });
  }
}
