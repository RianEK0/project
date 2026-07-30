import { Injectable } from '@nestjs/common';
import { type IntegrationAuthMode, type IntegrationProviderKey } from '@nova/shared-types';

import {
  type AiIntegrationPreview,
  type IntegrationProviderSummary,
} from './integrations-workspace.types';
import {
  assertIntegrationMin,
  assertIntegrationPercent,
  averageIntegrationReadiness,
  countConnectedProviders,
  resolveIntegrationStatus,
  roundIntegrationMetric,
} from './integrations-workspace-preview.utils';

export type AiProviderInput = {
  key: IntegrationProviderKey;
  label: string;
  authModes: IntegrationAuthMode[];
  readinessPct: number;
  guardrailReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type AiPortfolioInput = {
  providers: AiProviderInput[];
  providersExpected: number;
  promptGovernancePct: number;
  fallbackCoveragePct: number;
  modelRoutingCoveragePct: number;
};

@Injectable()
export class IntegrationAiService {
  previewPortfolio(input: AiPortfolioInput): AiIntegrationPreview {
    assertIntegrationMin('AI providers expected', input.providersExpected, 1);
    assertIntegrationPercent('Prompt governance pct', input.promptGovernancePct);
    assertIntegrationPercent('Fallback coverage pct', input.fallbackCoveragePct);
    assertIntegrationPercent('Model routing coverage pct', input.modelRoutingCoveragePct);

    const providers = input.providers.map((provider) => this.buildProvider(provider));
    const connectedProviders = countConnectedProviders(
      providers.map((provider) => provider.readinessPct),
    );
    const providerCoveragePct = roundIntegrationMetric(
      (connectedProviders / input.providersExpected) * 100,
    );
    const readinessPct = averageIntegrationReadiness([
      providerCoveragePct,
      input.promptGovernancePct,
      input.fallbackCoveragePct,
      input.modelRoutingCoveragePct,
    ]);
    const status = resolveIntegrationStatus({
      readinessPct,
      blockers: [connectedProviders === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      category: 'AI',
      status,
      connectedProviders,
      providersExpected: input.providersExpected,
      promptGovernancePct: roundIntegrationMetric(input.promptGovernancePct),
      fallbackCoveragePct: roundIntegrationMetric(input.fallbackCoveragePct),
      modelRoutingCoveragePct: roundIntegrationMetric(input.modelRoutingCoveragePct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      providers,
    };
  }

  private buildProvider(input: AiProviderInput): IntegrationProviderSummary {
    assertIntegrationPercent(`${input.label} readiness pct`, input.readinessPct);
    assertIntegrationMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveIntegrationStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.guardrailReady],
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
      summary: `${input.label} ${this.describeStatus(status)} for governed model routing and domain copilot handoff. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: AiIntegrationPreview['status']): string {
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

  private resolveNextFocus(status: AiIntegrationPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Configure provider keys, guardrails, and routing policy before exposing AI features to tenants.';
      case 'LIMITED':
        return 'Expand fallback and prompt governance coverage so AI copilots fail safely and predictably.';
      case 'FOUNDATION':
        return 'Complete routing policy and cost controls before scaling multi-provider AI execution.';
      case 'READY':
        return 'Use multi-provider routing for resilience while tracking cost, latency, and policy compliance.';
    }
  }

  private buildSummary(status: AiIntegrationPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `AI providers are blocked on governance or credential readiness. ${nextFocus}`;
      case 'LIMITED':
        return `AI provider visibility exists, but routing and guardrail coverage still needs work before broad adoption. ${nextFocus}`;
      case 'FOUNDATION':
        return `AI integration foundation can already support staged domain copilots and report generation. ${nextFocus}`;
      case 'READY':
        return `AI integration coverage is ready for broader multi-provider orchestration across NovaERP workspaces. ${nextFocus}`;
    }
  }
}
