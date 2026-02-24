import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Roles } from '../common/decorators';

@Controller('branches')
@Roles('BOSS', 'MANAGER')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Post()
  @Roles('BOSS')
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles('BOSS')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('BOSS')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Get(':id/inventory')
  getInventory(@Param('id') id: string) {
    return this.service.getInventory(id);
  }

  @Post('transfer')
  createTransfer(@Body() data: any, @Request() req) {
    return this.service.createTransfer(data, req.user.organizationId, req.user.id);
  }

  @Post('transfer/:id/approve')
  @Roles('BOSS')
  approveTransfer(@Param('id') id: string, @Request() req) {
    return this.service.approveTransfer(id, req.user.id);
  }
}
