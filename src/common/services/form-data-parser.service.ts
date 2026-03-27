import { Injectable, BadRequestException } from '@nestjs/common';
import { plainToClass, Transform } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class FormDataParserService {
  /**
   * Parse multipart form data into a DTO with proper validation
   * Handles nested objects using dot notation (e.g., bossData[fullName])
   */
  async parseAndValidate<T>(
    rawData: any,
    DtoClass: new () => T,
    options: {
      fileFields?: string[];
      nestedFields?: string[];
    } = {}
  ): Promise<T> {
    try {
      // Parse nested form data
      const parsedData = this.parseNestedFormData(rawData);
      
      // Transform to DTO class
      const dto = plainToClass(DtoClass, parsedData, {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
      });

      // Validate the DTO
      const errors = await validate(dto as any, {
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      if (errors.length > 0) {
        const errorMessages = this.formatValidationErrors(errors);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: errorMessages,
        });
      }

      return dto;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid form data structure');
    }
  }

  /**
   * Parse nested form data from multipart/form-data
   * Converts bossData[fullName] to { bossData: { fullName: value } }
   */
  private parseNestedFormData(rawData: any): any {
    const parsed: any = {};

    for (const [key, value] of Object.entries(rawData)) {
      if (key.includes('[') && key.includes(']')) {
        // Handle nested fields like bossData[fullName]
        const match = key.match(/^([^[]+)\[([^\]]+)\]$/);
        if (match) {
          const [, parentKey, childKey] = match;
          if (!parsed[parentKey]) {
            parsed[parentKey] = {};
          }
          parsed[parentKey][childKey] = value;
        }
      } else {
        // Handle regular fields
        parsed[key] = value;
      }
    }

    return parsed;
  }

  /**
   * Format validation errors into user-friendly messages
   */
  private formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    const processError = (error: ValidationError, prefix = '') => {
      const fieldName = prefix ? `${prefix}.${error.property}` : error.property;
      
      if (error.constraints) {
        formattedErrors[fieldName] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        error.children.forEach(childError => {
          processError(childError, fieldName);
        });
      }
    };

    errors.forEach(error => processError(error));
    return formattedErrors;
  }

  /**
   * Sanitize and trim string values
   */
  sanitizeStringValue(value: any): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  /**
   * Validate file upload constraints
   */
  validateFileUpload(
    file: Express.Multer.File,
    options: {
      maxSize?: number;
      allowedMimeTypes?: string[];
      required?: boolean;
    } = {}
  ): void {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
      required = false
    } = options;

    if (!file && required) {
      throw new BadRequestException('File upload is required');
    }

    if (file) {
      if (file.size > maxSize) {
        throw new BadRequestException(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      }

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
      }
    }
  }
}