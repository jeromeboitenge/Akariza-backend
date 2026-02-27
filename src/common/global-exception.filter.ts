import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    // Log error (but don't expose details to client)
    if (status === 500) {
      console.error('Internal Server Error:', exception);
    }

    // Send safe error response
    response.status(status).json({
      statusCode: status,
      message: status === 500 ? 'Internal server error' : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
