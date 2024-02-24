import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

export const Permission = (roles: string[]) => SetMetadata('roles', roles);
