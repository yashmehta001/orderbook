import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFundsFromUsersTable1759008332510
  implements MigrationInterface
{
  name = 'RemoveFundsFromUsersTable1759008332510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "funds"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "funds" integer NOT NULL DEFAULT '0'`,
    );
  }
}
