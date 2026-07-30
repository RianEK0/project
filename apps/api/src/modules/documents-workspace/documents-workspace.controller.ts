import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  documentWorkspaceAreas,
  documentWorkspaceCapabilityKeys,
  documentWorkspaceCapabilityStatuses,
} from '@nova/shared-types';

import { DocumentFormatsService } from './document-formats.service';
import { DocumentGovernanceService } from './document-governance.service';
import { DocumentRecordsService } from './document-records.service';

@ApiTags('Documents Workspace')
@Controller({
  path: 'documents-workspace',
  version: '1',
})
export class DocumentsWorkspaceController {
  constructor(
    private readonly documentFormatsService: DocumentFormatsService,
    private readonly documentRecordsService: DocumentRecordsService,
    private readonly documentGovernanceService: DocumentGovernanceService,
  ) {}

  @Get()
  getWorkspace() {
    return {
      capabilities: documentWorkspaceCapabilityKeys,
      areas: documentWorkspaceAreas,
      statuses: documentWorkspaceCapabilityStatuses,
      cards: [
        {
          id: 'file-formats',
          label: 'File Formats',
          route: '/app/documents/pdf',
          description:
            'PDF, Word, and Excel as the governed format lane for enterprise-ready document access.',
        },
        {
          id: 'business-records',
          label: 'Business Records',
          route: '/app/documents/contract',
          description:
            'Contracts and invoices as traceable business records linked back to operational workflows.',
        },
        {
          id: 'governance-knowledge',
          label: 'Governance & Knowledge',
          route: '/app/documents/company-sop',
          description:
            'Company SOP, manuals, training materials, and policies in one governed knowledge lane.',
        },
      ],
      relatedRoutes: [
        { label: 'AI document OCR', route: '/app/ai/document-ocr' },
        { label: 'Invoices', route: '/app/invoices' },
        { label: 'Procurement contracts', route: '/app/procurement/contracts' },
        { label: 'HR training', route: '/app/hr/training' },
        { label: 'Platform compliance', route: '/app/platform/compliance' },
        { label: 'Portal downloads', route: '/portal/downloads' },
      ],
    };
  }

  @Get('formats-preview')
  getFormatsPreview() {
    return this.documentFormatsService.previewReadiness({
      capabilitiesExpected: 3,
      previewSupportPct: 86,
      editingContinuityPct: 81,
      searchabilityPct: 78,
      capabilities: [
        {
          key: 'PDF_LIBRARY',
          label: 'PDF',
          readinessPct: 88,
          previewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Distribute invoices, SOPs, proofs, and controlled exports in a stable review format.',
          nextFocus:
            'Broaden annotation and signed-copy review patterns for finance and compliance teams.',
        },
        {
          key: 'WORD_LIBRARY',
          label: 'Word',
          readinessPct: 79,
          previewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Coordinate editable policies, manuals, and contract drafts before controlled publication.',
          nextFocus: 'Improve tracked-change continuity and draft-to-approved handoff visibility.',
        },
        {
          key: 'EXCEL_LIBRARY',
          label: 'Excel',
          readinessPct: 76,
          previewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Support governed spreadsheets for analysis packs, vendor pricing, budgets, and planning.',
          nextFocus:
            'Add workbook lineage, tab-level preview cues, and stronger governed export references.',
        },
      ],
    });
  }

  @Get('records-preview')
  getRecordsPreview() {
    return this.documentRecordsService.previewReadiness({
      capabilitiesExpected: 2,
      contractCoveragePct: 82,
      invoiceCoveragePct: 88,
      approvalTraceabilityPct: 79,
      capabilities: [
        {
          key: 'CONTRACT_LIBRARY',
          label: 'Contract',
          readinessPct: 81,
          reviewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Centralize procurement and commercial contracts with clear review and reference trails.',
          nextFocus:
            'Improve expiry, obligation, and approval-path visibility around governed contract records.',
        },
        {
          key: 'INVOICE_LIBRARY',
          label: 'Invoice',
          readinessPct: 87,
          reviewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Unify issued invoices, prepared payables, and document evidence in one review lane.',
          nextFocus:
            'Strengthen duplicate-detection, exception routing, and evidence bundling around invoices.',
        },
      ],
    });
  }

  @Get('governance-preview')
  getGovernancePreview() {
    return this.documentGovernanceService.previewReadiness({
      capabilitiesExpected: 4,
      sopCoveragePct: 80,
      trainingCoveragePct: 77,
      policyControlPct: 84,
      capabilities: [
        {
          key: 'COMPANY_SOP',
          label: 'Company SOP',
          readinessPct: 83,
          publishReady: true,
          routeCount: 3,
          primaryUseCase:
            'Publish operating procedures with versioned ownership for frontline and back-office teams.',
          nextFocus:
            'Expand branch-aware rollout and acknowledgement evidence for critical procedures.',
        },
        {
          key: 'MANUAL_LIBRARY',
          label: 'Manual',
          readinessPct: 78,
          publishReady: true,
          routeCount: 3,
          primaryUseCase:
            'Organize equipment, warehouse, production, and admin manuals in reusable bundles.',
          nextFocus:
            'Improve role-specific packaging and quick-start access for operational manuals.',
        },
        {
          key: 'TRAINING_LIBRARY',
          label: 'Training',
          readinessPct: 76,
          publishReady: true,
          routeCount: 3,
          primaryUseCase:
            'Deliver onboarding and recurring training artifacts with governed publishing context.',
          nextFocus:
            'Connect training materials more tightly to completion tracking and role progression.',
        },
        {
          key: 'POLICY_LIBRARY',
          label: 'Policy',
          readinessPct: 84,
          publishReady: true,
          routeCount: 3,
          primaryUseCase:
            'Maintain policy documents with controlled review, ownership, and compliance alignment.',
          nextFocus:
            'Add stronger exception handling, sign-off references, and policy change narratives.',
        },
      ],
    });
  }
}
