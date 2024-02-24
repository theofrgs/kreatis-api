import { Global, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseService } from '@src/services/base.service';
import { CreateNativeCredentialDTO } from './dto/create-native-credential.dto';
import { UpdateNativeCredentialDTO } from './dto/update-native-credential.dto';
import { NativeCredential } from './entities/native-credential.entity';
import { HashService } from '@src/services/hash/hash.service';

@Global()
@Injectable()
export class NativeCredentialService extends BaseService<NativeCredential> {
  constructor(
    @InjectRepository(NativeCredential)
    private readonly nativecredentialRepository: Repository<NativeCredential>,
    private readonly hashService: HashService,
  ) {
    super(nativecredentialRepository);
  }

  async create(dto: CreateNativeCredentialDTO, entityManager?: EntityManager) {
    if (await this.findOneBy({ email: dto.email }, [], {}, entityManager))
      throw new HttpException(
        { message: 'NativeCredential with this email already exist' },
        HttpStatus.BAD_REQUEST,
      );
    return await super.create(
      {
        ...dto,
        password: await this.hashService.hash(dto.password),
      },
      entityManager,
    );
  }

  async update(id: string, dto: UpdateNativeCredentialDTO) {
    const toUpdate = await this.findOneByOrFail({ id });
    Object.assign(toUpdate, dto);
    return await this.nativecredentialRepository.save({
      ...toUpdate,
      password: await this.hashService.hash(dto.password),
    });
  }
}
