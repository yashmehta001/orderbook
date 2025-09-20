import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderBookTableInit1758316072558 implements MigrationInterface {
  name = 'OrderBookTableInit1758316072558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orderbook" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stock_name" character varying NOT NULL, "side" character varying NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '0', "user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_12663924441061faafd4193dc5c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "orderbook" ADD CONSTRAINT "FK_f0e08f844dc3631d9c30383aa3d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orderbook" DROP CONSTRAINT "FK_f0e08f844dc3631d9c30383aa3d"`,
    );
    await queryRunner.query(`DROP TABLE "orderbook"`);
  }
}
