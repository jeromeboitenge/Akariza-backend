import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Roles } from '../common/decorators';

@Controller('organizations')
@Roles('SYSTEM_ADMIN')
export class OrganizationsController {
  constructor(private service: OrganizationsService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user.id);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
