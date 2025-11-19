import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { INestApplication, ValidationPipe } from '@nestjs/common';

export class TestSetup {
  static app: INestApplication;
  static dataSource: DataSource;
  static moduleFixture: TestingModule;
  static isSetup = false;

  static async setupApp(): Promise<void> {
    if (this.isSetup) {
      return;
    }

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.DB_NAME = 'task_management_test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';

    this.moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.moduleFixture.createNestApplication();

    // Apply validation pipes
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await this.app.init();

    this.dataSource = this.moduleFixture.get<DataSource>(DataSource);

    // Run migrations to set up the schema
    if (this.dataSource.isInitialized) {
      try {
        await this.dataSource.runMigrations();
      } catch (error: any) {
        console.warn(
          'Migration error (might be already applied):',
          error.message,
        );
      }
    }

    this.isSetup = true;
  }

  static async teardownApp(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      try {
        // Check if tables exist before trying to delete
        const tables = await this.dataSource.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        );
        const tableNames = tables.map((t: any) => t.table_name);

        if (tableNames.includes('tasks')) {
          await this.dataSource.query('DELETE FROM tasks WHERE TRUE');
        }
        if (tableNames.includes('users')) {
          await this.dataSource.query('DELETE FROM users WHERE TRUE');
        }
      } catch (error: any) {
        console.warn('Cleanup error:', error.message);
      }
    }
  }

  static async closeApp(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      try {
        await this.dataSource.dropDatabase();
      } catch (error: any) {
        console.warn('Drop database error:', error.message);
      }
      await this.dataSource.destroy();
    }
    if (this.app) {
      await this.app.close();
    }
    this.isSetup = false;
  }
}
