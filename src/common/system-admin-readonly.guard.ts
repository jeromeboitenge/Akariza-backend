import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, SYSTEM_ADMIN_READONLY_KEY } from './decorators';

@Injectable()
export class SystemAdminReadOnlyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isSystemAdminReadOnly = this.reflector.getAllAndOverride<boolean>(
      SYSTEM_ADMIN_READONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // If this endpoint is marked as system admin read-only
    if (isSystemAdminReadOnly && user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN can only perform GET operations on organization data
      if (method !== 'GET') {
        throw new ForbiddenException(
          'System administrators have read-only access to organization data. Only organization owners (BOSS) can modify their data.'
        );
      }
      return true;
    }

    // SYSTEM_ADMIN has full access to system administration endpoints (not marked as read-only)
    if (user.role === 'SYSTEM_ADMIN' && !isSystemAdminReadOnly) {
      return true;
    }
    
    // For non-SYSTEM_ADMIN users, check if they have the required role
    return requiredRoles.some((role) => user.role === role);
  }
}