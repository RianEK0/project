import { Injectable } from '@nestjs/common';
import { type IntegrationAuthMode, type IntegrationProviderKey } from '@nova/shared-types';

import {
  type IntegrationProviderSummary,
  type SuiteIntegrationPreview,
} from './integrations-workspace.types';
import {
  assertIntegrationMin,
  assertIntegrationPercent,
  averageIntegrationReadiness,
  countConnectedProviders,
  resolveIntegrationStatus,
  roundIntegrationMetric,
} from './integrations-workspace-preview.utils';

export type SuiteProviderInput = {
  key: IntegrationProviderKey;
  label: string;
  authModes: IntegrationAuthMode[];
  readinessPct: number;
  directoryReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type SuitePortfolioInput = {
  providers: SuiteProviderInput[];
  providersExpected: number;
  directorySyncCoveragePct: number;
  calendarSyncCoveragePct: number;
  documentCollaborationCoveragePct: number;
};

@Injectable()
export class IntegrationSuiteService {
  previewPortfolio(input: SuitePortfolioInput): SuiteIntegrationPreview {
    assertIntegrationMin('Suite providers expected', input.providersExpected, 1);
    assertIntegrationPercent('Directory sync coverage pct', input.directorySyncCoveragePct);
    assertIntegrationPercent('Calendar sync coverage pct', input.calendarSyncCoveragePct);
    assertIntegrationPercent(
      'Document collaboration coverage pct',
      input.documentCollaborationCoveragePct,
    );

    const providers = input.providers.map((provider) => this.buildProvider(provider));
    const connectedProviders = countConnectedProviders(
      providers.map((provider) => provider.readinessPct),
    );
    const providerCoveragePct = roundIntegrationMetric(
      (connectedProviders / input.providersExpected) * 100,
    );
    const readinessPct = averageIntegrationReadiness([
      providerCoveragePct,
      input.directorySyncCoveragePct,
      input.calendarSyncCoveragePct,
      input.documentCollaborationCoveragePct,
    ]);
    const status = resolveIntegrationStatus({
      readinessPct,
      blockers: [connectedProviders === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      category: 'SUITE',
      status,
      connectedProviders,
      providersExpected: input.providersExpected,
      directorySyncCoveragePct: roundIntegrationMetric(input.directorySyncCoveragePct),
      calendarSyncCoveragePct: roundIntegrationMetric(input.calendarSyncCoveragePct),
      documentCollaborationCoveragePct: roundIntegrationMetric(
        input.documentCollaborationCoveragePct,
      ),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      providers,
    };
  }

  private buildProvider(input: SuiteProviderInput): IntegrationProviderSummary {
    assertIntegrationPercent(`${input.label} readiness pct`, input.readinessPct);
    assertIntegrationMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveIntegrationStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.directoryReady],
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
      summary: `${input.label} ${this.describeStatus(status)} for identity, calendar, and collaboration handoff. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: SuiteIntegrationPreview['status']): string {
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

  private resolveNextFocus(status: SuiteIntegrationPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Close OAuth, directory sync, and tenant-consent prerequisites before enabling SSO or calendar sync.';
      case 'LIMITED':
        return 'Raise directory and collaboration coverage so Google and Microsoft can anchor workspace identity safely.';
      case 'FOUNDATION':
        return 'Finish document and schedule synchronization so productivity suites can support more departments.';
      case 'READY':
        return 'Scale suite rollout with role-mapping and consent monitoring baked into tenant onboarding.';
    }
  }

  private buildSummary(status: SuiteIntegrationPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Suite connectors are not yet safe to expose for tenant identity and schedule handoff. ${nextFocus}`;
      case 'LIMITED':
        return `Google and Microsoft visibility exists, but sync coverage is still too narrow for broad adoption. ${nextFocus}`;
      case 'FOUNDATION':
        return `Suite integration foundation can support staged onboarding for identity and collaboration needs. ${nextFocus}`;
      case 'READY':
        return `Suite integration coverage is ready to support broader SSO, calendar, and document collaboration flows. ${nextFocus}`;
    }
  }
}
