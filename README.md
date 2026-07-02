# TripVault 🧳

TripVault is a travel memory journal app. This repo contains **Week 1** of the build: project foundation + full user authentication (register, login, protected dashboard).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **Frontend:** React (Vite), React Router, Axios

## Folder Structure

```
tripvault/
│
├── client/
│   └── src/
│       ├── api/axios.js
│       ├── pages/
│       │   ├── Register.jsx
│       │   ├── Login.jsx
│       │   └── Dashboard.jsx
│       ├── components/ProtectedRoute.jsx
│       └── App.jsx
│
├── server/
│   ├── models/User.js
│   ├── routes/auth.js
│   ├── middleware/authMiddleware.js
│   ├── index.js
│   └── .env (not committed — see .env.example)
│
└── README.md
```

## Setup Instructions

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env and fill in your own MONGO_URI and JWT_SECRET
npm run dev   # or: npm start
```

Server runs at `http://localhost:5000`.

**Environment variables (`server/.env`):**

| Key | Description |
|---|---|
| `PORT` | Port for Express server (default `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS (default `http://localhost:5173`) |

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`.

**Environment variables (`client/.env`):**

| Key | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:5000/api`) |

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user, returns JWT |
| POST | `/api/auth/login` | Public | Validate credentials, returns JWT |
| GET | `/api/auth/me` | Private (Bearer token) | Returns current user's info |

## Auth Flow

1. User registers on `/register` → backend hashes password, saves user, returns JWT.
2. Frontend stores JWT in `localStorage` and redirects to `/dashboard`.
3. `/dashboard` is a protected route — it calls `GET /api/auth/me` with the token to fetch and display the user's name.
4. If no valid token exists, the user is redirected to `/login`.

## Deliverables Checklist

- [x] Express server running on port 5000, MongoDB connected
- [x] Register API with hashed password (bcrypt)
- [x] Login API returning JWT
- [x] Protected route `/api/auth/me`
- [x] React frontend with Register, Login, Dashboard pages
- [x] End-to-end auth flow (Register → Login → Dashboard)
- [x] Clean `/server` and `/client` separation

## Best Practices Followed

- `.env` excluded via `.gitignore` in both `client/` and `server/`
- Passwords hashed with bcrypt before storage, never returned in API responses
- JWT signed with a secret from environment variables
- Test APIs with Postman before wiring up the frontend
