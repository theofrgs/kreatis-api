import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@src/user/user.module';
import { CredentialModule } from '@src/credential/credential.module';
import { NativeCredentialModule } from '@src/native-credential/native-credential.module';
import { HashService } from '@src/services/hash/hash.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionService } from '@src/transaction/transaction.service';

@Module({
  imports: [UserModule, CredentialModule, NativeCredentialModule],
  controllers: [AuthController],
  providers: [AuthService, HashService, JwtService, TransactionService],
})
export class AuthModule {}
