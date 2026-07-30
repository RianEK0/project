import { HttpStatus, Injectable } from '@nestjs/common';
import {
  globalEnterpriseDeploymentModels,
  globalEnterpriseScaleDimensions,
  globalEnterpriseTopologyModes,
  selfServeBuilderStatuses,
  type GlobalEnterpriseDeploymentModel,
  type GlobalEnterpriseScaleDimension,
  type GlobalEnterpriseTopologyMode,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type GlobalEnterprisePreviewInput = {
  programName?: string;
  deploymentModel?: string;
  topologyMode?: string;
  companyCount?: number;
  branchCount?: number;
  userCount?: number;
  unlimitedDimensions?: string[];
};

type GlobalEnterpriseStarterBlueprint = {
  title: string;
  deploymentModel: GlobalEnterpriseDeploymentModel;
  topologyMode: GlobalEnterpriseTopologyMode;
  focus: string;
};

type GlobalEnterpriseDimensionPreview = {
  dimension: GlobalEnterpriseScaleDimension;
  target: string;
  policy: string;
};

export type GlobalEnterpriseFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  scaleDimensions: readonly GlobalEnterpriseScaleDimension[];
  deploymentModels: readonly GlobalEnterpriseDeploymentModel[];
  topologyModes: readonly GlobalEnterpriseTopologyMode[];
  recommendedRegions: string[];
  unlimitedDimensions: GlobalEnterpriseScaleDimension[];
  starterBlueprints: GlobalEnterpriseStarterBlueprint[];
};

export type GlobalEnterprisePreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  deploymentModel: GlobalEnterpriseDeploymentModel;
  topologyMode: GlobalEnterpriseTopologyMode;
  companyCount: number;
  branchCount: number;
  userCount: number;
  unlimitedDimensions: GlobalEnterpriseScaleDimension[];
  recommendedShardCount: number;
  regionalPods: string[];
  globalRolloutDate: string;
  summary: string;
  scalePlan: GlobalEnterpriseDimensionPreview[];
  governanceChecks: string[];
  enablementTracks: string[];
};

const unlimitedDimensionsDefault: GlobalEnterpriseScaleDimension[] = [
  'WAREHOUSE',
  'STORE',
  'CURRENCY',
  'LANGUAGE',
  'THEME',
];

@Injectable()
export class GlobalEnterpriseService {
  getFoundation(): GlobalEnterpriseFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      scaleDimensions: globalEnterpriseScaleDimensions,
      deploymentModels: globalEnterpriseDeploymentModels,
      topologyModes: globalEnterpriseTopologyModes,
      recommendedRegions: ['APAC', 'EMEA', 'AMER'],
      unlimitedDimensions: unlimitedDimensionsDefault,
      starterBlueprints: [
        {
          title: 'Global Holding Rollout',
          deploymentModel: 'GLOBAL_FEDERATION',
          topologyMode: 'REGIONAL_HUBS',
          focus: 'Scale 1,000 companies across regional control pods with shared governance.',
        },
        {
          title: 'Retail Mesh Expansion',
          deploymentModel: 'REGIONAL_PARTITION',
          topologyMode: 'HUB_AND_SPOKE',
          focus: 'Coordinate branch-heavy tenant growth while keeping operational defaults fast.',
        },
        {
          title: 'Sovereign Enterprise Pack',
          deploymentModel: 'GLOBAL_FEDERATION',
          topologyMode: 'SOVEREIGN_PODS',
          focus: 'Preserve country-sensitive policy boundaries for regulated global tenants.',
        },
      ],
    };
  }

  preview(input: GlobalEnterprisePreviewInput): GlobalEnterprisePreview {
    const programName = input.programName?.trim();

    if (!programName) {
      throw new AppException(
        ERROR_CODES.GLOBAL_ENTERPRISE_INPUT_INVALID,
        'Program name is required for global enterprise preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const deploymentModel = this.resolveDeploymentModel(input.deploymentModel);
    const topologyMode = this.resolveTopologyMode(input.topologyMode);
    const companyCount = this.resolveCount(input.companyCount, 'Company count');
    const branchCount = this.resolveCount(input.branchCount, 'Branch count');
    const userCount = this.resolveCount(input.userCount, 'User count');
    const unlimitedDimensions = this.resolveUnlimitedDimensions(input.unlimitedDimensions);

    if (branchCount < companyCount) {
      throw new AppException(
        ERROR_CODES.GLOBAL_ENTERPRISE_INPUT_INVALID,
        'Branch count must be greater than or equal to company count.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userCount < branchCount) {
      throw new AppException(
        ERROR_CODES.GLOBAL_ENTERPRISE_INPUT_INVALID,
        'User count must be greater than or equal to branch count.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const withinTarget = companyCount <= 1_000 && branchCount <= 10_000 && userCount <= 100_000;
    const recommendedShardCount = Math.max(3, Math.ceil(userCount / 25_000));
    const regionalPods = this.resolveRegionalPods(deploymentModel, topologyMode);

    return {
      programName,
      status: withinTarget ? 'READY' : 'REVIEW_NEEDED',
      deploymentModel,
      topologyMode,
      companyCount,
      branchCount,
      userCount,
      unlimitedDimensions,
      recommendedShardCount,
      regionalPods,
      globalRolloutDate: '2026-07-31',
      summary: `Global enterprise preview for "${programName}" now models ${companyCount.toLocaleString(
        'en-US',
      )} companies, ${branchCount.toLocaleString('en-US')} branches, and ${userCount.toLocaleString(
        'en-US',
      )} users with unlimited warehouse, store, currency, language, and theme policies kept under one governed platform lane.`,
      scalePlan: [
        {
          dimension: 'COMPANY',
          target: companyCount.toLocaleString('en-US'),
          policy:
            'Provision legal entity templates with isolated defaults and shared-service inheritance.',
        },
        {
          dimension: 'BRANCH',
          target: branchCount.toLocaleString('en-US'),
          policy:
            'Roll out branch starter packs with regional policy overlays and local routing visibility.',
        },
        {
          dimension: 'USER',
          target: userCount.toLocaleString('en-US'),
          policy:
            'Partition workforce identity, audit, and automation queues across regional pods.',
        },
        ...unlimitedDimensions.map((dimension) => ({
          dimension,
          target: 'Unlimited by policy',
          policy: this.resolveUnlimitedPolicy(dimension),
        })),
      ],
      governanceChecks: [
        'Cross-company role inheritance must remain tenant-scoped even when companies exceed 1,000 entities.',
        'Branch and warehouse provisioning should be pushed through regional onboarding queues before Friday, July 31, 2026.',
        'Localization packs must preserve currency, language, and theme fallbacks without leaking restricted defaults.',
      ],
      enablementTracks: [
        'Regional control pods for APAC, EMEA, and AMER',
        'Shared audit and federation baseline for 100,000-user identity scale',
        'Tenant-safe rollout checklist for unlimited warehouse and store growth',
      ],
    };
  }

  private resolveDeploymentModel(value?: string): GlobalEnterpriseDeploymentModel {
    if (!value) {
      return 'GLOBAL_FEDERATION';
    }

    if (!globalEnterpriseDeploymentModels.includes(value as GlobalEnterpriseDeploymentModel)) {
      throw new AppException(
        ERROR_CODES.GLOBAL_ENTERPRISE_INPUT_INVALID,
        `Unsupported global deployment model: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as GlobalEnterpriseDeploymentModel;
  }

  private resolveTopologyMode(value?: string): GlobalEnterpriseTopologyMode {
    if (!value) {
      return 'REGIONAL_HUBS';
    }

    if (!globalEnterpriseTopologyModes.includes(value as GlobalEnterpriseTopologyMode)) {
      throw new AppException(
        ERROR_CODES.GLOBAL_ENTERPRISE_INPUT_INVALID,
        `Unsupported global topology mode: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as GlobalEnterpriseTopologyMode;
  }

  private resolveCount(value: number | undefined, label: string) {
    if (!Number.isFinite(value) || (value ?? 0) <= 0) {
      throw new AppException(
        ERROR_CODES.GLOBAL_ENTERPRISE_INPUT_INVALID,
        `${label} must be greater than zero.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return Math.floor(value as number);
  }

  private resolveUnlimitedDimensions(values?: string[]): GlobalEnterpriseScaleDimension[] {
    const requested = values?.length ? values : unlimitedDimensionsDefault;

    return requested.map((dimension) => {
      if (!globalEnterpriseScaleDimensions.includes(dimension as GlobalEnterpriseScaleDimension)) {
        throw new AppException(
          ERROR_CODES.GLOBAL_ENTERPRISE_INPUT_INVALID,
          `Unsupported unlimited enterprise dimension: ${dimension}.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return dimension as GlobalEnterpriseScaleDimension;
    });
  }

  private resolveRegionalPods(
    deploymentModel: GlobalEnterpriseDeploymentModel,
    topologyMode: GlobalEnterpriseTopologyMode,
  ) {
    if (deploymentModel === 'GLOBAL_FEDERATION' || topologyMode === 'REGIONAL_HUBS') {
      return ['APAC Control Pod', 'EMEA Control Pod', 'AMER Control Pod'];
    }

    if (topologyMode === 'SOVEREIGN_PODS') {
      return ['Indonesia Sovereign Pod', 'EU Sovereign Pod', 'US Sovereign Pod'];
    }

    return ['Primary Global Pod', 'Secondary DR Pod'];
  }

  private resolveUnlimitedPolicy(dimension: GlobalEnterpriseScaleDimension) {
    switch (dimension) {
      case 'WAREHOUSE':
        return 'Use branch-aware provisioning templates so warehouses can scale without manual control-plane duplication.';
      case 'STORE':
        return 'Treat stores as branch-attached surfaces with local retail defaults and shared catalog policy.';
      case 'CURRENCY':
        return 'Distribute currency dictionaries and exchange-rate safeguards through finance control lanes.';
      case 'LANGUAGE':
        return 'Apply dictionary fallback packs and content ownership per locale bundle.';
      case 'THEME':
        return 'Scope theme tokens per company or partner while preserving enterprise accessibility guardrails.';
      case 'COMPANY':
      case 'BRANCH':
      case 'USER':
        return 'Scale this dimension under governed provisioning and identity controls.';
    }
  }
}
