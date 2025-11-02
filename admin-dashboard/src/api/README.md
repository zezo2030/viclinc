# API Layer Documentation

## Overview
This directory contains all API services for communicating with the backend. All services use Axios with TypeScript for type safety.

## Structure

```
api/
├── client.ts          # Axios instance with interceptors
├── auth.ts           # Authentication APIs
├── users.ts          # User management
├── doctors.ts        # Doctor management
├── departments.ts    # Department management
├── appointments.ts   # Appointment management
├── payments.ts       # Payment APIs
├── metrics.ts        # Dashboard metrics
├── reports.ts        # Report generation
└── index.ts          # Barrel export
```

## Usage

### Import APIs
```typescript
import { authApi, usersApi, doctorsApi } from '@/api'
```

### Example: Login
```typescript
const { access_token, user } = await authApi.login({
  email: 'admin@example.com',
  password: 'password123'
})

localStorage.setItem('access_token', access_token)
```

### Example: Fetch Users with Pagination
```typescript
const response = await usersApi.getAll({
  page: 1,
  limit: 10,
  search: 'john',
  sort: 'createdAt',
  order: 'desc'
})

console.log(response.data) // User[]
console.log(response.meta) // { total, page, limit, totalPages }
```

### Example: Create Department with Logo
```typescript
const department = await departmentsApi.create({
  name: 'Cardiology',
  description: 'Heart specialists',
  logo: fileInput.files[0] // File object
})
```

## Features

### 🔐 Auto Authentication
- Bearer token automatically added to all requests
- Auto logout on 401 errors
- Language header (Accept-Language) included

### 🌍 Internationalization
- Supports Arabic and English
- Language preference from localStorage

### 📁 File Upload Support
- Departments API supports logo upload
- Automatic FormData handling
- Content-Type: multipart/form-data

### 🛡️ Error Handling
- Centralized error handling in interceptor
- Status code specific messages
- Network error detection

### 📊 Type Safety
- Full TypeScript support
- Type inference for responses
- Compile-time validation

## API Client Configuration

```typescript
// Base URL
const API_URL = 'http://localhost:3000/v1'

// Timeout
const TIMEOUT = 30000 // 30 seconds

// Default Headers
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {token}',
  'Accept-Language': 'ar' | 'en'
}
```

## Available APIs

### authApi
- `login(email, password)` - User login
- `registerPatient(data)` - Register new patient
- `logout()` - Clear tokens
- `getCurrentUser()` - Get current user info

### usersApi
- `getAll(params)` - List users with pagination
- `getById(id)` - Get single user
- `create(data)` - Create new user
- `updateRole(id, role)` - Update user role
- `updateStatus(id, status)` - Update user status
- `delete(id)` - Delete user

### doctorsApi
- `getAll(params)` - List doctors
- `getById(id)` - Get doctor details
- `create(data)` - Create doctor
- `update(id, data)` - Update doctor
- `updateStatus(id, status)` - Update doctor status
- `delete(id)` - Delete doctor
- `getSchedule(id)` - Get doctor schedule
- `getAppointments(id, params)` - Get doctor appointments

### departmentsApi
- `getAll()` - List all departments
- `getById(id)` - Get department
- `create(data)` - Create department (with logo upload)
- `update(id, data)` - Update department (with logo upload)
- `delete(id)` - Delete department

### appointmentsApi
- `getAll(params)` - List appointments with filters
- `getById(id)` - Get appointment details
- `updateStatus(id, data)` - Update appointment status
- `getConflicts()` - Get scheduling conflicts

### paymentsApi
- `getAll(params)` - List payments
- `getById(id)` - Get payment details

### metricsApi
- `getOverview(params)` - Dashboard overview metrics
- `getAppointments(params)` - Appointment statistics
- `getDoctors(params)` - Doctor statistics
- `getPatients(params)` - Patient statistics
- `getRevenue(params)` - Revenue statistics

### reportsApi
- `getDaily(date)` - Daily report
- `getWeekly(weekStart)` - Weekly report
- `getMonthly(month)` - Monthly report
- `getDoctorsPerformance(params)` - Doctor performance report

## Error Handling

All API calls can throw errors. Use try-catch:

```typescript
try {
  const users = await usersApi.getAll()
  // Handle success
} catch (error) {
  // Handle error
  if (error.response?.status === 404) {
    console.error('Not found')
  }
}
```

## Types

All request/response types are available from `@/types`:

```typescript
import type {
  User,
  UserRole,
  UserStatus,
  CreateUserRequest,
  PaginatedResponse,
  SearchParams
} from '@/types'
```

## Best Practices

1. **Always use types**: Import types from `@/types`
2. **Handle errors**: Wrap API calls in try-catch
3. **Use pagination**: For large datasets
4. **Token management**: Store tokens securely
5. **Loading states**: Show loading indicators during API calls

## Testing

```typescript
// Mock API client for testing
jest.mock('@/api/client')

// Test API call
it('should fetch users', async () => {
  const mockUsers = [{ id: '1', name: 'John' }]
  usersApi.getAll = jest.fn().mockResolvedValue({
    data: mockUsers,
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
  })
  
  const result = await usersApi.getAll()
  expect(result.data).toEqual(mockUsers)
})
```

---

For more information, see the main [PHASE_2_COMPLETION.md](../../PHASE_2_COMPLETION.md)



