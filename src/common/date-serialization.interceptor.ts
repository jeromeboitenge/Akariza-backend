import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DateSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.serializeDates(data))
    );
  }

  private serializeDates(data: any): any {
    if (!data) return data;
    
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.serializeDates(item));
    }
    
    if (typeof data === 'object') {
      const serialized = {};
      
      Object.keys(data).forEach(key => {
        const value = data[key];
        
        if (value instanceof Date) {
          serialized[key] = value.toISOString();
        } else if (value && typeof value === 'object') {
          serialized[key] = this.serializeDates(value);
        } else {
          serialized[key] = value;
        }
      });
      
      return serialized;
    }
    
    return data;
  }
}