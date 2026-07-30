import { HttpStatus, Injectable } from '@nestjs/common';
import {
  formBuilderArtifactTypes,
  formBuilderFieldTypes,
  formBuilderLayoutModes,
  selfServeBuilderStatuses,
  type FormBuilderArtifactType,
  type FormBuilderFieldType,
  type FormBuilderLayoutMode,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type FormFieldDraft = {
  id?: string;
  label?: string;
  type?: string;
  required?: boolean;
  section?: string;
};

type FormBuilderPreviewInput = {
  name?: string;
  artifactType?: string;
  layoutMode?: string;
  fields?: FormFieldDraft[];
};

type FormStarterField = {
  label: string;
  type: FormBuilderFieldType;
  suggestedFor: FormBuilderArtifactType[];
};

type FormPreviewField = {
  label: string;
  type: FormBuilderFieldType;
  required: boolean;
  section: string;
};

type FormPreviewSection = {
  title: string;
  fieldCount: number;
  fieldLabels: string[];
};

export type FormBuilderFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  artifactTypes: readonly FormBuilderArtifactType[];
  fieldTypes: readonly FormBuilderFieldType[];
  layoutModes: readonly FormBuilderLayoutMode[];
  publishingTargets: string[];
  starterFields: FormStarterField[];
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
  sections: FormPreviewSection[];
  fields: FormPreviewField[];
};

const starterFields: FormStarterField[] = [
  {
    label: 'Requester name',
    type: 'SHORT_TEXT',
    suggestedFor: ['FORM', 'APPROVAL', 'CUSTOM_MODULE'],
  },
  {
    label: 'Inspection photo',
    type: 'PHOTO',
    suggestedFor: ['INSPECTION', 'CHECKLIST'],
  },
  {
    label: 'Approval decision',
    type: 'APPROVAL_STATUS',
    suggestedFor: ['APPROVAL', 'CUSTOM_MODULE'],
  },
  {
    label: 'Site checklist',
    type: 'CHECKBOX',
    suggestedFor: ['CHECKLIST', 'INSPECTION'],
  },
  {
    label: 'Follow-up notes',
    type: 'LONG_TEXT',
    suggestedFor: ['SURVEY', 'FORM', 'CUSTOM_MODULE'],
  },
];

@Injectable()
export class FormBuilderService {
  getFoundation(): FormBuilderFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      artifactTypes: formBuilderArtifactTypes,
      fieldTypes: formBuilderFieldTypes,
      layoutModes: formBuilderLayoutModes,
      publishingTargets: ['Internal App', 'Customer Portal', 'Warehouse Tablet', 'Mobile PWA'],
      starterFields,
    };
  }

  preview(input: FormBuilderPreviewInput): FormBuilderPreview {
    const name = input.name?.trim();

    if (!name) {
      throw new AppException(
        ERROR_CODES.FORM_BUILDER_INPUT_INVALID,
        'Form name is required for preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const artifactType = this.resolveArtifactType(input.artifactType);
    const layoutMode = this.resolveLayoutMode(input.layoutMode);
    const fields = this.resolveFields(input.fields);

    if (fields.length === 0) {
      throw new AppException(
        ERROR_CODES.FORM_BUILDER_INPUT_INVALID,
        'At least one field is required for a no-code form preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sections = this.buildSections(fields);
    const approvalRouting = artifactType === 'APPROVAL' || artifactType === 'CUSTOM_MODULE';

    return {
      name,
      artifactType,
      layoutMode,
      status: fields.length >= 4 ? 'READY' : 'REVIEW_NEEDED',
      fieldCount: fields.length,
      estimatedCompletionMinutes: Math.max(2, Math.ceil(fields.length / 2)),
      summary: `${artifactType.replaceAll('_', ' ')} "${name}" sekarang punya ${fields.length} field tanpa coding dan siap diteruskan ke approval, checklist, inspection, atau custom module flow.`,
      generatedModule: this.buildGeneratedModule(name, artifactType),
      approvalRouting,
      publicationTargets: this.resolveTargets(artifactType),
      dataBindings: this.resolveBindings(artifactType),
      sections,
      fields,
    };
  }

  private resolveArtifactType(artifactType?: string): FormBuilderArtifactType {
    if (!artifactType) {
      return 'FORM';
    }

    if (!formBuilderArtifactTypes.includes(artifactType as FormBuilderArtifactType)) {
      throw new AppException(
        ERROR_CODES.FORM_BUILDER_INPUT_INVALID,
        `Unsupported form artifact type: ${artifactType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return artifactType as FormBuilderArtifactType;
  }

  private resolveLayoutMode(layoutMode?: string): FormBuilderLayoutMode {
    if (!layoutMode) {
      return 'SINGLE_COLUMN';
    }

    if (!formBuilderLayoutModes.includes(layoutMode as FormBuilderLayoutMode)) {
      throw new AppException(
        ERROR_CODES.FORM_BUILDER_INPUT_INVALID,
        `Unsupported form layout mode: ${layoutMode}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return layoutMode as FormBuilderLayoutMode;
  }

  private resolveFields(fields?: FormFieldDraft[]): FormPreviewField[] {
    return (fields ?? [])
      .filter(
        (
          field,
        ): field is Required<Omit<FormFieldDraft, 'required'>> &
          Pick<FormFieldDraft, 'required'> => {
          return Boolean(field.id?.trim() && field.label?.trim() && field.type?.trim());
        },
      )
      .slice(0, 20)
      .map((field) => {
        if (!formBuilderFieldTypes.includes(field.type as FormBuilderFieldType)) {
          throw new AppException(
            ERROR_CODES.FORM_BUILDER_INPUT_INVALID,
            `Unsupported form field type: ${field.type}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        return {
          label: field.label.trim(),
          type: field.type as FormBuilderFieldType,
          required: field.required ?? true,
          section: field.section?.trim() || 'General',
        };
      });
  }

  private buildSections(fields: FormPreviewField[]): FormPreviewSection[] {
    const grouped = new Map<string, FormPreviewField[]>();

    for (const field of fields) {
      const current = grouped.get(field.section) ?? [];
      current.push(field);
      grouped.set(field.section, current);
    }

    return [...grouped.entries()].map(([title, sectionFields]) => ({
      title,
      fieldCount: sectionFields.length,
      fieldLabels: sectionFields.map((field) => field.label),
    }));
  }

  private buildGeneratedModule(name: string, artifactType: FormBuilderArtifactType) {
    switch (artifactType) {
      case 'APPROVAL':
        return `${name} Approval Workspace`;
      case 'CHECKLIST':
        return `${name} Checklist Module`;
      case 'INSPECTION':
        return `${name} Inspection Module`;
      case 'CUSTOM_MODULE':
        return `${name} Custom Module`;
      case 'SURVEY':
        return `${name} Survey Module`;
      case 'FORM':
        return `${name} Form Module`;
    }
  }

  private resolveTargets(artifactType: FormBuilderArtifactType) {
    switch (artifactType) {
      case 'SURVEY':
        return ['Customer Portal', 'Mobile PWA'];
      case 'INSPECTION':
        return ['Warehouse Tablet', 'Mobile PWA'];
      default:
        return ['Internal App', 'Mobile PWA'];
    }
  }

  private resolveBindings(artifactType: FormBuilderArtifactType) {
    switch (artifactType) {
      case 'APPROVAL':
        return ['Submission', 'ApprovalRequest', 'AuditLog'];
      case 'CHECKLIST':
        return ['Submission', 'ChecklistResponse', 'Task'];
      case 'INSPECTION':
        return ['Submission', 'InspectionFinding', 'Attachment'];
      case 'CUSTOM_MODULE':
        return ['Submission', 'WorkflowTrigger', 'AnalyticsFact'];
      case 'SURVEY':
        return ['Submission', 'SurveyResponse'];
      case 'FORM':
        return ['Submission', 'Notification'];
    }
  }
}
