import { HttpStatus, Injectable } from '@nestjs/common';
import {
  publicApiAuthModes,
  publicApiProtocols,
  publicApiSdkLanguages,
  selfServeBuilderStatuses,
  type PublicApiAuthMode,
  type PublicApiProtocol,
  type PublicApiSdkLanguage,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type PublicApiPreviewInput = {
  programName?: string;
  protocol?: string;
  sdkLanguage?: string;
  domain?: string;
  webhookEvents?: string[];
};

type PublicApiStarterBundle = {
  title: string;
  protocol: PublicApiProtocol;
  focus: string;
};

export type PublicApiFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  protocols: readonly PublicApiProtocol[];
  sdkLanguages: readonly PublicApiSdkLanguage[];
  authModes: readonly PublicApiAuthMode[];
  sampleDomains: string[];
  webhookEvents: string[];
  starterBundles: PublicApiStarterBundle[];
};

export type PublicApiPreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  protocol: PublicApiProtocol;
  sdkLanguage: PublicApiSdkLanguage | null;
  domain: string;
  publishWindowDate: string;
  summary: string;
  baseUrl: string;
  authMode: PublicApiAuthMode;
  rateLimitProfile: string;
  artifactBundle: string[];
  sampleOperation: string;
  webhookEvents: string[];
  sdkPackageName: string | null;
  guardrails: string[];
  enablementChecklist: string[];
};

@Injectable()
export class PublicApiService {
  getFoundation(): PublicApiFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      protocols: publicApiProtocols,
      sdkLanguages: publicApiSdkLanguages,
      authModes: publicApiAuthModes,
      sampleDomains: ['Procurement', 'Inventory', 'Sales', 'Finance', 'CRM'],
      webhookEvents: [
        'purchase.order.approved',
        'inventory.stock.low',
        'sales.invoice.posted',
        'crm.deal.won',
      ],
      starterBundles: [
        {
          title: 'REST + TypeScript SDK',
          protocol: 'REST',
          focus: 'Ship OpenAPI-first endpoints with typed frontend or partner SDK support.',
        },
        {
          title: 'Webhook Event Relay',
          protocol: 'WEBHOOK',
          focus: 'Broadcast operational events into partner systems with signed deliveries.',
        },
        {
          title: 'GraphQL Explorer',
          protocol: 'GRAPHQL',
          focus: 'Offer flexible cross-domain reads for analytics, portals, or partner apps.',
        },
      ],
    };
  }

  preview(input: PublicApiPreviewInput): PublicApiPreview {
    const programName = input.programName?.trim();

    if (!programName) {
      throw new AppException(
        ERROR_CODES.PUBLIC_API_INPUT_INVALID,
        'Program name is required for public API preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const protocol = this.resolveProtocol(input.protocol);
    const sdkLanguage = this.resolveSdkLanguage(protocol, input.sdkLanguage);
    const domain = input.domain?.trim() || 'Procurement';
    const webhookEvents = this.resolveWebhookEvents(protocol, input.webhookEvents);

    return {
      programName,
      status: protocol === 'SDK' && !sdkLanguage ? 'REVIEW_NEEDED' : 'READY',
      protocol,
      sdkLanguage,
      domain,
      publishWindowDate: '2026-08-03',
      summary: `Public API preview for "${programName}" now prepares ${protocol} access across ${domain} flows with REST, GraphQL, webhook, and SDK-ready governance for external developers.`,
      baseUrl: this.resolveBaseUrl(protocol),
      authMode: this.resolveAuthMode(protocol),
      rateLimitProfile:
        protocol === 'WEBHOOK'
          ? 'Delivery retry tier with signed callbacks'
          : '10,000 requests / hour / tenant',
      artifactBundle: this.resolveArtifactBundle(protocol, sdkLanguage),
      sampleOperation: this.resolveSampleOperation(protocol, domain),
      webhookEvents,
      sdkPackageName: this.resolveSdkPackageName(sdkLanguage),
      guardrails: [
        'External apps must stay scoped to tenant-issued credentials and least-privilege domain grants.',
        'Webhook callbacks require signature verification and replay window checks before Monday, August 3, 2026.',
        'SDK packages must remain versioned against the same OpenAPI or GraphQL contract published by the platform lane.',
      ],
      enablementChecklist: [
        'Publish REST, GraphQL, webhook, and SDK onboarding docs to the developer portal.',
        'Issue sandbox credentials and sample collections for JavaScript, TypeScript, Python, Java, PHP, Go, C#, Dart, Swift, Kotlin users.',
        'Attach deprecation, changelog, and webhook retry policy to every public release.',
      ],
    };
  }

  private resolveProtocol(value?: string): PublicApiProtocol {
    if (!value) {
      return 'REST';
    }

    if (!publicApiProtocols.includes(value as PublicApiProtocol)) {
      throw new AppException(
        ERROR_CODES.PUBLIC_API_INPUT_INVALID,
        `Unsupported public API protocol: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as PublicApiProtocol;
  }

  private resolveSdkLanguage(
    protocol: PublicApiProtocol,
    sdkLanguage?: string,
  ): PublicApiSdkLanguage | null {
    if (!sdkLanguage) {
      if (protocol === 'SDK') {
        throw new AppException(
          ERROR_CODES.PUBLIC_API_INPUT_INVALID,
          'SDK language is required when protocol is SDK.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return null;
    }

    if (!publicApiSdkLanguages.includes(sdkLanguage as PublicApiSdkLanguage)) {
      throw new AppException(
        ERROR_CODES.PUBLIC_API_INPUT_INVALID,
        `Unsupported SDK language: ${sdkLanguage}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return sdkLanguage as PublicApiSdkLanguage;
  }

  private resolveWebhookEvents(protocol: PublicApiProtocol, events?: string[]) {
    if (protocol !== 'WEBHOOK') {
      return [];
    }

    return (events ?? []).filter((event) => event.trim().length > 0);
  }

  private resolveBaseUrl(protocol: PublicApiProtocol) {
    switch (protocol) {
      case 'REST':
        return 'https://api.novaerp.dev/public/v1';
      case 'GRAPHQL':
        return 'https://api.novaerp.dev/graphql';
      case 'WEBHOOK':
        return 'https://api.novaerp.dev/webhooks';
      case 'SDK':
        return 'https://api.novaerp.dev/public/v1';
    }
  }

  private resolveAuthMode(protocol: PublicApiProtocol): PublicApiAuthMode {
    switch (protocol) {
      case 'REST':
      case 'SDK':
        return 'API_KEY';
      case 'GRAPHQL':
        return 'OAUTH2';
      case 'WEBHOOK':
        return 'SERVICE_TOKEN';
    }
  }

  private resolveArtifactBundle(
    protocol: PublicApiProtocol,
    sdkLanguage: PublicApiSdkLanguage | null,
  ) {
    switch (protocol) {
      case 'REST':
        return ['OpenAPI 3.1 Spec', 'Postman Collection', 'REST Error Catalog'];
      case 'GRAPHQL':
        return ['GraphQL Schema', 'Explorer Queries', 'Field Deprecation Guide'];
      case 'WEBHOOK':
        return ['Webhook Event Catalog', 'Signature Verification Sample', 'Retry Policy Sheet'];
      case 'SDK':
        return [
          `${sdkLanguage?.replaceAll('_', ' ')} SDK Package`,
          'Quickstart Guide',
          'Authentication Helper',
        ];
    }
  }

  private resolveSampleOperation(protocol: PublicApiProtocol, domain: string) {
    switch (protocol) {
      case 'REST':
        return `GET /public/v1/${domain.toLowerCase()}/records`;
      case 'GRAPHQL':
        return `query ${domain}List { ${domain.toLowerCase()}Records { id status updatedAt } }`;
      case 'WEBHOOK':
        return `${domain.toLowerCase()}.record.updated`;
      case 'SDK':
        return `${domain}Client.list({ limit: 20 })`;
    }
  }

  private resolveSdkPackageName(sdkLanguage: PublicApiSdkLanguage | null) {
    if (!sdkLanguage) {
      return null;
    }

    return `@nova/sdk-${sdkLanguage.toLowerCase()}`;
  }
}
