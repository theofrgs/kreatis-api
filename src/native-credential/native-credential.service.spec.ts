import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { CreateNativeCredentialDTO } from './dto/create-native-credential.dto';
import { NativeCredential } from './entities/native-credential.entity';
import { NativeCredentialService } from './native-credential.service';
import { HashService } from '@src/services/hash/hash.service';

describe('NativeCredentialService', () => {
  let service: NativeCredentialService;
  let hashService: HashService;
  let nativeCredentialRepository: Repository<NativeCredential>;

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
        TypeOrmModule.forFeature([NativeCredential]),
      ],
      providers: [NativeCredentialService, HashService],
    }).compile();

    service = module.get<NativeCredentialService>(NativeCredentialService);
    hashService = module.get<HashService>(HashService);
    nativeCredentialRepository = module.get<Repository<NativeCredential>>(
      getRepositoryToken(NativeCredential),
    );
  });

  afterAll(async () => {
    const connection = nativeCredentialRepository.manager.connection;
    await connection.dropDatabase();
  });

  describe('Create', () => {
    const dto: CreateNativeCredentialDTO = {
      email: 'test@example.com',
      password: 'password',
    };

    it('Basic', async () => {
      const nativeCredential: NativeCredential = await service.create(dto);
      expect(nativeCredential.email).toBe(dto.email);
      expect(
        await hashService.equals(dto.password, nativeCredential.password),
      ).toBe(true);
    });

    it('Error - Same email', async () => {
      await expect(service.create(dto)).rejects.toThrow(
        'NativeCredential with this email already exist',
      );
    });
  });

  describe('Get all', () => {
    it('Basic', async () => {
      const founded: NativeCredential[] = await service.findBy({});
      expect(founded.length).toBe(1);
    });
  });

  describe('Get one', () => {
    it('By email', async () => {
      expect(
        (
          await service.findOneBy({
            email: 'test@example.com',
          })
        ).email,
      ).toBe('test@example.com');
    });

    it('Wrong email', async () => {
      expect(
        await service.findOneBy({
          email: 'devoe',
        }),
      ).toBe(null);
    });
  });

  describe('Get one or fail', () => {
    it('By email', async () => {
      expect(
        (
          await service.findOneByOrFail({
            email: 'test@example.com',
          })
        ).email,
      ).toBe('test@example.com');
      await expect(
        service.findOneByOrFail({
          email: 'test@a.jhbcom',
        }),
      ).rejects.toThrow('Not found');
    });
  });

  describe('Update', () => {
    let nativeCredential: NativeCredential;

    it('Get nativeCredential', async () => {
      nativeCredential = await service.findOneByOrFail({
        email: 'test@example.com',
      });
    });

    it('Basic', async () => {
      const updated: NativeCredential = await service.update(
        nativeCredential.id,
        {
          password: 'New password',
        },
      );
      expect(await hashService.equals('New password', updated.password)).toBe(
        true,
      );
    });

    it('Error - Wrong id', async () => {
      await expect(
        service.update('fakeId', {
          password: 'New password',
        }),
      ).rejects.toThrow('Not found');
    });
  });

  describe('Delete', () => {
    let nativeCredential: NativeCredential;

    it('Get nativeCredential', async () => {
      nativeCredential = await service.findOneByOrFail({
        email: 'test@example.com',
      });
    });

    it('Basic', async () => {
      const deleteResult: any = await service.remove(nativeCredential.id);

      expect(deleteResult).toBe(`${nativeCredential.id} has been removed`);
      const deletedNativeCredential: NativeCredential | null =
        await service.findOneBy({
          email: 'test@example.com',
        });
      expect(deletedNativeCredential).toBe(null);
    });

    it('Error - Wrong id', async () => {
      await expect(service.remove('fakeId')).rejects.toThrow('Not found');
    });
  });
});
