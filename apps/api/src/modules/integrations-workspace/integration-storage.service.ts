import { Injectable } from '@nestjs/common';
import { type IntegrationAuthMode, type IntegrationProviderKey } from '@nova/shared-types';

import {
  type IntegrationProviderSummary,
  type StorageIntegrationPreview,
} from './integrations-workspace.types';
import {
  assertIntegrationMin,
  assertIntegrationPercent,
  averageIntegrationReadiness,
  countConnectedProviders,
  resolveIntegrationStatus,
  roundIntegrationMetric,
} from './integrations-workspace-preview.utils';

export type StorageProviderInput = {
  key: IntegrationProviderKey;
  label: string;
  authModes: IntegrationAuthMode[];
  readinessPct: number;
  retentionPolicyReady: boolean;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
};

export type StoragePortfolioInput = {
  providers: StorageProviderInput[];
  providersExpected: number;
  retentionCoveragePct: number;
  signedUrlCoveragePct: number;
  backupRedundancyPct: number;
};

@Injectable()
export class IntegrationStorageService {
  previewPortfolio(input: StoragePortfolioInput): StorageIntegrationPreview {
    assertIntegrationMin('Storage providers expected', input.providersExpected, 1);
    assertIntegrationPercent('Retention coverage pct', input.retentionCoveragePct);
    assertIntegrationPercent('Signed URL coverage pct', input.signedUrlCoveragePct);
    assertIntegrationPercent('Backup redundancy pct', input.backupRedundancyPct);

    const providers = input.providers.map((provider) => this.buildProvider(provider));
    const connectedProviders = countConnectedProviders(
      providers.map((provider) => provider.readinessPct),
    );
    const providerCoveragePct = roundIntegrationMetric(
      (connectedProviders / input.providersExpected) * 100,
    );
    const readinessPct = averageIntegrationReadiness([
      providerCoveragePct,
      input.retentionCoveragePct,
      input.signedUrlCoveragePct,
      input.backupRedundancyPct,
    ]);
    const status = resolveIntegrationStatus({
      readinessPct,
      blockers: [connectedProviders === 0],
    });
    const nextFocus = this.resolveNextFocus(status);

    return {
      category: 'STORAGE',
      status,
      connectedProviders,
      providersExpected: input.providersExpected,
      retentionCoveragePct: roundIntegrationMetric(input.retentionCoveragePct),
      signedUrlCoveragePct: roundIntegrationMetric(input.signedUrlCoveragePct),
      backupRedundancyPct: roundIntegrationMetric(input.backupRedundancyPct),
      nextFocus,
      summary: this.buildSummary(status, nextFocus),
      providers,
    };
  }

  private buildProvider(input: StorageProviderInput): IntegrationProviderSummary {
    assertIntegrationPercent(`${input.label} readiness pct`, input.readinessPct);
    assertIntegrationMin(`${input.label} route count`, input.routeCount, 1);

    const status = resolveIntegrationStatus({
      readinessPct: input.readinessPct,
      blockers: [!input.retentionPolicyReady],
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
      summary: `${input.label} ${this.describeStatus(status)} for document storage, signed access, and retention controls. ${input.nextFocus}`,
    };
  }

  private describeStatus(status: StorageIntegrationPreview['status']): string {
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

  private resolveNextFocus(status: StorageIntegrationPreview['status']): string {
    switch (status) {
      case 'BLOCKED':
        return 'Scope storage credentials, retention defaults, and signed access rules before exposing file exchange.';
      case 'LIMITED':
        return 'Increase retention and signed URL coverage so documents can move safely across tenant workflows.';
      case 'FOUNDATION':
        return 'Close the last resilience and backup gaps before using connectors as primary document paths.';
      case 'READY':
        return 'Scale storage rollout with tenant-level policy templates and redundancy checks in place.';
    }
  }

  private buildSummary(status: StorageIntegrationPreview['status'], nextFocus: string): string {
    switch (status) {
      case 'BLOCKED':
        return `Storage connectors are blocked on policy or credential readiness. ${nextFocus}`;
      case 'LIMITED':
        return `Storage providers are visible, but retention and secure delivery controls still need work. ${nextFocus}`;
      case 'FOUNDATION':
        return `Storage integration foundation can support staged document and export flows. ${nextFocus}`;
      case 'READY':
        return `Storage integration coverage is ready for broader file delivery, archive, and backup orchestration. ${nextFocus}`;
    }
  }
}
