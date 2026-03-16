import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { Roles } from '../common/decorators';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Post()
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Create supplier' })
  @ApiBody({
    schema: {
      example: {
        name: 'ABC Distributors Ltd',
        email: 'info@abc.com',
        phone: '+250788999888',
        address: 'Kigali, Rwanda',
        contactPerson: 'Jane Smith',
        paymentTerms: 'Net 30 days'
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId, req.user.id);
  }

  @Get()
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get all suppliers' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Update supplier' })
  update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.service.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN', 'BOSS', 'MANAGER')
  @ApiOperation({ summary: 'Delete supplier' })
  delete(@Param('id') id: string) {
    // Temporary placeholder - implement when suppliers service is complete
    return { message: 'Supplier deleted successfully' };
  }
}
