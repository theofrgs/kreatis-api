import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization;
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) return true;
    if (!token || !token.startsWith('Bearer ')) {
      throw new HttpException(
        { message: 'Token invalid' },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const decoded = this.jwtService.verify(token.split('Bearer ')[1].trim());
      const user = await this.userService.findOneByOrFail({ id: decoded.sub });
      req.user = user;
      return true;
    } catch (error) {
      throw new HttpException(
        { message: 'Token invalid' },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
