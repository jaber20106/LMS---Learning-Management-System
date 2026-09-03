# Learning Management System (LMS)

A full-stack Learning Management System built with **Next.js**, **Strapi 5**, and **PostgreSQL**.

The platform provides role-based access for **Admin, Instructor, and Student** users, allowing users to manage courses, lessons, quizzes, enrollments, and learning progress.

---

## Live Application

- **Frontend:** https://lms-learning-management-system-eight.vercel.app/
- **Strapi Admin:** https://lms-learning-management-system-production-0ff5.up.railway.app/admin
- **GitHub Repository:** https://github.com/jaber20106/LMS---Learning-Management-System

---


The demonstration covers:

- User registration and login
- Role-based access control
- Student course browsing
- Course enrollment
- My Courses
- Lesson viewing
- Lesson progress tracking
- Quiz participation
- Quiz results
- Instructor dashboard
- Course management
- Lesson management
- Quiz management
- Admin dashboard
- Backend role and permission management
- Live deployed application

---

## What it does

This Learning Management System allows students to learn through structured courses, lessons, and quizzes while providing instructors and administrators with role-based management features.

### Students can:

- Register and login
- Browse available courses
- Enroll in courses
- View enrolled courses
- Access course lessons
- Complete lessons
- Track learning progress
- Take quizzes
- View quiz results

### Instructors can:

- Create courses
- Edit their own courses
- Delete their own courses
- Add lessons to their courses
- Edit lessons
- Delete lessons
- Create quizzes
- Manage quiz questions
- View student progress for their courses

### Administrators can:

- Access the admin dashboard
- Manage users
- Manage roles
- Manage courses
- Manage lessons
- Manage quizzes
- View student progress
- Manage system-level access

---

## Role-Based Access Control

| Feature | Admin | Instructor | Student |
|---|:---:|:---:|:---:|
| Manage Users | ✓ | ✗ | ✗ |
| Manage Roles | ✓ | ✗ | ✗ |
| Create Courses | ✓ | ✓ | ✗ |
| Edit Courses | ✓ | Own Courses | ✗ |
| Delete Courses | ✓ | Own Courses | ✗ |
| Manage Lessons | ✓ | Own Courses | ✗ |
| Create Quizzes | ✓ | Own Courses | ✗ |
| Manage Quiz Questions | ✓ | Own Courses | ✗ |
| View Student Progress | ✓ | Own Courses | Own Progress |
| Enroll in Courses | ✗ | ✗ | ✓ |
| Take Quizzes | ✗ | ✗ | ✓ |

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Automatic Student role assignment for new users
- Role-based navigation
- Protected routes
- Backend authentication using Strapi Users & Permissions

### Student Features

- Browse available courses
- Enroll in courses
- View My Courses
- Access enrolled course lessons
- Complete lessons
- Track course progress
- Take quizzes
- View quiz results

### Instructor Features

- Instructor dashboard
- Create courses
- Edit courses
- Delete courses
- Add lessons
- Edit lessons
- Delete lessons
- Create quizzes
- Manage quiz questions
- View enrolled student progress

### Admin Features

- Admin dashboard
- User management
- Role management
- Course management
- Lesson management
- Quiz management
- Student progress management
- System-level access control

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Backend

- Strapi 5
- REST API
- JWT Authentication
- Users & Permissions

### Database

- PostgreSQL

### Deployment

- Vercel — Frontend
- Railway — Backend
- Railway PostgreSQL — Database

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │        Users         │
                    │                      │
                    │  Student             │
                    │  Instructor          │
                    │  Admin               │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Next.js        │
                    │      Frontend        │
                    │       Vercel         │
                    └──────────┬───────────┘
                               │
                         REST API + JWT
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Strapi 5       │
                    │       Backend        │
                    │       Railway        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │       Database       │
                    │       Railway        │
                    └──────────────────────┘
```

---

## Authentication Flow

The application uses Strapi authentication with JWT.

```text
User
  │
  ▼
Register / Login
  │
  ▼
Strapi Authentication API
  │
  ▼
JWT Token
  │
  ▼
Next.js Frontend
  │
  ▼
Current User + Role
  │
  ├──────────────┬──────────────┐
  ▼              ▼              ▼
Admin        Instructor      Student
```

Protected API requests use the authenticated user's JWT token:

```text
Authorization: Bearer <JWT>
```

---

## Learning Progress

Students can track their learning progress throughout a course.

The progress system includes:

- Lesson completion
- Persistent lesson progress
- Course progress calculation
- Student-specific progress
- Instructor access to student progress
- Admin access to progress information

Example:

```text
Course
 ├── Lesson 1 ✓
 ├── Lesson 2 ✓
 ├── Lesson 3
 └── Lesson 4

Progress: 50%
```

Progress data is stored in the backend so that it remains available after logging out and logging back in.

---

## Quiz System

The LMS includes a quiz system for testing student knowledge.

### Instructor

Instructors can:

- Create quizzes
- Add quiz questions
- Create multiple-choice questions
- Manage quiz content

### Student

Students can:

- Open quizzes
- Answer quiz questions
- Submit quizzes
- Receive quiz results
- View their score

Quiz data and results are managed through the Strapi backend.

---

## Application Routes

### Public Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/courses` | Browse available courses |
| `/login` | User login |
| `/register` | User registration |

### Student Routes

| Route | Description |
|---|---|
| `/my-courses` | View enrolled courses |
| `/lessons/[documentId]` | View lesson |
| `/quizzes/[documentId]` | Take quiz |

### Instructor Routes

| Route | Description |
|---|---|
| `/instructor/dashboard` | Instructor dashboard |
| `/instructor/dashboard/create-course` | Create course |
| `/instructor/dashboard/edit/[documentId]` | Edit course |
| `/instructor/dashboard/lessons/[documentId]` | Manage lessons |
| `/instructor/dashboard/quizzes` | Manage quizzes |

### Admin Routes

| Route | Description |
|---|---|
| `/admin/dashboard` | Admin dashboard |

---

## Project Structure

```text
LMS---Learning-Management-System/
│
├── backend/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── extensions/
│   │   └── index.ts
│   ├── types/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── courses/
│   │   ├── instructor/
│   │   ├── lessons/
│   │   ├── login/
│   │   ├── my-courses/
│   │   ├── quizzes/
│   │   └── register/
│   │
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL
- Git

---

### Clone the Repository

```bash
git clone https://github.com/jaber20106/LMS---Learning-Management-System.git
```

```bash
cd LMS---Learning-Management-System
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
```

Start the development server:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:3000
```

---

## Backend Setup

Open another terminal and navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the environment variables using:

```text
.env.example
```

Start Strapi:

```bash
npm run develop
```

Strapi admin panel:

```text
http://localhost:1337/admin
```

---

## Environment Variables

### Frontend

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
```

For production, use the deployed Strapi backend URL.

### Backend

The backend requires environment variables for:

- Database connection
- PostgreSQL
- Strapi application keys
- JWT configuration
- Production configuration

Use the provided `.env.example` file as the configuration reference.

> Never commit sensitive credentials, passwords, or secret keys to GitHub.

---

## API

The frontend communicates with the Strapi backend through REST APIs.

Main API areas include:

```text
/api/auth/local
/api/users/me
/api/courses
/api/lessons
/api/enrollments
/api/lesson-progresses
/api/quizzes
/api/quiz-questions
```

API access is controlled through Strapi Users & Permissions and role-based authorization.

---

## Security

The application implements security at both frontend and backend levels.

### Frontend

- Protected routes
- Authentication state
- Role-based navigation
- JWT authentication

### Backend

- Strapi authentication
- Role-based permissions
- Protected API endpoints
- Instructor ownership checks
- Protected user data

Backend authorization is used to ensure users cannot access functionality outside their assigned role.

---

## Deployment

### Frontend

The Next.js frontend is deployed on Vercel.

**Production URL:**

https://lms-learning-management-system-eight.vercel.app/

### Backend

The Strapi backend is deployed on Railway.

**Production URL:**

https://lms-learning-management-system-production-0ff5.up.railway.app/

### Database

The production PostgreSQL database is hosted on Railway.

---

## Live Links

| Service | Link |
|---|---|
| Live Website | https://lms-learning-management-system-eight.vercel.app/ |
| Strapi Admin | https://lms-learning-management-system-production-0ff5.up.railway.app/admin |
| GitHub | https://github.com/jaber20106/LMS---Learning-Management-System |

---

## Project Goals

The main goals of this project are:

- Build a full-stack Learning Management System
- Implement role-based access control
- Practice Next.js development
- Integrate Next.js with Strapi
- Work with PostgreSQL
- Implement authentication and authorization
- Implement course enrollment
- Implement lesson progress tracking
- Implement quiz functionality
- Deploy a full-stack application

---

## Future Improvements

Possible future improvements include:

- Course search and filtering
- Course categories
- Advanced instructor analytics
- Improved admin statistics
- Advanced quiz functionality
- Certificate generation
- Course completion certificates
- Notification system
- Detailed student analytics
- UI and performance improvements

---

## Repository

GitHub Repository:

https://github.com/jaber20106/LMS---Learning-Management-System

---

## Author

**Jaber**

Learning Management System developed as a full-stack educational project.

---

## License

This project was developed for educational and project demonstration purposes.
