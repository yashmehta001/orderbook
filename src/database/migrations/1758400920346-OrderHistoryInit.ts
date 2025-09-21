import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderHistoryInit1758400920346 implements MigrationInterface {
  name = 'OrderHistoryInit1758400920346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Order_History" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stock_name" character varying NOT NULL, "side" character varying NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '0', "transaction_id" character varying NOT NULL, "user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_b93c51c9af5c5bf234165d6ab56" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Order_History" ADD CONSTRAINT "FK_f5fc91ea85b7503a9f07a96e087" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Order_History" DROP CONSTRAINT "FK_f5fc91ea85b7503a9f07a96e087"`,
    );
    await queryRunner.query(`DROP TABLE "Order_History"`);
  }
}
