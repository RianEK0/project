import { describe, expect, it } from 'vitest';

import { AiMeetingService } from './ai-meeting.service';

describe('AiMeetingService', () => {
  const service = new AiMeetingService();

  it('summarizes procurement meeting audio into actions and decisions', () => {
    const result = service.summarize({
      fileName: 'procurement-review.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 1_250_000,
      meetingType: 'PROCUREMENT_REVIEW',
    });

    expect(result.meetingType).toBe('PROCUREMENT_REVIEW');
    expect(result.decisions.length).toBeGreaterThan(0);
    expect(result.actionItems[0]?.deadline).toBe('2026-07-27');
  });

  it('rejects unsupported meeting file types', () => {
    expect(() =>
      service.summarize({
        fileName: 'meeting.txt',
        mimeType: 'text/plain',
        sizeBytes: 2_000,
      }),
    ).toThrowError(/Unsupported AI Meeting file type/);
  });
});
