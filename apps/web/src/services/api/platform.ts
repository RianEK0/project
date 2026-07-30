import type {
  ApiSuccessResponse,
  FormBuilderArtifactType,
  FormBuilderFieldType,
  FormBuilderLayoutMode,
  DevOpsDeploymentTarget,
  DevOpsObservabilityTool,
  DevOpsPipelineProvider,
  EnterpriseCloudRegionStrategy,
  EnterpriseCloudServiceLane,
  EnterpriseCloudTenancyMode,
  EnterpriseSecurityFramework,
  EnterpriseSecurityIdentityMode,
  EnterpriseSecurityTrustMode,
  GlobalEnterpriseDeploymentModel,
  GlobalEnterpriseScaleDimension,
  GlobalEnterpriseTopologyMode,
  LowCodeComponentType,
  LowCodeLayoutMode,
  LowCodeSurfaceTarget,
  PluginMarketplaceInstallScope,
  PluginMarketplacePackageType,
  PluginMarketplaceVertical,
  NovaOsCollaborationMode,
  NovaOsDeploymentMode,
  NovaOsStudio,
  PlatformCapabilityKey,
  PlatformCapabilityStatus,
  PublicApiAuthMode,
  PublicApiProtocol,
  PublicApiSdkLanguage,
  PlatformWorkspaceArea,
  SelfServeBuilderStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

type PlatformRouteLink = {
  label: string;
  route: string;
};

type PlatformWorkspaceCard = {
  id: string;
  label: string;
  route: string;
  description: string;
};

export type PlatformWorkspaceFoundation = {
  capabilities: PlatformCapabilityKey[];
  areas: PlatformWorkspaceArea[];
  statuses: PlatformCapabilityStatus[];
  cards: PlatformWorkspaceCard[];
  relatedRoutes: PlatformRouteLink[];
};

export type PlatformControlPreview = {
  key: PlatformCapabilityKey;
  label: string;
  status: PlatformCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

type PlatformAreaPreview = {
  area: PlatformWorkspaceArea;
  status: PlatformCapabilityStatus;
  enabledControls: number;
  controlsExpected: number;
  nextFocus: string;
  summary: string;
  controls: PlatformControlPreview[];
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

export type FormBuilderStarterField = {
  label: string;
  type: FormBuilderFieldType;
  suggestedFor: FormBuilderArtifactType[];
};

export type FormBuilderFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  artifactTypes: FormBuilderArtifactType[];
  fieldTypes: FormBuilderFieldType[];
  layoutModes: FormBuilderLayoutMode[];
  publishingTargets: string[];
  starterFields: FormBuilderStarterField[];
};

export type FormBuilderPreviewSection = {
  title: string;
  fieldCount: number;
  fieldLabels: string[];
};

export type FormBuilderPreviewField = {
  label: string;
  type: FormBuilderFieldType;
  required: boolean;
  section: string;
};

export type FormBuilderPreview = {
  name: string;
  artifactType: FormBuilderArtifactType;
  layoutMode: FormBuilderLayoutMode;
  status: SelfServeBuilderStatus;
  fieldCount: number;
  estimatedCompletionMinutes: number;
  summary: string;
  generatedModule: string;
  approvalRouting: boolean;
  publicationTargets: string[];
  dataBindings: string[];
  sections: FormBuilderPreviewSection[];
  fields: FormBuilderPreviewField[];
};

export type FormBuilderPreviewRequest = {
  name: string;
  artifactType: FormBuilderArtifactType;
  layoutMode: FormBuilderLayoutMode;
  fields: Array<{
    id: string;
    label: string;
    type: FormBuilderFieldType;
    required: boolean;
    section: string;
  }>;
};

export type LowCodeStarterScreen = {
  title: string;
  targetSurface: LowCodeSurfaceTarget;
  recommendedComponents: LowCodeComponentType[];
};

export type LowCodeBuilderFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  componentTypes: LowCodeComponentType[];
  layoutModes: LowCodeLayoutMode[];
  surfaceTargets: LowCodeSurfaceTarget[];
  supportedZones: string[];
  connectedDomains: string[];
  starterScreens: LowCodeStarterScreen[];
};

export type LowCodeBuilderPreviewComponent = {
  id: string;
  type: LowCodeComponentType;
  zone: string;
  title: string;
  behavior: string;
  queryBinding: string;
};

export type LowCodeBuilderPreview = {
  appName: string;
  status: SelfServeBuilderStatus;
  layoutMode: LowCodeLayoutMode;
  surfaceTarget: LowCodeSurfaceTarget;
  componentCount: number;
  publishReadinessDate: string;
  summary: string;
  generatedRoutes: string[];
  connectedDomains: string[];
  automationHooks: string[];
  governanceChecks: string[];
  components: LowCodeBuilderPreviewComponent[];
};

export type LowCodeBuilderPreviewRequest = {
  appName: string;
  layoutMode: LowCodeLayoutMode;
  surfaceTarget: LowCodeSurfaceTarget;
  components: Array<{
    id: string;
    type: LowCodeComponentType;
    zone: string;
    label: string;
  }>;
};

export type GlobalEnterpriseStarterBlueprint = {
  title: string;
  deploymentModel: GlobalEnterpriseDeploymentModel;
  topologyMode: GlobalEnterpriseTopologyMode;
  focus: string;
};

export type GlobalEnterpriseFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  scaleDimensions: GlobalEnterpriseScaleDimension[];
  deploymentModels: GlobalEnterpriseDeploymentModel[];
  topologyModes: GlobalEnterpriseTopologyMode[];
  recommendedRegions: string[];
  unlimitedDimensions: GlobalEnterpriseScaleDimension[];
  starterBlueprints: GlobalEnterpriseStarterBlueprint[];
};

export type GlobalEnterpriseScalePlan = {
  dimension: GlobalEnterpriseScaleDimension;
  target: string;
  policy: string;
};

export type GlobalEnterprisePreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  deploymentModel: GlobalEnterpriseDeploymentModel;
  topologyMode: GlobalEnterpriseTopologyMode;
  companyCount: number;
  branchCount: number;
  userCount: number;
  unlimitedDimensions: GlobalEnterpriseScaleDimension[];
  recommendedShardCount: number;
  regionalPods: string[];
  globalRolloutDate: string;
  summary: string;
  scalePlan: GlobalEnterpriseScalePlan[];
  governanceChecks: string[];
  enablementTracks: string[];
};

export type GlobalEnterprisePreviewRequest = {
  programName: string;
  deploymentModel: GlobalEnterpriseDeploymentModel;
  topologyMode: GlobalEnterpriseTopologyMode;
  companyCount: number;
  branchCount: number;
  userCount: number;
  unlimitedDimensions: GlobalEnterpriseScaleDimension[];
};

export type PluginMarketplaceStarterPlugin = {
  id: string;
  label: string;
  vertical: PluginMarketplaceVertical;
  packageType: PluginMarketplacePackageType;
  summary: string;
};

export type PluginMarketplaceFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  verticals: PluginMarketplaceVertical[];
  packageTypes: PluginMarketplacePackageType[];
  installScopes: PluginMarketplaceInstallScope[];
  reviewStages: string[];
  starterPlugins: PluginMarketplaceStarterPlugin[];
};

export type PluginMarketplacePreviewPlugin = {
  id: string;
  label: string;
  vertical: PluginMarketplaceVertical;
  packageType: PluginMarketplacePackageType;
  installTarget: string;
  oneClickAction: string;
  postInstallRoute: string;
};

export type PluginMarketplacePreview = {
  marketplaceName: string;
  status: SelfServeBuilderStatus;
  installScope: PluginMarketplaceInstallScope;
  pluginCount: number;
  oneClickLaunchDate: string;
  summary: string;
  installEstimateMinutes: number;
  installPlan: string[];
  permissionBundles: string[];
  developerChecklist: string[];
  postInstallRoutes: string[];
  plugins: PluginMarketplacePreviewPlugin[];
};

export type PluginMarketplacePreviewRequest = {
  marketplaceName: string;
  installScope: PluginMarketplaceInstallScope;
  plugins: Array<{
    id: string;
    label: string;
    vertical: PluginMarketplaceVertical;
    packageType: PluginMarketplacePackageType;
  }>;
};

export type PublicApiStarterBundle = {
  title: string;
  protocol: PublicApiProtocol;
  focus: string;
};

export type PublicApiFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  protocols: PublicApiProtocol[];
  sdkLanguages: PublicApiSdkLanguage[];
  authModes: PublicApiAuthMode[];
  sampleDomains: string[];
  webhookEvents: string[];
  starterBundles: PublicApiStarterBundle[];
};

export type PublicApiPreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  protocol: PublicApiProtocol;
  sdkLanguage: PublicApiSdkLanguage | null;
  domain: string;
  publishWindowDate: string;
  summary: string;
  baseUrl: string;
  authMode: PublicApiAuthMode;
  rateLimitProfile: string;
  artifactBundle: string[];
  sampleOperation: string;
  webhookEvents: string[];
  sdkPackageName: string | null;
  guardrails: string[];
  enablementChecklist: string[];
};

export type PublicApiPreviewRequest = {
  programName: string;
  protocol: PublicApiProtocol;
  sdkLanguage?: PublicApiSdkLanguage | null;
  domain: string;
  webhookEvents: string[];
};

export type EnterpriseCloudStarterProfile = {
  title: string;
  tenancyMode: EnterpriseCloudTenancyMode;
  regionStrategy: EnterpriseCloudRegionStrategy;
  focus: string;
};

export type EnterpriseCloudFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  tenancyModes: EnterpriseCloudTenancyMode[];
  regionStrategies: EnterpriseCloudRegionStrategy[];
  serviceLanes: EnterpriseCloudServiceLane[];
  recommendedRegions: string[];
  starterProfiles: EnterpriseCloudStarterProfile[];
};

export type EnterpriseCloudServicePlan = {
  lane: EnterpriseCloudServiceLane;
  owner: string;
  policy: string;
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

export type EnterpriseCloudPreviewRequest = {
  programName: string;
  tenancyMode: EnterpriseCloudTenancyMode;
  regionStrategy: EnterpriseCloudRegionStrategy;
  tenantCount: number;
  regions: string[];
  enabledLanes: EnterpriseCloudServiceLane[];
};

export type DevopsStarterProgram = {
  title: string;
  deploymentTarget: DevOpsDeploymentTarget;
  pipelineProvider: DevOpsPipelineProvider;
  focus: string;
};

export type DevopsPlatformFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  deploymentTargets: DevOpsDeploymentTarget[];
  pipelineProviders: DevOpsPipelineProvider[];
  observabilityTools: DevOpsObservabilityTool[];
  infrastructureLayers: string[];
  starterPrograms: DevopsStarterProgram[];
};

export type DevopsPlatformPreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  deploymentTarget: DevOpsDeploymentTarget;
  pipelineProvider: DevOpsPipelineProvider;
  environments: string[];
  observabilityTools: DevOpsObservabilityTool[];
  clusterCount: number;
  helmChartCount: number;
  terraformWorkspaceCount: number;
  releaseReadinessDate: string;
  summary: string;
  deliveryStages: string[];
  observabilityCoverage: string[];
  guardrails: string[];
};

export type DevopsPlatformPreviewRequest = {
  programName: string;
  deploymentTarget: DevOpsDeploymentTarget;
  pipelineProvider: DevOpsPipelineProvider;
  environments: string[];
  observabilityTools: DevOpsObservabilityTool[];
};

export type EnterpriseSecurityStarterPolicy = {
  title: string;
  trustMode: EnterpriseSecurityTrustMode;
  identityMode: EnterpriseSecurityIdentityMode;
  focus: string;
};

export type EnterpriseSecurityFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  trustModes: EnterpriseSecurityTrustMode[];
  identityModes: EnterpriseSecurityIdentityMode[];
  frameworks: EnterpriseSecurityFramework[];
  controlLanes: string[];
  starterPolicies: EnterpriseSecurityStarterPolicy[];
};

export type EnterpriseSecurityControlCheck = {
  control: string;
  owner: string;
  expectation: string;
};

export type EnterpriseSecurityPreview = {
  programName: string;
  status: SelfServeBuilderStatus;
  trustMode: EnterpriseSecurityTrustMode;
  identityMode: EnterpriseSecurityIdentityMode;
  frameworks: EnterpriseSecurityFramework[];
  enabledControls: string[];
  mfaCoveragePct: number;
  passkeyRolloutPct: number;
  auditRetentionDays: number;
  secretsVaultMode: string;
  securityReadinessDate: string;
  summary: string;
  controlChecks: EnterpriseSecurityControlCheck[];
  complianceTracks: string[];
  policyActions: string[];
};

export type EnterpriseSecurityPreviewRequest = {
  programName: string;
  trustMode: EnterpriseSecurityTrustMode;
  identityMode: EnterpriseSecurityIdentityMode;
  frameworks: EnterpriseSecurityFramework[];
  enabledControls: string[];
};

export type NovaOsStarterTrack = {
  title: string;
  deploymentMode: NovaOsDeploymentMode;
  collaborationMode: NovaOsCollaborationMode;
  focus: string;
};

export type NovaOsFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  deploymentModes: NovaOsDeploymentMode[];
  collaborationModes: NovaOsCollaborationMode[];
  studios: NovaOsStudio[];
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

export type NovaOsPreviewRequest = {
  programName: string;
  deploymentMode: NovaOsDeploymentMode;
  collaborationMode: NovaOsCollaborationMode;
  studios: NovaOsStudio[];
  regions: string[];
};

export type PlatformWorkspaceFoundationResponse = ApiSuccessResponse<PlatformWorkspaceFoundation>;
export type PlatformTopologyPreviewResponse = ApiSuccessResponse<PlatformTopologyPreview>;
export type PlatformExperiencePreviewResponse = ApiSuccessResponse<PlatformExperiencePreview>;
export type PlatformIdentityPreviewResponse = ApiSuccessResponse<PlatformIdentityPreview>;
export type FormBuilderFoundationResponse = ApiSuccessResponse<FormBuilderFoundation>;
export type FormBuilderPreviewResponse = ApiSuccessResponse<FormBuilderPreview>;
export type LowCodeBuilderFoundationResponse = ApiSuccessResponse<LowCodeBuilderFoundation>;
export type LowCodeBuilderPreviewResponse = ApiSuccessResponse<LowCodeBuilderPreview>;
export type GlobalEnterpriseFoundationResponse = ApiSuccessResponse<GlobalEnterpriseFoundation>;
export type GlobalEnterprisePreviewResponse = ApiSuccessResponse<GlobalEnterprisePreview>;
export type PluginMarketplaceFoundationResponse = ApiSuccessResponse<PluginMarketplaceFoundation>;
export type PluginMarketplacePreviewResponse = ApiSuccessResponse<PluginMarketplacePreview>;
export type PublicApiFoundationResponse = ApiSuccessResponse<PublicApiFoundation>;
export type PublicApiPreviewResponse = ApiSuccessResponse<PublicApiPreview>;
export type EnterpriseCloudFoundationResponse = ApiSuccessResponse<EnterpriseCloudFoundation>;
export type EnterpriseCloudPreviewResponse = ApiSuccessResponse<EnterpriseCloudPreview>;
export type DevopsPlatformFoundationResponse = ApiSuccessResponse<DevopsPlatformFoundation>;
export type DevopsPlatformPreviewResponse = ApiSuccessResponse<DevopsPlatformPreview>;
export type EnterpriseSecurityFoundationResponse = ApiSuccessResponse<EnterpriseSecurityFoundation>;
export type EnterpriseSecurityPreviewResponse = ApiSuccessResponse<EnterpriseSecurityPreview>;
export type NovaOsFoundationResponse = ApiSuccessResponse<NovaOsFoundation>;
export type NovaOsPreviewResponse = ApiSuccessResponse<NovaOsPreview>;

export const platformApi = {
  getWorkspace() {
    return apiClient.get<PlatformWorkspaceFoundationResponse>('/platform-workspace');
  },
  getTopologyPreview() {
    return apiClient.get<PlatformTopologyPreviewResponse>('/platform-workspace/topology-preview');
  },
  getExperiencePreview() {
    return apiClient.get<PlatformExperiencePreviewResponse>(
      '/platform-workspace/experience-preview',
    );
  },
  getIdentityPreview() {
    return apiClient.get<PlatformIdentityPreviewResponse>('/platform-workspace/identity-preview');
  },
  getFormBuilder() {
    return apiClient.get<FormBuilderFoundationResponse>('/form-builder');
  },
  previewFormBuilder(body: FormBuilderPreviewRequest) {
    return apiClient.post<FormBuilderPreviewResponse>('/form-builder/preview', body);
  },
  getLowCodeBuilder() {
    return apiClient.get<LowCodeBuilderFoundationResponse>('/low-code-builder');
  },
  previewLowCodeBuilder(body: LowCodeBuilderPreviewRequest) {
    return apiClient.post<LowCodeBuilderPreviewResponse>('/low-code-builder/preview', body);
  },
  getGlobalEnterprise() {
    return apiClient.get<GlobalEnterpriseFoundationResponse>('/global-enterprise');
  },
  previewGlobalEnterprise(body: GlobalEnterprisePreviewRequest) {
    return apiClient.post<GlobalEnterprisePreviewResponse>('/global-enterprise/preview', body);
  },
  getPluginMarketplace() {
    return apiClient.get<PluginMarketplaceFoundationResponse>('/plugin-marketplace');
  },
  previewPluginMarketplace(body: PluginMarketplacePreviewRequest) {
    return apiClient.post<PluginMarketplacePreviewResponse>(
      '/plugin-marketplace/install-preview',
      body,
    );
  },
  getPublicApi() {
    return apiClient.get<PublicApiFoundationResponse>('/public-api');
  },
  previewPublicApi(body: PublicApiPreviewRequest) {
    return apiClient.post<PublicApiPreviewResponse>('/public-api/access-preview', body);
  },
  getEnterpriseCloud() {
    return apiClient.get<EnterpriseCloudFoundationResponse>('/enterprise-cloud');
  },
  previewEnterpriseCloud(body: EnterpriseCloudPreviewRequest) {
    return apiClient.post<EnterpriseCloudPreviewResponse>('/enterprise-cloud/preview', body);
  },
  getDevopsPlatform() {
    return apiClient.get<DevopsPlatformFoundationResponse>('/devops-platform');
  },
  previewDevopsPlatform(body: DevopsPlatformPreviewRequest) {
    return apiClient.post<DevopsPlatformPreviewResponse>('/devops-platform/preview', body);
  },
  getEnterpriseSecurity() {
    return apiClient.get<EnterpriseSecurityFoundationResponse>('/enterprise-security');
  },
  previewEnterpriseSecurity(body: EnterpriseSecurityPreviewRequest) {
    return apiClient.post<EnterpriseSecurityPreviewResponse>('/enterprise-security/preview', body);
  },
  getNovaOs() {
    return apiClient.get<NovaOsFoundationResponse>('/nova-os');
  },
  previewNovaOs(body: NovaOsPreviewRequest) {
    return apiClient.post<NovaOsPreviewResponse>('/nova-os/preview', body);
  },
};
