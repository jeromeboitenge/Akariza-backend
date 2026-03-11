import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `→ ${method} ${url} | User: ${user?.sub || 'Anonymous'} | Role: ${user?.role || 'N/A'}`
    );

    // Log request body for non-GET requests (excluding sensitive data)
    if (method !== 'GET' && body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `← ${method} ${url} | Status: 200 | Duration: ${duration}ms`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `← ${method} ${url} | Status: ${error.status || 500} | Duration: ${duration}ms | Error: ${error.message}`
          );
        },
      })
    );
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'refreshToken', 'otpCode', 'secret'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
