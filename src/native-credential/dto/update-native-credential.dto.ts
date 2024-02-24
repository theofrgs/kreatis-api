import { OmitType } from '@nestjs/swagger';
import { CreateNativeCredentialDTO } from './create-native-credential.dto';

export class UpdateNativeCredentialDTO extends OmitType(
  CreateNativeCredentialDTO,
  ['email'],
) {}
