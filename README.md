🎓 Learning Management System (LMS)

A full-stack Learning Management System built with Next.js, Strapi
5, and PostgreSQL.

The application provides authentication, role-based access control,
course management, student enrollment, lesson learning, quizzes,
progress tracking, and separate dashboards for Student, Instructor,
and Admin users.

🌐 Live Project

Resource                            Link

Live Frontend                   https://lms-learning-management-system-eight.vercel.app/

Strapi Admin                    https://lms-learning-management-system-production-0ff5.up.railway.app/admin

GitHub Repository               https://github.com/jaber20106/LMS---Learning-Management-System

✨ Features

🔐 Authentication

User registration and login

JWT-based authentication

Logout functionality

Current-user and role detection

Protected role-based dashboard access

New registered users are automatically assigned the Student role

👨‍🎓 Student

Browse available courses

View course details

Enroll in courses

Access enrolled courses through My Courses

View lessons

Track lesson/course progress

Take quizzes

View quiz results

👨‍🏫 Instructor

Dedicated Instructor Dashboard

Create courses

Edit courses

Delete owned courses

Manage lessons for courses

Manage quizzes

View student/course progress

Ownership-based access control for instructor resources

🛡️ Admin

Dedicated Admin Dashboard

Manage users

Manage user roles

Manage courses and learning content according to configured
permissions

Administrative access to the LMS system

🔒 Role-Based Access Control

The application uses role-based permissions through the Strapi Users &
Permissions system.

Role             Access

Admin        System-wide administrative access
Instructor   Manage own courses, lessons and quizzes
Student      Browse, enroll, learn, track progress and take quizzes

Backend permissions are used to enforce access instead of relying only
on frontend UI restrictions.

🏗️ Architecture

┌──────────────────────────────┐
│        Next.js Frontend      │
│          Vercel              │
└──────────────┬───────────────┘
               │
               │ REST API + JWT
               ▼
┌──────────────────────────────┐
│        Strapi 5 Backend      │
│          Railway             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       PostgreSQL Database    │
│          Railway             │
└──────────────────────────────┘

🛠️ Technology Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

Next.js App Router

Backend

Strapi 5

TypeScript

REST API

Strapi Users & Permissions

Custom backend authorization / lifecycle logic

Database

PostgreSQL

Deployment

Vercel --- Frontend

Railway --- Backend

Railway PostgreSQL --- Database

📁 Project Structure

LMS---Learning-Management-System/
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   │   └── dashboard/
│   │   ├── instructor/
│   │   │   └── dashboard/
│   │   ├── courses/
│   │   ├── lessons/
│   │   ├── quizzes/
│   │   ├── my-courses/
│   │   ├── login/
│   │   └── register/
│   └── ...
│
├── backend/
│   ├── config/
│   ├── database/
│   ├── src/
│   ├── public/
│   └── ...
│
└── README.md

The repository currently contains separate frontend and backend
applications. The frontend includes dedicated admin/instructor
dashboards, course, lesson, quiz, authentication, and My Courses routes.
The backend contains the Strapi configuration, source code, database
migrations and authorization logic.

🔄 Main User Flow

Student Flow

Register
   ↓
Student Role Assigned
   ↓
Login
   ↓
Browse Courses
   ↓
Enroll
   ↓
My Courses
   ↓
View Lessons
   ↓
Track Progress
   ↓
Take Quiz

Instructor Flow

Login
   ↓
Instructor Dashboard
   ↓
Create / Manage Course
   ↓
Manage Lessons
   ↓
Manage Quiz
   ↓
View Course / Student Progress

Admin Flow

Login
   ↓
Admin Dashboard
   ↓
Manage Users & Roles
   ↓
Manage LMS Resources
   ↓
Administrative Operations

📚 Application Routes

Route                                          Purpose

/                                            Home page
/courses                                     Browse courses
/my-courses                                  Enrolled courses
/login                                       Login
/register                                    Registration
/lessons/[documentId]                        Lesson page
/quizzes/[documentId]                        Quiz page
/instructor/dashboard                        Instructor dashboard
/instructor/dashboard/create-course          Create course
/instructor/dashboard/edit/[documentId]      Edit course
/instructor/dashboard/lessons/[documentId]   Manage lessons
/instructor/dashboard/quizzes                Manage quizzes
/admin/dashboard                             Admin dashboard

🚀 Getting Started

Prerequisites

Make sure you have:

Node.js

npm

Git

PostgreSQL

1. Clone the repository

git clone https://github.com/jaber20106/LMS---Learning-Management-System.git

cd LMS---Learning-Management-System

💻 Frontend Setup

cd frontend
npm install

Create a .env.local file:

NEXT_PUBLIC_API_URL=http://localhost:1337

Start the development server:

npm run dev

Frontend:

http://localhost:3000

⚙️ Backend Setup

Open another terminal:

cd backend
npm install

Configure your Strapi environment variables and PostgreSQL connection.

Then run:

npm run develop

Strapi Admin:

http://localhost:1337/admin

🔑 Environment Variables

Never commit real secrets or credentials to GitHub.

Frontend

Example:

NEXT_PUBLIC_API_URL=http://localhost:1337

Backend

Configure the required Strapi variables for:

Database connection

Application keys

JWT/authentication secrets

Other production secrets

Use environment variables for all sensitive information.

☁️ Deployment

Frontend

The Next.js application is deployed on Vercel.

Live:

https://lms-learning-management-system-eight.vercel.app/

Backend

The Strapi application is deployed on Railway.

Live backend:

https://lms-learning-management-system-production-0ff5.up.railway.app/

The backend uses Railway PostgreSQL for persistent database storage.

🔐 Security

Authentication is handled through Strapi.

JWT tokens are used for authenticated API requests.

Role information is loaded from the backend.

Protected functionality is controlled by user roles.

Backend permissions provide the main authorization layer.

Instructor resource ownership is checked on the backend.

Sensitive environment variables are kept outside source control.

🎯 Project Purpose

This project was developed as a practical full-stack LMS to demonstrate:

Modern Next.js development

Strapi CMS and REST API integration

PostgreSQL database integration

Authentication

Role-based access control

Course management

Student enrollment

Lesson management

Learning progress tracking

Quiz functionality

Admin and Instructor dashboards

Cloud deployment

👨‍💻 Author

Jaber

GitHub:
https://github.com/jaber20106

Project Repository:
https://github.com/jaber20106/LMS---Learning-Management-System

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on
GitHub.
