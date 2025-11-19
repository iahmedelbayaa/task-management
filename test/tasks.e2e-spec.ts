import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestSetup } from './test-setup';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    await TestSetup.setupApp();
    app = TestSetup.app;

    // Register a user and get token
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'taskuser@example.com',
        password: 'Password123!',
      });

    userToken = response.body.access_token as string;
  }, 30000);

  beforeEach(async () => {
    // Clean up tasks but keep the user for authentication
    if (TestSetup.dataSource && TestSetup.dataSource.isInitialized) {
      try {
        // Check if tables exist before trying to delete
        const tables = await TestSetup.dataSource.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        );
        const tableNames = tables.map((t: any) => t.table_name);

        if (tableNames.includes('tasks')) {
          await TestSetup.dataSource.query('DELETE FROM tasks');
        }
      } catch (error: any) {
        console.warn('Cleanup error:', error.message);
      }
    }
  });

  afterAll(async () => {
    await TestSetup.closeApp();
  });

  describe('/tasks (POST)', () => {
    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Task',
          description: 'This is a test task',
          status: 'todo',
          dueDate: '2025-12-31T23:59:59Z',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Task');
          expect(res.body.status).toBe('todo');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'This is a test task',
        })
        .expect(401);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Task without title',
        })
        .expect(400);
    });
  });

  describe('/tasks (GET)', () => {
    it('should get all tasks for the user', async () => {
      // First create a task
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Task for GET',
          description: 'This is a test task',
          status: 'todo',
          dueDate: '2025-12-31T23:59:59Z',
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          expect(Array.isArray(res.body.tasks)).toBe(true);
          expect(res.body.tasks.length).toBeGreaterThan(0);
        });
    });

    it('should get all tasks with pagination', async () => {
      // Create some tasks first
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task 1',
          description: 'First task',
          status: 'todo',
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/tasks?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
        });
    });

    it('should filter tasks by status', async () => {
      // Create tasks with specific statuses first
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Todo Task',
          description: 'A todo task',
          status: 'todo',
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/tasks?status=todo')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          if (res.body.tasks.length > 0) {
            res.body.tasks.forEach((task: any) => {
              expect(task.status).toBe('todo');
            });
          }
        });
    });
  });

  describe('/tasks (PUT)', () => {
    it('should update a task', async () => {
      // First create a task to update
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task to Update',
          description: 'This task will be updated',
          status: 'todo',
        })
        .expect(201);

      const taskId = createResponse.body.id;
      console.log('Created task ID:', taskId);

      // Verify task exists before update
      const getResponse = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      console.log('Task found before update:', getResponse.body);

      // Now update it
      const updateResponse = await request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Task',
          status: 'in_progress',
        })
        .expect(200);

      expect(updateResponse.body.title).toBe('Updated Task');
      expect(updateResponse.body.status).toBe('in_progress');
    });
  });

  describe('/tasks (DELETE)', () => {
    it('should delete a task', async () => {
      // First create a task to delete
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task to Delete',
          description: 'This task will be deleted',
          status: 'todo',
        })
        .expect(201);

      const taskId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);
    });

    it('should return 404 for non-existent task', () => {
      // Use a valid UUID format that doesn't exist
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      return request(app.getHttpServer())
        .delete(`/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
