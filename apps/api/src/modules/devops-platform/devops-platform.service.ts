import { HttpStatus, Injectable } from '@nestjs/common';
import {
  devOpsDeploymentTargets,
  devOpsObservabilityTools,
  devOpsPipelineProviders,
  selfServeBuilderStatuses,
  type DevOpsDeploymentTarget,
  type DevOpsObservabilityTool,
  type DevOpsPipelineProvider,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type DevopsPlatformPreviewInput = {
  programName?: string;
  deploymentTarget?: string;
  pipelineProvider?: string;
  environments?: string[];
  observabilityTools?: string[];
};

type DevopsStarterProgram = {
  title: string;
  deploymentTarget: DevOpsDeploymentTarget;
  pipelineProvider: DevOpsPipelineProvider;
  focus: string;
};

export type DevopsPlatformFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  deploymentTargets: readonly DevOpsDeploymentTarget[];
  pipelineProviders: readonly DevOpsPipelineProvider[];
  observabilityTools: readonly DevOpsObservabilityTool[];
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

const defaultObservabilityTools: DevOpsObservabilityTool[] = [
  'GRAFANA',
  'PROMETHEUS',
  'SENTRY',
  'OPENTELEMETRY',
];

@Injectable()
export class DevopsPlatformService {
  getFoundation(): DevopsPlatformFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      deploymentTargets: devOpsDeploymentTargets,
      pipelineProviders: devOpsPipelineProviders,
      observabilityTools: devOpsObservabilityTools,
      infrastructureLayers: ['Docker', 'Kubernetes', 'Helm', 'Terraform'],
      starterPrograms: [
        {
          title: 'Kubernetes Core Delivery',
          deploymentTarget: 'KUBERNETES',
          pipelineProvider: 'GITHUB_ACTIONS',
          focus:
            'Standarkan build, test, deploy, observability, dan rollback untuk cluster utama NovaERP.',
        },
        {
          title: 'Hybrid Edge Control',
          deploymentTarget: 'HYBRID_EDGE',
          pipelineProvider: 'HYBRID_CI',
          focus:
            'Gabungkan cluster pusat dan edge location dengan Helm, Terraform, dan telemetry yang konsisten.',
        },
        {
          title: 'Container Developer Loop',
          deploymentTarget: 'DOCKER_COMPOSE',
          pipelineProvider: 'GITLAB_CI',
          focus:
            'Percepat local-to-staging flow untuk tim produk tanpa melepas quality gate observability.',
        },
      ],
    };
  }

  preview(input: DevopsPlatformPreviewInput): DevopsPlatformPreview {
    const programName = input.programName?.trim();

    if (!programName) {
      throw new AppException(
        ERROR_CODES.DEVOPS_PLATFORM_INPUT_INVALID,
        'Program name is required for DevOps platform preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const deploymentTarget = this.resolveDeploymentTarget(input.deploymentTarget);
    const pipelineProvider = this.resolvePipelineProvider(input.pipelineProvider);
    const environments = this.resolveEnvironments(input.environments);
    const observabilityTools = this.resolveObservabilityTools(input.observabilityTools);
    const launchReady =
      environments.includes('production') &&
      observabilityTools.includes('SENTRY') &&
      observabilityTools.includes('OPENTELEMETRY');

    return {
      programName,
      status: launchReady ? 'READY' : 'REVIEW_NEEDED',
      deploymentTarget,
      pipelineProvider,
      environments,
      observabilityTools,
      clusterCount: deploymentTarget === 'DOCKER_COMPOSE' ? 1 : Math.max(3, environments.length),
      helmChartCount: deploymentTarget === 'DOCKER_COMPOSE' ? 1 : 4,
      terraformWorkspaceCount: environments.length + 1,
      releaseReadinessDate: '2026-08-08',
      summary: `DevOps Platform preview for "${programName}" now prepares ${deploymentTarget.replaceAll(
        '_',
        ' ',
      )} delivery across ${environments.length} environments with ${pipelineProvider.replaceAll(
        '_',
        ' ',
      )}, Helm, Terraform, and observability gates for NovaERP releases.`,
      deliveryStages: [
        'Build and unit test on every pull request',
        'Security, lint, and contract checks before staging promotion',
        'Helm release approval and Terraform drift review before production deploy',
        'Post-deploy canary verification with Sentry and OpenTelemetry traces',
      ],
      observabilityCoverage: observabilityTools.map((tool) => this.describeObservability(tool)),
      guardrails: [
        'Production rollout should stay blocked until tracing and alert routing are verified by Friday, August 8, 2026.',
        'Helm values and Terraform variables must be environment-scoped to avoid tenant config leakage.',
        'GitHub Actions and GitLab CI runners should publish the same artifact metadata for release auditability.',
      ],
    };
  }

  private resolveDeploymentTarget(value?: string): DevOpsDeploymentTarget {
    if (!value) {
      return 'KUBERNETES';
    }

    if (!devOpsDeploymentTargets.includes(value as DevOpsDeploymentTarget)) {
      throw new AppException(
        ERROR_CODES.DEVOPS_PLATFORM_INPUT_INVALID,
        `Unsupported deployment target: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as DevOpsDeploymentTarget;
  }

  private resolvePipelineProvider(value?: string): DevOpsPipelineProvider {
    if (!value) {
      return 'GITHUB_ACTIONS';
    }

    if (!devOpsPipelineProviders.includes(value as DevOpsPipelineProvider)) {
      throw new AppException(
        ERROR_CODES.DEVOPS_PLATFORM_INPUT_INVALID,
        `Unsupported pipeline provider: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as DevOpsPipelineProvider;
  }

  private resolveEnvironments(value?: string[]) {
    const environments = (value ?? ['development', 'staging', 'production'])
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .filter((item, index, current) => current.indexOf(item) === index);

    if (environments.length === 0) {
      throw new AppException(
        ERROR_CODES.DEVOPS_PLATFORM_INPUT_INVALID,
        'At least one environment is required for DevOps preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return environments;
  }

  private resolveObservabilityTools(value?: string[]) {
    const tools = (value ?? defaultObservabilityTools).map((item) => item.trim()).filter(Boolean);

    if (tools.length === 0) {
      throw new AppException(
        ERROR_CODES.DEVOPS_PLATFORM_INPUT_INVALID,
        'At least one observability tool is required for DevOps preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const invalidTool = tools.find(
      (tool) => !devOpsObservabilityTools.includes(tool as DevOpsObservabilityTool),
    );

    if (invalidTool) {
      throw new AppException(
        ERROR_CODES.DEVOPS_PLATFORM_INPUT_INVALID,
        `Unsupported observability tool: ${invalidTool}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return tools.filter(
      (tool, index, current) => current.indexOf(tool) === index,
    ) as DevOpsObservabilityTool[];
  }

  private describeObservability(tool: DevOpsObservabilityTool) {
    switch (tool) {
      case 'GRAFANA':
        return 'Grafana dashboards for release health, worker saturation, and regional error budgets';
      case 'PROMETHEUS':
        return 'Prometheus metrics for API latency, queue lag, and pod autoscaling thresholds';
      case 'ELK':
        return 'ELK pipeline for structured logs, correlation IDs, and audit evidence retention';
      case 'SENTRY':
        return 'Sentry issue capture for frontend, API, and worker deploy regressions';
      case 'OPENTELEMETRY':
        return 'OpenTelemetry traces to follow user actions across API, queue, and worker hops';
    }
  }
}
