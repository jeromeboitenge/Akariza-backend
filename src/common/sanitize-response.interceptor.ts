import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.sanitize(data))
    );
  }

  private sanitize(data: any): any {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      // Remove sensitive fields
      delete sanitized.password;
      delete sanitized.otpCode;
      delete sanitized.otpExpiry;
      delete sanitized.passwordHistory;
      delete sanitized.failedLoginAttempts;
      delete sanitized.lockedUntil;
      
      // Recursively sanitize nested objects
      Object.keys(sanitized).forEach(key => {
        sanitized[key] = this.sanitize(sanitized[key]);
      });
      
      return sanitized;
    }
    
    return data;
  }
}
