import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ERROR_CODES } from '../constants/error-codes';

type ErrorPayload = {
  code?: string;
  message?: string | string[];
  details?: unknown[];
};

type RequestWithId = Request & {
  id?: string;
};

function isErrorPayload(value: unknown): value is ErrorPayload {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<RequestWithId>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const normalizedPayload = isErrorPayload(payload) ? payload : null;

    const code =
      normalizedPayload?.code
        ? normalizedPayload.code
        : status === 401
          ? ERROR_CODES.UNAUTHORIZED
          : ERROR_CODES.INTERNAL_SERVER_ERROR;

    const message =
      normalizedPayload?.message === undefined
        ? 'Internal server error'
        : Array.isArray(normalizedPayload.message)
          ? normalizedPayload.message.join(', ')
          : normalizedPayload.message;

    const details = normalizedPayload?.details ?? [];

    if (!(exception instanceof HttpException) || status >= 500) {
      this.logger.error(
        {
          path: request.originalUrl,
          method: request.method,
          exception,
        },
        'Unhandled exception',
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      requestId: request.id ?? undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
