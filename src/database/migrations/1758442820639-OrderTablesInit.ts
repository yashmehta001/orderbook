import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderTablesInit1758442820639 implements MigrationInterface {
    name = 'OrderTablesInit1758442820639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Order_Book" ("id" uuid NOT NULL, "stock_name" character varying NOT NULL, "side" character varying NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '0', "user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_ed66415c3690ff0c43376219504" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Order_History" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stock_name" character varying NOT NULL, "side" character varying NOT NULL, "price" numeric(10,2) NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '0', "transaction_id" character varying NOT NULL, "user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_b93c51c9af5c5bf234165d6ab56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Order_Book" ADD CONSTRAINT "FK_265e020cea796ed0ec1b53ae671" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Order_History" ADD CONSTRAINT "FK_f5fc91ea85b7503a9f07a96e087" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Order_History" DROP CONSTRAINT "FK_f5fc91ea85b7503a9f07a96e087"`);
        await queryRunner.query(`ALTER TABLE "Order_Book" DROP CONSTRAINT "FK_265e020cea796ed0ec1b53ae671"`);
        await queryRunner.query(`DROP TABLE "Order_History"`);
        await queryRunner.query(`DROP TABLE "Order_Book"`);
    }

}
