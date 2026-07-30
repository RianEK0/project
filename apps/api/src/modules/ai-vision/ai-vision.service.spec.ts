import { describe, expect, it } from 'vitest';

import { AiVisionService } from './ai-vision.service';

describe('AiVisionService', () => {
  const service = new AiVisionService();

  it('scans rack imagery into location and stock detections', () => {
    const result = service.scan({
      fileName: 'rack-jakarta-a.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 420_000,
      scanMode: 'RACK',
    });

    expect(result.scanMode).toBe('RACK');
    expect(result.resultStatus).toBe('MATCHED');
    expect(result.countedItems[0]?.detectedQuantity).toBe(24);
  });

  it('rejects unsupported vision file types', () => {
    expect(() =>
      service.scan({
        fileName: 'rack.mov',
        mimeType: 'video/quicktime',
        sizeBytes: 900_000,
        scanMode: 'RACK',
      }),
    ).toThrowError(/Unsupported AI Vision file type/);
  });
});
