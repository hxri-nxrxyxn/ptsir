# API Documentation

This document provides detailed information about the backend API endpoints for the Learning Management System. This API is connected to a MySQL database and uses JSON Web Tokens (JWT) for authentication.

## Getting Started

Follow these steps to set up and run the server locally.

### 1. Prerequisites

- **Node.js**: v16 or later.
- **MySQL**: A running MySQL or MariaDB server instance.

### 2. Installation

Clone the repository and install the required npm packages.

```bash
# Clone your project (if you have one)
# git clone <your-repo-url>
# cd <your-project-directory>

# Install dependencies
npm install
```

### 3. Database Setup

You must create the database and populate it with the required tables and initial data.

1.  **Create the Database**: Connect to your MySQL server and run the following command to create the database named `lms_db`.

    ```sql
    CREATE DATABASE IF NOT EXISTS lms_db;
    ```

2.  **Create Tables**: Use your MySQL client to execute the entire `schema.sql` file against the `lms_db` database. This will create all the necessary tables with the correct relationships.

3.  **Seed Data**: After the tables are created, execute the `seed.sql` file. This will populate the database with initial users, courses, and other sample data.

### 4. Run the Server

Start the server in development mode using `nodemon`. The server will run on `http://localhost:3001`.

```bash
npm run dev
```

## General Information

### Base URL

All API endpoints are prefixed with `/api`.
**Example**: `http://localhost:3001/api/auth/login`

### Authentication Flow

Most routes are protected. To access them, you must follow this flow:

1.  Register a new user or use the credentials for a seeded user (e.g., `student.alan@example.com`).
2.  Send a `POST` request to `/api/auth/login` with the user's email and password.
3.  The server will respond with a JWT if the credentials are valid.
4.  For all subsequent requests to protected endpoints, include the token in the `Authorization` header.

- **Header Format**: `Authorization: Bearer <your-jwt-token>`

---

## Authentication Endpoints

### `POST /api/auth/register`

Registers a new user. New users are created with `is_approved=false` and must be approved by an admin.

- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "New Student",
    "email": "new.student@example.com",
    "password": "securepassword123",
    "role": "student"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "user": {
      "id": 7,
      "name": "New Student",
      "email": "new.student@example.com",
      "role": "student",
      "is_approved": false
    }
  }
  ```

### `POST /api/auth/login`

Logs in an existing, approved user and returns a JWT.

- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "student.alan@example.com",
    "password": "your_actual_password"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "name": "Alan Turing",
      "email": "student.alan@example.com",
      "role": "student"
    }
  }
  ```

### `GET /api/auth/me`

Retrieves the profile of the currently authenticated user based on their token.

- **Access:** Any authenticated user
- **Request Headers:** `Authorization: Bearer <your-jwt-token>`
- **Success Response (200 OK):**
  ```json
  {
    "user": {
      "id": 5,
      "name": "Alan Turing",
      "email": "student.alan@example.com",
      "role": "student",
      "is_approved": true
    }
  }
  ```

---

## Admin Routes

- **Required Role:** `admin`
- **Authentication:** All routes require a valid admin JWT.

### `GET /api/admin/users/pending`

Lists all users awaiting approval.

- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 6,
      "name": "Pending Teacher",
      "email": "pending.teacher@example.com",
      "role": "teacher",
      "created_at": "2024-03-15T10:00:00.000Z"
    }
  ]
  ```

### `PATCH /api/admin/users/:userId/approve`

Approves a pending user.

- **Success Response (200 OK):**
  ```json
  {
    "message": "User 6 approved successfully."
  }
  ```

### `GET /api/admin/users`

Lists all users in the system.

- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "is_approved": true
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "email": "teacher.ada@example.com",
      "role": "teacher",
      "is_approved": true
    }
  ]
  ```

### `POST /api/courses`

Creates a new course.

- **Request Body:**
  ```json
  {
    "title": "Quantum Computing 101",
    "description": "An introduction to the principles of quantum computing."
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "id": 104,
    "title": "Quantum Computing 101",
    "description": "An introduction to the principles of quantum computing."
  }
  ```

### `DELETE /api/courses/:courseId`

Deletes a course and all associated data (tests, materials, etc.) due to cascading database rules.

- **Success Response (200 OK):**
  ```json
  {
    "message": "Course 104 deleted. Cascading deletes handled by DB."
  }
  ```

---

## Teacher Routes

- **Required Role:** `teacher`
- **Authentication:** All routes require a valid teacher JWT.

### `GET /api/courses/my`

Lists courses managed by the logged-in teacher.

- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 101,
      "title": "Introduction to Computer Science",
      "description": "Learn the fundamentals of computing, algorithms, and data structures.",
      "created_by_user_id": 1,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
  ```

### `POST /api/courses/:courseId/tests`

Creates a new test for a course managed by the teacher.

- **Request Body:**
  ```json
  {
    "title": "Final Exam"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "id": 203,
    "courseId": "101",
    "title": "Final Exam"
  }
  ```

---

## Student Routes

- **Required Role:** `student`
- **Authentication:** All routes require a valid student JWT.

### `GET /api/courses`

Lists all available courses in the system for enrollment.

- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 101,
      "title": "Introduction to Computer Science",
      "description": "..."
    },
    { "id": 102, "title": "Web Development Basics", "description": "..." }
  ]
  ```

### `POST /api/enrollments`

Enrolls the current student in a course.

- **Request Body:**
  ```json
  {
    "courseId": 102
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Enrolled successfully."
  }
  ```

### `GET /api/enrollments/my`

Lists all courses the current student is enrolled in.

- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 101,
      "title": "Introduction to Computer Science",
      "description": "...",
      "created_by_user_id": 1,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
  ```

### `GET /api/courses/:courseId/details`

Get details of an enrolled course, including its materials and tests.

- **Success Response (200 OK):**
  ```json
  {
    "id": 101,
    "title": "Introduction to Computer Science",
    "description": "...",
    "materials": [
      {
        "id": 1,
        "title": "Lecture 1: What is an Algorithm?",
        "file_type": "pdf"
      }
    ],
    "tests": [{ "id": 201, "title": "CS101 Midterm Exam" }]
  }
  ```

---

## General / Shared Routes

Accessible by multiple roles, with internal permission checks.

### `GET /api/courses/:courseId`

View basic information about a specific course.

- **Access:** Any authenticated user
- **Success Response (200 OK):**
  ```json
  {
    "id": 101,
    "title": "Introduction to Computer Science",
    "description": "Learn the fundamentals of computing, algorithms, and data structures."
  }
  ```

### `GET /api/materials/:materialId/download`

Simulates a file download. Checks if the user is enrolled in or manages the associated course.

- **Access:** Authenticated student, teacher, or admin (with permissions)
- **Success Response (200 OK):**
  ```json
  {
    "message": "Simulating download for Lecture 1: What is an Algorithm?. Real path: /uploads/materials/cs101_lec1.pdf"
  }
  ```

---

## Not Yet Implemented

The following endpoints are defined in the API specification but are not yet fully implemented. They will return a `501 Not Implemented` response.

- Teacher: Adding/updating questions, viewing student progress, grading, handling doubts.
- Student: Submitting tests, viewing submissions, creating/viewing doubts.
