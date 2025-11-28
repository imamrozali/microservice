# Attendance Client

React frontend application for the Employee Attendance System built with Vite and TanStack Router.

## Features

- **Authentication**: Login/logout with JWT token management
- **Route Protection**: Automatic redirects based on authentication status
- **Responsive UI**: Built with Tailwind CSS
- **Form Validation**: React Hook Form with validation rules
- **Modern Routing**: TanStack Router with type-safe navigation

## Tech Stack

- **React 19** - Frontend library
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe routing
- **React Hook Form** - Form handling and validation
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Axios** - HTTP client with interceptors

## Routes

- `/` - Root route (redirects based on auth status)
- `/login` - Login page (redirects to /home if authenticated)
- `/home` - Protected dashboard (requires authentication)
- `/notfound` - 404 page (for authenticated users)

## Authentication Flow

1. **Login Page**: Email/password form with validation
   - Email: Required + valid email format
   - Password: Required + minimum 6 characters
2. **Token Management**: JWT token stored in localStorage
   - Automatic logout when token is removed
   - Token included in API requests

3. **Route Protection**:
   - Unauthenticated users → redirected to `/login`
   - Authenticated users accessing `/login` → redirected to `/home`
   - Invalid routes for authenticated users → redirected to `/notfound`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

The application reads environment variables from the root project's `.env` file located at `../../.env`.

The API base URL is configured via:

```bash
# In root .env file
VITE_API_BASE_URL=http://localhost:3001/api
```

Vite is configured to automatically load environment variables from the root directory, so no additional configuration is needed in the client.

## API Integration

The client is configured to integrate with the auth service running on `http://localhost:3001/api`.

Login endpoint: `POST /api/auth/login`

```json
{
  "email": "employee@company.com",
  "password": "employee123"
}
```

Expected response:

```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "employee@company.com",
    "name": "Employee Name"
  }
}
```

## Project Structure

```
src/
├── components/
│   └── Root.tsx           # Root component with layout
├── pages/
│   ├── LoginPage.tsx      # Login form with validation
│   ├── HomePage.tsx       # Protected dashboard
│   └── NotFoundPage.tsx   # 404 error page
├── services/
│   ├── index.ts           # Service exports
│   ├── authService.ts     # Authentication service with axios
│   ├── employeeService.ts # Employee management API
│   └── attendanceService.ts # Attendance tracking API
├── router.tsx             # Route definitions
├── App.tsx               # Main app component
└── main.tsx              # App entry point
```

## API Services

The application uses axios for HTTP requests with automatic token management:

### AuthService

- Handles login/logout
- Automatic token injection
- Axios instance configuration
- Response interceptors for 401 handling

### EmployeeService

- Employee CRUD operations
- Shared axios instance with auth

### AttendanceService

- Check-in/check-out functionality
- Attendance history and summaries
- Location-based tracking support

All services use the same axios instance with automatic authentication headers.
