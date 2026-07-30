import { HttpStatus, Injectable } from '@nestjs/common';
import {
  pluginMarketplaceInstallScopes,
  pluginMarketplacePackageTypes,
  pluginMarketplaceVerticals,
  selfServeBuilderStatuses,
  type PluginMarketplaceInstallScope,
  type PluginMarketplacePackageType,
  type PluginMarketplaceVertical,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type PluginDraft = {
  id?: string;
  label?: string;
  vertical?: string;
  packageType?: string;
};

type PluginMarketplacePreviewInput = {
  marketplaceName?: string;
  installScope?: string;
  plugins?: PluginDraft[];
};

type StarterPlugin = {
  id: string;
  label: string;
  vertical: PluginMarketplaceVertical;
  packageType: PluginMarketplacePackageType;
  summary: string;
};

type PluginInstallPreview = {
  id: string;
  label: string;
  vertical: PluginMarketplaceVertical;
  packageType: PluginMarketplacePackageType;
  installTarget: string;
  oneClickAction: string;
  postInstallRoute: string;
};

export type PluginMarketplaceFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  verticals: readonly PluginMarketplaceVertical[];
  packageTypes: readonly PluginMarketplacePackageType[];
  installScopes: readonly PluginMarketplaceInstallScope[];
  reviewStages: string[];
  starterPlugins: StarterPlugin[];
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
  plugins: PluginInstallPreview[];
};

const starterPlugins: StarterPlugin[] = [
  {
    id: 'pos-suite',
    label: 'POS Suite',
    vertical: 'POS',
    packageType: 'VERTICAL_APP',
    summary: 'Counter sales, cashier, receipt, and outlet operations for retail or store teams.',
  },
  {
    id: 'hotel-ops',
    label: 'Hotel Operations',
    vertical: 'HOTEL',
    packageType: 'VERTICAL_APP',
    summary: 'Front desk, room service, housekeeping, and property workflow pack.',
  },
  {
    id: 'restaurant-pack',
    label: 'Restaurant Pack',
    vertical: 'RESTAURANT',
    packageType: 'WORKFLOW_ADDON',
    summary: 'Kitchen tickets, dining floor flow, and menu-driven order operations.',
  },
  {
    id: 'laundry-flow',
    label: 'Laundry Flow',
    vertical: 'LAUNDRY',
    packageType: 'WORKFLOW_ADDON',
    summary: 'Order intake, washing stages, pickup, and delivery orchestration.',
  },
  {
    id: 'clinic-bridge',
    label: 'Clinic Bridge',
    vertical: 'CLINIC',
    packageType: 'DATA_BRIDGE',
    summary: 'Registration, appointment intake, and medical billing connector starter.',
  },
];

@Injectable()
export class PluginMarketplaceService {
  getFoundation(): PluginMarketplaceFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      verticals: pluginMarketplaceVerticals,
      packageTypes: pluginMarketplacePackageTypes,
      installScopes: pluginMarketplaceInstallScopes,
      reviewStages: [
        'Manifest Review',
        'Security Scan',
        'Data Scope Approval',
        'One-Click Publish',
      ],
      starterPlugins,
    };
  }

  preview(input: PluginMarketplacePreviewInput): PluginMarketplacePreview {
    const marketplaceName = input.marketplaceName?.trim();

    if (!marketplaceName) {
      throw new AppException(
        ERROR_CODES.PLUGIN_MARKETPLACE_INPUT_INVALID,
        'Marketplace name is required for plugin install preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const installScope = this.resolveInstallScope(input.installScope);
    const plugins = this.resolvePlugins(input.plugins);

    if (plugins.length === 0) {
      throw new AppException(
        ERROR_CODES.PLUGIN_MARKETPLACE_INPUT_INVALID,
        'At least one marketplace plugin must be selected for install preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const requiresClinicalReview = plugins.some((plugin) =>
      ['HOSPITAL', 'CLINIC'].includes(plugin.vertical),
    );

    return {
      marketplaceName,
      status: requiresClinicalReview ? 'REVIEW_NEEDED' : 'READY',
      installScope,
      pluginCount: plugins.length,
      oneClickLaunchDate: '2026-07-30',
      summary: `Plugin marketplace "${marketplaceName}" now prepares ${plugins.length} one-click installs for external developer packages like POS, hotel, restaurant, laundry, clinic, or other vertical apps while keeping NovaERP governance intact.`,
      installEstimateMinutes: Math.max(3, plugins.length * 2),
      installPlan: [
        'Validate plugin manifest, scopes, and declared runtime package before one-click install starts.',
        'Provision tenant-safe routes, navigation entries, and workflow hooks on Wednesday, July 29, 2026.',
        'Publish install summary and post-install links to the platform audit lane on Thursday, July 30, 2026.',
      ],
      permissionBundles: [
        'Domain data access stays limited to the tenant, company, or branch scope selected.',
        'Sensitive financial, HR, or clinical mutations require explicit capability grants before activation.',
        'All plugin hooks must emit install and runtime audit events into the audit center.',
      ],
      developerChecklist: [
        'Ship a signed manifest with route, permission, webhook, and storage declarations.',
        'Provide migration and rollback notes for each vertical package before public publish.',
        'Attach support ownership and compatibility policy for each plugin release.',
      ],
      postInstallRoutes: plugins.map((plugin) => plugin.postInstallRoute),
      plugins,
    };
  }

  private resolveInstallScope(value?: string): PluginMarketplaceInstallScope {
    if (!value) {
      return 'TENANT';
    }

    if (!pluginMarketplaceInstallScopes.includes(value as PluginMarketplaceInstallScope)) {
      throw new AppException(
        ERROR_CODES.PLUGIN_MARKETPLACE_INPUT_INVALID,
        `Unsupported plugin install scope: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as PluginMarketplaceInstallScope;
  }

  private resolvePlugins(plugins?: PluginDraft[]): PluginInstallPreview[] {
    return (plugins ?? [])
      .filter((plugin): plugin is Required<PluginDraft> => {
        return Boolean(
          plugin.id?.trim() &&
          plugin.label?.trim() &&
          plugin.vertical?.trim() &&
          plugin.packageType?.trim(),
        );
      })
      .slice(0, 8)
      .map((plugin) => {
        if (!pluginMarketplaceVerticals.includes(plugin.vertical as PluginMarketplaceVertical)) {
          throw new AppException(
            ERROR_CODES.PLUGIN_MARKETPLACE_INPUT_INVALID,
            `Unsupported plugin vertical: ${plugin.vertical}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (
          !pluginMarketplacePackageTypes.includes(
            plugin.packageType as PluginMarketplacePackageType,
          )
        ) {
          throw new AppException(
            ERROR_CODES.PLUGIN_MARKETPLACE_INPUT_INVALID,
            `Unsupported plugin package type: ${plugin.packageType}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const vertical = plugin.vertical as PluginMarketplaceVertical;
        const packageType = plugin.packageType as PluginMarketplacePackageType;

        return {
          id: plugin.id,
          label: plugin.label.trim(),
          vertical,
          packageType,
          installTarget: this.resolveInstallTarget(vertical),
          oneClickAction: this.resolveOneClickAction(vertical, packageType),
          postInstallRoute: this.resolveRoute(vertical),
        };
      });
  }

  private resolveInstallTarget(vertical: PluginMarketplaceVertical) {
    switch (vertical) {
      case 'POS':
      case 'RESTAURANT':
      case 'LAUNDRY':
      case 'RENTAL':
      case 'GYM':
      case 'SALON':
        return 'Frontline Operations';
      case 'HOTEL':
      case 'SCHOOL':
        return 'Service Operations';
      case 'HOSPITAL':
      case 'CLINIC':
        return 'Regulated Operations';
    }
  }

  private resolveOneClickAction(
    vertical: PluginMarketplaceVertical,
    packageType: PluginMarketplacePackageType,
  ) {
    return `Install ${vertical.replaceAll('_', ' ')} package as ${packageType
      .replaceAll('_', ' ')
      .toLowerCase()} with one governed click.`;
  }

  private resolveRoute(vertical: PluginMarketplaceVertical) {
    switch (vertical) {
      case 'POS':
        return '/app/platform/plugin-marketplace/pos';
      case 'HOTEL':
        return '/app/platform/plugin-marketplace/hotel';
      case 'HOSPITAL':
        return '/app/platform/plugin-marketplace/hospital';
      case 'SCHOOL':
        return '/app/platform/plugin-marketplace/school';
      case 'RESTAURANT':
        return '/app/platform/plugin-marketplace/restaurant';
      case 'LAUNDRY':
        return '/app/platform/plugin-marketplace/laundry';
      case 'RENTAL':
        return '/app/platform/plugin-marketplace/rental';
      case 'GYM':
        return '/app/platform/plugin-marketplace/gym';
      case 'SALON':
        return '/app/platform/plugin-marketplace/salon';
      case 'CLINIC':
        return '/app/platform/plugin-marketplace/clinic';
    }
  }
}
