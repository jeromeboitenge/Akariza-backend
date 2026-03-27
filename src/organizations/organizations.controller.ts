import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Request, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Logger,
  HttpStatus,
  Res
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { UploadService } from '../upload/upload.service';
import { FormDataParserService } from '../common/services/form-data-parser.service';
import { ErrorResponseService } from '../common/services/error-response.service';
import { Roles, SystemAdminReadOnly } from '../common/decorators';
import { CreateOrganizationDto } from '../common/dto/examples.dto';
import { CreateOrganizationMultipartDto } from './dto/create-organization-multipart.dto';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@Roles('SYSTEM_ADMIN', 'BOSS')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(
    private service: OrganizationsService,
    private uploadService: UploadService,
    private formDataParser: FormDataParserService,
    private errorResponse: ErrorResponseService
  ) {}

  @Post()
  @Roles('SYSTEM_ADMIN') // Only SYSTEM_ADMIN can create organizations
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Create new organization with logo upload (SYSTEM_ADMIN only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'SuperMart Retail' },
        businessType: { type: 'string', example: 'Retail' },
        address: { type: 'string', example: '123 Main Street, Kigali' },
        phone: { type: 'string', example: '+250788123456' },
        email: { type: 'string', example: 'info@supermart.rw' },
        logo: { type: 'string', format: 'binary', description: 'Organization logo image' },
        'bossData[fullName]': { type: 'string', example: 'John Mugisha' },
        'bossData[email]': { type: 'string', example: 'boss@supermart.rw' },
        'bossData[password]': { type: 'string', example: 'boss123' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Organization already exists (duplicate name, email, or phone)' })
  async create(
    @Body() body: any, 
    @UploadedFile() logoFile: Express.Multer.File,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      this.logger.log(`Creating organization: ${body.name || 'Unknown'}`);

      // Validate file upload if provided
      if (logoFile) {
        this.formDataParser.validateFileUpload(logoFile, {
          maxSize: 5 * 1024 * 1024, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          required: false
        });
      }

      // Parse and validate form data
      const organizationData = await this.formDataParser.parseAndValidate(
        body,
        CreateOrganizationMultipartDto
      );

      // Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        try {
          logoUrl = await this.uploadService.uploadImage(logoFile, 'akariza/organizations');
          this.logger.log(`Logo uploaded successfully: ${logoUrl}`);
        } catch (uploadError) {
          this.logger.error(`Logo upload failed: ${uploadError.message}`);
          return this.errorResponse.sendBusinessError(
            res,
            'Failed to upload organization logo. Please try again.',
            'UPLOAD_ERROR'
          );
        }
      }

      // Add logo URL to organization data
      const finalData = {
        ...organizationData,
        logo: logoUrl
      };

      // Create organization
      const result = await this.service.create(finalData, req.user.id);
      
      this.logger.log(`Organization created successfully: ${result.organization.id}`);
      
      return this.errorResponse.sendSuccess(
        res,
        result,
        'Organization created successfully',
        HttpStatus.CREATED
      );

    } catch (error) {
      this.logger.error(`Organization creation failed: ${error.message}`, error.stack);

      // Handle validation errors
      if (error instanceof BadRequestException) {
        const errorData = error.getResponse() as any;
        if (errorData.errors) {
          return this.errorResponse.sendValidationError(res, errorData.errors, req.url);
        }
        return this.errorResponse.sendBusinessError(res, errorData.message || error.message);
      }

      // Handle duplicate errors
      if (this.errorResponse.isDuplicateError(error)) {
        return this.errorResponse.sendBusinessError(
          res,
          'An organization with this name, email, or phone number already exists',
          'DUPLICATE_ORGANIZATION',
          HttpStatus.CONFLICT
        );
      }

      // Handle other errors
      return this.errorResponse.sendBusinessError(
        res,
        'Failed to create organization. Please try again.',
        'CREATION_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @SystemAdminReadOnly()
  @ApiOperation({ summary: 'Get all organizations (SYSTEM_ADMIN: read-only, BOSS: own org only)' })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  findAll(@Request() req) {
    // SYSTEM_ADMIN can view all organizations (read-only)
    // BOSS can only view their own organization
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.findAll();
    } else {
      return this.service.findByOwner(req.user.organizationId);
    }
  }

  @Get(':id')
  @SystemAdminReadOnly()
  @ApiOperation({ summary: 'Get organization by ID (SYSTEM_ADMIN: read-only, BOSS: own org only)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string, @Request() req) {
    // SYSTEM_ADMIN can view any organization (read-only)
    // BOSS can only view their own organization
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.findOne(id);
    } else {
      return this.service.findOneByOwner(id, req.user.organizationId);
    }
  }

  @Patch(':id')
  @SystemAdminReadOnly()
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Update organization with optional logo upload (SYSTEM_ADMIN: any, BOSS: own organization)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Store Name' },
        businessType: { type: 'string', example: 'Retail' },
        address: { type: 'string', example: '456 New Street, Kigali' },
        phone: { type: 'string', example: '+250788999999' },
        email: { type: 'string', example: 'updated@store.com' },
        logo: { type: 'string', format: 'binary', description: 'Organization logo image' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own organization' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async update(
    @Param('id') id: string, 
    @Body() data: any, 
    @UploadedFile() logoFile: Express.Multer.File,
    @Request() req
  ) {
    let updateData = { ...data };
    
    // Upload new logo if provided
    if (logoFile) {
      updateData.logo = await this.uploadService.uploadImage(logoFile, 'akariza/organizations');
    }

    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.update(id, updateData);
    }
    // BOSS can only update their own organization
    return this.service.updateByOwner(id, req.user.organizationId, updateData);
  }

  @Delete(':id')
  @SystemAdminReadOnly()
  @ApiOperation({ summary: 'Deactivate organization (SYSTEM_ADMIN: any, BOSS: own organization)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only deactivate own organization' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  deactivate(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.deactivate(id);
    }
    // BOSS can only deactivate their own organization
    return this.service.deactivateByOwner(id, req.user.organizationId);
  }

  @Patch(':id/activate')
  @SystemAdminReadOnly()
  @ApiOperation({ summary: 'Activate organization (SYSTEM_ADMIN: any, BOSS: own organization)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization activated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only activate own organization' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  activate(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.activate(id);
    }
    // BOSS can only activate their own organization
    return this.service.activateByOwner(id, req.user.organizationId);
  }

  @Get(':id/stats')
  @SystemAdminReadOnly()
  @ApiOperation({ summary: 'Get organization statistics (SYSTEM_ADMIN: read-only, BOSS: own org only)' })
  @ApiParam({ name: 'id', example: 'org-1' })
  @ApiResponse({ status: 200, description: 'Organization statistics' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  getStats(@Param('id') id: string, @Request() req) {
    // SYSTEM_ADMIN can view any organization stats (read-only)
    // BOSS can only view their own organization stats
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.service.getStats(id);
    } else {
      return this.service.getStatsByOwner(id, req.user.organizationId);
    }
  }
}
