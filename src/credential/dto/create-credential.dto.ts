import { ApiProperty } from '@nestjs/swagger';
import { NativeCredential } from '@src/native-credential/entities/native-credential.entity';
import { User } from '@src/user/entities/user.entity';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CreateCredentialDTO {
  @ApiProperty({ type: () => User })
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => User)
  user: User;

  @ApiProperty({ type: () => NativeCredential })
  @ValidateNested()
  @IsOptional()
  @Type(() => NativeCredential)
  native?: NativeCredential;
}
