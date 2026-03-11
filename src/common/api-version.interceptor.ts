import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiVersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    // Add API version to response headers
    response.setHeader('X-API-Version', '1.0');
    response.setHeader('X-API-Deprecated', 'false');
    
    return next.handle().pipe(
      map((data) => {
        // Add version metadata to response
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return {
            ...data,
            _metadata: {
              apiVersion: '1.0',
              timestamp: new Date().toISOString(),
            },
          };
        }
        return data;
      })
    );
  }
}
