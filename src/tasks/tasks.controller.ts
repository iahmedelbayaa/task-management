import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all tasks for the logged-in user (or all tasks for admin)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['todo', 'in_progress', 'done'],
  })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryTaskDto, @GetUser() user: User) {
    return this.tasksService.findAll(queryDto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task successfully updated' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task successfully deleted' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.remove(id, user);
  }
}
