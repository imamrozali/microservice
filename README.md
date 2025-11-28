# Employee Management System - Turborepo

## 🎯 Overview

Sistem manajemen karyawan berbasis microservices yang dibangun dengan:

- **Turborepo** - Monorepo management
- **NestJS** - Backend framework
- **Kysely** - Type-safe SQL query builder
- **PostgreSQL** - Database
- **Swagger** - API documentation

## 👨‍💻 Author

**Muhammad Imam Rozali**  
Senior Software Engineer & Microservices System Architect

## 📁 Project Structure

```
microservice/
├── apps/
│   ├── auth-service/          # Authentication & User Management (Port 3001)
│   ├── employee-service/      # Employee Profile Management (Port 3002)
│   └── attendance-service/    # Attendance Tracking (Port 3003)
├── packages/
│   └── database/             # Shared Kysely Database Package
│       ├── src/
│       │   ├── setup/
│       │   │   ├── db-main/         # Main database migrations
│       │   │   ├── db-logs/         # Logs database migrations
│       │   │   ├── database-config/ # Database configuration
│       │   │   └── seeder/          # Database seeders
│       │   ├── database.ts
│       │   ├── types.ts
│       │   ├── config.ts
│       │   ├── migrations.ts
│       │   ├── migrate.ts
│       │   └── seed.ts
│       └── package.json
├── package.json
├── turbo.json
├── .env.example
└── README.md
```

## 🗄️ Database Schema

### DB-Main Schema

- **roles** - User roles (ADMIN, HR, MANAGER, EMPLOYEE, INTERN)
- **users** - User accounts with authentication
- **employee_profiles** - Employee detailed information
- **attendance_events** - Check-in/out events
- **attendance_summary** - View for daily attendance summary

### DB-Logs Schema

- **audit_logs** - System audit logs and activity tracking

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Update database credentials in .env
DB_MAIN_HOST=localhost
DB_MAIN_PORT=5432
DB_MAIN_USER=postgres
DB_MAIN_PASSWORD=your_password
DB_MAIN_NAME=employee_management

DB_LOGS_HOST=localhost
DB_LOGS_PORT=5432
DB_LOGS_USER=postgres
DB_LOGS_PASSWORD=your_password
DB_LOGS_NAME=employee_logs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Create PostgreSQL databases
createdb employee_management
createdb employee_logs

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Development

```bash
# Start all services in development mode
npm run dev

# Or start individual services
cd apps/auth-service && npm run start:dev
cd apps/employee-service && npm run start:dev
cd apps/attendance-service && npm run start:dev
```

## 📊 Services & APIs

### Auth Service (Port 3001)

- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
- **GET** `/api/users/:id` - Get user details
- **Docs**: http://localhost:3001/api/docs

### Employee Service (Port 3002)

- **GET** `/api/employees` - List employees
- **POST** `/api/employees` - Create employee profile
- **PUT** `/api/employees/:id` - Update employee profile
- **GET** `/api/employees/:id` - Get employee details
- **Docs**: http://localhost:3002/api/docs

### Attendance Service (Port 3003)

- **POST** `/api/attendance/check-in` - Check in
- **POST** `/api/attendance/check-out` - Check out
- **GET** `/api/attendance/summary` - Get attendance summary
- **GET** `/api/attendance/events` - Get attendance events
- **Docs**: http://localhost:3003/api/docs

## 📝 Example Queries

### 1. Authentication

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "employee@company.com", "password": "employee123"}'
```

### 2. Employee Profile

```bash
# Create profile (requires auth token)
curl -X POST http://localhost:3002/api/employees \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "<user_id>",
    "fullName": "John Doe",
    "position": "Engineer",
    "phoneNumber": "081234567890",
    "employeeNumber": "EMP002"
  }'
```

### 3. Attendance

```bash
# Check in
curl -X POST http://localhost:3003/api/attendance/check-in \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"latitude": -6.2088, "longitude": 106.8456}'
```

## 🛠️ Development Commands

```bash
# Build all packages
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Clean build artifacts
npm run clean

# Database operations
npm run db:migrate  # Run migrations
npm run db:seed     # Seed data
```

## 📦 Package Scripts

### Root Level

- `npm run dev` - Start all services in watch mode
- `npm run build` - Build all packages
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database

### Database Package

- `npm run build` - Compile TypeScript
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Run seeders

## 🔒 Authentication

All services use JWT authentication with Bearer tokens. Get token from auth service login endpoint and include in requests:

```
Authorization: Bearer <your_jwt_token>
```

## 🏗️ System Architecture

### Microservices Architecture

Sistem ini menerapkan arsitektur microservices dengan pemisahan tanggung jawab yang jelas:

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                          │
│                  (Future Addition)                     │
└─────────────────────────────────────────────────────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │ Auth Service│  │Employee Srvc│  │Attendance   │
    │   :3001     │  │    :3002    │  │Service :3003│
    └─────────────┘  └─────────────┘  └─────────────┘
               │              │              │
               └──────────────┼──────────────┘
                              │
                    ┌─────────────┐
                    │  Database   │
                    │  Package    │
                    └─────────────┘
                              │
                    ┌─────────────┐
                    │ PostgreSQL  │
                    │  Cluster    │
                    └─────────────┘
```

### Architecture Principles

#### 1. **Separation of Concerns**

- **Auth Service**: Menangani autentikasi, autorisasi, dan manajemen user
- **Employee Service**: Mengelola profil karyawan dan data personal
- **Attendance Service**: Melacak kehadiran dan aktivitas check-in/out

#### 2. **Shared Infrastructure**

- **Database Package**: Shared library untuk database operations
- **Type Definitions**: Konsistensi tipe data across services
- **Migration System**: Centralized database schema management

#### 3. **Technology Stack**

- **Turborepo**: Monorepo management dengan caching dan parallelization
- **NestJS**: Enterprise-grade Node.js framework dengan dependency injection
- **Kysely**: Type-safe SQL query builder untuk compile-time safety
- **PostgreSQL**: Robust relational database dengan ACID compliance
- **JWT**: Stateless authentication dengan Bearer token

#### 4. **Database Design**

- **Multi-Database Approach**: Pemisahan data operasional dan audit logs
- **db-main**: Core business data (users, employees, attendance)
- **db-logs**: Audit trails dan system logs
- **Migration-First**: Schema changes melalui version-controlled migrations

#### 5. **Development Workflow**

- **Hot Reload**: Development mode dengan automatic restart
- **Type Safety**: Full TypeScript coverage untuk compile-time error detection
- **API Documentation**: Auto-generated Swagger docs untuk setiap service
- **Seeded Data**: Consistent test data untuk development environment

#### 6. **Security Architecture**

- **JWT Authentication**: Stateless token-based authentication
- **Role-Based Access Control**: Granular permissions (ADMIN, HR, MANAGER, EMPLOYEE, INTERN)
- **Request Validation**: DTO-based input validation
- **Audit Logging**: Comprehensive activity tracking

### Technical Features

- **Shared Database Package**: Reusable Kysely setup across all services
- **Type Safety**: Full TypeScript types for database operations
- **Migration System**: Organized migrations per database
- **Seeder System**: Automated data seeding
- **Swagger Docs**: Auto-generated API documentation
- **Modular Services**: Independent NestJS applications
- **Service Discovery**: Ready for containerization and orchestration

## 📈 Next Steps

1. Add API Gateway (e.g., Nginx, Traefik)
2. Implement Redis for caching
3. Add Docker containers
4. Set up CI/CD pipeline
5. Add monitoring (Prometheus, Grafana)
6. Implement rate limiting
7. Add file upload for employee photos
