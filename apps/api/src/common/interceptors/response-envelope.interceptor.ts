import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, unknown>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        if (
          typeof value === 'object' &&
          value !== null &&
          'success' in value &&
          value.success === true
        ) {
          return value;
        }

        return {
          success: true,
          data: value,
        };
      }),
    );
  }
}
