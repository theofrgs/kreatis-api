import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashService } from '@src/services/hash/hash.service';
import { NativeCredential } from './entities/native-credential.entity';
import { NativeCredentialService } from './native-credential.service';

@Module({
  imports: [TypeOrmModule.forFeature([NativeCredential])],
  providers: [NativeCredentialService, HashService],
  exports: [NativeCredentialService],
})
export class NativeCredentialModule {}
