import { HttpStatus, Injectable } from '@nestjs/common';
import {
  reportBuilderBlockTypes,
  reportBuilderExportFormats,
  reportBuilderJoinTypes,
  selfServeBuilderStatuses,
  type ReportBuilderBlockType,
  type ReportBuilderExportFormat,
  type ReportBuilderJoinType,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type ReportBlockDraft = {
  id?: string;
  type?: string;
};

type ReportBuilderPreviewInput = {
  reportName?: string;
  dataset?: string;
  joinType?: string;
  blocks?: ReportBlockDraft[];
};

type ReportPreviewStage = {
  type: ReportBuilderBlockType;
  summary: string;
};

export type ReportBuilderFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  blockTypes: readonly ReportBuilderBlockType[];
  joinTypes: readonly ReportBuilderJoinType[];
  exportFormats: readonly ReportBuilderExportFormat[];
  datasets: string[];
  starterColumns: string[];
};

export type ReportBuilderPreview = {
  reportName: string;
  dataset: string;
  joinType: ReportBuilderJoinType;
  status: SelfServeBuilderStatus;
  blockCount: number;
  summary: string;
  sqlPreview: string;
  estimatedRows: number;
  outputColumns: string[];
  exportFormats: readonly ReportBuilderExportFormat[];
  guardrails: string[];
  stages: ReportPreviewStage[];
  recommendedScheduleDate: string;
};

const datasets = [
  'Sales Orders',
  'Purchase Orders',
  'Invoices',
  'Inventory Balances',
  'Customers',
  'Suppliers',
] as const;
type ReportDataset = (typeof datasets)[number];

@Injectable()
export class ReportBuilderService {
  getFoundation(): ReportBuilderFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      blockTypes: reportBuilderBlockTypes,
      joinTypes: reportBuilderJoinTypes,
      exportFormats: reportBuilderExportFormats,
      datasets: [...datasets],
      starterColumns: [
        'document_number',
        'status',
        'owner',
        'counterparty',
        'amount',
        'created_at',
      ],
    };
  }

  preview(input: ReportBuilderPreviewInput): ReportBuilderPreview {
    const reportName = input.reportName?.trim();
    const dataset = input.dataset?.trim();

    if (!reportName || !dataset) {
      throw new AppException(
        ERROR_CODES.REPORT_BUILDER_INPUT_INVALID,
        'Report name and dataset are required for preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!datasets.includes(dataset as (typeof datasets)[number])) {
      throw new AppException(
        ERROR_CODES.REPORT_BUILDER_INPUT_INVALID,
        `Unsupported report dataset: ${dataset}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const resolvedDataset = dataset as ReportDataset;
    const joinType = this.resolveJoinType(input.joinType);
    const blocks = this.resolveBlocks(input.blocks);

    if (blocks.length === 0 || blocks[0]?.type !== 'SELECT') {
      throw new AppException(
        ERROR_CODES.REPORT_BUILDER_INPUT_INVALID,
        'Report preview must start with a SELECT block.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const outputColumns = this.resolveOutputColumns(resolvedDataset, blocks);

    return {
      reportName,
      dataset: resolvedDataset,
      joinType,
      status: blocks.length >= 4 ? 'READY' : 'REVIEW_NEEDED',
      blockCount: blocks.length,
      summary: `Report "${reportName}" now turns ${resolvedDataset} into a click-built report with ${blocks.length} query stages covering select, filter, group, sort, join, or export.`,
      sqlPreview: this.buildSqlPreview(resolvedDataset, blocks, joinType, outputColumns),
      estimatedRows: 428 + blocks.length * 32,
      outputColumns,
      exportFormats: reportBuilderExportFormats,
      guardrails: [
        'Tenant and organization filters remain enforced even in self-serve mode.',
        'Exports above 50,000 rows should move to async generation before production rollout.',
        'Cross-domain joins should stay limited to approved marts and shared dimensions.',
      ],
      stages: blocks.map((block) => ({
        type: block.type,
        summary: this.buildStageSummary(block.type, resolvedDataset),
      })),
      recommendedScheduleDate: '2026-07-27',
    };
  }

  private resolveJoinType(joinType?: string): ReportBuilderJoinType {
    if (!joinType) {
      return 'LEFT';
    }

    if (!reportBuilderJoinTypes.includes(joinType as ReportBuilderJoinType)) {
      throw new AppException(
        ERROR_CODES.REPORT_BUILDER_INPUT_INVALID,
        `Unsupported report join type: ${joinType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return joinType as ReportBuilderJoinType;
  }

  private resolveBlocks(blocks?: ReportBlockDraft[]) {
    return (blocks ?? [])
      .filter((block): block is Required<ReportBlockDraft> =>
        Boolean(block.id?.trim() && block.type?.trim()),
      )
      .slice(0, 8)
      .map((block) => {
        if (!reportBuilderBlockTypes.includes(block.type as ReportBuilderBlockType)) {
          throw new AppException(
            ERROR_CODES.REPORT_BUILDER_INPUT_INVALID,
            `Unsupported report block type: ${block.type}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        return {
          id: block.id,
          type: block.type as ReportBuilderBlockType,
        };
      });
  }

  private resolveOutputColumns(
    dataset: ReportDataset,
    blocks: Array<{ id: string; type: ReportBuilderBlockType }>,
  ): string[] {
    const baseColumns = this.datasetColumns(dataset);

    if (blocks.some((block) => block.type === 'GROUP')) {
      return [baseColumns[0] ?? 'document_number', 'record_count', 'total_amount'];
    }

    return baseColumns;
  }

  private buildSqlPreview(
    dataset: ReportDataset,
    blocks: Array<{ id: string; type: ReportBuilderBlockType }>,
    joinType: ReportBuilderJoinType,
    outputColumns: string[],
  ) {
    const tableName = dataset.toLowerCase().replaceAll(' ', '_');
    const clauses = blocks.slice(1).map((block) => {
      switch (block.type) {
        case 'FILTER':
          return "WHERE status <> 'ARCHIVED'";
        case 'GROUP':
          return `GROUP BY ${outputColumns[0] ?? 'document_number'}`;
        case 'SORT':
          return 'ORDER BY created_at DESC';
        case 'JOIN':
          return `${joinType} JOIN shared_dimension ON shared_dimension.id = ${tableName}.organization_id`;
        case 'EXPORT':
          return '-- export handled after query materialization';
        case 'SELECT':
          return '';
      }
    });

    return `SELECT ${outputColumns.join(', ')} FROM ${tableName} ${clauses.filter(Boolean).join(' ')}`.trim();
  }

  private buildStageSummary(type: ReportBuilderBlockType, dataset: ReportDataset) {
    switch (type) {
      case 'SELECT':
        return `Choose visible columns from ${dataset}.`;
      case 'FILTER':
        return 'Apply click-built filters before users export or share the result.';
      case 'GROUP':
        return 'Aggregate the dataset for summary reporting.';
      case 'SORT':
        return 'Set row ordering for dashboard and exported report consumers.';
      case 'JOIN':
        return 'Bring in approved lookup attributes through governed joins.';
      case 'EXPORT':
        return 'Send the materialized output to PDF, XLSX, or CSV.';
    }
  }

  private datasetColumns(dataset: ReportDataset): string[] {
    switch (dataset) {
      case 'Sales Orders':
        return ['order_number', 'customer_name', 'grand_total', 'status', 'created_at'];
      case 'Purchase Orders':
        return ['po_number', 'supplier_name', 'grand_total', 'status', 'created_at'];
      case 'Invoices':
        return ['invoice_number', 'counterparty', 'balance_due', 'status', 'issue_date'];
      case 'Inventory Balances':
        return ['sku', 'warehouse_name', 'available_qty', 'reserved_qty', 'updated_at'];
      case 'Customers':
        return ['customer_number', 'customer_name', 'segment', 'status', 'created_at'];
      case 'Suppliers':
        return ['supplier_number', 'supplier_name', 'rating', 'status', 'updated_at'];
    }
  }
}
