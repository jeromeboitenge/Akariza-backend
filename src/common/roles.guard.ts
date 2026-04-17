import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Support System Admin impersonation of an organization via header
    if (user && user.role === 'SYSTEM_ADMIN') {
      const impersonatedOrgId = request.headers['x-organization-id'];
      const impersonatedBranchId = request.headers['x-branch-id'];
      
      if (impersonatedOrgId) {
        user.organizationId = impersonatedOrgId;
        user.isImpersonating = true;
      }
      
      if (impersonatedBranchId) {
        user.branchId = impersonatedBranchId;
      }
    }

    if (!requiredRoles) return true;

    if (!user) return false;

    // A SYSTEM_ADMIN impersonating an org gets full operational access
    if (user.role === 'SYSTEM_ADMIN' && user.isImpersonating) {
      return true;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
