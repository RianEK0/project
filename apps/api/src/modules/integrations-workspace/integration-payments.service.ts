import { Injectable } from '@nestjs/common';
import { type IntegrationAuthMode, type IntegrationProviderKey } from '@nova/shared-types';

import {
  type IntegrationProviderSummary,
  type PaymentsIntegrationPreview,
} from './integrations-workspace.types';
import {
  assertIntegrationMin,
  assertIntegrationPercent,
  averageIntegrationReadiness,
  countConnectedProviders,
  resolveIntegrationStatus,
  roundIntegrationMetric,
  toIntegrationPercent,
} from './integrations-workspace-preview.utils';

export type PaymentProviderInput = {
  key: IntegrationProviderKey;
  label: string;
  authModes: IntegrationAuthMode[];
  readinessPct: number;
  webhookReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type PaymentPortfolioInput = {
  providers: PaymentProviderInput[];
  providersExpected: number;
  webhookEndpointsReady: number;
  webhookEndpointsExpected: number;
  settlementMatchRatePct: number;
  ledgerRoutingCoveragePct: number;
};

@Injectable()
export class IntegrationPaymentsService {
  previewPortfolio(input: PaymentPortfolioInput): PaymentsIntegrationPreview {
    assertIntegrationMin('Payment providers expected', input.providersExpected, 1);
    assertIntegrationMin('Webhook endpoints expected', input.webhookEndpointsExpected, 1);
    assertIntegrationPercent('Settlement match rate pct', input.settlementMatchRatePct);
    assertIntegrationPercent('Ledger routing coverage pct', input.ledgerRoutingCoveragePct);

    const providers = input.providers.map((provider) => this.buildProvider(provider));
    const connectedProviders = countConnectedProviders(
      providers.map((provider) => provider.readinessPct),
    );
    const providerCoveragePct = toIntegrationPercent(connectedProviders, input.providersExpected);
    const webhookCoveragePct = toIntegrationPercent(
      input.webhookEndpointsReady,
      input.webhookEndpointsExpected,
    );
    const readinessPct = averageIntegrationReadiness([
      providerCoveragePct,
      webhookCoveragePct,
      input.settlementMatchRatePct,
      input.ledgerRoutingCoveragePct,
    ]);
    const status = resolveIntegrationStatus({
      readinessPct,
      blockers: [connectedProviders === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      category: 'PAYMENT',
      status,
      connectedProviders,
      providersExpected: input.providersExpected,
      webhookCoveragePct: roundIntegrationMetric(webhookCoveragePct),
      settlementMatchRatePct: roundIntegrationMetric(input.settlementMatchRatePct),
      ledgerRoutingCoveragePct: roundIntegrationMetric(input.ledgerRoutingCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, connectedProviders, input.providersExpected, nextFocus),
      providers,
    };
  }

  private buildProvider(input: PaymentProviderInput): IntegrationProviderSummary {
    assertIntegrationPercent(`${input.label} readiness pct`, input.readinessPct);
    assertIntegrationMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveIntegrationStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.webhookReady],
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
      summary: `${input.label} ${this.describeStatus(status)} for payment capture and callback reconciliation. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: PaymentsIntegrationPreview['status']): string {
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

  private resolveNextFocus(status: PaymentsIntegrationPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Finalize credentials, webhook signatures, and ledger routing before exposing live capture.';
      case 'LIMITED':
        return 'Raise webhook and settlement coverage so asynchronous payment states reconcile cleanly.';
      case 'FOUNDATION':
        return 'Add the remaining provider checks and finance reconciliation hooks before wider rollout.';
      case 'READY':
        return 'Promote payment enablement tenant by tenant with settlement monitoring in place.';
    }
  }

  private buildSummary(
    status: PaymentsIntegrationPreview['status'],
    connectedProviders: number,
    providersExpected: number,
    nextFocus: string,
  ): string {
    switch (status) {
      case 'BLOCKED':
        return `Payment connector control is not yet safe for production. ${connectedProviders} of ${providersExpected} providers are above the minimum readiness bar. ${nextFocus}`;
      case 'LIMITED':
        return `Payment providers are visible, but callback and reconciliation coverage is still incomplete. ${connectedProviders} of ${providersExpected} providers are partially usable. ${nextFocus}`;
      case 'FOUNDATION':
        return `Payment integration foundation is shaping up across the main gateways. ${connectedProviders} of ${providersExpected} providers can support guided rollout. ${nextFocus}`;
      case 'READY':
        return `Payment integration coverage is ready for broader commercial onboarding. ${connectedProviders} of ${providersExpected} providers are operational. ${nextFocus}`;
    }
  }
}
