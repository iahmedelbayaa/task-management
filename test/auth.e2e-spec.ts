import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestSetup } from './test-setup';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await TestSetup.setupApp();
    app = TestSetup.app;
  }, 30000);

  afterAll(async () => {
    await TestSetup.closeApp();
  });

  describe('/users/register (POST)', () => {
    afterEach(async () => {
      await TestSetup.teardownApp();
    });

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail with duplicate email', async () => {
      // First, create a user
      await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(201);

      // Then try to create the same user again
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'test2@example.com',
          password: '12345',
        })
        .expect(400);
    });
  });

  describe('/users/login (POST)', () => {
    beforeEach(async () => {
      await TestSetup.teardownApp();
      // Create a test user for login tests
      await request(app.getHttpServer()).post('/users/register').send({
        email: 'logintest@example.com',
        password: 'Password123!',
      });
    });

    afterEach(async () => {
      await TestSetup.teardownApp();
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'logintest@example.com',
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('logintest@example.com');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'logintest@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });
});
