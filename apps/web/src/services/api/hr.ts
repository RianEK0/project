import type {
  ApiSuccessResponse,
  AttendanceStatus,
  CandidateStatus,
  DepartmentStatus,
  EmployeeEmploymentType,
  EmployeeStatus,
  KpiStatus,
  LeaveRequestStatus,
  LeaveType,
  OrganizationChartNodeType,
  PayrollFrequency,
  PayrollStatus,
  PerformanceReviewStatus,
  RecruitmentStage,
  ShiftStatus,
  TrainingStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type EmployeeFoundation = {
  items: unknown[];
  statuses: EmployeeStatus[];
  employmentTypes: EmployeeEmploymentType[];
  lifecycleSteps: string[];
};

export type DepartmentFoundation = {
  items: unknown[];
  statuses: DepartmentStatus[];
  hierarchyLevels: string[];
  linkedViews: string[];
};

export type AttendanceFoundation = {
  items: unknown[];
  statuses: AttendanceStatus[];
  captureMethods: string[];
  complianceRules: string[];
};

export type AttendancePreview = {
  status: Extract<AttendanceStatus, 'PRESENT' | 'LATE'>;
  workedMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
};

export type LeaveFoundation = {
  items: unknown[];
  statuses: LeaveRequestStatus[];
  leaveTypes: LeaveType[];
  approvalLanes: string[];
};

export type LeaveBalancePreview = {
  availableDays: number;
  pendingDays: number;
  remainingDays: number;
  requestable: boolean;
};

export type PayrollFoundation = {
  items: unknown[];
  statuses: PayrollStatus[];
  frequencies: PayrollFrequency[];
  controlPoints: string[];
};

export type PayrollRunPreview = {
  status: PayrollStatus;
  employeeCount: number;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
  payoutWindow: string;
};

export type ShiftFoundation = {
  items: unknown[];
  statuses: ShiftStatus[];
  templates: string[];
  publishingRules: string[];
};

export type RecruitmentFoundation = {
  items: unknown[];
  stages: RecruitmentStage[];
  candidateStatuses: CandidateStatus[];
  sourcingChannels: string[];
};

export type PerformanceFoundation = {
  items: unknown[];
  statuses: PerformanceReviewStatus[];
  cycleTypes: string[];
  calibrationViews: string[];
};

export type TrainingFoundation = {
  items: unknown[];
  statuses: TrainingStatus[];
  deliveryModes: string[];
  complianceTracks: string[];
};

export type KpiFoundation = {
  items: unknown[];
  statuses: KpiStatus[];
  cadences: string[];
  scoreBands: string[];
};

export type OrganizationChartFoundation = {
  nodes: unknown[];
  nodeTypes: OrganizationChartNodeType[];
  layoutModes: string[];
  linkedContexts: string[];
};

export type EmployeeFoundationResponse = ApiSuccessResponse<EmployeeFoundation>;
export type DepartmentFoundationResponse = ApiSuccessResponse<DepartmentFoundation>;
export type AttendanceFoundationResponse = ApiSuccessResponse<AttendanceFoundation>;
export type AttendancePreviewResponse = ApiSuccessResponse<AttendancePreview>;
export type LeaveFoundationResponse = ApiSuccessResponse<LeaveFoundation>;
export type LeaveBalancePreviewResponse = ApiSuccessResponse<LeaveBalancePreview>;
export type PayrollFoundationResponse = ApiSuccessResponse<PayrollFoundation>;
export type PayrollRunPreviewResponse = ApiSuccessResponse<PayrollRunPreview>;
export type ShiftFoundationResponse = ApiSuccessResponse<ShiftFoundation>;
export type RecruitmentFoundationResponse = ApiSuccessResponse<RecruitmentFoundation>;
export type PerformanceFoundationResponse = ApiSuccessResponse<PerformanceFoundation>;
export type TrainingFoundationResponse = ApiSuccessResponse<TrainingFoundation>;
export type KpiFoundationResponse = ApiSuccessResponse<KpiFoundation>;
export type OrganizationChartFoundationResponse = ApiSuccessResponse<OrganizationChartFoundation>;

export const hrApi = {
  getEmployees() {
    return apiClient.get<EmployeeFoundationResponse>('/employees');
  },
  getDepartments() {
    return apiClient.get<DepartmentFoundationResponse>('/departments');
  },
  getAttendance() {
    return apiClient.get<AttendanceFoundationResponse>('/attendance');
  },
  getAttendancePreview() {
    return apiClient.get<AttendancePreviewResponse>('/attendance/preview');
  },
  getLeaveRequests() {
    return apiClient.get<LeaveFoundationResponse>('/leave-requests');
  },
  getLeaveBalancePreview() {
    return apiClient.get<LeaveBalancePreviewResponse>('/leave-requests/balance-preview');
  },
  getPayroll() {
    return apiClient.get<PayrollFoundationResponse>('/payroll');
  },
  getPayrollPreviewRun() {
    return apiClient.get<PayrollRunPreviewResponse>('/payroll/preview-run');
  },
  getShifts() {
    return apiClient.get<ShiftFoundationResponse>('/shifts');
  },
  getRecruitment() {
    return apiClient.get<RecruitmentFoundationResponse>('/recruitment');
  },
  getPerformance() {
    return apiClient.get<PerformanceFoundationResponse>('/performance');
  },
  getTraining() {
    return apiClient.get<TrainingFoundationResponse>('/training');
  },
  getKpis() {
    return apiClient.get<KpiFoundationResponse>('/kpis');
  },
  getOrganizationChart() {
    return apiClient.get<OrganizationChartFoundationResponse>('/organization-chart');
  },
};
