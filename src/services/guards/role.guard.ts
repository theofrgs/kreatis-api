// import {
//     Injectable,
//     CanActivate,
//     ExecutionContext,
//     HttpException,
//     HttpStatus,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { AccountService } from '@src/account/account.service';

// @Injectable()
// export class RoleGuard implements CanActivate {
//     constructor(
//         private readonly reflector: Reflector,
//         private readonly accountService: AccountService) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const req = context.switchToHttp().getRequest();
//         const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
//         if (!requiredRoles || requiredRoles.length === 0) return true;

//         const userRole = await this.accountService.findOnByOrFail({ user: { _id: req.user._id } }, {path: 'role'});
//         if (req.roleEntity && requiredRoles.some((requiredRole) => userRole.role.name === requiredRole))
//             return true;
//         throw new HttpException({ message: 'Unauthorized' }, HttpStatus.FORBIDDEN);
//     }
// }
