import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class BranchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // System admin and boss can access all branches
    if (user.role === 'SYSTEM_ADMIN' || user.role === 'BOSS') {
      return true;
    }
    
    // Manager and cashier can only access their branch
    const resourceBranchId = request.params.branchId || request.body?.branchId;
    
    if (resourceBranchId && resourceBranchId !== user.branchId) {
      throw new ForbiddenException('Cannot access other branch data');
    }
    
    return true;
  }
}
