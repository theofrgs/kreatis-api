import { HttpException, HttpStatus } from '@nestjs/common';
import { EntityManager, ObjectLiteral } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';

interface IBaseService<T extends ObjectLiteral> {
  create(...args: any[]): Promise<T>;
  findBy(
    findOneOptions?: any,
    relations?: string[],
    opt?: any,
    entityManager?: EntityManager,
  ): Promise<T[]>;
  findOneBy(
    findOneOptions?: any,
    relations?: string[],
    opt?: any,
    entityManager?: EntityManager,
  ): Promise<T | null>;
  findOneByOrFail(
    findOneOptions?: any,
    relations?: string[],
    opt?: any,
    entityManager?: EntityManager,
  ): Promise<T>;
  remove(id: string, entityManager?: EntityManager): Promise<any>;
}

export abstract class BaseService<T extends ObjectLiteral>
  implements IBaseService<T>
{
  constructor(private repository: Repository<T>) {}

  async create(dto: Partial<T>, entityManager?: EntityManager): Promise<T> {
    const manager = entityManager || this.repository.manager;

    return manager.save(
      this.repository.target,
      manager.create(this.repository.target, dto as T),
    ) as unknown as T;
  }

  async findBy(
    findOneOptions?: any,
    relations?: string[],
    opt?: any,
    entityManager?: EntityManager,
  ): Promise<T[]> {
    return (entityManager || this.repository.manager).find(
      this.repository.target,
      {
        where: findOneOptions,
        relations: relations || [],
        ...opt,
      },
    );
  }

  async findOneBy(
    findOneOptions?: any,
    relations?: string[],
    opt?: any,
    entityManager?: EntityManager,
  ): Promise<T | null> {
    return (entityManager || this.repository.manager).findOne(
      this.repository.target,
      {
        where: findOneOptions,
        relations: relations || [],
        ...opt,
      },
    );
  }

  async findOneByOrFail(
    findOneOptions?: any,
    relations?: string[],
    opt?: any,
    entityManager?: EntityManager,
  ): Promise<T> {
    const entity = await this.findOneBy(
      findOneOptions,
      relations,
      opt,
      entityManager,
    );
    if (!entity)
      throw new HttpException({ message: `Not found` }, HttpStatus.NOT_FOUND);
    return entity;
  }

  async remove(id: string, entityManager?: EntityManager): Promise<any> {
    await (entityManager || this.repository.manager).remove(
      this.repository.target,
      await this.findOneByOrFail({ id }, [], {}, entityManager),
    );
    return `${id} has been removed`;
  }
}
