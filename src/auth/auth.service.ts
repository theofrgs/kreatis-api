import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateNativeCredentialDTO } from '../native-credential/dto/create-native-credential.dto';
import { HashService } from '../services/hash/hash.service';
import { NativeCredentialService } from '@src/native-credential/native-credential.service';
import { CreateNativeRegisterDTO } from './dto/create-auth.dto';
import { CredentialService } from '@src/credential/credential.service';
import { TransactionService } from '@src/transaction/transaction.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly nativeCredentialService: NativeCredentialService,
    private readonly credentialService: CredentialService,
    private readonly jwtService: JwtService,
    private readonly hasService: HashService,
    private readonly transactionService: TransactionService,
  ) {}

  async loginNative(dto: CreateNativeCredentialDTO) {
    const nativeCredential = await this.nativeCredentialService.findOneByOrFail(
      {
        email: dto.email,
      },
      ['credential', 'credential.user'],
    );
    if (
      !(await this.hasService.equals(dto.password, nativeCredential.password))
    )
      throw new HttpException(
        { message: 'Invalid credentials' },
        HttpStatus.FORBIDDEN,
      );
    // TOTO remvoe the secret use global tru
    return {
      access_token: await this.jwtService.signAsync(
        {
          sub: nativeCredential.credential.user.id,
          username: nativeCredential.credential.user.email,
        },
        {
          secret: process.env.API_JWT_SECRET,
          expiresIn: '6000h',
        },
      ),
    };
  }

  async registerNative(dto: CreateNativeRegisterDTO) {
    const queryRunner =
      await this.transactionService.startTransactionByQueryRunner();
    try {
      const user = await this.userService.create(dto, queryRunner.manager);
      await this.credentialService.create(
        {
          user: user,
          native: await this.nativeCredentialService.create(
            dto,
            queryRunner.manager,
          ),
        },
        queryRunner.manager,
      );
      const access_token = await this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.email,
        },
        {
          secret: process.env.API_JWT_SECRET,
          expiresIn: '6000h',
        },
      );
      await this.transactionService.commitTransactionByQueryRunner(queryRunner);
      return {
        access_token,
      };
    } catch (err) {
      await this.transactionService.rollbackTransactionByQueryRunner(
        queryRunner,
      );
      throw err;
    } finally {
      await this.transactionService.release(queryRunner);
    }
  }
}
