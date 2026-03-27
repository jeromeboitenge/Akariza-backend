import { Controller, Get, Post, Body, Patch, Param, Delete, Request , UseGuards} from '@nestjs/common';
import { OrganizationContextGuard } from '../common/organization-context.guard';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { Roles } from '../common/decorators';

@ApiTags('Promotions')
@ApiBearerAuth()
@Controller('promotions')
@UseGuards(OrganizationContextGuard)
@Roles('BOSS', 'MANAGER', 'SYSTEM_ADMIN')
export class PromotionsController {
  constructor(private service: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create promotion' })
  @ApiBody({
    schema: {
      example: {
        name: 'February Sale',
        description: '20% off all products',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        productIds: ['product-1-id', 'product-2-id']
      }
    }
  })
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all promotions' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active promotions' })
  findActive(@Request() req) {
    return this.service.findActive(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promotion' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate promotion' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
