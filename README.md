# Minimal Notes App

**Author:** mdkwe  
**Start date:** 14/12/2025  
**Status:** Ongoing

---

## 1. Project Overview

**Minimal Notes App** is a full-stack web application that allows authenticated users to **create, read, update, and delete personal notes**.

Each user has a **private workspace**, secured through authentication and **database-level access control**.

The primary goal of this project is **learning**:  
to understand how a real frontend interacts with a real database in a modern web stack.

---

## 2. Project Goals

This project focuses on learning how to:

- Connect a **React frontend** to a backend database
- Implement **authentication and authorization**
- Secure data using **Row Level Security (RLS)** instead of frontend-only checks
- Structure a **modern full-stack web application**
- Follow a clean commit history and incremental development

---

## 3. Tech Stack

### Frontend

- **Vite** — fast development server & build tool
- **React** — UI and state management
- **TypeScript** — type safety and scalability
- **Tailwind CSS** — utility-first styling

### Backend / Database

- **Supabase**
  - PostgreSQL database
  - Email/password authentication
  - Auto-generated REST API
  - JavaScript client
  - Row Level Security (RLS)

### Tooling

- **npm**
- **Git & GitHub**
- **Browser DevTools**

---

## 4. Environment Setup

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` file at the root of the project:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

📖 Supabase setup guide:  
https://supabase.com/docs/guides/getting-started/quickstarts/reactjs

---

## 5. Core Features

- User authentication (sign up / login / logout)
- Password recovery
- Create a note
- Edit a note
- Delete a note
- List notes (only the authenticated user’s notes)
- Persistent storage using PostgreSQL
- Secure access via Supabase RLS policies

---

## 6. Progress & Milestones

### Completed

- [x] Initial project setup
- [x] User authentication (sign up / login / logout) — 16/12/2025
- [x] Forgot password & update password flow — 17/12/2025

### In Progress / Planned

- [ ] Create a reusable authentication UI with Tailwind CSS
- [ ] Build the dashboard layout
- [ ] Implement Create / Edit / Delete notes
- [ ] Notes list view (user-scoped)
- [ ] Improve UX and error handling

---

## 8. License

This project is for learning purposes. So MIT baby ! 