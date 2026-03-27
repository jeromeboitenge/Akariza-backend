import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OrganizationContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) return false;

    // For SYSTEM_ADMIN accessing operational endpoints, they MUST have selected an organization context
    if (user.role === 'SYSTEM_ADMIN' && !user.organizationId) {
      throw new ForbiddenException(
        'System administrators must select an organization context before accessing this module.'
      );
    }

    return true;
  }
}
