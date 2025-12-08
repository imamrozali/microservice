# Employee Monitor - Setup & Usage Guide

## 📋 Overview

Employee Monitor adalah aplikasi web khusus untuk admin HRD yang memungkinkan:
1. **Employee Management (CRUD)** - Kelola data karyawan (Create, Read, Update, Delete)
2. **Attendance Monitoring** - Monitor absensi karyawan (Read-Only)
3. **Real-time Notifications** - Notifikasi real-time ketika ada user yang login (WebSocket)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm (package manager)
- Docker & Docker Compose (untuk services)

### Installation

```bash
# 1. Install dependencies di root project
cd /Users/muhammadimamrozali/Documents/Personal/imamrozali-git/mir-microservice
npm install

# 2. Start infrastructure (PostgreSQL, RabbitMQ, dll)
docker-compose up -d

# 3. Run migrations untuk User Service
cd apps/user-service
npm run migrate
npm run seed

# 4. Run migrations untuk Auth Service
cd ../auth-service
npm run migrate

# 5. Run migrations untuk Attendance Service
cd ../attendance-service
npm run migrate
```

### Development

```bash
# Terminal 1: Start Auth Service (port 3001)
cd apps/auth-service
npm run dev

# Terminal 2: Start User Service (port 3002)
cd apps/user-service
npm run dev

# Terminal 3: Start Attendance Service (port 3003)
cd apps/attendance-service
npm run dev

# Terminal 4: Start Employee Monitor (port 5174)
cd apps/employee-monitor
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:5174**

## 🔐 Authentication

### Login Credentials

Gunakan akun admin untuk login:
- **Email**: `admin@dexa.com`
- **Password**: `admin123`

**Catatan Penting**: Hanya user dengan role **Administrator** (role_id = 1) yang bisa mengakses aplikasi ini.

### Role-based Access Control

Aplikasi ini memiliki 3 role:
1. **Administrator** (role_id = 1) - Full access ke Employee Monitor ✅
2. **Employee** (role_id = 2) - Tidak bisa akses ❌
3. **Manager** (role_id = 3) - Tidak bisa akses ❌

## 📱 Features

### 1. Dashboard
- Overview statistik karyawan
- Total karyawan, present hari ini, attendance rate
- Quick access ke menu lain

### 2. Employee Management

#### View Employees
- Menampilkan daftar semua karyawan
- Fitur search (nama, email, posisi)
- Informasi: nama, email, posisi, role, status

#### Add Employee
- Form tambah karyawan baru
- Field: Full Name, Email, Password, Position, Phone, Photo URL, Role
- Validasi form otomatis
- Password minimal 6 karakter

#### Edit Employee
- Update data karyawan existing
- Semua field bisa diupdate kecuali password
- Toggle status Active/Inactive
- Validasi form otomatis

#### Delete Employee
- Hapus karyawan dengan konfirmasi
- Data terhapus permanen dari database

### 3. Attendance Monitoring (Read-Only)

#### View Attendance
- Menampilkan semua absensi karyawan
- Kolom: Date, Employee, Check In, Check Out, Work Hours, Status
- Status: Present (hijau), Absent (merah), Incomplete (kuning)

#### Filters
- **Date Range**: Filter by start date & end date (default 7 hari terakhir)
- **Status**: Filter by Present, Absent, or Incomplete
- Apply filters untuk refresh data

#### Export
- Export data absensi ke CSV
- Include semua kolom dan filtered data
- Nama file: `attendance-report-{startDate}-{endDate}.csv`

### 4. WebSocket Notifications (Admin Only)

#### Login Notifications
- Real-time notification ketika ada user login
- Tampil di kanan atas layar
- Info: nama user, email, user ID, timestamp
- Auto-hide setelah 5 detik
- Support browser notifications

#### Connection Status
- Indikator WebSocket connection (hijau = connected, merah = disconnected)
- Auto-reconnect jika koneksi terputus

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: TanStack Router (type-safe routing)
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form
- **HTTP**: Axios (auto token injection)
- **WebSocket**: Socket.IO Client
- **Icons**: Lucide React

### Project Structure

```
apps/employee-monitor/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Main layout with navigation
│   │   ├── Navigation.tsx          # Top navigation bar
│   │   ├── WebSocketNotification.tsx  # Real-time notifications
│   │   └── index.ts
│   ├── hooks/
│   │   └── useWebSocket.ts         # WebSocket custom hook
│   ├── pages/
│   │   ├── AttendancePage.tsx      # Attendance monitoring (read-only)
│   │   ├── DashboardPage.tsx       # Dashboard overview
│   │   ├── EmployeeFormPage.tsx    # Add/Edit employee form
│   │   ├── EmployeesPage.tsx       # Employee list & CRUD
│   │   ├── LoginPage.tsx           # Login page
│   │   └── index.ts
│   ├── services/
│   │   ├── attendanceService.ts    # Attendance API client
│   │   ├── authService.ts          # Auth API client
│   │   ├── userService.ts          # User/Employee API client
│   │   ├── websocketService.ts     # WebSocket client
│   │   └── index.ts
│   ├── App.tsx                     # Root component
│   ├── router.tsx                  # Route configuration
│   ├── main.tsx                    # Entry point
│   ├── index.css                   # Global styles
│   └── env.d.ts                    # TypeScript env types
├── .env                            # Environment variables
├── .env.example                    # Env template
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### API Integration

#### Auth Service (port 3001)
- `POST /auth/login` - Login & get JWT tokens
- `POST /auth/logout` - Logout & invalidate refresh token
- `POST /auth/refresh` - Refresh access token
- `GET /auth/verify` - Verify token
- WebSocket namespace: `/auth` (for login notifications)

#### User Service (port 3002)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by I7
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Attendance Service (port 3003)
- `GET /attendance/summary` - Get attendance summary (with filters)
- `GET /attendance/events` - Get attendance events by user & date

### Security Features

#### JWT Authentication
- Access token (15 minutes expiry) di Authorization header
- Refresh token (7 days) di localStorage
- Auto logout on 401 response
- Token injection via Axios interceptor

#### Role-based Authorization
- Admin-only access (role_id = 1)
- Route guards di router.tsx
- Client-side & server-side validation

#### Environment Variables
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_USER_SERVICE_URL=http://localhost:3002
VITE_ATTENDANCE_SERVICE_URL=http://localhost:3003
VITE_EMPLOYEE_SERVICE_URL=http://localhost:3004
```

## 🔄 WebSocket Migration

WebSocket login notification sudah **dipindahkan dari attendance-client ke employee-monitor**:

### Changes:
1. ✅ `apps/attendance-client/src/App.tsx` - Removed `<WebSocketNotification />`
2. ✅ `apps/attendance-client/src/services/authService.ts` - Removed `isAdmin()` & `getUserRole()`
3. ✅ `apps/employee-monitor/` - Complete new app with WebSocket notifications

### Why?
- Attendance client untuk employee biasa (tidak perlu notif login)
- Employee Monitor untuk admin HRD (perlu monitoring siapa yang login)
- Separation of concerns

## 🧪 Testing

### Manual Testing Steps

1. **Login Test**
   ```bash
   # Akses http://localhost:5174/login
   # Login dengan: admin@dexa.com / admin123
   # Verify: redirect ke dashboard, ada WebSocket status (green)
   ```

2. **Employee CRUD Test**
   ```bash
   # Click "Employees" menu
   # Test Search: ketik nama/email
   # Click "Add Employee" → isi form → submit
   # Click "Edit" → ubah data → submit
   # Click "Delete" → confirm → data terhapus
   ```

3. **Attendance Monitoring Test**
   ```bash
   # Click "Attendance" menu
   # Change date range filter
   # Change status filter
   # Click "Export CSV" → file terdownload
   ```

4. **WebSocket Test**
   ```bash
   # Buka 2 browser windows:
   # Window 1: Employee Monitor (logged in as admin)
   # Window 2: Login page (any user)
   # Login di window 2 → notif muncul di window 1 (kanan atas)
   ```

## 📝 API Examples

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dexa.com",
    "password": "admin123"
  }'
```

### Get All Employees
```bash
curl -X GET http://localhost:3002/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Employee
```bash
curl -X POST http://localhost:3002/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemployee@dexa.com",
    "password": "password123",
    "full_name": "New Employee",
    "job_position": "Software Engineer",
    "phone_number": "081234567890",
    "role_id": 2
  }'
```

### Get Attendance Summary
```bash
curl -X GET "http://localhost:3003/attendance/summary?startDate=2025-12-01&endDate=2025-12-08" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🐛 Troubleshooting

### Issue: "Unauthorized" error
**Solution**: Pastikan login sebagai admin (admin@dexa.com)

### Issue: WebSocket tidak connect
**Solution**: 
- Check Auth Service running di port 3001
- Check browser console untuk error messages
- Verify VITE_AUTH_SERVICE_URL di .env

### Issue: Data tidak muncul
**Solution**:
- Check backend services running (Auth, User, Attendance)
- Check migrations & seeds sudah dijalankan
- Check network tab untuk API errors

### Issue: CORS error
**Solution**: Pastikan backend services sudah enable CORS untuk http://localhost:5174

## 🚢 Production Deployment

### Build
```bash
cd apps/employee-monitor
npm run build
# Output: dist/ folder
```

### Environment Variables (Production)
```env
VITE_AUTH_SERVICE_URL=https://api.yourdomain.com/auth
VITE_USER_SERVICE_URL=https://api.yourdomain.com/users
VITE_ATTENDANCE_SERVICE_URL=https://api.yourdomain.com/attendance
VITE_EMPLOYEE_SERVICE_URL=https://api.yourdomain.com/employees
```

### Serve
```bash
# Preview production build
npm run preview

# Or deploy dist/ to static hosting (Vercel, Netlify, S3, dll)
```

## 📊 Performance Optimization

- ✅ Code splitting via dynamic imports
- ✅ Lazy loading routes
- ✅ Optimized images (avatar fallback)
- ✅ Debounced search
- ✅ Auto cleanup WebSocket on unmount
- ✅ React.StrictMode for development

## 🔮 Future Enhancements

1. **Dashboard dengan real data** - Fetch actual stats dari API
2. **Employee profile page** - Detail view dengan attendance history
3. **Advanced filters** - Filter by role, status, department
4. **Pagination** - Handle large datasets
5. **Dark mode** - Theme switcher
6. **Attendance analytics** - Charts & graphs
8. **Push notifications** - Desktop notifications via Service Worker

## 📞 Support

Untuk pertanyaan atau issue:
1. Check dokumentasi ini
2. Check backend service logs
3. Check browser console
4. Check Network tab untuk API calls

---

**Version**: 1.0.0  
**Last Updated**: December 8, 2025  
**Author**: MIR Microservice Team
