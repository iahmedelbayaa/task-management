import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskEntity1700000000002 implements MigrationInterface {
  name = 'CreateTaskEntity1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM('todo', 'in_progress', 'done')
    `);

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "dueDate" TIMESTAMP,
        "status" "task_status_enum" NOT NULL DEFAULT 'todo',
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "task_status_enum"`);
  }
}
