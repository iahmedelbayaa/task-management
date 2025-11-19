import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestSetup } from './test-setup';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await TestSetup.setupApp();
    app = TestSetup.app;
  }, 30000);

  afterEach(async () => {
    await TestSetup.teardownApp();
  });

  afterAll(async () => {
    await TestSetup.closeApp();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
