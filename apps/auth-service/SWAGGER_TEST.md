# Auth Service - Swagger API Testing Guide

## Access Swagger UI
Open in browser: http://localhost:3001/api/docs

---

## Test Credentials

### Available Users:
1. **Employee Account**
   - Email: `employee@dexa.com`
   - Password: `employee123`
   - Role: Employee

2. **Manager Account**
   - Email: `manager@dexa.com`
   - Password: `manager123`
   - Role: Manager

3. **Admin Account**
   - Email: `admin@dexa.com`
   - Password: `admin123`
   - Role: Administrator

---

## Testing Flow

### 1. Login (POST /api/auth/login)
**No authentication required**

**Request Body:**
```json
{
  "email": "employee@dexa.com",
  "password": "employee123"
}
```

**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "employee@dexa.com",
    "full_name": "John Doe",
    "role_id": "uuid"
  }
}
```

**⚠️ Important:**
- Copy **`access_token`** untuk Authorize (digunakan di protected endpoints)
- Simpan **`refresh_token`** untuk refresh token nanti (ketika access_token expired)

---

### 2. Authorize in Swagger

1. Click the **"Authorize"** button (🔒 icon) at the top right
2. In the "Value" field, paste your **`access_token`** (BUKAN refresh_token!)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyM2U3N...
   ```
3. Click **"Authorize"**
4. Click **"Close"**

Now all protected endpoints will use this token automatically!

**Token Usage:**
- ✅ `access_token` → Authorize button & protected endpoints
- ✅ `refresh_token` → Endpoint `/api/auth/refresh` & `/api/auth/logout`

---

### 3. Get Profile (GET /api/auth/me)
**Requires authentication** 🔒

**No request body needed**

**Expected Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "employee@dexa.com",
  "full_name": "John Doe",
  "job_position": "Software Engineer",
  "role_id": "uuid",
  "is_active": true
}
```

---

### 4. Verify Token (GET /api/auth/verify)
**Requires authentication** 🔒

**No request body needed**

**Expected Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "employee@dexa.com",
    "full_name": "John Doe",
    "role_id": "uuid"
  }
}
```

---

### 5. Refresh Token (POST /api/auth/refresh)
**No authentication required**

Use this when `access_token` expires (after 15 minutes)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (200 OK):**
```json
{
  "access_token": "new_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "new_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

---

### 6. Logout (POST /api/auth/logout)
**Requires authentication** 🔒

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Expected Error Responses

### 401 Unauthorized
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 401 Invalid Token
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## Quick Test Sequence

1. **Start Services:**
   ```bash
   # Terminal 1 - User Service
   cd apps/user-service
   npm run dev
   
   # Terminal 2 - Auth Service
   cd apps/auth-service
   npm run dev
   ```

2. **Open Swagger:** http://localhost:3001/api/docs

3. **Test Login:**
   - Expand `POST /api/auth/login`
   - Click "Try it out"
   - Use credentials: `employee@dexa.com` / `employee123`
   - Click "Execute"
   - Copy `access_token` from response

4. **Authorize:**
   - Click 🔒 "Authorize" button
   - Paste `access_token`
   - Click "Authorize" then "Close"

5. **Test Protected Endpoints:**
   - Try `GET /api/auth/me`
   - Try `GET /api/auth/verify`

6. **Test Logout:**
   - Use `POST /api/auth/logout`
   - Paste `refresh_token` from login response

---

## Token Lifetimes

- **Access Token:** 15 minutes (900 seconds)
- **Refresh Token:** 7 days (604800 seconds)

---

## Refresh Token Flow & Database

### How Refresh Token Works:

**1. Login → Store Refresh Token:**
```sql
-- Saat login berhasil, refresh_token disimpan ke table refresh_tokens
INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info)
VALUES ('user-uuid', 'hashed-token', '2025-12-15', 'web');
```

**2. Token Properties:**
- `access_token` → Untuk akses API (short-lived: 15 menit)
- `refresh_token` → Untuk mendapatkan access_token baru (long-lived: 7 hari)
- Token disimpan dalam bentuk **hash** (bcrypt) di database untuk keamanan

**3. Refresh Token Endpoint:**
Ketika `access_token` expired (setelah 15 menit), gunakan `refresh_token`:
```bash
POST /api/auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**4. Logout → Delete Refresh Token:**
```sql
-- Saat logout, refresh_token dihapus dari database
DELETE FROM refresh_tokens 
WHERE user_id = 'user-uuid' AND token_hash = 'hashed-token';
```

### Refresh Tokens Table Structure:
```sql
refresh_tokens:
- id (uuid)
- user_id (uuid) → foreign key ke users
- token_hash (string) → hashed refresh token
- device_info (string) → 'web', 'mobile', etc
- expires_at (timestamp) → 7 days from created
- created_at (timestamp)
```

### Security Features:
1. ✅ Refresh token di-hash sebelum disimpan (tidak plain text)
2. ✅ Setiap refresh akan delete old token & create new token
3. ✅ Logout akan delete token dari database
4. ✅ Auto cleanup expired tokens
5. ✅ One token per device/session

---

## Headers Documentation

### Standard Headers (All Endpoints):
```http
Content-Type: application/json
Accept: application/json
```

### Protected Endpoints Headers:
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Available Headers in Swagger:

**1. Content-Type**
- Value: `application/json`
- Required: Yes (for POST/PUT requests)
- Description: Indicates request body format

**2. Accept**
- Value: `application/json`
- Required: No
- Description: Expected response format

**3. Authorization**
- Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Required: Yes (for protected endpoints)
- Description: JWT access token untuk authentication
- **Note**: Swagger automatically adds "Bearer " prefix

**4. X-API-Key** (Optional)
- Value: `your-api-key`
- Required: No
- Description: API Key untuk service-to-service communication

### How Headers Work in Swagger:

1. **Login Endpoint** (No Auth Required):
   ```
   Content-Type: application/json
   ```

2. **Protected Endpoints** (Auth Required):
   ```
   Authorization: Bearer {access_token}
   Content-Type: application/json
   ```

3. **Using Authorize Button**:
   - Click 🔒 Authorize
   - Paste only the token (without "Bearer")
   - Swagger will automatically add "Bearer " prefix
   - All protected endpoints will use this token

### CURL Example with Headers:

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"employee@dexa.com","password":"employee123"}'
```

**Get Profile (Protected):**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Accept: application/json"
```

---

## Notes

- All timestamps are in ISO 8601 format
- Tokens are JWT (JSON Web Tokens)
- Protected endpoints require Bearer token in Authorization header
- Swagger automatically adds "Bearer " prefix to your token
- Make sure both User Service (3002) and Auth Service (3001) are running
- **Access token** untuk API calls, **refresh token** untuk get new access token
- Headers sudah terdokumentasi di setiap endpoint Swagger

---

## Troubleshooting

### "Invalid credentials" error:
- Check email/password are correct
- Verify User Service is running on port 3002
- Check database has seeded users (run `npm run seed`)

### "Unauthorized" on protected endpoints:
- Make sure you clicked "Authorize" button
- Check token hasn't expired (15 min limit)
- Use refresh token to get new access token

### "Internal server error":
- Check User Service is running
- Verify database connection
- Check console logs for details
