import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task, TaskStatus } from '../../tasks/entities/task.entity';

export default class TaskSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const taskRepository = dataSource.getRepository(Task);
    const userRepository = dataSource.getRepository(User);

    // Check if tasks already exist
    const existingTasks = await taskRepository.count();
    if (existingTasks > 0) {
      console.log('Tasks already exist, skipping task seeding');
      return;
    }

    // Get users to assign tasks to
    const users = await userRepository.find();
    if (users.length === 0) {
      console.log('No users found, please run user seeder first');
      return;
    }

    const tasks = [
      {
        title: 'Setup project environment',
        description:
          'Configure development environment and install dependencies',
        status: TaskStatus.DONE,
        dueDate: new Date('2025-11-20'),
        userId: users[0].id,
      },
      {
        title: 'Implement authentication system',
        description: 'Create login and registration functionality with JWT',
        status: TaskStatus.DONE,
        dueDate: new Date('2025-11-22'),
        userId: users[0].id,
      },
      {
        title: 'Design database schema',
        description:
          'Create entity models and relationships for the application',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2025-11-25'),
        userId: users[1].id,
      },
      {
        title: 'Implement task CRUD operations',
        description:
          'Create endpoints for creating, reading, updating, and deleting tasks',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2025-11-28'),
        userId: users[1].id,
      },
      {
        title: 'Add input validation',
        description: 'Implement proper validation for all API endpoints',
        status: TaskStatus.TODO,
        dueDate: new Date('2025-12-01'),
        userId: users[2].id,
      },
      {
        title: 'Write unit tests',
        description:
          'Add comprehensive test coverage for all services and controllers',
        status: TaskStatus.TODO,
        dueDate: new Date('2025-12-05'),
        userId: users[2].id,
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: TaskStatus.TODO,
        dueDate: new Date('2025-12-10'),
        userId: users[3].id,
      },
      {
        title: 'Add API documentation',
        description: 'Generate Swagger documentation for all endpoints',
        status: TaskStatus.TODO,
        dueDate: new Date('2025-12-15'),
        userId: users[3].id,
      },
    ];

    const createdTasks = taskRepository.create(tasks);
    await taskRepository.save(createdTasks);

    console.log('Tasks seeded successfully');
  }
}
