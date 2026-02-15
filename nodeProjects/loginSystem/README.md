# Email Login System

A simple email-based authentication system with JWT tokens and password hashing.

## Features

- ✅ User Signup with email validation
- ✅ User Login with JWT authentication
- ✅ Password hashing using bcrypt
- ✅ JWT token generation
- ✅ Protected routes with JWT verification middleware
- ✅ In-memory data storage (array)

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Signup

**POST** `/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "1234567890",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Missing or invalid email/password
- `409` - User already exists
- `500` - Internal server error

### 2. Login

**POST** `/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "1234567890",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Missing email/password
- `401` - Invalid email or password
- `500` - Internal server error

### 3. Profile (Protected)

**GET** `/profile`

Get the authenticated user's profile. Requires a valid JWT token.

**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "1234567890",
    "email": "user@example.com",
    "createdAt": "2026-02-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - No token provided / Invalid token / Token expired
- `404` - User not found
- `500` - Internal server error

## Testing with cURL

### Signup:
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Profile (Protected Route):
First, save the token from signup/login response, then:
```bash
# Replace YOUR_TOKEN with the actual token from signup/login
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Complete Example:**
```bash
# 1. Signup and save response
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 2. Copy the token from response and use it
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Security Notes

⚠️ **Important:** This is a simple implementation for development/learning purposes.

For production, consider:
- Store JWT_SECRET in environment variables
- Use a real database instead of in-memory array
- Implement rate limiting
- Add email verification
- Implement refresh tokens
- Add HTTPS
- Add middleware for protected routes
- Add password strength requirements
- Implement account recovery

## Token Usage

The JWT token returned from signup/login can be used to authenticate subsequent requests. Include it in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

Create a `.env` file (optional, currently using hardcoded secret):

```
JWT_SECRET=your-super-secret-key
PORT=3000
```
