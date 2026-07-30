import { HttpStatus, Injectable } from '@nestjs/common';
import {
  novaOsCollaborationModes,
  novaOsDeploymentModes,
  novaOsStudios,
  selfServeBuilderStatuses,
  type NovaOsCollaborationMode,
  type NovaOsDeploymentMode,
  type NovaOsStudio,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NovaOsPreviewInput = {
  programName?: string;
  deploymentMode?: string;
  collaborationMode?: string;
  studios?: string[];
  regions?: string[];
};

type NovaOsStarterTrack = {
  title: string;
  deploymentMode: NovaOsDeploymentMode;
  collaborationMode: NovaOsCollaborationMode;
  focus: string;
};

export type NovaOsFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  deploymentModes: readonly NovaOsDeploymentMode[];
  collaborationModes: readonly NovaOsCollaborationMode[];
  studios: readonly NovaOsStudio[];
  recommendedRegions: string[];
  starterTracks: NovaOsStarterTrack[];
};

export type NovaOsPreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  deploymentMode: NovaOsDeploymentMode;
  collaborationMode: NovaOsCollaborationMode;
  studios: NovaOsStudio[];
  regions: string[];
  eventBusMode: string;
  apiGatewayProfile: string;
  featureFlagStrategy: string;
  migrationWaveDate: string;
  summary: string;
  runtimeSurfaces: string[];
  launchMilestones: string[];
  governanceHooks: string[];
};

const defaultStudios: NovaOsStudio[] = [
  'VISUAL_WORKFLOW_STUDIO',
  'AI_STUDIO',
  'API_GATEWAY',
  'FEATURE_FLAGS',
  'TENANT_MIGRATION',
  'OBSERVABILITY_CENTER',
];

@Injectable()
export class NovaOsService {
  getFoundation(): NovaOsFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      deploymentModes: novaOsDeploymentModes,
      collaborationModes: novaOsCollaborationModes,
      studios: novaOsStudios,
      recommendedRegions: ['jakarta-1', 'singapore-1', 'frankfurt-1'],
      starterTracks: [
        {
          title: 'Platform OS Core',
          deploymentMode: 'MULTI_REGION_FABRIC',
          collaborationMode: 'LIVE_MULTIPLAYER',
          focus:
            'Satukan workflow studio, AI studio, API gateway, feature flags, dan observability center dalam control plane tunggal.',
        },
        {
          title: 'Sovereign Enterprise Fabric',
          deploymentMode: 'SOVEREIGN_FABRIC',
          collaborationMode: 'HYBRID_SESSION',
          focus:
            'Siapkan tenant migration, multi-region isolation, dan white-label runtime untuk enterprise regulated.',
        },
        {
          title: 'Product Builder Lane',
          deploymentMode: 'SINGLE_CONTROL_PLANE',
          collaborationMode: 'ASYNC_REVIEW',
          focus:
            'Fokus pada extension marketplace, theme builder, dan plugin SDK sebelum real-time collaboration dibuka lebar.',
        },
      ],
    };
  }

  preview(input: NovaOsPreviewInput): NovaOsPreview {
    const programName = input.programName?.trim();

    if (!programName) {
      throw new AppException(
        ERROR_CODES.NOVA_OS_INPUT_INVALID,
        'Program name is required for NovaOS preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const deploymentMode = this.resolveDeploymentMode(input.deploymentMode);
    const collaborationMode = this.resolveCollaborationMode(input.collaborationMode);
    const studios = this.resolveStudios(input.studios);
    const regions = this.resolveRegions(input.regions);
    const launchReady =
      studios.includes('EVENT_BUS') &&
      studios.includes('API_GATEWAY') &&
      studios.includes('FEATURE_FLAGS') &&
      studios.includes('TENANT_MIGRATION') &&
      regions.length >= 2;

    return {
      programName,
      status: launchReady ? 'READY' : 'REVIEW_NEEDED',
      deploymentMode,
      collaborationMode,
      studios,
      regions,
      eventBusMode:
        deploymentMode === 'SINGLE_CONTROL_PLANE'
          ? 'Central event spine'
          : 'Region-aware replicated event fabric',
      apiGatewayProfile:
        collaborationMode === 'LIVE_MULTIPLAYER'
          ? 'Realtime API gateway with collaboration channels'
          : 'Governed API gateway with async review hooks',
      featureFlagStrategy: 'Tenant, company, and region scoped progressive rollout',
      migrationWaveDate: '2026-08-14',
      summary: `NovaOS preview for "${programName}" now assembles ${studios.length} platform studios across ${regions.length} regions, with API gateway, event bus, feature flags, and tenant migration kept under one operating shell.`,
      runtimeSurfaces: [
        'Visual Workflow Studio for drag-and-drop orchestration',
        'AI Studio for internal agent prompts, tools, and governed deployment packs',
        'Offline-first mobile sync and observability center for field operations',
        'Extension marketplace, theme builder, and white-label shell for tenant customization',
      ],
      launchMilestones: [
        'Open API gateway and plugin SDK contracts for internal builders first',
        'Pilot real-time collaboration on shared dashboard and workflow surfaces',
        'Roll out feature flags and tenant migration runbooks before Friday, August 14, 2026.',
      ],
      governanceHooks: [
        'Every studio release should emit event bus, feature flag, and audit metadata together.',
        'Tenant migration tools must carry rollback checkpoints before multi-region moves are permitted.',
        'White-label and theme builder changes should remain bounded by extension marketplace permission scopes.',
      ],
    };
  }

  private resolveDeploymentMode(value?: string): NovaOsDeploymentMode {
    if (!value) {
      return 'MULTI_REGION_FABRIC';
    }

    if (!novaOsDeploymentModes.includes(value as NovaOsDeploymentMode)) {
      throw new AppException(
        ERROR_CODES.NOVA_OS_INPUT_INVALID,
        `Unsupported NovaOS deployment mode: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as NovaOsDeploymentMode;
  }

  private resolveCollaborationMode(value?: string): NovaOsCollaborationMode {
    if (!value) {
      return 'LIVE_MULTIPLAYER';
    }

    if (!novaOsCollaborationModes.includes(value as NovaOsCollaborationMode)) {
      throw new AppException(
        ERROR_CODES.NOVA_OS_INPUT_INVALID,
        `Unsupported NovaOS collaboration mode: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as NovaOsCollaborationMode;
  }

  private resolveStudios(value?: string[]) {
    const studios = (value ?? defaultStudios)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, current) => current.indexOf(item) === index);

    if (studios.length === 0) {
      throw new AppException(
        ERROR_CODES.NOVA_OS_INPUT_INVALID,
        'At least one NovaOS studio is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const invalidStudio = studios.find((studio) => !novaOsStudios.includes(studio as NovaOsStudio));

    if (invalidStudio) {
      throw new AppException(
        ERROR_CODES.NOVA_OS_INPUT_INVALID,
        `Unsupported NovaOS studio: ${invalidStudio}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return studios as NovaOsStudio[];
  }

  private resolveRegions(value?: string[]) {
    const regions = (value ?? ['jakarta-1', 'singapore-1'])
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, current) => current.indexOf(item) === index);

    if (regions.length === 0) {
      throw new AppException(
        ERROR_CODES.NOVA_OS_INPUT_INVALID,
        'At least one NovaOS region is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return regions;
  }
}
