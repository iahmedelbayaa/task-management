# Task Management API

A comprehensive RESTful API for task management with JWT authentication, role-based access control, and full CRUD operations built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Features

### Core Features

- ✅ **User Authentication** - JWT-based authentication with secure password hashing
- ✅ **Task Management** - Full CRUD operations for tasks (Create, Read, Update, Delete)
- ✅ **Role-Based Access Control** - Admin and User roles with different permissions
- ✅ **Pagination & Filtering** - Support for paginated task lists with status filtering
- ✅ **Input Validation** - Comprehensive validation using class-validator
- ✅ **API Documentation** - Interactive Swagger/OpenAPI documentation
- ✅ **Logging** - Winston-based logging for all actions and errors
- ✅ **Docker Support** - Complete Docker and Docker Compose configuration
- ✅ **Unit & Integration Tests** - Test coverage for authentication and tasks

### Technical Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: Passport JWT & Local Strategy
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Testing**: Jest & Supertest
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+ (or Docker)
- PostgreSQL 16+ (or use Docker Compose)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd task-management-test
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Database Setup**

**Option A: Using Docker (Recommended)**

```bash
# Start with development environment and seeds
pnpm run docker:dev

# Or start production environment
pnpm run docker:prod
```

**Option B: Local PostgreSQL**

```bash
# 1. Create PostgreSQL database
createdb task_management

# 2. Copy environment file
cp .env.example .env

# 3. Update database connection in .env file

# 4. Run migrations and seeds
pnpm run db:setup
```

4. **Start the application**

```bash
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=task_management

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d
```

4. **Start PostgreSQL Database**

If you don't have PostgreSQL installed, you can use Docker:

```bash
docker run --name task-management-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=task_management \
  -p 5432:5432 \
  -d postgres:16-alpine
```

5. **Run the application**

Development mode:

```bash
pnpm run start:dev
```

Production mode:

```bash
pnpm run build
pnpm run start:prod
```

The API will be available at:

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api

## Running with Docker

### Using Docker Compose (Recommended)

1. **Start all services**

```bash
docker-compose up -d
```

This will start both the PostgreSQL database and the application.

2. **View logs**

```bash
docker-compose logs -f app
```

3. **Stop services**

```bash
docker-compose down
```

### Using Docker only

1. **Build the image**

```bash
docker build -t task-management-api .
```

2. **Run the container**

```bash
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=task_management \
  -e JWT_SECRET=your-secret \
  task-management-api
```

## API Endpoints

### Authentication

#### Register a new user

```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2025-11-18T10:00:00.000Z",
    "updatedAt": "2025-11-18T10:00:00.000Z"
  }
}
```

#### Login

```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** Same as register

### Tasks (Protected Routes)

All task endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

#### Create a task

```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "todo",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

#### Get all tasks (with pagination and filtering)

```http
GET /tasks?page=1&limit=10&status=todo
Authorization: Bearer <token>
```

**Response:**

```json
{
  "tasks": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### Get a specific task

```http
GET /tasks/:id
Authorization: Bearer <token>
```

#### Update a task

```http
PATCH /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in_progress"
}
```

#### Delete a task

```http
DELETE /tasks/:id
Authorization: Bearer <token>
```

## Role-Based Access Control

### User Roles

- **Admin**: Can view and manage all users' tasks
- **User**: Can only view and manage their own tasks

### Permissions Matrix

| Action                | Admin | User |
| --------------------- | ----- | ---- |
| View own tasks        | ✅    | ✅   |
| View all users' tasks | ✅    | ❌   |
| Create task           | ✅    | ✅   |
| Update own task       | ✅    | ✅   |
| Update other's task   | ✅    | ❌   |
| Delete own task       | ✅    | ✅   |
| Delete other's task   | ✅    | ❌   |

## Database Management

### Migrations

```bash
# Run pending migrations
pnpm run migration:run

# Generate new migration from entity changes
pnpm run migration:generate

# Create empty migration file
pnpm run migration:create

# Revert last migration
pnpm run migration:revert
```

### Seeds

```bash
# Run all seeds
pnpm run seed:run

# Reset database (revert all migrations, run migrations, run seeds)
pnpm run db:reset

# Setup fresh database (migrations + seeds)
pnpm run db:setup
```

### Docker Database Management

```bash
# Start with development environment and run seeds
pnpm run docker:dev

# Start production environment (no seeds)
pnpm run docker:prod

# Run seeds in running container (if RUN_SEEDS=false)
docker exec task-management-api npm run seed:run
```

### Sample Data

The seeded database includes:

- **4 Users**: 1 admin (admin@example.com) + 3 regular users
- **8 Tasks**: Various statuses (todo/in_progress/done) assigned to different users
- **Passwords**: All user passwords are "password123" (bcrypt hashed)

## Testing

### Run all tests

```bash
pnpm run test
```

### Run e2e tests

```bash
pnpm run test:e2e
```

### Run tests with coverage

```bash
pnpm run test:cov
```

### Test Files

- `test/auth.e2e-spec.ts` - Authentication tests (register, login)
- `test/tasks.e2e-spec.ts` - Task management tests (CRUD operations)

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api
```

Features:

- Complete API specification
- Request/response examples
- Try-it-out functionality
- JWT authentication support

## Logging

The application uses Winston for logging:

### Log Levels

- **error**: Error events
- **warn**: Warning events
- **info**: Informational messages
- **debug**: Debug messages

### Log Files

- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All logs

### Logged Events

- User registration
- User login
- Task creation
- Task updates
- Task deletion
- Errors and exceptions

## Project Structure

```
task-management-test/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── decorators/          # Custom decorators (GetUser, Roles)
│   │   ├── guards/              # Auth guards (JWT, Local, Roles)
│   │   ├── strategies/          # Passport strategies
│   │   ├── auth.controller.ts   # Auth endpoints
│   │   ├── auth.service.ts      # Auth business logic
│   │   └── auth.module.ts       # Auth module definition
│   ├── users/                   # Users module
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── entities/            # User entity
│   │   ├── users.controller.ts  # User endpoints
│   │   ├── users.service.ts     # User business logic
│   │   └── users.module.ts      # User module definition
│   ├── tasks/                   # Tasks module
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── entities/            # Task entity
│   │   ├── tasks.controller.ts  # Task endpoints
│   │   ├── tasks.service.ts     # Task business logic
│   │   └── tasks.module.ts      # Task module definition
│   ├── config/                  # Configuration files
│   │   └── logger.config.ts     # Winston logger configuration
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry point
├── test/                        # Test files
│   ├── auth.e2e-spec.ts        # Auth integration tests
│   └── tasks.e2e-spec.ts       # Tasks integration tests
├── logs/                        # Log files
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Docker image configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Environment Variables

| Variable       | Description             | Default         | Required |
| -------------- | ----------------------- | --------------- | -------- |
| NODE_ENV       | Application environment | development     | No       |
| PORT           | Application port        | 3000            | No       |
| DB_HOST        | PostgreSQL host         | localhost       | Yes      |
| DB_PORT        | PostgreSQL port         | 5432            | Yes      |
| DB_USERNAME    | Database username       | postgres        | Yes      |
| DB_PASSWORD    | Database password       | -               | Yes      |
| DB_NAME        | Database name           | task_management | Yes      |
| JWT_SECRET     | JWT signing secret      | -               | Yes      |
| JWT_EXPIRES_IN | JWT expiration time     | 1d              | No       |

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Protection**: TypeORM parameterized queries
- **Role-Based Access**: Fine-grained permission control
- **CORS**: Configurable cross-origin resource sharing

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Successful GET/PATCH requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., email already exists)
- `500 Internal Server Error` - Server errors

Error responses include descriptive messages:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

## Performance Considerations

- Database connection pooling
- Indexed database queries
- Pagination for large datasets
- Efficient TypeORM queries with relations
- Asynchronous operations

## Future Enhancements

- [ ] Task assignment to multiple users
- [ ] Task categories and tags
- [ ] Task priority levels
- [ ] File attachments
- [ ] Email notifications
- [ ] Task comments
- [ ] Activity history
- [ ] Search functionality
- [ ] Export tasks (CSV, PDF)
- [ ] Task templates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is [UNLICENSED](LICENSE).

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

---

**Note**: Remember to change the `JWT_SECRET` in production and use strong, unique passwords for your database.
