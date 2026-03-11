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
export class QueryPerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('QueryPerformance');
  private readonly slowQueryThreshold = 1000; // 1 second

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          
          // Log slow queries
          if (duration > this.slowQueryThreshold) {
            this.logger.warn(
              `⚠️ Slow request detected: ${method} ${url} took ${duration}ms`
            );
          }

          // Log very slow queries with higher severity
          if (duration > this.slowQueryThreshold * 3) {
            this.logger.error(
              `🐌 Very slow request: ${method} ${url} took ${duration}ms - Consider optimization!`
            );
          }
        },
      })
    );
  }
}
