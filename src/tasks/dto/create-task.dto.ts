import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete project documentation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Write comprehensive API documentation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
