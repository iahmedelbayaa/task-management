import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
      dueDate: createTaskDto.dueDate
        ? new Date(createTaskDto.dueDate)
        : undefined,
    });

    return this.tasksRepository.save(task);
  }

  async findAll(
    queryDto: QueryTaskDto,
    user: User,
  ): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user');

    // If user is not admin, filter by userId
    if (user.role !== UserRole.ADMIN) {
      queryBuilder.where('task.userId = :userId', { userId: user.id });
    }

    // Filter by status if provided
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    // Pagination
    queryBuilder.skip(skip).take(limit).orderBy('task.createdAt', 'DESC');

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      tasks,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has permission to view this task
    if (user.role !== UserRole.ADMIN && task.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to view this task',
      );
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id, user);

    // Check if user has permission to update this task
    if (user.role !== UserRole.ADMIN && task.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }

    Object.assign(task, {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate
        ? new Date(updateTaskDto.dueDate)
        : task.dueDate,
    });

    return this.tasksRepository.save(task);
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);

    // Check if user has permission to delete this task
    if (user.role !== UserRole.ADMIN && task.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this task',
      );
    }

    await this.tasksRepository.remove(task);
  }
}
