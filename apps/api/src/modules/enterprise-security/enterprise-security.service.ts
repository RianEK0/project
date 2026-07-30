import { HttpStatus, Injectable } from '@nestjs/common';
import {
  enterpriseSecurityFrameworks,
  enterpriseSecurityIdentityModes,
  enterpriseSecurityTrustModes,
  selfServeBuilderStatuses,
  type EnterpriseSecurityFramework,
  type EnterpriseSecurityIdentityMode,
  type EnterpriseSecurityTrustMode,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type EnterpriseSecurityPreviewInput = {
  programName?: string;
  trustMode?: string;
  identityMode?: string;
  frameworks?: string[];
  enabledControls?: string[];
};

type EnterpriseSecurityStarterPolicy = {
  title: string;
  trustMode: EnterpriseSecurityTrustMode;
  identityMode: EnterpriseSecurityIdentityMode;
  focus: string;
};

type EnterpriseSecurityControlCheck = {
  control: string;
  owner: string;
  expectation: string;
};

export type EnterpriseSecurityFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  trustModes: readonly EnterpriseSecurityTrustMode[];
  identityModes: readonly EnterpriseSecurityIdentityMode[];
  frameworks: readonly EnterpriseSecurityFramework[];
  controlLanes: string[];
  starterPolicies: EnterpriseSecurityStarterPolicy[];
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

const enterpriseSecurityControlLanes = [
  'ZERO_TRUST',
  'MFA',
  'PASSKEY',
  'SSO',
  'OAUTH',
  'SAML',
  'DEVICE_MANAGEMENT',
  'IP_RESTRICTION',
  'AUDIT_CENTER',
  'ENCRYPTION',
  'SECRETS_VAULT',
];

const defaultFrameworks: EnterpriseSecurityFramework[] = ['SOC2_READY', 'ISO27001_READY'];
const defaultControls = ['ZERO_TRUST', 'MFA', 'PASSKEY', 'SSO', 'AUDIT_CENTER', 'SECRETS_VAULT'];

@Injectable()
export class EnterpriseSecurityService {
  getFoundation(): EnterpriseSecurityFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      trustModes: enterpriseSecurityTrustModes,
      identityModes: enterpriseSecurityIdentityModes,
      frameworks: enterpriseSecurityFrameworks,
      controlLanes: enterpriseSecurityControlLanes,
      starterPolicies: [
        {
          title: 'Zero Trust Core',
          trustMode: 'ZERO_TRUST_FOUNDATION',
          identityMode: 'MFA_AND_PASSKEY',
          focus:
            'Satukan MFA, passkey, secrets vault, dan audit center sebelum scale user enterprise dibuka lebih luas.',
        },
        {
          title: 'Federated Workforce Security',
          trustMode: 'ADAPTIVE_ENTERPRISE',
          identityMode: 'SSO_FEDERATION',
          focus:
            'Siapkan SSO, OAuth, SAML, dan device-aware posture untuk organisasi besar lintas region.',
        },
        {
          title: 'Regulated Residency Pack',
          trustMode: 'SOVEREIGN_REGULATED',
          identityMode: 'WORKFORCE_DEVICE_POSTURE',
          focus:
            'Hubungkan encryption, IP restriction, dan compliance evidence untuk tenant sensitif.',
        },
      ],
    };
  }

  preview(input: EnterpriseSecurityPreviewInput): EnterpriseSecurityPreview {
    const programName = input.programName?.trim();

    if (!programName) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_SECURITY_INPUT_INVALID,
        'Program name is required for enterprise security preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const trustMode = this.resolveTrustMode(input.trustMode);
    const identityMode = this.resolveIdentityMode(input.identityMode);
    const frameworks = this.resolveFrameworks(input.frameworks);
    const enabledControls = this.resolveControls(input.enabledControls);
    const securityReady =
      frameworks.length >= 2 &&
      enabledControls.includes('MFA') &&
      enabledControls.includes('PASSKEY') &&
      enabledControls.includes('SECRETS_VAULT');

    return {
      programName,
      status: securityReady ? 'READY' : 'REVIEW_NEEDED',
      trustMode,
      identityMode,
      frameworks,
      enabledControls,
      mfaCoveragePct: identityMode === 'MFA_AND_PASSKEY' ? 98 : 86,
      passkeyRolloutPct: identityMode === 'MFA_AND_PASSKEY' ? 84 : 58,
      auditRetentionDays: trustMode === 'SOVEREIGN_REGULATED' ? 400 : 180,
      secretsVaultMode:
        trustMode === 'SOVEREIGN_REGULATED'
          ? 'Customer-managed key hierarchy'
          : 'Central vault with regional replicas',
      securityReadinessDate: '2026-08-12',
      summary: `Enterprise Security preview for "${programName}" now combines ${trustMode.replaceAll(
        '_',
        ' ',
      )} posture, ${identityMode.replaceAll(
        '_',
        ' ',
      )} identity controls, and ${frameworks.length} compliance tracks under one governed rollout lane.`,
      controlChecks: enabledControls.map((control) => this.buildControlCheck(control)),
      complianceTracks: frameworks.map((framework) => this.describeFramework(framework)),
      policyActions: [
        'Passkey, device, and IP policies should be piloted with privileged roles before Wednesday, August 12, 2026.',
        'Audit center evidence must cover SSO, OAuth, SAML, vault access, and policy overrides for every enterprise tenant.',
        'Encryption and secrets rotation should remain part of the release gate, not an afterthought in incident response.',
      ],
    };
  }

  private resolveTrustMode(value?: string): EnterpriseSecurityTrustMode {
    if (!value) {
      return 'ZERO_TRUST_FOUNDATION';
    }

    if (!enterpriseSecurityTrustModes.includes(value as EnterpriseSecurityTrustMode)) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_SECURITY_INPUT_INVALID,
        `Unsupported enterprise security trust mode: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as EnterpriseSecurityTrustMode;
  }

  private resolveIdentityMode(value?: string): EnterpriseSecurityIdentityMode {
    if (!value) {
      return 'MFA_AND_PASSKEY';
    }

    if (!enterpriseSecurityIdentityModes.includes(value as EnterpriseSecurityIdentityMode)) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_SECURITY_INPUT_INVALID,
        `Unsupported enterprise security identity mode: ${value}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value as EnterpriseSecurityIdentityMode;
  }

  private resolveFrameworks(value?: string[]) {
    const frameworks = (value ?? defaultFrameworks)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, current) => current.indexOf(item) === index);

    if (frameworks.length === 0) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_SECURITY_INPUT_INVALID,
        'At least one compliance framework is required for enterprise security preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const invalidFramework = frameworks.find(
      (framework) =>
        !enterpriseSecurityFrameworks.includes(framework as EnterpriseSecurityFramework),
    );

    if (invalidFramework) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_SECURITY_INPUT_INVALID,
        `Unsupported enterprise security framework: ${invalidFramework}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return frameworks as EnterpriseSecurityFramework[];
  }

  private resolveControls(value?: string[]) {
    const controls = (value ?? defaultControls)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, current) => current.indexOf(item) === index);

    if (controls.length === 0) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_SECURITY_INPUT_INVALID,
        'At least one enterprise security control is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const invalidControl = controls.find(
      (control) => !enterpriseSecurityControlLanes.includes(control),
    );

    if (invalidControl) {
      throw new AppException(
        ERROR_CODES.ENTERPRISE_SECURITY_INPUT_INVALID,
        `Unsupported enterprise security control: ${invalidControl}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return controls;
  }

  private buildControlCheck(control: string): EnterpriseSecurityControlCheck {
    switch (control) {
      case 'ZERO_TRUST':
        return {
          control,
          owner: 'Security Architecture',
          expectation:
            'Evaluate every request by identity, device posture, and tenant policy before trust is granted.',
        };
      case 'MFA':
        return {
          control,
          owner: 'Identity Platform',
          expectation:
            'Require phishing-resistant MFA for privileged and finance-sensitive surfaces.',
        };
      case 'PASSKEY':
        return {
          control,
          owner: 'Identity Platform',
          expectation:
            'Roll out passkey enrollment with fallback recovery that still preserves audit evidence.',
        };
      case 'SSO':
        return {
          control,
          owner: 'Enterprise Identity',
          expectation:
            'Support tenant federation with onboarding, failback, and certificate review workflows.',
        };
      case 'OAUTH':
        return {
          control,
          owner: 'Platform Access',
          expectation: 'Track delegated consent, token rotation, and provider-specific scopes.',
        };
      case 'SAML':
        return {
          control,
          owner: 'Enterprise Identity',
          expectation: 'Manage metadata exchange and certificate rollover for customer IdPs.',
        };
      case 'DEVICE_MANAGEMENT':
        return {
          control,
          owner: 'Endpoint Security',
          expectation: 'Gate high-risk routes by enrolled device posture and OS compliance.',
        };
      case 'IP_RESTRICTION':
        return {
          control,
          owner: 'Network Security',
          expectation:
            'Limit admin and vault surfaces to approved corporate ranges or secure gateways.',
        };
      case 'AUDIT_CENTER':
        return {
          control,
          owner: 'Security Governance',
          expectation: 'Retain privileged action evidence with export and reviewer workflows.',
        };
      case 'ENCRYPTION':
        return {
          control,
          owner: 'Data Security',
          expectation: 'Encrypt secrets, backups, exports, and tenant data with lifecycle review.',
        };
      case 'SECRETS_VAULT':
        return {
          control,
          owner: 'Security Platform',
          expectation:
            'Rotate platform and integration secrets through managed vault policy, not manual sharing.',
        };
      default:
        return {
          control,
          owner: 'Security Operations',
          expectation: 'Document ownership and periodic review for this enterprise control.',
        };
    }
  }

  private describeFramework(framework: EnterpriseSecurityFramework) {
    switch (framework) {
      case 'SOC2_READY':
        return 'SOC 2 readiness for access control, logging, backup, and change management evidence';
      case 'ISO27001_READY':
        return 'ISO 27001 readiness for risk management, asset handling, and control ownership';
      case 'GDPR':
        return 'GDPR support for privacy, residency, access requests, and deletion workflows';
      case 'PDPA':
        return 'PDPA support for consent, retention, and region-specific personal data handling';
    }
  }
}
