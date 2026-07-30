import { HttpStatus, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type WebhookDeliveryInput = {
  endpointName: string;
  maxAttempts: number;
  initialDelayMinutes: number;
  strategy: 'LINEAR' | 'EXPONENTIAL';
};

export type WebhookDeliveryPreview = {
  endpointName: string;
  retryStrategy: 'LINEAR' | 'EXPONENTIAL';
  retryScheduleMinutes: number[];
  totalRetryWindowMinutes: number;
};

@Injectable()
export class WebhookDeliveryPolicyService {
  previewDelivery(input: WebhookDeliveryInput): WebhookDeliveryPreview {
    if (input.maxAttempts < 1 || input.maxAttempts > 10 || input.initialDelayMinutes < 1) {
      throw new AppException(
        ERROR_CODES.AUTOMATION_WEBHOOK_ATTEMPTS_INVALID,
        'Webhook retry settings must use 1-10 attempts and a positive delay.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const retryScheduleMinutes = Array.from({ length: input.maxAttempts }, (_, index) => {
      if (input.strategy === 'LINEAR') {
        return input.initialDelayMinutes * (index + 1);
      }

      return input.initialDelayMinutes * 2 ** index;
    });

    return {
      endpointName: input.endpointName,
      retryStrategy: input.strategy,
      retryScheduleMinutes,
      totalRetryWindowMinutes: retryScheduleMinutes.reduce((sum, delay) => sum + delay, 0),
    };
  }
}
