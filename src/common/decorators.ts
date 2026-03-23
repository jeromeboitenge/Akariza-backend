import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const SYSTEM_ADMIN_READONLY_KEY = 'systemAdminReadOnly';
export const SystemAdminReadOnly = () => SetMetadata(SYSTEM_ADMIN_READONLY_KEY, true);
