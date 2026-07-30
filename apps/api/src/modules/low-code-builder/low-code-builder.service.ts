import { HttpStatus, Injectable } from '@nestjs/common';
import {
  lowCodeComponentTypes,
  lowCodeLayoutModes,
  lowCodeSurfaceTargets,
  selfServeBuilderStatuses,
  type LowCodeComponentType,
  type LowCodeLayoutMode,
  type LowCodeSurfaceTarget,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type LowCodeComponentDraft = {
  id?: string;
  type?: string;
  zone?: string;
  label?: string;
};

type LowCodeBuilderPreviewInput = {
  appName?: string;
  layoutMode?: string;
  surfaceTarget?: string;
  components?: LowCodeComponentDraft[];
};

type LowCodeStarterScreen = {
  title: string;
  targetSurface: LowCodeSurfaceTarget;
  recommendedComponents: readonly LowCodeComponentType[];
};

type LowCodePreviewComponent = {
  id: string;
  type: LowCodeComponentType;
  zone: string;
  title: string;
  behavior: string;
  queryBinding: string;
};

export type LowCodeBuilderFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  componentTypes: readonly LowCodeComponentType[];
  layoutModes: readonly LowCodeLayoutMode[];
  surfaceTargets: readonly LowCodeSurfaceTarget[];
  supportedZones: string[];
  connectedDomains: string[];
  starterScreens: LowCodeStarterScreen[];
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
  components: LowCodePreviewComponent[];
};

const supportedZones = ['Header', 'Workspace', 'Sidebar', 'Detail Panel'] as const;

@Injectable()
export class LowCodeBuilderService {
  getFoundation(): LowCodeBuilderFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      componentTypes: lowCodeComponentTypes,
      layoutModes: lowCodeLayoutModes,
      surfaceTargets: lowCodeSurfaceTargets,
      supportedZones: [...supportedZones],
      connectedDomains: ['Inventory', 'Procurement', 'Finance', 'CRM', 'Documents'],
      starterScreens: [
        {
          title: 'Procurement Console',
          targetSurface: 'DESKTOP',
          recommendedComponents: ['TABLE', 'FORM', 'BUTTON', 'KANBAN'],
        },
        {
          title: 'Warehouse Tablet Board',
          targetSurface: 'TABLET',
          recommendedComponents: ['GALLERY', 'TREE', 'INPUT', 'BUTTON'],
        },
        {
          title: 'Customer Portal Tracker',
          targetSurface: 'PORTAL',
          recommendedComponents: ['CALENDAR', 'TABLE', 'FORM', 'GALLERY'],
        },
      ],
    };
  }

  preview(input: LowCodeBuilderPreviewInput): LowCodeBuilderPreview {
    const appName = input.appName?.trim();

    if (!appName) {
      throw new AppException(
        ERROR_CODES.LOW_CODE_BUILDER_INPUT_INVALID,
        'App name is required for low-code preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const layoutMode = this.resolveLayoutMode(input.layoutMode);
    const surfaceTarget = this.resolveSurfaceTarget(input.surfaceTarget);
    const components = this.resolveComponents(input.components);

    if (components.length === 0) {
      throw new AppException(
        ERROR_CODES.LOW_CODE_BUILDER_INPUT_INVALID,
        'At least one component must be dropped onto the low-code canvas.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      appName,
      status: components.length >= 4 ? 'READY' : 'REVIEW_NEEDED',
      layoutMode,
      surfaceTarget,
      componentCount: components.length,
      publishReadinessDate: '2026-07-29',
      summary: `Low-code app "${appName}" now combines ${components.length} drag-and-drop components into a governed internal surface that feels closer to Retool while staying inside NovaERP.`,
      generatedRoutes: ['/overview', '/operations', '/approvals'],
      connectedDomains: this.resolveConnectedDomains(components),
      automationHooks: [
        'Launch workflow builder after submit actions',
        'Push rule-engine checks before destructive updates',
        'Route audit logs into platform control plane',
      ],
      governanceChecks: [
        'Tenant-scoped data access remains enforced per query binding.',
        'Component actions should inherit approval and audit policy before publish.',
        'Portal surfaces must avoid exposing internal-only procurement and finance mutations.',
      ],
      components,
    };
  }

  private resolveLayoutMode(layoutMode?: string): LowCodeLayoutMode {
    if (!layoutMode) {
      return 'CANVAS';
    }

    if (!lowCodeLayoutModes.includes(layoutMode as LowCodeLayoutMode)) {
      throw new AppException(
        ERROR_CODES.LOW_CODE_BUILDER_INPUT_INVALID,
        `Unsupported low-code layout mode: ${layoutMode}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return layoutMode as LowCodeLayoutMode;
  }

  private resolveSurfaceTarget(surfaceTarget?: string): LowCodeSurfaceTarget {
    if (!surfaceTarget) {
      return 'DESKTOP';
    }

    if (!lowCodeSurfaceTargets.includes(surfaceTarget as LowCodeSurfaceTarget)) {
      throw new AppException(
        ERROR_CODES.LOW_CODE_BUILDER_INPUT_INVALID,
        `Unsupported low-code surface target: ${surfaceTarget}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return surfaceTarget as LowCodeSurfaceTarget;
  }

  private resolveComponents(components?: LowCodeComponentDraft[]): LowCodePreviewComponent[] {
    return (components ?? [])
      .filter((component): component is Required<LowCodeComponentDraft> => {
        return Boolean(
          component.id?.trim() &&
          component.type?.trim() &&
          component.zone?.trim() &&
          component.label?.trim(),
        );
      })
      .slice(0, 12)
      .map((component) => {
        if (!lowCodeComponentTypes.includes(component.type as LowCodeComponentType)) {
          throw new AppException(
            ERROR_CODES.LOW_CODE_BUILDER_INPUT_INVALID,
            `Unsupported low-code component type: ${component.type}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const type = component.type as LowCodeComponentType;
        const zone = component.zone.trim();

        return {
          id: component.id,
          type,
          zone,
          title: component.label.trim(),
          behavior: this.resolveBehavior(type),
          queryBinding: this.resolveQueryBinding(type, zone),
        };
      });
  }

  private resolveConnectedDomains(components: LowCodePreviewComponent[]) {
    const domains = new Set<string>();

    for (const component of components) {
      switch (component.type) {
        case 'KANBAN':
        case 'TREE':
          domains.add('Procurement');
          break;
        case 'TABLE':
        case 'GALLERY':
          domains.add('Inventory');
          break;
        case 'CALENDAR':
          domains.add('CRM');
          break;
        case 'FORM':
        case 'INPUT':
          domains.add('Documents');
          break;
        default:
          domains.add('Finance');
      }
    }

    return [...domains];
  }

  private resolveBehavior(type: LowCodeComponentType) {
    switch (type) {
      case 'TABLE':
        return 'Show operational rows with filter, sort, and inline action hooks.';
      case 'BUTTON':
        return 'Trigger workflow, mutation, or modal actions from the app surface.';
      case 'CHART':
        return 'Expose live metric trends with drill-friendly visual summaries.';
      case 'MAP':
        return 'Plot branch, warehouse, or route context on geographic overlays.';
      case 'CALENDAR':
        return 'Render schedule and due-date views tied to operational records.';
      case 'INPUT':
        return 'Capture lightweight parameters or search terms for surrounding widgets.';
      case 'FORM':
        return 'Collect structured submissions before validation and automation.';
      case 'TREE':
        return 'Navigate hierarchical data such as BOM, org, or warehouse structure.';
      case 'KANBAN':
        return 'Track stage-based work movement for approvals or operations.';
      case 'GALLERY':
        return 'Surface image or document previews for faster visual inspection.';
    }
  }

  private resolveQueryBinding(type: LowCodeComponentType, zone: string) {
    switch (type) {
      case 'TABLE':
        return `List query scoped to ${zone}`;
      case 'FORM':
        return `Mutation form pipeline for ${zone}`;
      case 'KANBAN':
        return `Stage aggregation feed for ${zone}`;
      case 'MAP':
        return `Geo dataset binding for ${zone}`;
      default:
        return `Component data binding for ${zone}`;
    }
  }
}
