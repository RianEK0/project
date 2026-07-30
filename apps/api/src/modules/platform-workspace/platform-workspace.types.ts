import type {
  PlatformCapabilityKey,
  PlatformCapabilityStatus,
  PlatformWorkspaceArea,
} from '@nova/shared-types';

export type PlatformControlSummary = {
  key: PlatformCapabilityKey;
  label: string;
  status: PlatformCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

export type PlatformAreaPreview = {
  area: PlatformWorkspaceArea;
  status: PlatformCapabilityStatus;
  enabledControls: number;
  controlsExpected: number;
  nextFocus: string;
  summary: string;
  controls: PlatformControlSummary[];
};

export type PlatformTopologyPreview = PlatformAreaPreview & {
  area: 'TOPOLOGY';
  companyScopePct: number;
  branchCoveragePct: number;
  warehouseCoveragePct: number;
  localeCoveragePct: number;
};

export type PlatformExperiencePreview = PlatformAreaPreview & {
  area: 'EXPERIENCE';
  brandingCoveragePct: number;
  marketplaceReadinessPct: number;
  extensionGovernancePct: number;
};

export type PlatformIdentityPreview = PlatformAreaPreview & {
  area: 'IDENTITY_TRUST';
  auditCoveragePct: number;
  complianceCoveragePct: number;
  federationCoveragePct: number;
};
