import { HttpException, HttpStatus } from '@nestjs/common';

import type { ErrorCode } from '../constants/error-codes';

export class AppException extends HttpException {
  constructor(
    code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details: unknown[] = [],
  ) {
    super(
      {
        code,
        message,
        details,
      },
      status,
    );
  }
}

