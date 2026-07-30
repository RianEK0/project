import { HttpStatus, Injectable } from '@nestjs/common';
import {
  enterpriseCloudRegionStrategies,
  enterpriseCloudServiceLanes,
  enterpriseCloudTenancyModes,
  selfServeBuilderStatuses,
  type EnterpriseCloudRegionStrategy,
  type EnterpriseCloudServiceLane,
  type EnterpriseCloudTenancyMode,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type EnterpriseCloudPreviewInput = {
  programName?: string;
  tenancyMode?: string;
  regionStrategy?: string;
  tenantCount?: number;
  regions?: string[];
  enabledLanes?: string[];
};

type EnterpriseCloudStarterProfile = {
  title: string;
  tenancyMode: EnterpriseCloudTenancyMode;
  regionStrategy: EnterpriseCloudRegionStrategy;
  focus: string;
};

type EnterpriseCloudServicePlan = {
  lane: EnterpriseCloudServiceLane;
  owner: string;
  policy: string;
};

export type EnterpriseCloudFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  tenancyModes: readonly EnterpriseCloudTenancyMode[];
  regionStrategies: readonly EnterpriseCloudRegionStrategy[];
  serviceLanes: readonly EnterpriseCloudServiceLane[];
  recommendedRegions: string[];
  starterProfiles: EnterpriseCloudStarterProfile[];
};

export type EnterpriseCloudPreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  tenancyMode: EnterpriseCloudTenancyMode;
  regionStrategy: EnterpriseCloudRegionStrategy;
  tenantCount: number;
  regions: string[];
  enabledLanes: EnterpriseCloudServiceLane[];
  monthlyBillingForecast: string;
  backupRpoMinutes: number;
  restoreRtoMinutes: number;
  scaleReadinessDate: string;
  summary: string;
  servicePlans: EnterpriseCloudServicePlan[];
  operationalGuardrails: string[];
  observabilityStack: string[];
};

const defaultRegions = ['jakarta-1', 'singapore-1'];
const defaultEnabledLanes: EnterpriseCloudServiceLane[] = [
  'SUBSCRIPTION',
  'BILLING',
  'USAGE',
  'TENANT',
  'REGION',
  'BACKUP',
  'RESTORE',
  'MONITORING',
  'SECURITY',
  'SCALING',
];

@Injectable()
export class EnterpriseCloudService {
  getFoundation(): EnterpriseCloudFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      tenancyModes: enterpriseCloudTenancyModes,
      regionStrategies: enterpriseCloudRegionStrategies,
      serviceLanes: enterpriseCloudServiceLanes,
      recommendedRegions: ['jakarta-1', 'singapore-1', 'frankfurt-1', 'virginia-1'],
      starterProfiles: [
        {
          title: 'Regional SaaS Core',
          tenancyMode: 'SHARED_SAAS',
          regionStrategy: 'ACTIVE_PASSIVE_MULTI_REGION',
          focus:
            'Gabungkan subscription, billing, queue, worker, dan monitoring sebagai lane SaaS utama untuk tenant regional.',
        },
        {
          title: 'Enterprise Residency Pack',
          tenancyMode: 'DEDICATED_ENTERPRISE',
          regionStrategy: 'SINGLE_REGION',
          focus:
            'Siapkan tenant premium dengan backup, restore, audit, dan security control yang lebih ketat pada region khusus.',
        },
        {
          title: 'Global Cloud Fabric',
          tenancyMode: 'HYBRID_RESIDENCY',
          regionStrategy: 'ACTIVE_ACTIVE_MULTI_REGION',
          focus:
            'Skalakan tenant lintas region dengan CDN, storage, queue, worker, dan autoscaling yang tetap governed.',
        },
      ],
    };
  }

  preview(input: EnterpriseCloudPreviewInput): EnterpriseCloudPreview {
    const programName = input.programName?.trim();

    if (!programName) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_CLOUD_INPUT_INVALID,
        'Program name is required for enterprise cloud preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tenancyMode = this.resolveTenancyMode(input.tenancyMode);
    const regionStrategy = this.resolveRegionStrategy(input.regionStrategy);
    const tenantCount = this.resolveTenantCount(input.tenantCount);
    const regions = this.resolveRegions(input.regions);
    const enabledLanes = this.resolveEnabledLanes(input.enabledLanes);
    const readyForLaunch =
      tenantCount <= 2_500 &&
      regions.length <= 4 &&
      enabledLanes.includes('BACKUP') &&
      enabledLanes.includes('RESTORE') &&
      enabledLanes.includes('MONITORING') &&
      enabledLanes.includes('SECURITY');

    return {
      programName,
      status: readyForLaunch ? 'READY' : 'REVIEW_NEEDED',
      tenancyMode,
      regionStrategy,
      tenantCount,
      regions,
      enabledLanes,
      monthlyBillingForecast: `USD ${(tenantCount * 42).toLocaleString('en-US')}`,
      backupRpoMinutes: regionStrategy === 'ACTIVE_ACTIVE_MULTI_REGION' ? 10 : 30,
      restoreRtoMinutes: tenancyMode === 'DEDICATED_ENTERPRISE' ? 45 : 90,
      scaleReadinessDate: '2026-08-06',
      summary: `Enterprise Cloud preview for "${programName}" now models ${tenantCount.toLocaleString(
        'en-US',
      )} tenants across ${regions.length} regions with subscription, billing, backup, monitoring, queue, worker, and scaling services kept inside one SaaS control plane.`,
      servicePlans: enabledLanes.map((lane) => this.buildServicePlan(lane)),
      operationalGuardrails: [
        'Backup verification should complete before Thursday, August 6, 2026, for every production region.',
        'Subscription, billing, and usage meters must stay tenant-scoped before shared SaaS rollout expands beyond 2,500 tenants.',
        'Queue and worker pools should scale independently so noisy tenants do not affect restore or monitoring lanes.',
      ],
      observabilityStack: [
        'Prometheus scrape federation for worker, queue, and API saturation',
        'Grafana tenant health boards for billing, usage, backup, and restore posture',
        'Audit-ready storage and CDN access logs for security review',
      ],
    };
  }

  private resolveTenancyMode(value?: string): EnterpriseCloudTenancyMode {
    if (!value) {
      return 'HYBRID_RESIDENCY';
    }

    if (!enterpriseCloudTenancyModes.includes(value as EnterpriseCloudTenancyMode)) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_CLOUD_INPUT_INVALID,
        `Unsupported enterprise cloud tenancy mode: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as EnterpriseCloudTenancyMode;
  }

  private resolveRegionStrategy(value?: string): EnterpriseCloudRegionStrategy {
    if (!value) {
      return 'ACTIVE_ACTIVE_MULTI_REGION';
    }

    if (!enterpriseCloudRegionStrategies.includes(value as EnterpriseCloudRegionStrategy)) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_CLOUD_INPUT_INVALID,
        `Unsupported enterprise cloud region strategy: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as EnterpriseCloudRegionStrategy;
  }

  private resolveTenantCount(value?: number) {
    if (!Number.isFinite(value) || (value ?? 0) <= 0) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_CLOUD_INPUT_INVALID,
        'Tenant count must be greater than zero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return Math.floor(value as number);
  }

  private resolveRegions(value?: string[]) {
    const regions = (value ?? defaultRegions)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, current) => current.indexOf(item) === index);

    if (regions.length === 0) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_CLOUD_INPUT_INVALID,
        'At least one cloud region is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return regions;
  }

  private resolveEnabledLanes(value?: string[]) {
    const lanes = (value ?? defaultEnabledLanes).map((item) => item.trim()).filter(Boolean);

    if (lanes.length === 0) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_CLOUD_INPUT_INVALID,
        'At least one enterprise cloud service lane is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const invalidLane = lanes.find(
      (lane) => !enterpriseCloudServiceLanes.includes(lane as EnterpriseCloudServiceLane),
    );

    if (invalidLane) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_CLOUD_INPUT_INVALID,
        `Unsupported enterprise cloud service lane: ${invalidLane}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return lanes.filter(
      (lane, index, current) => current.indexOf(lane) === index,
    ) as EnterpriseCloudServiceLane[];
  }

  private buildServicePlan(lane: EnterpriseCloudServiceLane): EnterpriseCloudServicePlan {
    switch (lane) {
      case 'SUBSCRIPTION':
        return {
          lane,
          owner: 'Revenue Operations',
          policy: 'Keep plan catalogs versioned per tenant cohort and region.',
        };
      case 'BILLING':
        return {
          lane,
          owner: 'Finance Platform',
          policy: 'Separate invoice issuance, retries, and tax evidence by region.',
        };
      case 'USAGE':
        return {
          lane,
          owner: 'Platform Metering',
          policy: 'Meter API, storage, worker, and AI usage with hourly tenant snapshots.',
        };
      case 'TENANT':
        return {
          lane,
          owner: 'Tenant Operations',
          policy:
            'Provision tenant defaults, residency, and region access through governed templates.',
        };
      case 'REGION':
        return {
          lane,
          owner: 'Cloud Foundation',
          policy: 'Treat region activation as a reviewed rollout with explicit failover policy.',
        };
      case 'BACKUP':
        return {
          lane,
          owner: 'Reliability Engineering',
          policy: 'Run daily encrypted snapshots with documented restore rehearsal.',
        };
      case 'RESTORE':
        return {
          lane,
          owner: 'Reliability Engineering',
          policy: 'Restore drills must be measured against region-specific RTO commitments.',
        };
      case 'MONITORING':
        return {
          lane,
          owner: 'Observability Team',
          policy:
            'Expose queue lag, worker saturation, billing failures, and API latency per tenant tier.',
        };
      case 'AUDIT':
        return {
          lane,
          owner: 'Security Governance',
          policy:
            'Capture tenant-admin actions, retention policy changes, and restore requests in the audit chain.',
        };
      case 'SECURITY':
        return {
          lane,
          owner: 'Security Platform',
          policy:
            'Enforce secrets rotation, encryption posture, and access reviews across regions.',
        };
      case 'CDN':
        return {
          lane,
          owner: 'Edge Delivery',
          policy:
            'Distribute portal, asset, and download traffic with region-aware cache invalidation.',
        };
      case 'STORAGE':
        return {
          lane,
          owner: 'Data Platform',
          policy: 'Partition objects, backups, and exports by tenant and residency rule.',
        };
      case 'QUEUE':
        return {
          lane,
          owner: 'Platform Runtime',
          policy: 'Route automation, billing, and document jobs through isolated queue classes.',
        };
      case 'WORKER':
        return {
          lane,
          owner: 'Platform Runtime',
          policy:
            'Scale workers by workload family so OCR or sync bursts do not starve core ERP jobs.',
        };
      case 'SCALING':
        return {
          lane,
          owner: 'SRE',
          policy:
            'Autoscale API, worker, and storage tiers with tenant-safe throttling thresholds.',
        };
    }
  }
}
