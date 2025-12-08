# Employee Monitor - HRD Admin Portal

Employee monitoring application for HRD administrators to manage employee data and monitor attendance.

## Features

### 1. Employee Management (CRUD)
- ✅ View all employees with search and filter
- ✅ Add new employee
- ✅ Update employee information
- ✅ Delete employee
- ✅ Employee details view

### 2. Attendance Monitoring (Read-Only)
- ✅ View all employee attendance submissions
- ✅ Filter by date range, employee, status
- ✅ Export attendance reports
- ✅ Real-time attendance updates

### 3. WebSocket Notifications
- ✅ Real-time user login notifications
- ✅ Real-time attendance submissions
- ✅ Only visible to admin role (role_id = 1)

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client
- **Forms**: React Hook Form
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Access the app at: http://localhost:5174

## Login Credentials

For testing, use admin credentials:
- Email: admin@dexa.com
- Password: admin123

## Environment Variables

```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_USER_SERVICE_URL=http://localhost:3002
VITE_ATTENDANCE_SERVICE_URL=http://localhost:3003
VITE_EMPLOYEE_SERVICE_URL=http://localhost:3004
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API service clients
├── hooks/           # Custom React hooks
├── router.tsx       # Route configuration
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```
