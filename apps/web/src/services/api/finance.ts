import type {
  AccountNormalBalance,
  AccountStatus,
  AccountType,
  AccountingVoucherStatus,
  ApiSuccessResponse,
  BankAccountStatus,
  BankAccountType,
  BudgetPlanStatus,
  CashAccountStatus,
  CashAccountType,
  CostCenterStatus,
  CurrencyStatus,
  DepreciationMethod,
  DepreciationRunStatus,
  ExchangeRateType,
  FinancialStatementType,
  FiscalYearStatus,
  FixedAssetCategory,
  FixedAssetStatus,
  JournalEntryStatus,
  PostingBatchStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type ChartOfAccountsFoundation = {
  items: unknown[];
  accountTypes: AccountType[];
  normalBalances: AccountNormalBalance[];
  statuses: AccountStatus[];
  rootGroups: Array<{
    codePrefix: string;
    label: string;
    accountType: AccountType;
  }>;
};

export type GeneralLedgerFoundation = {
  dimensions: string[];
  accountTypes: AccountType[];
  cards: Array<{
    id: string;
    label: string;
    route: string;
  }>;
};

export type JournalFoundation = {
  items: unknown[];
  statuses: JournalEntryStatus[];
  voucherStatuses: AccountingVoucherStatus[];
  balancingRule: string;
};

export type JournalMetadata = {
  transitions: Record<JournalEntryStatus, JournalEntryStatus[]>;
  postableStatuses: JournalEntryStatus[];
  reversibleStatuses: JournalEntryStatus[];
};

export type AccountingPostingFoundation = {
  items: unknown[];
  statuses: PostingBatchStatus[];
  sources: string[];
};

export type AccountingVoucherFoundation = {
  items: unknown[];
  statuses: AccountingVoucherStatus[];
  voucherTypes: string[];
};

export type BankAccountFoundation = {
  items: unknown[];
  statuses: BankAccountStatus[];
  accountTypes: BankAccountType[];
  reconciliationModes: string[];
};

export type CashAccountFoundation = {
  items: unknown[];
  statuses: CashAccountStatus[];
  accountTypes: CashAccountType[];
  controlPoints: string[];
};

export type BudgetFoundation = {
  items: unknown[];
  statuses: BudgetPlanStatus[];
  dimensions: string[];
  controls: string[];
};

export type FixedAssetFoundation = {
  items: unknown[];
  statuses: FixedAssetStatus[];
  categories: FixedAssetCategory[];
  depreciationMethods: DepreciationMethod[];
};

export type DepreciationFoundation = {
  items: unknown[];
  statuses: DepreciationRunStatus[];
  methods: DepreciationMethod[];
  supportedPreviewMethods: DepreciationMethod[];
};

export type DepreciationPreview = {
  method: DepreciationMethod;
  depreciableBase: number;
  monthlyDepreciationAmount: number;
  endingResidualValue: number;
  schedule: Array<{
    periodNumber: number;
    depreciationDate: string;
    depreciationAmount: number;
    endingBookValue: number;
  }>;
};

export type CostCenterFoundation = {
  items: unknown[];
  statuses: CostCenterStatus[];
  hierarchyLevels: string[];
};

export type FiscalYearFoundation = {
  items: unknown[];
  statuses: FiscalYearStatus[];
  closeChecklist: string[];
};

export type CurrencyFoundation = {
  items: unknown[];
  statuses: CurrencyStatus[];
  baseCurrency: string;
  supportedCodes: string[];
};

export type ExchangeRateFoundation = {
  items: unknown[];
  rateTypes: ExchangeRateType[];
  rateSources: string[];
};

export type FinancialStatementsFoundation = {
  types: FinancialStatementType[];
  cards: Array<{
    id: string;
    label: string;
    route: string;
    sectionCount: number;
  }>;
};

export type FinancialStatementCatalog = Array<{
  type: FinancialStatementType;
  route: string;
  sections: string[];
}>;

export type ChartOfAccountsFoundationResponse = ApiSuccessResponse<ChartOfAccountsFoundation>;
export type GeneralLedgerFoundationResponse = ApiSuccessResponse<GeneralLedgerFoundation>;
export type JournalFoundationResponse = ApiSuccessResponse<JournalFoundation>;
export type JournalMetadataResponse = ApiSuccessResponse<JournalMetadata>;
export type AccountingPostingFoundationResponse = ApiSuccessResponse<AccountingPostingFoundation>;
export type AccountingVoucherFoundationResponse = ApiSuccessResponse<AccountingVoucherFoundation>;
export type BankAccountFoundationResponse = ApiSuccessResponse<BankAccountFoundation>;
export type CashAccountFoundationResponse = ApiSuccessResponse<CashAccountFoundation>;
export type BudgetFoundationResponse = ApiSuccessResponse<BudgetFoundation>;
export type FixedAssetFoundationResponse = ApiSuccessResponse<FixedAssetFoundation>;
export type DepreciationFoundationResponse = ApiSuccessResponse<DepreciationFoundation>;
export type DepreciationPreviewResponse = ApiSuccessResponse<DepreciationPreview>;
export type CostCenterFoundationResponse = ApiSuccessResponse<CostCenterFoundation>;
export type FiscalYearFoundationResponse = ApiSuccessResponse<FiscalYearFoundation>;
export type CurrencyFoundationResponse = ApiSuccessResponse<CurrencyFoundation>;
export type ExchangeRateFoundationResponse = ApiSuccessResponse<ExchangeRateFoundation>;
export type FinancialStatementsFoundationResponse =
  ApiSuccessResponse<FinancialStatementsFoundation>;
export type FinancialStatementCatalogResponse = ApiSuccessResponse<FinancialStatementCatalog>;

export const financeApi = {
  getChartOfAccounts() {
    return apiClient.get<ChartOfAccountsFoundationResponse>('/chart-of-accounts');
  },
  getGeneralLedger() {
    return apiClient.get<GeneralLedgerFoundationResponse>('/general-ledger');
  },
  getJournals() {
    return apiClient.get<JournalFoundationResponse>('/journals');
  },
  getJournalMetadata() {
    return apiClient.get<JournalMetadataResponse>('/journals/metadata');
  },
  getPostings() {
    return apiClient.get<AccountingPostingFoundationResponse>('/accounting-postings');
  },
  getVouchers() {
    return apiClient.get<AccountingVoucherFoundationResponse>('/accounting-vouchers');
  },
  getBankAccounts() {
    return apiClient.get<BankAccountFoundationResponse>('/bank-accounts');
  },
  getCashAccounts() {
    return apiClient.get<CashAccountFoundationResponse>('/cash-accounts');
  },
  getBudgets() {
    return apiClient.get<BudgetFoundationResponse>('/budgets');
  },
  getFixedAssets() {
    return apiClient.get<FixedAssetFoundationResponse>('/fixed-assets');
  },
  getDepreciation() {
    return apiClient.get<DepreciationFoundationResponse>('/depreciation');
  },
  getDepreciationPreview() {
    return apiClient.get<DepreciationPreviewResponse>('/depreciation/preview');
  },
  getCostCenters() {
    return apiClient.get<CostCenterFoundationResponse>('/cost-centers');
  },
  getFiscalYears() {
    return apiClient.get<FiscalYearFoundationResponse>('/fiscal-years');
  },
  getCurrencies() {
    return apiClient.get<CurrencyFoundationResponse>('/currencies');
  },
  getExchangeRates() {
    return apiClient.get<ExchangeRateFoundationResponse>('/exchange-rates');
  },
  getFinancialStatements() {
    return apiClient.get<FinancialStatementsFoundationResponse>('/financial-statements');
  },
  getFinancialStatementCatalog() {
    return apiClient.get<FinancialStatementCatalogResponse>('/financial-statements/catalog');
  },
};
