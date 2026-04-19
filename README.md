# 🚀 TaskTodo – Full Stack Todo Application

A modern full-stack Todo application with authentication, built using **TypeScript, Express, PostgreSQL, and Vanilla JavaScript**.

---

## 📌 Features

### 🔐 Authentication
- User Signup & Login
- JWT-based authentication
- HTTP-only cookie storage
- Protected routes via middleware

### ✅ Todo Management
- Create, Edit, Delete todos
- Mark todos as complete/incomplete
- Fetch all todos for logged-in user

### 🎨 Frontend
- Modern UI
- Expandable descriptions
- Modal editing
- Optimistic updates

---

## 🛠️ Tech Stack

**Backend**
- Node.js, Express, TypeScript
- PostgreSQL
- JWT, bcrypt

**Frontend**
- HTML, CSS, JavaScript

---

## ⚙️ Setup

### Backend
```bash
npm install
npm run dev
```

Create `.env`:
```
PORT=8080
DATABASE_URL=your_db_url
JWT_SECRET=your_secret
```

### Frontend
Run with Live Server:
```
http://localhost:5500
```

---

## 📡 API

### Auth
- POST /login
- POST /signup

### Todos
- GET /todo/all
- POST /todo/create
- POST /todo/edit
- DELETE /todo/delete
- PUT /todo/complete

---

## 🔒 Security
- Password hashing with bcrypt
- HTTP-only cookies
- Auth middleware

---

## 👨‍💻 Author
Ayush Pal Singh
