import { Global, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCredentialDTO } from './dto/create-credential.dto';
import { Credential } from './entities/credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseService } from '@src/services/base.service';
import { UserService } from '@src/user/user.service';
import { NativeCredentialService } from '@src/native-credential/native-credential.service';

@Global()
@Injectable()
export class CredentialService extends BaseService<Credential> {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly userService: UserService,
    private readonly nativeCredentialService: NativeCredentialService,
  ) {
    super(credentialRepository);
  }

  async create(dto: CreateCredentialDTO, entityManager?: EntityManager) {
    await this.userService.findOneByOrFail(
      { id: dto.user.id },
      [],
      {},
      entityManager,
    );
    if (dto.native)
      await this.nativeCredentialService.findOneByOrFail(
        { id: dto.native.id },
        [],
        {},
        entityManager,
      );
    if (
      await this.findOneBy({ user: { id: dto.user.id } }, [], {}, entityManager)
    )
      throw new HttpException(
        { message: 'Credential with this user already exist' },
        HttpStatus.BAD_REQUEST,
      );
    if (!dto.native)
      throw new HttpException(
        { message: 'Invalid credential' },
        HttpStatus.BAD_REQUEST,
      );
    return await super.create(dto, entityManager);
  }
}
