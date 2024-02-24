import { IntersectionType } from '@nestjs/swagger';
import { CreateNativeCredentialDTO } from '@src/native-credential/dto/create-native-credential.dto';
import { CreateUserDTO } from '@src/user/dto/create-user.dto';

export class CreateNativeRegisterDTO extends IntersectionType(
  CreateNativeCredentialDTO,
  CreateUserDTO,
) {}
