import { Injectable } from '@nestjs/common';
import { type IntegrationAuthMode, type IntegrationProviderKey } from '@nova/shared-types';

import {
  type IntegrationProviderSummary,
  type MessagingIntegrationPreview,
} from './integrations-workspace.types';
import {
  assertIntegrationMin,
  assertIntegrationPercent,
  averageIntegrationReadiness,
  countConnectedProviders,
  resolveIntegrationStatus,
  roundIntegrationMetric,
} from './integrations-workspace-preview.utils';

export type MessagingProviderInput = {
  key: IntegrationProviderKey;
  label: string;
  authModes: IntegrationAuthMode[];
  readinessPct: number;
  callbackReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type MessagingPortfolioInput = {
  providers: MessagingProviderInput[];
  providersExpected: number;
  deliveryVisibilityPct: number;
  automationBindingPct: number;
  incomingWebhookCoveragePct: number;
};

@Injectable()
export class IntegrationMessagingService {
  previewPortfolio(input: MessagingPortfolioInput): MessagingIntegrationPreview {
    assertIntegrationMin('Messaging providers expected', input.providersExpected, 1);
    assertIntegrationPercent('Delivery visibility pct', input.deliveryVisibilityPct);
    assertIntegrationPercent('Automation binding pct', input.automationBindingPct);
    assertIntegrationPercent('Incoming webhook coverage pct', input.incomingWebhookCoveragePct);

    const providers = input.providers.map((provider) => this.buildProvider(provider));
    const connectedProviders = countConnectedProviders(
      providers.map((provider) => provider.readinessPct),
    );
    const providerCoveragePct = roundIntegrationMetric(
      (connectedProviders / input.providersExpected) * 100,
    );
    const readinessPct = averageIntegrationReadiness([
      providerCoveragePct,
      input.deliveryVisibilityPct,
      input.automationBindingPct,
      input.incomingWebhookCoveragePct,
    ]);
    const status = resolveIntegrationStatus({
      readinessPct,
      blockers: [connectedProviders === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      category: 'MESSAGING',
      status,
      connectedProviders,
      providersExpected: input.providersExpected,
      deliveryVisibilityPct: roundIntegrationMetric(input.deliveryVisibilityPct),
      automationBindingPct: roundIntegrationMetric(input.automationBindingPct),
      incomingWebhookCoveragePct: roundIntegrationMetric(input.incomingWebhookCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      providers,
    };
  }

  private buildProvider(input: MessagingProviderInput): IntegrationProviderSummary {
    assertIntegrationPercent(`${input.label} readiness pct`, input.readinessPct);
    assertIntegrationMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveIntegrationStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.callbackReady],
    });

    return {
      key: input.key,
      label: input.label,
      status,
      authModes: input.authModes,
      readinessPct: roundIntegrationMetric(input.readinessPct),
      routeCount: input.routeCount,
      primaryUseCase: input.primaryUseCase,
      nextFocus: input.nextFocus,
      summary: `${input.label} ${this.describeStatus(status)} for conversational handoff, callback intake, and automation fan-out. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: MessagingIntegrationPreview['status']): string {
    switch (status) {
      case 'READY':
        return 'is ready';
      case 'FOUNDATION':
        return 'has a solid foundation';
      case 'LIMITED':
        return 'is still limited';
      case 'BLOCKED':
        return 'is blocked';
    }
  }

  private resolveNextFocus(status: MessagingIntegrationPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Wire channel credentials, callbacks, and delivery logging before exposing outbound messaging.';
      case 'LIMITED':
        return 'Increase callback and automation binding coverage so message status is observable end to end.';
      case 'FOUNDATION':
        return 'Complete inbound escalation and acknowledgement flows before wider business rollout.';
      case 'READY':
        return 'Expand messaging automation to more teams with guardrails on rate limits and escalation paths.';
    }
  }

  private buildSummary(status: MessagingIntegrationPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Messaging connectors are still blocked on callback or credential readiness. ${nextFocus}`;
      case 'LIMITED':
        return `Messaging visibility is live, but delivery and automation coverage is still uneven across channels. ${nextFocus}`;
      case 'FOUNDATION':
        return `Messaging integration foundation can already support staged operational notifications and sales follow-up. ${nextFocus}`;
      case 'READY':
        return `Messaging integration coverage is ready for broader customer, internal, and automation-driven communication. ${nextFocus}`;
    }
  }
}
