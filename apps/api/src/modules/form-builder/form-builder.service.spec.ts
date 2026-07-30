import { describe, expect, it } from 'vitest';

import { FormBuilderService } from './form-builder.service';

describe('FormBuilderService', () => {
  const service = new FormBuilderService();

  it('creates a no-code inspection preview from dropped fields', () => {
    const preview = service.preview({
      name: 'Warehouse Dock Inspection',
      artifactType: 'INSPECTION',
      layoutMode: 'TWO_COLUMN',
      fields: [
        { id: 'f1', label: 'Inspector', type: 'SHORT_TEXT', section: 'Basics' },
        { id: 'f2', label: 'Dock photo', type: 'PHOTO', section: 'Inspection' },
        { id: 'f3', label: 'Findings', type: 'LONG_TEXT', section: 'Inspection' },
        { id: 'f4', label: 'Follow-up required', type: 'CHECKBOX', section: 'Actions' },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.generatedModule).toContain('Inspection Module');
    expect(preview.publicationTargets).toContain('Warehouse Tablet');
  });

  it('rejects unsupported form field types', () => {
    expect(() =>
      service.preview({
        name: 'Broken Form',
        fields: [{ id: 'f1', label: 'Bad', type: 'UNKNOWN' }],
      }),
    ).toThrow();
  });
});
