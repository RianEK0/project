import type {
  AiCopilotExecutionStatus,
  AiCopilotExportFormat,
  AiCopilotIntentType,
  AiConversationRole,
  AiDocumentConfidenceBand,
  AiDocumentReviewStatus,
  AiDocumentReviewType,
  AiForecastHorizon,
  AiInsightType,
  AiModelMode,
  AiOcrDocumentType,
  AiRecommendationPriority,
  AiReportType,
  AiRequestStatus,
  AiDocumentSaveStatus,
  AiMeetingArtifactStatus,
  AiMeetingType,
  AiSearchDomain,
  AiVisionDetectionType,
  AiVisionResultStatus,
  AiVisionScanMode,
  AiVoiceConfirmationMode,
  AiVoiceExecutionStatus,
  AiVoiceIntentType,
  AiWorkspaceArea,
  AiWorkspaceCapabilityKey,
  AiWorkspaceCapabilityStatus,
  ApiSuccessResponse,
} from '@nova/shared-types';

import { apiClient } from './client';

export type ChatErpFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  conversationRoles: AiConversationRole[];
  insightTypes: AiInsightType[];
  supportedDomains: AiSearchDomain[];
};

export type ChatRoutePreview = {
  prompt: string;
  domain: AiSearchDomain;
  insightType: AiInsightType;
  modelMode: AiModelMode;
  requestStatus: AiRequestStatus;
  intent: string;
  rationale: string;
  nextActions: string[];
};

export type AskDomainFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  primaryDomain: AiSearchDomain;
  insightTypes: AiInsightType[];
  modelModes: AiModelMode[];
  suggestedPrompts: string[];
  supportedQuestions?: string[];
  scenarios?: string[];
  exportModes?: string[];
};

export type NaturalLanguageSearchFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  domains: AiSearchDomain[];
  modelModes: AiModelMode[];
  sampleEntities: string[];
};

export type NaturalLanguageQueryPlan = {
  query: string;
  normalizedQuery: string;
  primaryDomain: AiSearchDomain;
  relatedDomains: AiSearchDomain[];
  modelMode: AiModelMode;
  filters: string[];
  executionPlan: string[];
};

export type AiReportsFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  reportTypes: AiReportType[];
  modelModes: AiModelMode[];
  deliveryModes: string[];
  aggregationWindows: string[];
};

export type AiForecastFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  horizons: AiForecastHorizon[];
  modelModes: AiModelMode[];
  measures: string[];
};

export type ForecastSignalPreview = {
  metric: string;
  horizon: AiForecastHorizon;
  baseline: number;
  projectedValue: number;
  averageDelta: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  confidence: 'MEDIUM' | 'HIGH';
};

export type AiRecommendationsFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  priorities: AiRecommendationPriority[];
  insightTypes: AiInsightType[];
  actionBuckets: string[];
};

export type AiDocumentOcrFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  documentTypes: AiOcrDocumentType[];
  confidenceBands: AiDocumentConfidenceBand[];
  saveStatuses: AiDocumentSaveStatus[];
  acceptedMimeTypes: readonly string[];
  extractedFields: string[];
  databaseTargets: string[];
};

export type AiDocumentOcrLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AiDocumentOcrDatabaseTarget = {
  entity: string;
  action: string;
  mappedFields: string[];
};

export type AiDocumentOcrExtraction = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  documentType: AiOcrDocumentType;
  requestStatus: AiRequestStatus;
  saveStatus: AiDocumentSaveStatus;
  confidenceBand: AiDocumentConfidenceBand;
  confidencePct: number;
  detectedLanguage: string;
  supplier: string;
  invoiceDate: string;
  invoiceNumber: string;
  ppnAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  currency: string;
  items: AiDocumentOcrLineItem[];
  warnings: string[];
  databaseWritePreview: AiDocumentOcrDatabaseTarget[];
};

export type AiDocumentReviewFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  documentTypes: AiDocumentReviewType[];
  reviewStatuses: AiDocumentReviewStatus[];
  riskLevels: AiRecommendationPriority[];
  acceptedMimeTypes: readonly string[];
  outputSections: string[];
};

export type AiDocumentReviewParty = {
  name: string;
  role: string;
};

export type AiDocumentReviewDeadline = {
  title: string;
  date: string;
  owner: string;
};

export type AiDocumentReviewRisk = {
  title: string;
  severity: AiRecommendationPriority;
  rationale: string;
};

export type AiDocumentReviewAnalysis = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  documentType: AiDocumentReviewType;
  requestStatus: AiRequestStatus;
  status: AiDocumentReviewStatus;
  summary: string;
  nominalAmount: number | null;
  currency: string | null;
  effectiveDate: string;
  expiryDate: string | null;
  parties: AiDocumentReviewParty[];
  deadlines: AiDocumentReviewDeadline[];
  risks: AiDocumentReviewRisk[];
  extractedSignals: string[];
  recommendedActions: string[];
};

export type RecommendationPriorityPreview = {
  title: string;
  weightedScore: number;
  priority: AiRecommendationPriority;
  ranking: number;
};

type AiWorkspaceRouteLink = {
  label: string;
  route: string;
};

type AiWorkspaceCard = {
  id: string;
  label: string;
  route: string;
  description: string;
};

export type AiWorkspaceFoundation = {
  capabilities: AiWorkspaceCapabilityKey[];
  areas: AiWorkspaceArea[];
  statuses: AiWorkspaceCapabilityStatus[];
  cards: AiWorkspaceCard[];
  relatedRoutes: AiWorkspaceRouteLink[];
};

export type AiWorkspaceCapabilityPreview = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  status: AiWorkspaceCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

type AiWorkspaceAreaPreview = {
  area: AiWorkspaceArea;
  status: AiWorkspaceCapabilityStatus;
  enabledCapabilities: number;
  capabilitiesExpected: number;
  nextFocus: string;
  summary: string;
  capabilities: AiWorkspaceCapabilityPreview[];
};

export type AiCommandCenterPreview = AiWorkspaceAreaPreview & {
  area: 'COMMAND_CENTER';
  dashboardCoveragePct: number;
  orchestrationCoveragePct: number;
  narrativeCoveragePct: number;
};

export type AiForecastRiskPreview = AiWorkspaceAreaPreview & {
  area: 'FORECAST_RISK';
  forecastCoveragePct: number;
  anomalyCoveragePct: number;
  financeSignalCoveragePct: number;
};

export type AiOptimizationPreview = AiWorkspaceAreaPreview & {
  area: 'OPTIMIZATION';
  recommendationCoveragePct: number;
  executionLinkagePct: number;
  crossDomainCoveragePct: number;
};

export type AiDocumentIntelligencePreview = AiWorkspaceAreaPreview & {
  area: 'DOCUMENT_INTELLIGENCE';
  extractionCoveragePct: number;
  confidenceCoveragePct: number;
  reviewGovernancePct: number;
};

export type AiPerceptionPreview = AiWorkspaceAreaPreview & {
  area: 'PERCEPTION';
  visualCoveragePct: number;
  countingAccuracyPct: number;
  safetyCompliancePct: number;
};

export type AiAssistantsPreview = AiWorkspaceAreaPreview & {
  area: 'ASSISTANTS';
  voiceCoveragePct: number;
  transcriptGovernancePct: number;
  followUpCapturePct: number;
};

export type AiVisionFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  scanModes: AiVisionScanMode[];
  detectionTypes: AiVisionDetectionType[];
  resultStatuses: AiVisionResultStatus[];
  confidenceBands: AiDocumentConfidenceBand[];
  acceptedMimeTypes: readonly string[];
  supportedDevices: string[];
  outputSignals: string[];
};

export type AiVisionDetection = {
  type: AiVisionDetectionType;
  label: string;
  value: string;
  confidencePct: number;
};

export type AiVisionCountedItem = {
  sku: string;
  productName: string;
  detectedQuantity: number;
  barcode: string;
  lot: string | null;
  serial: string | null;
};

export type AiVisionPpeCheck = {
  label: string;
  detected: boolean;
};

export type AiVisionAttendanceMatch = {
  employeeId: string;
  employeeName: string;
  department: string;
  shift: string;
  attendanceMarkedAt: string;
};

export type AiVisionScanResult = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  scanMode: AiVisionScanMode;
  requestStatus: AiRequestStatus;
  resultStatus: AiVisionResultStatus;
  confidenceBand: AiDocumentConfidenceBand;
  confidencePct: number;
  capturedAt: string;
  site: string;
  summary: string;
  detections: AiVisionDetection[];
  countedItems: AiVisionCountedItem[];
  attendanceMatch: AiVisionAttendanceMatch | null;
  ppeChecks: AiVisionPpeCheck[];
  recommendedActions: string[];
};

export type AiVoiceFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  intentTypes: AiVoiceIntentType[];
  modelModes: AiModelMode[];
  executionStatuses: AiVoiceExecutionStatus[];
  confirmationModes: AiVoiceConfirmationMode[];
  supportedDomains: AiSearchDomain[];
  sampleCommands: string[];
};

export type AiVoiceField = {
  label: string;
  value: string;
};

export type AiVoiceExecutionPreview = {
  transcript: string;
  normalizedTranscript: string;
  requestStatus: AiRequestStatus;
  modelMode: AiModelMode;
  intentType: AiVoiceIntentType;
  executionStatus: AiVoiceExecutionStatus;
  confirmationMode: AiVoiceConfirmationMode;
  summary: string;
  spokenResponse: string;
  targetRoute: string;
  generatedRecordNumber: string;
  extractedParameters: AiVoiceField[];
  nextActions: string[];
};

export type AiMeetingFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  meetingTypes: AiMeetingType[];
  artifactStatuses: AiMeetingArtifactStatus[];
  acceptedMimeTypes: readonly string[];
  outputSections: string[];
  supportedLanguages: string[];
};

export type AiMeetingParticipant = {
  name: string;
  role: string;
};

export type AiMeetingDecision = {
  title: string;
  rationale: string;
};

export type AiMeetingActionItem = {
  title: string;
  pic: string;
  deadline: string;
  status: 'OPEN';
};

export type AiMeetingSummary = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  meetingType: AiMeetingType;
  requestStatus: AiRequestStatus;
  artifactStatus: AiMeetingArtifactStatus;
  language: string;
  summary: string;
  participants: AiMeetingParticipant[];
  decisions: AiMeetingDecision[];
  actionItems: AiMeetingActionItem[];
  followUpRoutes: string[];
};

export type AiCopilotFoundation = {
  items: unknown[];
  statuses: AiRequestStatus[];
  modelModes: AiModelMode[];
  intentTypes: AiCopilotIntentType[];
  executionStatuses: AiCopilotExecutionStatus[];
  exportFormats: AiCopilotExportFormat[];
  supportedDomains: AiSearchDomain[];
  samplePrompts: string[];
  guardrails: string[];
  responsePrinciples: string[];
};

export type AiCopilotMetric = {
  label: string;
  value: string;
  note: string;
};

export type AiCopilotChartPoint = {
  label: string;
  value: number;
};

export type AiCopilotDataRow = {
  primary: string;
  secondary: string;
  tertiary: string;
};

export type AiCopilotDraftAction = {
  label: string;
  route: string;
  rationale: string;
};

export type AiCopilotPreview = {
  prompt: string;
  normalizedPrompt: string;
  requestStatus: AiRequestStatus;
  modelMode: AiModelMode;
  intentType: AiCopilotIntentType;
  executionStatus: AiCopilotExecutionStatus;
  primaryDomain: AiSearchDomain;
  coverageWindow: string;
  chartTitle: string;
  chartPoints: AiCopilotChartPoint[];
  summary: string;
  metrics: AiCopilotMetric[];
  dataRows: AiCopilotDataRow[];
  narrative: string[];
  safeQueryPlan: string[];
  suggestedExports: AiCopilotExportFormat[];
  draftActions: AiCopilotDraftAction[];
};

export type ChatErpFoundationResponse = ApiSuccessResponse<ChatErpFoundation>;
export type ChatRoutePreviewResponse = ApiSuccessResponse<ChatRoutePreview>;
export type AskDomainFoundationResponse = ApiSuccessResponse<AskDomainFoundation>;
export type NaturalLanguageSearchFoundationResponse =
  ApiSuccessResponse<NaturalLanguageSearchFoundation>;
export type NaturalLanguageQueryPlanResponse = ApiSuccessResponse<NaturalLanguageQueryPlan>;
export type AiReportsFoundationResponse = ApiSuccessResponse<AiReportsFoundation>;
export type AiForecastFoundationResponse = ApiSuccessResponse<AiForecastFoundation>;
export type ForecastSignalPreviewResponse = ApiSuccessResponse<ForecastSignalPreview>;
export type AiRecommendationsFoundationResponse = ApiSuccessResponse<AiRecommendationsFoundation>;
export type RecommendationPriorityPreviewResponse = ApiSuccessResponse<
  RecommendationPriorityPreview[]
>;
export type AiDocumentOcrFoundationResponse = ApiSuccessResponse<AiDocumentOcrFoundation>;
export type AiDocumentOcrExtractionResponse = ApiSuccessResponse<AiDocumentOcrExtraction>;
export type AiDocumentReviewFoundationResponse = ApiSuccessResponse<AiDocumentReviewFoundation>;
export type AiDocumentReviewAnalysisResponse = ApiSuccessResponse<AiDocumentReviewAnalysis>;
export type AiWorkspaceFoundationResponse = ApiSuccessResponse<AiWorkspaceFoundation>;
export type AiCommandCenterPreviewResponse = ApiSuccessResponse<AiCommandCenterPreview>;
export type AiForecastRiskPreviewResponse = ApiSuccessResponse<AiForecastRiskPreview>;
export type AiOptimizationPreviewResponse = ApiSuccessResponse<AiOptimizationPreview>;
export type AiDocumentIntelligencePreviewResponse =
  ApiSuccessResponse<AiDocumentIntelligencePreview>;
export type AiPerceptionPreviewResponse = ApiSuccessResponse<AiPerceptionPreview>;
export type AiAssistantsPreviewResponse = ApiSuccessResponse<AiAssistantsPreview>;
export type AiVisionFoundationResponse = ApiSuccessResponse<AiVisionFoundation>;
export type AiVisionScanResultResponse = ApiSuccessResponse<AiVisionScanResult>;
export type AiVoiceFoundationResponse = ApiSuccessResponse<AiVoiceFoundation>;
export type AiVoiceExecutionPreviewResponse = ApiSuccessResponse<AiVoiceExecutionPreview>;
export type AiMeetingFoundationResponse = ApiSuccessResponse<AiMeetingFoundation>;
export type AiMeetingSummaryResponse = ApiSuccessResponse<AiMeetingSummary>;
export type AiCopilotFoundationResponse = ApiSuccessResponse<AiCopilotFoundation>;
export type AiCopilotPreviewResponse = ApiSuccessResponse<AiCopilotPreview>;

export const aiApi = {
  getChatErp() {
    return apiClient.get<ChatErpFoundationResponse>('/chat-erp');
  },
  getChatRoutePreview() {
    return apiClient.get<ChatRoutePreviewResponse>('/chat-erp/route-preview');
  },
  getAskInventory() {
    return apiClient.get<AskDomainFoundationResponse>('/ask-inventory');
  },
  getAskFinance() {
    return apiClient.get<AskDomainFoundationResponse>('/ask-finance');
  },
  getAskCrm() {
    return apiClient.get<AskDomainFoundationResponse>('/ask-crm');
  },
  getNaturalLanguageSearch() {
    return apiClient.get<NaturalLanguageSearchFoundationResponse>('/natural-language-search');
  },
  getNaturalLanguageQueryPlan() {
    return apiClient.get<NaturalLanguageQueryPlanResponse>('/natural-language-search/plan-preview');
  },
  getAiReports() {
    return apiClient.get<AiReportsFoundationResponse>('/ai-reports');
  },
  getAiForecast() {
    return apiClient.get<AiForecastFoundationResponse>('/ai-forecast');
  },
  getAiForecastPreview() {
    return apiClient.get<ForecastSignalPreviewResponse>('/ai-forecast/preview');
  },
  getAiRecommendations() {
    return apiClient.get<AiRecommendationsFoundationResponse>('/ai-recommendations');
  },
  getAiRecommendationPreview() {
    return apiClient.get<RecommendationPriorityPreviewResponse>(
      '/ai-recommendations/priority-preview',
    );
  },
  getAiDocumentOcr() {
    return apiClient.get<AiDocumentOcrFoundationResponse>('/ai-document-ocr');
  },
  extractAiDocumentOcr(file: File, documentType?: AiOcrDocumentType) {
    const formData = new FormData();
    formData.append('file', file);

    if (documentType) {
      formData.append('documentType', documentType);
    }

    return apiClient.postForm<AiDocumentOcrExtractionResponse>(
      '/ai-document-ocr/extract',
      formData,
    );
  },
  getAiDocumentReview() {
    return apiClient.get<AiDocumentReviewFoundationResponse>('/ai-document-review');
  },
  analyzeAiDocument(file: File, documentType?: AiDocumentReviewType) {
    const formData = new FormData();
    formData.append('file', file);

    if (documentType) {
      formData.append('documentType', documentType);
    }

    return apiClient.postForm<AiDocumentReviewAnalysisResponse>(
      '/ai-document-review/analyze',
      formData,
    );
  },
  getAiProcurement() {
    return apiClient.get<AskDomainFoundationResponse>('/ai-procurement');
  },
  getAiSales() {
    return apiClient.get<AskDomainFoundationResponse>('/ai-sales');
  },
  getAiAccounting() {
    return apiClient.get<AskDomainFoundationResponse>('/ai-accounting');
  },
  getAiHr() {
    return apiClient.get<AskDomainFoundationResponse>('/ai-hr');
  },
  getAiManufacturing() {
    return apiClient.get<AskDomainFoundationResponse>('/ai-manufacturing');
  },
  getAiAnalytics() {
    return apiClient.get<AskDomainFoundationResponse>('/ai-analytics');
  },
  getAiWorkspace() {
    return apiClient.get<AiWorkspaceFoundationResponse>('/ai-workspace');
  },
  getAiCommandCenterPreview() {
    return apiClient.get<AiCommandCenterPreviewResponse>('/ai-workspace/command-center-preview');
  },
  getAiForecastRiskPreview() {
    return apiClient.get<AiForecastRiskPreviewResponse>('/ai-workspace/forecast-risk-preview');
  },
  getAiOptimizationPreview() {
    return apiClient.get<AiOptimizationPreviewResponse>('/ai-workspace/optimization-preview');
  },
  getAiDocumentIntelligencePreview() {
    return apiClient.get<AiDocumentIntelligencePreviewResponse>(
      '/ai-workspace/document-intelligence-preview',
    );
  },
  getAiPerceptionPreview() {
    return apiClient.get<AiPerceptionPreviewResponse>('/ai-workspace/perception-preview');
  },
  getAiAssistantsPreview() {
    return apiClient.get<AiAssistantsPreviewResponse>('/ai-workspace/assistants-preview');
  },
  getAiVision() {
    return apiClient.get<AiVisionFoundationResponse>('/ai-vision');
  },
  scanAiVision(file: File, scanMode?: AiVisionScanMode) {
    const formData = new FormData();
    formData.append('file', file);

    if (scanMode) {
      formData.append('scanMode', scanMode);
    }

    return apiClient.postForm<AiVisionScanResultResponse>('/ai-vision/scan', formData);
  },
  getAiVoice() {
    return apiClient.get<AiVoiceFoundationResponse>('/ai-voice');
  },
  previewAiVoiceExecution(transcript: string) {
    return apiClient.post<AiVoiceExecutionPreviewResponse>('/ai-voice/execute-preview', {
      transcript,
    });
  },
  getAiMeeting() {
    return apiClient.get<AiMeetingFoundationResponse>('/ai-meeting');
  },
  summarizeAiMeeting(file: File, meetingType?: AiMeetingType) {
    const formData = new FormData();
    formData.append('file', file);

    if (meetingType) {
      formData.append('meetingType', meetingType);
    }

    return apiClient.postForm<AiMeetingSummaryResponse>('/ai-meeting/summarize', formData);
  },
  getAiCopilot() {
    return apiClient.get<AiCopilotFoundationResponse>('/ai-copilot');
  },
  previewAiCopilot(prompt: string) {
    return apiClient.post<AiCopilotPreviewResponse>('/ai-copilot/preview', { prompt });
  },
};
