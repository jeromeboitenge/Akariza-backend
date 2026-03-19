import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    console.log('🚨 Exception caught:', {
      type: exception?.constructor?.name,
      message: exception instanceof Error ? exception.message : 'Unknown error',
      path: request.url,
      method: request.method,
      body: request.body
    });

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
        
        // Handle validation errors specifically
        if ((exceptionResponse as any).message && Array.isArray((exceptionResponse as any).message)) {
          message = (exceptionResponse as any).message.join(', ');
        }
      }
    } else if (exception instanceof Error) {
      // Handle regular Error objects
      status = HttpStatus.BAD_REQUEST;
      message = exception.message || 'An error occurred';
      error = 'Bad Request';
      
      // Log the full error for debugging
      console.error('❌ Error details:', {
        message: exception.message,
        stack: exception.stack,
        path: request.url,
        method: request.method
      });
    } else {
      // Unknown error type
      console.error('❌ Unknown error:', exception);
      message = 'An unexpected error occurred';
    }

    // Send detailed error response
    const errorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    console.log('📤 Sending error response:', errorResponse);

    response.status(status).json(errorResponse);
  }
}
