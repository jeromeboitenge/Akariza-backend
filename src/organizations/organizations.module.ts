import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { AdminBranchesController } from './admin-branches.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { BranchesService } from '../branches/branches.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { UploadService } from '../upload/upload.service';
import { CloudinaryProvider } from '../upload/cloudinary.provider';
import { FormDataParserService } from '../common/services/form-data-parser.service';
import { ErrorResponseService } from '../common/services/error-response.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationsController, AdminBranchesController, AdminDashboardController],
  providers: [
    OrganizationsService, 
    BranchesService, 
    AdminDashboardService, 
    UploadService, 
    CloudinaryProvider,
    FormDataParserService,
    ErrorResponseService
  ],
})
export class OrganizationsModule {}
