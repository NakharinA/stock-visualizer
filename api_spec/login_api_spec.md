# Login Page — API Specification

## Overview
The login page authenticates users via email/password or Google OAuth and stores the session.

---

## POST `/auth/login`

Authenticate with email and password.

**Request**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response `200 OK`**
```json
{
  "user": {
    "id": "u_123",
    "name": "user",
    "email": "user@example.com",
    "avatar": "https://..."
  },
  "token": "eyJhbGci..."
}
```

**Response `401 Unauthorized`**
```json
{
  "error": "Invalid credentials"
}
```

| Field      | Type   | Required | Notes                        |
|------------|--------|----------|------------------------------|
| `email`    | string | yes      | Valid email format           |
| `password` | string | yes      | Min 8 characters             |

---

## POST `/auth/login/google`

Initiate Google OAuth login. Returns a redirect URL or an auth token depending on implementation.

**Request**
```json
{}
```

**Response `200 OK`**
```json
{
  "user": {
    "id": "u_456",
    "name": "Demo User",
    "email": "demo@example.com",
    "avatar": "https://..."
  },
  "token": "eyJhbGci..."
}
```

---

## POST `/auth/logout`

Invalidate the current session token.

**Request Headers**
```
Authorization: Bearer <token>
```

**Response `204 No Content`**

---

## Common Error Responses

| Status | Body                              | When                         |
|--------|-----------------------------------|------------------------------|
| `400`  | `{ "error": "Validation failed" }` | Missing or malformed fields  |
| `401`  | `{ "error": "Invalid credentials" }` | Wrong email or password    |
| `500`  | `{ "error": "Internal server error" }` | Unexpected server error  |
