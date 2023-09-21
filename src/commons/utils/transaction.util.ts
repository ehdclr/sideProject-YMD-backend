import { BadRequestException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

const runInTransaction = async (
  dataSource: DataSource,
  fn: (manager: EntityManager) => Promise<any>,
): Promise<any> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await fn(queryRunner.manager);
    await queryRunner.commitTransaction();
    return result;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    if (!(err instanceof BadRequestException)) {
      throw err;
    }
    throw new BadRequestException('잘못된 요청입니다.');
  } finally {
    await queryRunner.release();
  }
};

export default runInTransaction;
