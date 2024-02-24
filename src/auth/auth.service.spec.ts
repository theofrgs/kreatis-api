import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '@src/user/entities/user.entity';
import { UserService } from '@src/user/user.service';
import { AuthService } from './auth.service';
import { CreateNativeRegisterDTO } from './dto/create-auth.dto';
import { UserModule } from '@src/user/user.module';
import { CredentialModule } from '@src/credential/credential.module';
import { NativeCredentialModule } from '@src/native-credential/native-credential.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HashService } from '@src/services/hash/hash.service';
import { TransactionService } from '@src/transaction/transaction.service';
import { CreateNativeCredentialDTO } from '@src/native-credential/dto/create-native-credential.dto';

describe('UserService', () => {
  let service: AuthService;
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: ['../**/*.entity.ts'],
          synchronize: true,
          logging: false,
        }),
        // TODO fix with auth service where jwt use
        JwtModule.register({
          global: true,
          secret: process.env.API_JWT_SECRET,
          signOptions: { expiresIn: '6000h' },
        }),
        TypeOrmModule.forFeature([User]),
        UserModule,
        CredentialModule,
        NativeCredentialModule,
      ],
      providers: [
        AuthService,
        UserService,
        JwtService,
        HashService,
        TransactionService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    const connection = userRepository.manager.connection;
    await connection.dropDatabase();
  });

  describe('Register', () => {
    const dto: CreateNativeRegisterDTO = {
      email: 'test@example.com',
      first_name: 'joe',
      last_name: 'devoe',
      password: 'password',
    };

    it('Basic', async () => {
      expect(await service.registerNative(dto)).toHaveProperty('access_token');
      const user = await userService.findOneBy({ email: dto.email }, [
        'credential',
        'credential.native',
      ]);
      expect(user.email).toBe(dto.email);
      expect(user.first_name).toBe(dto.first_name);
      expect(user.last_name).toBe(dto.last_name);
      expect(user.credential.native.email).toBe(dto.email);
    });

    it('Error - Same email', async () => {
      await expect(service.registerNative(dto)).rejects.toThrow(
        'User with this email already exist',
      );
      // TODO check if the transaction service work
    });
  });

  describe('Login', () => {
    const dto: CreateNativeCredentialDTO = {
      email: 'test@example.com',
      password: 'password',
    };
    const registerDto: CreateNativeRegisterDTO = {
      email: 'test@example.com',
      first_name: 'joe',
      last_name: 'devoe',
      password: 'password',
    };

    it('Basic', async () => {
      expect(await service.loginNative(dto)).toHaveProperty('access_token');
      const user = await userService.findOneBy({ email: dto.email }, [
        'credential',
        'credential.native',
      ]);
      expect(user.email).toBe(dto.email);
      expect(user.first_name).toBe(registerDto.first_name);
      expect(user.last_name).toBe(registerDto.last_name);
      expect(user.credential.native.email).toBe(dto.email);
    });

    it('Error - Wrong email', async () => {
      await expect(
        service.loginNative({ ...dto, email: 'test' }),
      ).rejects.toThrow('Not found');
    });

    it('Error - Wrong password', async () => {
      await expect(
        service.loginNative({ ...dto, password: 'test' }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  // describe('Get all', () => {
  //   it('Basic', async () => {
  //     const founded: User[] = await service.findBy({});
  //     expect(founded.length).toBe(1);
  //   });
  // });

  // describe('Get one', () => {
  //   it('By email', async () => {
  //     expect(
  //       (
  //         await service.findOneBy({
  //           email: 'test@example.com',
  //         })
  //       ).email,
  //     ).toBe('test@example.com');
  //   });

  //   it('By first_name', async () => {
  //     expect(
  //       (
  //         await service.findOneBy({
  //           first_name: 'joe',
  //         })
  //       ).email,
  //     ).toBe('test@example.com');
  //   });

  //   it('By last_name', async () => {
  //     expect(
  //       (
  //         await service.findOneBy({
  //           last_name: 'devoe',
  //         })
  //       ).email,
  //     ).toBe('test@example.com');
  //   });

  //   it('Wrong first name', async () => {
  //     expect(
  //       await service.findOneBy({
  //         first_name: 'devoe',
  //       }),
  //     ).toBe(null);
  //   });
  // });

  // describe('Get one or fail', () => {
  //   it('By email', async () => {
  //     expect(
  //       (
  //         await service.findOneByOrFail({
  //           email: 'test@example.com',
  //         })
  //       ).email,
  //     ).toBe('test@example.com');
  //     await expect(
  //       service.findOneByOrFail({
  //         email: 'test@a.com',
  //       }),
  //     ).rejects.toThrow('Not found');
  //   });

  //   it('By first_name', async () => {
  //     expect(
  //       (
  //         await service.findOneByOrFail({
  //           first_name: 'joe',
  //         })
  //       ).email,
  //     ).toBe('test@example.com');
  //     await expect(
  //       service.findOneByOrFail({
  //         first_name: 'dze',
  //       }),
  //     ).rejects.toThrow('Not found');
  //   });

  //   it('By last_name', async () => {
  //     expect(
  //       (
  //         await service.findOneByOrFail({
  //           last_name: 'devoe',
  //         })
  //       ).email,
  //     ).toBe('test@example.com');
  //     await expect(
  //       service.findOneByOrFail({
  //         last_name: 'devoedeze',
  //       }),
  //     ).rejects.toThrow('Not found');
  //   });
  // });

  // describe('Update', () => {
  //   let user: User;

  //   it('Get user', async () => {
  //     user = await service.findOneByOrFail({ email: 'test@example.com' });
  //   });

  //   it('Basic - Update first name', async () => {
  //     const updated: User = await service.update(user.id, {
  //       first_name: 'New first name',
  //     });
  //     expect(updated.first_name).toBe('New first name');
  //   });

  //   it('Basic - Update last name', async () => {
  //     const updated: User = await service.update(user.id, {
  //       last_name: 'New last name',
  //     });
  //     expect(updated.last_name).toBe('New last name');
  //   });

  //   it('Error - Wrong id', async () => {
  //     await expect(service.update('fakeId', {})).rejects.toThrow('Not found');
  //   });
  // });

  // describe('Delete', () => {
  //   let user: User;

  //   it('Get user', async () => {
  //     user = await service.findOneByOrFail({ email: 'test@example.com' });
  //   });

  //   it('Basic', async () => {
  //     const deleteResult: any = await service.remove(user.id);

  //     expect(deleteResult).toBe(`${user.id} has been removed`);
  //     const deletedUser: User | null = await service.findOneBy({
  //       email: 'test@example.com',
  //     });
  //     expect(deletedUser).toBe(null);
  //   });

  //   it('Error - Wrong id', async () => {
  //     await expect(service.remove('fakeId')).rejects.toThrow('Not found');
  //   });
  // });
});
