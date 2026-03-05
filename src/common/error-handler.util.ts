import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';

/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error messages across the entire application
 * All services should use these methods instead of throwing raw Error objects
 */

export class ErrorHandler {
  /**
   * Validation Errors (400 Bad Request)
   */
  static requiredField(fieldName: string): never {
    throw new BadRequestException(`${fieldName} is required`);
  }

  static invalidField(fieldName: string, reason?: string): never {
    const message = reason 
      ? `Invalid ${fieldName}: ${reason}`
      : `Invalid ${fieldName}`;
    throw new BadRequestException(message);
  }

  static negativeValue(fieldName: string): never {
    throw new BadRequestException(`${fieldName} cannot be negative`);
  }

  static invalidRange(fieldName: string, min: number, max: number): never {
    throw new BadRequestException(`${fieldName} must be between ${min} and ${max}`);
  }

  static invalidComparison(field1: string, field2: string, comparison: string): never {
    throw new BadRequestException(`${field1} ${comparison} ${field2}`);
  }

  static emptyValue(fieldName: string): never {
    throw new BadRequestException(`${fieldName} cannot be empty`);
  }

  static invalidFormat(fieldName: string, expectedFormat: string): never {
    throw new BadRequestException(`${fieldName} must be in ${expectedFormat} format`);
  }

  static invalidLength(fieldName: string, minLength?: number, maxLength?: number): never {
    if (minLength && maxLength) {
      throw new BadRequestException(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
    } else if (minLength) {
      throw new BadRequestException(`${fieldName} must be at least ${minLength} characters`);
    } else if (maxLength) {
      throw new BadRequestException(`${fieldName} must be at most ${maxLength} characters`);
    }
    throw new BadRequestException(`${fieldName} has invalid length`);
  }

  /**
   * Duplicate/Conflict Errors (409 Conflict or 400 Bad Request)
   */
  static duplicate(resourceName: string, identifier: string): never {
    throw new ConflictException(`${resourceName} with ${identifier} already exists`);
  }

  static alreadyExists(resourceName: string, fieldName: string, value: string): never {
    throw new ConflictException(`${resourceName} with ${fieldName} "${value}" already exists`);
  }

  /**
   * Not Found Errors (404 Not Found)
   */
  static notFound(resourceName: string, identifier?: string): never {
    const message = identifier 
      ? `${resourceName} with ${identifier} not found`
      : `${resourceName} not found`;
    throw new NotFoundException(message);
  }

  static notFoundOrInactive(resourceName: string): never {
    throw new NotFoundException(`${resourceName} not found or inactive`);
  }

  /**
   * Authorization Errors (401 Unauthorized)
   */
  static unauthorized(message: string = 'Unauthorized access'): never {
    throw new UnauthorizedException(message);
  }

  static invalidCredentials(): never {
    throw new UnauthorizedException('Invalid credentials');
  }

  static tokenExpired(): never {
    throw new UnauthorizedException('Token expired');
  }

  static tokenInvalid(): never {
    throw new UnauthorizedException('Invalid token');
  }

  /**
   * Permission Errors (403 Forbidden)
   */
  static forbidden(message: string = 'Access forbidden'): never {
    throw new ForbiddenException(message);
  }

  static insufficientPermissions(action: string): never {
    throw new ForbiddenException(`You don't have permission to ${action}`);
  }

  static roleRequired(role: string): never {
    throw new ForbiddenException(`Only ${role} can perform this action`);
  }

  /**
   * Business Logic Errors (400 Bad Request)
   */
  static businessRule(message: string): never {
    throw new BadRequestException(message);
  }

  static insufficientStock(productName: string, available: number, requested: number): never {
    throw new BadRequestException(
      `Insufficient stock for ${productName}. Available: ${available}, Requested: ${requested}`
    );
  }

  static invalidOperation(operation: string, reason: string): never {
    throw new BadRequestException(`Cannot ${operation}: ${reason}`);
  }

  /**
   * Prisma Error Handler
   * Converts Prisma error codes to user-friendly messages
   */
  static handlePrismaError(error: any, resourceName: string): never {
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      throw new ConflictException(`${resourceName} with this ${field} already exists`);
    }

    if (error.code === 'P2003') {
      // Foreign key constraint violation
      throw new BadRequestException(`Invalid reference: related record not found`);
    }

    if (error.code === 'P2025') {
      // Record not found
      throw new NotFoundException(`${resourceName} not found`);
    }

    if (error.code === 'P2014') {
      // Required relation violation
      throw new BadRequestException(`Cannot delete ${resourceName}: it has related records`);
    }

    // Generic Prisma error
    console.error('Prisma error:', error);
    throw new BadRequestException(`Database error: ${error.message || 'Unknown error'}`);
  }

  /**
   * Generic Error Handler
   * Use as catch-all in try-catch blocks
   */
  static handle(error: any, context: string): never {
    // Re-throw HTTP exceptions as-is
    if (error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException) {
      throw error;
    }

    // Handle Prisma errors
    if (error.code && error.code.startsWith('P')) {
      ErrorHandler.handlePrismaError(error, context);
    }

    // Log and throw generic error
    console.error(`❌ Error in ${context}:`, error);
    throw new BadRequestException(error.message || `Failed to ${context}`);
  }
}

/**
 * Validation Helper Functions
 */
export class Validator {
  static isPositive(value: number, fieldName: string): void {
    if (value < 0) {
      ErrorHandler.negativeValue(fieldName);
    }
  }

  static isNonNegative(value: number, fieldName: string): void {
    if (value < 0) {
      ErrorHandler.negativeValue(fieldName);
    }
  }

  static isRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null) {
      ErrorHandler.requiredField(fieldName);
    }
  }

  static isNotEmpty(value: string, fieldName: string): void {
    if (!value || value.trim().length === 0) {
      ErrorHandler.emptyValue(fieldName);
    }
  }

  static isEmail(value: string, fieldName: string = 'Email'): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      ErrorHandler.invalidFormat(fieldName, 'email');
    }
  }

  static isPhone(value: string, fieldName: string = 'Phone'): void {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value)) {
      ErrorHandler.invalidFormat(fieldName, 'phone number');
    }
  }

  static minLength(value: string, min: number, fieldName: string): void {
    if (value.length < min) {
      ErrorHandler.invalidLength(fieldName, min);
    }
  }

  static maxLength(value: string, max: number, fieldName: string): void {
    if (value.length > max) {
      ErrorHandler.invalidLength(fieldName, undefined, max);
    }
  }

  static inRange(value: number, min: number, max: number, fieldName: string): void {
    if (value < min || value > max) {
      ErrorHandler.invalidRange(fieldName, min, max);
    }
  }

  static greaterThan(value: number, compareValue: number, fieldName: string, compareFieldName: string): void {
    if (value <= compareValue) {
      ErrorHandler.invalidComparison(fieldName, `must be greater than ${compareFieldName}`, '');
    }
  }

  static greaterThanOrEqual(value: number, compareValue: number, fieldName: string, compareFieldName: string): void {
    if (value < compareValue) {
      ErrorHandler.invalidComparison(fieldName, `must be greater than or equal to ${compareFieldName}`, '');
    }
  }
}
