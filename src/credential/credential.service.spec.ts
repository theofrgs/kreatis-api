import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { CredentialService } from './credential.service';
import { CreateCredentialDTO } from './dto/create-credential.dto';
import { Credential } from './entities/credential.entity';
import { UserService } from '@src/user/user.service';
import { User } from '@src/user/entities/user.entity';
import { NativeCredential } from '@src/native-credential/entities/native-credential.entity';
import { NativeCredentialService } from '@src/native-credential/native-credential.service';
import { NativeCredentialModule } from '@src/native-credential/native-credential.module';
import { UserModule } from '@src/user/user.module';

describe('CredentialService', () => {
  let service: CredentialService;
  let userService: UserService;
  let nativeCredentialService: NativeCredentialService;
  let nativeCredential: NativeCredential;
  let user: User;
  let credentialRepository: Repository<Credential>;

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
        TypeOrmModule.forFeature([Credential]),
        UserModule,
        NativeCredentialModule,
      ],
      providers: [CredentialService],
    }).compile();

    service = module.get<CredentialService>(CredentialService);
    userService = module.get<UserService>(UserService);
    nativeCredentialService = module.get<NativeCredentialService>(
      NativeCredentialService,
    );
    credentialRepository = module.get<Repository<Credential>>(
      getRepositoryToken(Credential),
    );

    user = await userService.create({
      email: 'test@example.com',
      first_name: 'first_name',
      last_name: 'last_name',
    });

    nativeCredential = await nativeCredentialService.create({
      email: user.email,
      password: 'password',
    });
  });

  afterAll(async () => {
    const connection = credentialRepository.manager.connection;
    await connection.dropDatabase();
  });

  describe('Create', () => {
    it('Error - No credential', async () => {
      const dto: CreateCredentialDTO = {
        user,
        native: nativeCredential,
      };
      await expect(
        service.create({ ...dto, native: undefined }),
      ).rejects.toThrow('Invalid credential');
    });

    it('Basic', async () => {
      const dto: CreateCredentialDTO = {
        user,
        native: nativeCredential,
      };
      const credential: Credential = await service.create(dto);
      expect(credential.user.id).toBe(dto.user.id);
      expect(credential.native.id).toBe(dto.native.id);
    });

    it('Error - Same user', async () => {
      const dto: CreateCredentialDTO = {
        user,
        native: nativeCredential,
      };
      await expect(service.create(dto)).rejects.toThrow(
        'Credential with this user already exist',
      );
    });
  });

  describe('Get all', () => {
    it('Basic', async () => {
      const founded: Credential[] = await service.findBy({});
      expect(founded.length).toBe(1);
    });
  });

  describe('Get one', () => {
    it('By native email', async () => {
      expect(
        (
          await service.findOneBy(
            {
              native: {
                email: 'test@example.com',
              },
            },
            ['native'],
          )
        ).native.email,
      ).toBe('test@example.com');
    });

    it('By user first_name', async () => {
      expect(
        (
          await service.findOneBy(
            {
              user: {
                first_name: 'first_name',
              },
            },
            ['user'],
          )
        ).user.email,
      ).toBe('test@example.com');
    });

    it('Wrong user email', async () => {
      expect(
        await service.findOneBy({
          user: {
            email: 'dzeezd',
          },
        }),
      ).toBe(null);
    });
  });

  describe('Get one or fail', () => {
    it('By user email', async () => {
      expect(
        (
          await service.findOneByOrFail(
            {
              user: {
                email: 'test@example.com',
              },
            },
            ['user'],
          )
        ).user.email,
      ).toBe('test@example.com');
      await expect(
        service.findOneByOrFail({
          user: {
            email: 'test@a.com',
          },
        }),
      ).rejects.toThrow('Not found');
    });

    it('By native email', async () => {
      expect(
        (
          await service.findOneByOrFail(
            {
              native: {
                email: 'test@example.com',
              },
            },
            ['native'],
          )
        ).native.email,
      ).toBe('test@example.com');
      await expect(
        service.findOneByOrFail({
          native: {
            email: 'dze',
          },
        }),
      ).rejects.toThrow('Not found');
    });
  });

  // TODO shoulnd be able to update
  // describe('Update', () => {
  //   let credential: Credential;

  //   it('Get credential', async () => {
  //     credential = await service.findOneByOrFail({ email: 'test@example.com' });
  //   });

  //   it('Basic - Update first name', async () => {
  //     const updated: Credential = await service.update(credential.id, {
  //       first_name: 'New first name',
  //     });
  //     expect(updated.first_name).toBe('New first name');
  //   });

  //   it('Basic - Update last name', async () => {
  //     const updated: Credential = await service.update(credential.id, {
  //       last_name: 'New last name',
  //     });
  //     expect(updated.last_name).toBe('New last name');
  //   });

  //   it('Error - Wrong credential', async () => {
  //     await expect(service.update('fakeId', {})).rejects.toThrow('Not found');
  //   });
  // });

  // TODO deal with foreign key
  // describe('Delete', () => {
  //   let credential: Credential;

  //   it('Get credential', async () => {
  //     credential = await service.findOneByOrFail({
  //       user: { email: 'test@example.com' },
  //     });
  //   });

  //   it('Basic', async () => {
  //     const deleteResult: any = await service.remove(credential.id);

  //     expect(deleteResult).toBe(`${credential.id} has been removed`);
  //     const deletedCredential: Credential | null = await service.findOneBy({
  //       user: {
  //         email: 'test@example.com',
  //       },
  //     });
  //     expect(deletedCredential).toBe(null);
  //   });

  //   it('Error - Wrong id', async () => {
  //     await expect(service.remove('fakeId')).rejects.toThrow('Not found');
  //   });
  // });
});
