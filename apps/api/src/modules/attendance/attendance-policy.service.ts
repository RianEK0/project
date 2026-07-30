import { HttpStatus, Injectable } from '@nestjs/common';
import { type AttendanceStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type AttendancePreviewInput = {
  scheduledStartAt: string;
  scheduledEndAt: string;
  checkInAt: string;
  checkOutAt: string;
  graceMinutes: number;
};

type AttendancePreview = {
  status: Extract<AttendanceStatus, 'PRESENT' | 'LATE'>;
  workedMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
};

const diffInMinutes = (startAt: string, endAt: string) => {
  const delta = new Date(endAt).getTime() - new Date(startAt).getTime();

  return Math.round(delta / 60000);
};

@Injectable()
export class AttendancePolicyService {
  getComplianceRules(): string[] {
    return [
      'Shift-linked attendance capture',
      'Grace period before late flag',
      'Overtime visibility from actual work duration',
    ];
  }

  previewEntry(input: AttendancePreviewInput): AttendancePreview {
    const scheduledMinutes = diffInMinutes(input.scheduledStartAt, input.scheduledEndAt);
    const workedMinutes = diffInMinutes(input.checkInAt, input.checkOutAt);

    if (scheduledMinutes <= 0 || workedMinutes < 0) {
      throw new AppException(
        ERROR_CODES.ATTENDANCE_CONFLICT,
        'Attendance preview requires a valid scheduled window and chronological check-in/out.',
        HttpStatus.CONFLICT,
      );
    }

    const arrivalOffsetMinutes = diffInMinutes(input.scheduledStartAt, input.checkInAt);
    const lateMinutes = Math.max(arrivalOffsetMinutes - input.graceMinutes, 0);

    return {
      status: lateMinutes > 0 ? 'LATE' : 'PRESENT',
      workedMinutes,
      lateMinutes,
      overtimeMinutes: Math.max(workedMinutes - scheduledMinutes, 0),
    };
  }
}
