import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { CredentialService } from './credential.service';
import { UserModule } from '@src/user/user.module';
import { NativeCredentialModule } from '@src/native-credential/native-credential.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),
    UserModule,
    NativeCredentialModule,
  ],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}
