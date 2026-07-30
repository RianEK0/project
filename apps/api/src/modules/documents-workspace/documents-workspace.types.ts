import type {
  DocumentWorkspaceArea,
  DocumentWorkspaceCapabilityKey,
  DocumentWorkspaceCapabilityStatus,
} from '@nova/shared-types';

export type DocumentsWorkspaceCapabilitySummary = {
  key: DocumentWorkspaceCapabilityKey;
  label: string;
  status: DocumentWorkspaceCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

export type DocumentsWorkspaceAreaPreview = {
  area: DocumentWorkspaceArea;
  status: DocumentWorkspaceCapabilityStatus;
  enabledCapabilities: number;
  capabilitiesExpected: number;
  nextFocus: string;
  summary: string;
  capabilities: DocumentsWorkspaceCapabilitySummary[];
};

export type DocumentFormatsPreview = DocumentsWorkspaceAreaPreview & {
  area: 'FILE_FORMATS';
  previewSupportPct: number;
  editingContinuityPct: number;
  searchabilityPct: number;
};

export type DocumentRecordsPreview = DocumentsWorkspaceAreaPreview & {
  area: 'BUSINESS_RECORDS';
  contractCoveragePct: number;
  invoiceCoveragePct: number;
  approvalTraceabilityPct: number;
};

export type DocumentGovernancePreview = DocumentsWorkspaceAreaPreview & {
  area: 'GOVERNANCE_KNOWLEDGE';
  sopCoveragePct: number;
  trainingCoveragePct: number;
  policyControlPct: number;
};
