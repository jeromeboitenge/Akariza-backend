import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // System admin can access all organizations
    if (user.role === 'SYSTEM_ADMIN') {
      return true;
    }
    
    // Check if accessing own organization's data
    const resourceOrgId = request.params.organizationId || request.body?.organizationId;
    
    if (resourceOrgId && resourceOrgId !== user.organizationId) {
      throw new ForbiddenException('Cannot access other organization data');
    }
    
    return true;
  }
}
