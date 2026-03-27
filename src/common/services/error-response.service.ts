import { Injectable, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class ErrorResponseService {
  /**
   * Create standardized error response
   */
  createErrorResponse(
    code: string,
    message: string,
    details?: any,
    path?: string
  ): ErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        path,
      },
    };
  }

  /**
   * Create standardized success response
   */
  createSuccessResponse<T>(
    data: T,
    message?: string
  ): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send validation error response
   */
  sendValidationError(
    res: Response,
    errors: Record<string, string[]>,
    path?: string
  ): void {
    const response = this.createErrorResponse(
      'VALIDATION_ERROR',
      'Validation failed',
      { fields: errors },
      path
    );

    res.status(HttpStatus.BAD_REQUEST).json(response);
  }

  /**
   * Send business logic error response
   */
  sendBusinessError(
    res: Response,
    message: string,
    code: string = 'BUSINESS_ERROR',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any
  ): void {
    const response = this.createErrorResponse(code, message, details);
    res.status(statusCode).json(response);
  }

  /**
   * Send success response
   */
  sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: HttpStatus = HttpStatus.OK
  ): void {
    const response = this.createSuccessResponse(data, message);
    res.status(statusCode).json(response);
  }

  /**
   * Extract user-friendly error message from various error types
   */
  extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    
    if (error?.response?.message) {
      if (Array.isArray(error.response.message)) {
        return error.response.message[0];
      }
      return error.response.message;
    }

    if (error?.message) return error.message;
    
    return 'An unexpected error occurred';
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(error: any): boolean {
    return error?.response?.statusCode === 400 && 
           error?.response?.message && 
           Array.isArray(error.response.message);
  }

  /**
   * Check if error is a duplicate entry error
   */
  isDuplicateError(error: any): boolean {
    return error?.code === 'P2002' || // Prisma unique constraint
           error?.message?.includes('duplicate') ||
           error?.message?.includes('already exists');
  }
}