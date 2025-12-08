# Employee Management System - Turborepo

A modern microservices architecture built with Turborepo, NestJS, and React.

## 🎯 Overview

This monorepo contains a complete microservices ecosystem with:
- **Auth Service**: User authentication and authorization with roles management
- **User Service**: User profile management with MinIO photo storage
- **Attendance Service**: Employee attendance tracking and management
- **Notification Service**: Real-time notifications and audit logging with RabbitMQ
- **Employee Service**: Employee management service
- **Attendance Client**: Employee-facing React application with WebSocket support
- **Employee Monitor Client**: Admin-facing React application for employee management

## 🏗️ Architecture

The project uses a modern microservices architecture with:
- **Turborepo**: Monorepo management and build orchestration
- **NestJS**: Backend microservices framework
- **React + Vite**: Frontend applications (2 clients)
- **PostgreSQL**: Primary database (2 instances: main and logs)
- **RabbitMQ**: Message queue for inter-service communication and audit logging
- **MinIO**: S3-compatible object storage for profile pictures with presigned URLs
- **WebSocket**: Real-time communication for notifications
- **TypeScript**: Full type safety across the stack

### Key Features

#### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Token refresh mechanism
- Password encryption with bcrypt

#### 👤 User Management
- Complete CRUD operations for users
- Profile picture upload to MinIO
- Presigned URLs for secure photo access
- Password update functionality
- Soft delete support

#### 📸 Photo Upload System
- MinIO S3-compatible object storage
- Automatic file validation (type, size)
- Presigned URL generation for secure access
- Automatic cleanup of old photos on update
- Support for JPEG/PNG up to 2MB

#### 📊 Audit Logging with RabbitMQ
- Automatic audit trail for all user operations
- Event-driven architecture using RabbitMQ
- Separate logs database for data integrity
- Tracks: user creation, updates, profile changes, photo uploads
- Stores old/new data, IP address, user agent

#### 🎨 Modern UI Design
- Gradient backgrounds (blue→indigo→purple)
- Clean white card-based layouts
- Password visibility toggle with eye icons
- Responsive design with Tailwind CSS
- Consistent design system across all pages
- Smooth animations and transitions

### Database Architecture

The system uses two PostgreSQL databases:
1. **postgres-main** (port 5433): Main application data (users, roles, notifications, attendance)
2. **postgres-logs** (port 5434): Audit logs and event tracking

## ✅ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: >= 18.x
- **npm**: >= 10.8.2
- **Docker**: Latest version
- **Docker Compose**: Latest version

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mir-microservice
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Main
DB_MAIN_HOST=localhost
DB_MAIN_PORT=5433
DB_MAIN_NAME=employee_management
DB_MAIN_USER=dexa
DB_MAIN_PASSWORD=password
DB_MAIN_SSL=false

# Database Logs
DB_LOGS_HOST=localhost
DB_LOGS_PORT=5434
DB_LOGS_NAME=employee_logs
DB_LOGS_USER=dexa
DB_LOGS_PASSWORD=password
DB_LOGS_SSL=false

# RabbitMQ
MQ_URL=amqp://admin:password@localhost:5672

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_BUCKET_NAME=employee-photos

# Service Ports
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
ATTENDANCE_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
EMPLOYEE_SERVICE_PORT=3005

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d
```

### 4. Start Docker Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL Main (port 5433) - Main application database
- PostgreSQL Logs (port 5434) - Audit logs database
- RabbitMQ (ports 5672, 15672) - Message queue & management UI
- MinIO (ports 9000, 9001) - Object storage & console

### 5. Build All Packages

```bash
npm run build
```

### 6. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary database tables and schemas across both databases.

### 7. Seed Initial Data

```bash
npm run seed
```

This will populate the database with:
- **Roles**: 
  - Administrator (full system access)
  - Employee (basic attendance access)
  - Manager (team management access)
- **Users**: 
  - admin@dexa.com / admin123 (Administrator)
  - employee@dexa.com / employee123 (Employee)
  - manager@dexa.com / manager123 (Manager)

### 8. Start Development Servers

```bash
npm run dev
```

This will start all services in development mode:
- Auth Service: `http://localhost:3001`
- User Service: `http://localhost:3002`
- Attendance Service: `http://localhost:3003`
- Notification Service: `http://localhost:3004`
- Employee Service: `http://localhost:3005`
- Attendance Client: `http://localhost:5173` (Employee-facing)
- Employee Monitor Client: `http://localhost:5174` (Admin-facing)

### 9. Access Services

**Web Applications:**
- **Attendance Client**: http://localhost:5173
  - For employees to check in/out and view attendance
  - Login with: employee@dexa.com / employee123
- **Employee Monitor Client**: http://localhost:5174
  - For admins to manage employees
  - Login with: admin@dexa.com / admin123
- **RabbitMQ Management**: http://localhost:15672 (admin/password)
- **MinIO Console**: http://localhost:9001 (admin/password123)

**API Endpoints:**
- Auth Service: http://localhost:3001/api
- User Service: http://localhost:3002/api
- Attendance Service: http://localhost:3003/api
- Notification Service: http://localhost:3004/api
- Employee Service: http://localhost:3005/api

## 📁 Project Structure

```
mir-microservice/
├── apps/
│   ├── attendance-client/      # Employee attendance React app
│   ├── employee-monitor-client/ # Admin employee management React app
│   ├── attendance-service/     # Attendance tracking service
│   ├── auth-service/           # Authentication & authorization
│   ├── employee-service/       # Employee management service
│   ├── notification-service/   # Notifications & audit logs with RabbitMQ
│   └── user-service/           # User management with MinIO storage
├── packages/
│   ├── api/                    # Shared API utilities
│   ├── database/               # Database connection & migrations
│   ├── environment/            # Environment configuration
│   ├── eslint-config/          # Shared ESLint configs
│   ├── jest-config/            # Shared Jest configs
│   ├── mq/                     # RabbitMQ wrapper for audit logs
│   ├── tailwind-config/        # Shared Tailwind CSS config
│   ├── typescript-config/      # Shared TypeScript configs
│   └── ui/                     # Shared UI components (Button, Input, Card, Alert)
├── docker-compose.yml          # Docker services (PostgreSQL, RabbitMQ, MinIO)
├── turbo.json                  # Turborepo configuration
└── package.json                # Root package.json with workspace scripts
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run build` | Build all packages and applications |
| `npm run test` | Run all tests across the monorepo |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint all code |
| `npm run format` | Format code with Prettier |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with initial data |

## 🚀 Key Features Explained

### Photo Upload System

The system uses MinIO for profile picture storage with a secure presigned URL approach:

1. **Upload Flow**:
   ```
   User uploads photo → User Service validates (JPEG/PNG, max 2MB)
   → Upload to MinIO bucket → Store filename in database
   → Generate presigned URL (7 days expiry) → Return to client
   ```

2. **Retrieval Flow**:
   ```
   GET /api/users → User Service fetches users
   → For each user with profile_picture → Generate presigned URL from MinIO
   → Return users with photoUrl field
   ```

3. **Security**:
   - Files stored with UUID-based filenames
   - Presigned URLs expire after 7 days
   - Automatic old file cleanup on photo update
   - File type and size validation

### Audit Logging with RabbitMQ

All user operations are automatically logged to a separate database:

1. **Event Publishing** (User Service):
   ```typescript
   // After user creation/update
   await this.rabbitMQService.publish('audit.logs', {
     user_id: userId,
     entity_type: 'users',
     action_type: 'create',
     new_data: userData,
     ip_address: req.ip,
     user_agent: req.headers['user-agent']
   });
   ```

2. **Event Consumption** (Notification Service):
   ```typescript
   // Listen to audit.logs queue
   async handleAuditLog(data: AuditLogDto) {
     await db('audit_logs').insert({
       ...data,
       created_at: new Date()
     });
   }
   ```

3. **Benefits**:
   - Decoupled logging (doesn't slow down main operations)
   - Separate database prevents log tampering
   - Complete audit trail for compliance
   - Asynchronous processing

### UI Component Library (@repo/ui)

Shared component library built with React and Tailwind CSS:

```typescript
// Button Component
<Button 
  variant="primary" // primary, secondary, danger, outline, ghost
  size="lg"         // sm, md, lg
  loading={true}    // Shows spinner
  icon={<SaveIcon />}
>
  Save Changes
</Button>

// Input Component with Password Toggle
<Input
  label="Password *"
  type="password"
  showPasswordToggle // Adds eye icon to toggle visibility
  error="Password is required"
  {...register('password')}
/>

// Card Component
<Card title="User Profile" className="max-w-3xl">
  <p>Card content here</p>
</Card>

// Alert Component
<Alert variant="error" title="Error">
  Something went wrong!
</Alert>
```

**Building the UI Package**:
```bash
cd packages/ui
npm run build    # Build styles and components
npm run dev      # Watch mode for development
```

## 💻 Development

### Working with Microservices

Each microservice can be developed independently:

```bash
# Work on a specific service
cd apps/auth-service
npm run dev

# Run tests for a specific service
npm run test

# Generate new migration
npm run migration:generate -- -n <migration-name>
```

### Working with Frontend

```bash
cd apps/attendance-client
npm run dev
```

### Adding New Packages

To add a dependency to a specific workspace:

```bash
npm install <package-name> -w apps/<service-name>
```

## 🧪 Testing

Run all tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test -- --coverage
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## 🚢 Deployment

### Building for Production

```bash
npm run build
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

## 📊 Database ERD (Entity Relationship Diagram)

### Main Database (employee_management)

```mermaid
erDiagram
    ROLES ||--o{ USERS : has
    USERS ||--o{ ATTENDANCE : records
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REFRESH_TOKENS : has
    
    ROLES {
        uuid id PK
        varchar role_name UK "Unique constraint"
        text description
        json permissions
        boolean is_active "Default: true"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "Soft delete"
    }
    
    USERS {
        uuid id PK
        varchar email UK "Unique constraint"
        varchar password "Hashed with bcrypt"
        varchar full_name
        varchar job_position
        varchar phone_number
        text photo_url "Deprecated field"
        varchar profile_picture "MinIO filename"
        uuid role_id FK
        boolean is_active "Default: true"
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "Soft delete"
    }
    
    ATTENDANCE {
        uuid id PK
        uuid user_id FK
        date attendance_date
        time check_in_time
        time check_out_time
        enum status "MASUK/PULANG/INCOMPLETE"
        varchar notes
        varchar ip_address
        decimal latitude "10,8 precision"
        decimal longitude "11,8 precision"
        timestamptz created_at
        timestamptz updated_at
        unique user_id_attendance_date "Unique constraint"
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        varchar notification_type
        varchar title
        text message
        json metadata
        boolean is_read "Default: false"
        timestamptz read_at
        timestamptz created_at
    }
    
    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token UK "Unique constraint"
        varchar user_agent
        varchar ip_address
        timestamptz expires_at
        timestamptz created_at
    }
```

### Logs Database (employee_logs)

```mermaid
erDiagram
    AUDIT_LOGS {
        uuid id PK
        uuid user_id "User who performed action"
        varchar entity_type "users, roles, etc"
        varchar action_type "create, update, delete, profile_update, photo_upload"
        json old_data "Previous state"
        json new_data "New state"
        varchar ip_address "Client IP"
        text user_agent "Client browser/device"
        timestamptz created_at
    }
```

### RabbitMQ Event Flow

```
User Action (Create/Update/Delete) 
    ↓
User Service
    ↓
Publish to RabbitMQ (audit.logs exchange)
    ↓
Notification Service (Consumer)
    ↓
Store in audit_logs table (postgres-logs)
```

Event Types:
- `user.created` - New user registration
- `user.updated` - Profile information updated
- `user.deleted` - User soft deleted
- `user.profile_updated` - Profile photo uploaded
- `user.password_updated` - Password changed

## 🛠️ Tech Stack

### Backend
- **NestJS**: Microservices framework
- **TypeScript**: Type-safe development
- **PostgreSQL**: Relational database (2 instances: main + logs)
- **RabbitMQ**: Message broker for audit logging
- **MinIO**: S3-compatible object storage with presigned URLs
- **WebSocket**: Real-time communication
- **Knex.js**: Query builder & migrations
- **Bcrypt**: Password hashing
- **JWT**: Token-based authentication
- **Multer**: File upload handling
- **Jest**: Testing framework

### Frontend
- **React 19**: UI library
- **Vite**: Build tool & dev server
- **TailwindCSS v4**: Utility-first CSS
- **React Hook Form**: Form validation
- **TanStack Router**: Type-safe routing
- **Axios**: HTTP client
- **Socket.IO Client**: WebSocket client for real-time updates
- **Lucide React**: Modern icon library
- **TypeScript**: Full type safety

### Infrastructure
- **Docker & Docker Compose**: Containerization
- **MinIO**: Object storage (profile pictures)
- **RabbitMQ**: Event-driven audit logging
- **PostgreSQL**: Dual database setup (main + logs)
- **Turborepo**: Monorepo build orchestration
- **ESLint & Prettier**: Code quality & formatting

## 📝 License

UNLICENSED

## 👥 Contributors

- Muhammad Imam Rozali

---

For more information or issues, please create an issue in the repository.