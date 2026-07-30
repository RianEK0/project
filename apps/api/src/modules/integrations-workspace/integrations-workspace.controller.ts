import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  integrationAuthModes,
  integrationConnectionStatuses,
  integrationProviderCategories,
  integrationProviderKeys,
} from '@nova/shared-types';

import { IntegrationAiService } from './integration-ai.service';
import { IntegrationMessagingService } from './integration-messaging.service';
import { IntegrationPaymentsService } from './integration-payments.service';
import { IntegrationStorageService } from './integration-storage.service';
import { IntegrationSuiteService } from './integration-suite.service';

@ApiTags('Integrations Workspace')
@Controller({
  path: 'integrations-workspace',
  version: '1',
})
export class IntegrationsWorkspaceController {
  constructor(
    private readonly integrationPaymentsService: IntegrationPaymentsService,
    private readonly integrationSuiteService: IntegrationSuiteService,
    private readonly integrationMessagingService: IntegrationMessagingService,
    private readonly integrationStorageService: IntegrationStorageService,
    private readonly integrationAiService: IntegrationAiService,
  ) {}

  @Get()
  getWorkspace() {
    return {
      providers: integrationProviderKeys,
      categories: integrationProviderCategories,
      statuses: integrationConnectionStatuses,
      authModes: integrationAuthModes,
      cards: [
        {
          id: 'payments',
          label: 'Payments',
          route: '/app/integrations/stripe',
          description:
            'Stripe, Xendit, and Midtrans readiness for capture, callback, and finance handoff.',
        },
        {
          id: 'suite',
          label: 'Google And Microsoft',
          route: '/app/integrations/google',
          description:
            'Identity, directory, calendar, and collaboration suite onboarding for tenant workspaces.',
        },
        {
          id: 'messaging',
          label: 'Messaging',
          route: '/app/integrations/whatsapp',
          description:
            'Operational and customer-facing channel orchestration across WhatsApp, Telegram, Slack, and Discord.',
        },
        {
          id: 'storage',
          label: 'Storage',
          route: '/app/integrations/dropbox',
          description:
            'Document exchange, signed delivery, backup, and archive controls across file providers.',
        },
        {
          id: 'ai',
          label: 'AI Providers',
          route: '/app/integrations/openai',
          description:
            'Multi-provider AI routing, governance, and fallback posture for NovaERP copilots.',
        },
      ],
      featuredProviders: [
        { key: 'STRIPE', label: 'Stripe', route: '/app/integrations/stripe', category: 'PAYMENT' },
        { key: 'GOOGLE', label: 'Google', route: '/app/integrations/google', category: 'SUITE' },
        {
          key: 'WHATSAPP',
          label: 'WhatsApp',
          route: '/app/integrations/whatsapp',
          category: 'MESSAGING',
        },
        {
          key: 'S3',
          label: 'S3',
          route: '/app/integrations/s3',
          category: 'STORAGE',
        },
        { key: 'OPENAI', label: 'OpenAI', route: '/app/integrations/openai', category: 'AI' },
      ],
      relatedRoutes: [
        { label: 'Payments', route: '/app/payments' },
        { label: 'Automation Webhooks', route: '/app/automation/webhooks' },
        { label: 'Chat ERP', route: '/app/ai/chat-erp' },
        { label: 'Portal Dashboard', route: '/portal/dashboard' },
        { label: 'Mobile Push', route: '/app/mobile/push-notification' },
      ],
    };
  }

  @Get('payments-preview')
  getPaymentsPreview() {
    return this.integrationPaymentsService.previewPortfolio({
      providersExpected: 3,
      webhookEndpointsExpected: 3,
      webhookEndpointsReady: 2,
      settlementMatchRatePct: 91,
      ledgerRoutingCoveragePct: 87,
      providers: [
        {
          key: 'STRIPE',
          label: 'Stripe',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 92,
          webhookReady: true,
          routeCount: 3,
          primaryUseCase: 'Global cards, links, and subscription collection.',
          nextFocus: 'Add dispute evidence and payout monitoring to the finance control loop.',
        },
        {
          key: 'XENDIT',
          label: 'Xendit',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 88,
          webhookReady: true,
          routeCount: 3,
          primaryUseCase: 'Indonesia VA, QRIS, and e-wallet readiness.',
          nextFocus:
            'Align settlement reconciliation with purchase and sales invoice preparation surfaces.',
        },
        {
          key: 'MIDTRANS',
          label: 'Midtrans',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 68,
          webhookReady: false,
          routeCount: 2,
          primaryUseCase: 'Regional checkout fallback and payment channel redundancy.',
          nextFocus:
            'Enable signed callbacks before routing live operational status from Midtrans.',
        },
      ],
    });
  }

  @Get('suite-preview')
  getSuitePreview() {
    return this.integrationSuiteService.previewPortfolio({
      providersExpected: 2,
      directorySyncCoveragePct: 84,
      calendarSyncCoveragePct: 79,
      documentCollaborationCoveragePct: 76,
      providers: [
        {
          key: 'GOOGLE',
          label: 'Google',
          authModes: ['OAUTH2', 'SERVICE_ACCOUNT'],
          readinessPct: 86,
          directoryReady: true,
          routeCount: 3,
          primaryUseCase: 'Google identity, calendar, and workspace collaboration.',
          nextFocus:
            'Tighten shared-drive policy templates before exposing tenant-wide document sync.',
        },
        {
          key: 'MICROSOFT',
          label: 'Microsoft',
          authModes: ['OAUTH2', 'SERVICE_ACCOUNT'],
          readinessPct: 74,
          directoryReady: true,
          routeCount: 3,
          primaryUseCase: 'Microsoft identity, Outlook calendar, and M365 document collaboration.',
          nextFocus: 'Finish role-mapping and consent observability for Entra and Outlook sync.',
        },
      ],
    });
  }

  @Get('messaging-preview')
  getMessagingPreview() {
    return this.integrationMessagingService.previewPortfolio({
      providersExpected: 4,
      deliveryVisibilityPct: 82,
      automationBindingPct: 78,
      incomingWebhookCoveragePct: 71,
      providers: [
        {
          key: 'WHATSAPP',
          label: 'WhatsApp',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 85,
          callbackReady: true,
          routeCount: 3,
          primaryUseCase: 'Customer messaging, reminder, and sales follow-up flows.',
          nextFocus: 'Add template-quality monitoring and tenant-by-tenant sender isolation.',
        },
        {
          key: 'TELEGRAM',
          label: 'Telegram',
          authModes: ['BOT_TOKEN', 'WEBHOOK_SIGNATURE'],
          readinessPct: 69,
          callbackReady: true,
          routeCount: 2,
          primaryUseCase: 'Ops relay bot for lightweight acknowledgement and exception handling.',
          nextFocus: 'Increase inbound routing coverage for warehouse and support escalations.',
        },
        {
          key: 'SLACK',
          label: 'Slack',
          authModes: ['BOT_TOKEN', 'WEBHOOK_SIGNATURE'],
          readinessPct: 88,
          callbackReady: true,
          routeCount: 2,
          primaryUseCase: 'Internal automation notices and approval nudges.',
          nextFocus: 'Wire richer action shortcuts into approval and warehouse exception messages.',
        },
        {
          key: 'DISCORD',
          label: 'Discord',
          authModes: ['BOT_TOKEN', 'WEBHOOK_SIGNATURE'],
          readinessPct: 57,
          callbackReady: false,
          routeCount: 1,
          primaryUseCase: 'Community-style alerting and low-friction pilot channel.',
          nextFocus:
            'Enable callback verification before using Discord as an operational event sink.',
        },
      ],
    });
  }

  @Get('storage-preview')
  getStoragePreview() {
    return this.integrationStorageService.previewPortfolio({
      providersExpected: 4,
      retentionCoveragePct: 83,
      signedUrlCoveragePct: 79,
      backupRedundancyPct: 88,
      providers: [
        {
          key: 'DROPBOX',
          label: 'Dropbox',
          authModes: ['OAUTH2'],
          readinessPct: 73,
          retentionPolicyReady: true,
          routeCount: 2,
          primaryUseCase: 'Shared export exchange for customer-facing documents.',
          nextFocus: 'Standardize tenant folder conventions before scaling shared delivery flows.',
        },
        {
          key: 'GOOGLE_DRIVE',
          label: 'Google Drive',
          authModes: ['OAUTH2'],
          readinessPct: 78,
          retentionPolicyReady: true,
          routeCount: 2,
          primaryUseCase: 'Collaborative storage for operations and finance artefacts.',
          nextFocus: 'Complete label policy mapping for regulated document classes.',
        },
        {
          key: 'ONEDRIVE',
          label: 'OneDrive',
          authModes: ['OAUTH2'],
          readinessPct: 72,
          retentionPolicyReady: true,
          routeCount: 2,
          primaryUseCase: 'M365-linked storage handoff for enterprise tenants.',
          nextFocus: 'Harden signed download rules for cross-tenant sharing scenarios.',
        },
        {
          key: 'S3',
          label: 'S3',
          authModes: ['ACCESS_KEY'],
          readinessPct: 91,
          retentionPolicyReady: true,
          routeCount: 3,
          primaryUseCase: 'Primary archive, export sink, and backup redundancy layer.',
          nextFocus: 'Expand lifecycle policy automation and replication health checks.',
        },
      ],
    });
  }

  @Get('ai-preview')
  getAiPreview() {
    return this.integrationAiService.previewPortfolio({
      providersExpected: 3,
      promptGovernancePct: 86,
      fallbackCoveragePct: 74,
      modelRoutingCoveragePct: 81,
      providers: [
        {
          key: 'OPENAI',
          label: 'OpenAI',
          authModes: ['API_KEY'],
          readinessPct: 92,
          guardrailReady: true,
          routeCount: 4,
          primaryUseCase: 'Chat ERP, AI report, and orchestration backbone.',
          nextFocus: 'Add per-domain latency budgets and routing thresholds.',
        },
        {
          key: 'CLAUDE',
          label: 'Claude',
          authModes: ['API_KEY'],
          readinessPct: 84,
          guardrailReady: true,
          routeCount: 3,
          primaryUseCase: 'Long-form reasoning and document-heavy analysis flows.',
          nextFocus: 'Finish fallback prompt coverage for report and recommendation flows.',
        },
        {
          key: 'GEMINI',
          label: 'Gemini',
          authModes: ['API_KEY', 'SERVICE_ACCOUNT'],
          readinessPct: 71,
          guardrailReady: true,
          routeCount: 3,
          primaryUseCase: 'Search-adjacent reasoning and multimodal support lane.',
          nextFocus:
            'Tighten budget policy and governance defaults before enabling broader multimodal use.',
        },
      ],
    });
  }
}
