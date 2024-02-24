import { EntityManager, QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  private queryRunner: QueryRunner;
  constructor(private manager: EntityManager) {}

  async startTransactionByQueryRunner() {
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async commitTransactionByQueryRunner(queryRunner: QueryRunner) {
    await queryRunner.commitTransaction();
  }

  async rollbackTransactionByQueryRunner(queryRunner: QueryRunner) {
    await queryRunner.rollbackTransaction();
  }

  async release(queryRunner: QueryRunner) {
    await queryRunner.release();
  }
}
