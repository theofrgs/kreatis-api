import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateNativeCredentialDTO } from '../native-credential/dto/create-native-credential.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../services/decorators/public.decorator';
import { CreateNativeRegisterDTO } from './dto/create-auth.dto';

@ApiTags('Auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // NATIVE PART
  @ApiOperation({ summary: 'Login native user' })
  @ApiBody({ type: CreateNativeCredentialDTO })
  @HttpCode(HttpStatus.OK)
  @Post('native/login')
  async loginNative(@Body() dto: CreateNativeCredentialDTO) {
    return await this.authService.loginNative(dto);
  }

  @ApiOperation({ summary: 'Register native user' })
  @ApiBody({ type: CreateNativeRegisterDTO })
  @HttpCode(HttpStatus.CREATED)
  @Post('native/register')
  async registerNative(@Body() dto: CreateNativeRegisterDTO) {
    return await this.authService.registerNative(dto);
  }
}
