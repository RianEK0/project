import type {
  ApiSuccessResponse,
  DocumentWorkspaceArea,
  DocumentWorkspaceCapabilityKey,
  DocumentWorkspaceCapabilityStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

type DocumentsRouteLink = {
  label: string;
  route: string;
};

type DocumentsWorkspaceCard = {
  id: string;
  label: string;
  route: string;
  description: string;
};

export type DocumentsWorkspaceFoundation = {
  capabilities: DocumentWorkspaceCapabilityKey[];
  areas: DocumentWorkspaceArea[];
  statuses: DocumentWorkspaceCapabilityStatus[];
  cards: DocumentsWorkspaceCard[];
  relatedRoutes: DocumentsRouteLink[];
};

export type DocumentCapabilityPreview = {
  key: DocumentWorkspaceCapabilityKey;
  label: string;
  status: DocumentWorkspaceCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

type DocumentsAreaPreview = {
  area: DocumentWorkspaceArea;
  status: DocumentWorkspaceCapabilityStatus;
  enabledCapabilities: number;
  capabilitiesExpected: number;
  nextFocus: string;
  summary: string;
  capabilities: DocumentCapabilityPreview[];
};

export type DocumentFormatsPreview = DocumentsAreaPreview & {
  area: 'FILE_FORMATS';
  previewSupportPct: number;
  editingContinuityPct: number;
  searchabilityPct: number;
};

export type DocumentRecordsPreview = DocumentsAreaPreview & {
  area: 'BUSINESS_RECORDS';
  contractCoveragePct: number;
  invoiceCoveragePct: number;
  approvalTraceabilityPct: number;
};

export type DocumentGovernancePreview = DocumentsAreaPreview & {
  area: 'GOVERNANCE_KNOWLEDGE';
  sopCoveragePct: number;
  trainingCoveragePct: number;
  policyControlPct: number;
};

export type DocumentsWorkspaceFoundationResponse = ApiSuccessResponse<DocumentsWorkspaceFoundation>;
export type DocumentFormatsPreviewResponse = ApiSuccessResponse<DocumentFormatsPreview>;
export type DocumentRecordsPreviewResponse = ApiSuccessResponse<DocumentRecordsPreview>;
export type DocumentGovernancePreviewResponse = ApiSuccessResponse<DocumentGovernancePreview>;

export const documentsApi = {
  getWorkspace() {
    return apiClient.get<DocumentsWorkspaceFoundationResponse>('/documents-workspace');
  },
  getFormatsPreview() {
    return apiClient.get<DocumentFormatsPreviewResponse>('/documents-workspace/formats-preview');
  },
  getRecordsPreview() {
    return apiClient.get<DocumentRecordsPreviewResponse>('/documents-workspace/records-preview');
  },
  getGovernancePreview() {
    return apiClient.get<DocumentGovernancePreviewResponse>(
      '/documents-workspace/governance-preview',
    );
  },
};
