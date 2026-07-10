# TripVault 🧳

TripVault is a travel memory journal app.

- **Week 1:** project foundation + full user authentication (register, login, protected dashboard).
- **Week 2:** Trip Management CRUD — create, view, edit, and delete trips from the dashboard, with every trip scoped to its owner.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **Frontend:** React (Vite), React Router, Axios

## Folder Structure

```
tripvault/
│
├── client/
│   └── src/
│       ├── api/
│       │   ├── axios.js
│       │   └── trips.js
│       ├── pages/
│       │   ├── Register.jsx
│       │   ├── Login.jsx
│       │   └── Dashboard.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── TripCard.jsx
│       │   ├── TripForm.jsx
│       │   └── ConfirmDialog.jsx
│       └── App.jsx
│
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Trip.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── trips.js
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

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user, returns JWT |
| POST | `/api/auth/login` | Public | Validate credentials, returns JWT |
| GET | `/api/auth/me` | Private (Bearer token) | Returns current user's info |

### Trips

All trip routes require a valid `Authorization: Bearer <token>` header and only ever operate on trips owned by the requesting user. Accessing or modifying another user's trip returns `403 Forbidden`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/trips` | Private | Create a trip linked to the authenticated user |
| GET | `/api/trips` | Private | Get all trips belonging to the logged-in user |
| GET | `/api/trips/:id` | Private (owner only) | Get a single trip by ID |
| PUT | `/api/trips/:id` | Private (owner only) | Update a trip |
| DELETE | `/api/trips/:id` | Private (owner only) | Delete a trip |

**Trip fields:** `title` (String, required), `destination` (String, required), `startDate` (Date), `endDate` (Date), `description` (String), `rating` (Number, 1–5), `user` (ObjectId, set automatically from the JWT).

## Auth Flow

1. User registers on `/register` → backend hashes password, saves user, returns JWT.
2. Frontend stores JWT in `localStorage` and redirects to `/dashboard`.
3. `/dashboard` is a protected route — it calls `GET /api/auth/me` with the token to fetch and display the user's name.
4. If no valid token exists, the user is redirected to `/login`.

## Trip Management Flow (Week 2)

1. On load, `/dashboard` calls `GET /api/trips` and renders each trip as a card (title, destination, date range, star rating, description).
2. **Create:** "+ New Trip" opens a modal form (`TripForm`); submitting `POST`s to `/api/trips` and refreshes the list.
3. **Edit:** clicking "Edit" on a card opens the same form pre-filled with that trip's data; submitting `PUT`s to `/api/trips/:id` and refreshes the list.
4. **Delete:** clicking "Delete" opens a confirmation dialog (`ConfirmDialog`); confirming `DELETE`s `/api/trips/:id` and refreshes the list.
5. If the user has no trips, a friendly empty state is shown instead of an empty grid, with a shortcut to add the first trip.
6. Every trip request automatically carries the JWT via the axios request interceptor (`client/src/api/axios.js`) — no manual header wiring needed per call.
7. Ownership is enforced server-side: `GET /api/trips` only ever returns the logged-in user's trips, and `GET/PUT/DELETE /api/trips/:id` check `trip.user` against the authenticated user before allowing access, returning `403` otherwise.
8. Loading and error states are handled independently for the trip list, the create/edit form, and the delete action, so a failure in one doesn't block the others.

## Deliverables Checklist

**Week 1**
- [x] Express server running on port 5000, MongoDB connected
- [x] Register API with hashed password (bcrypt)
- [x] Login API returning JWT
- [x] Protected route `/api/auth/me`
- [x] React frontend with Register, Login, Dashboard pages
- [x] End-to-end auth flow (Register → Login → Dashboard)
- [x] Clean `/server` and `/client` separation

**Week 2**
- [x] `Trip` Mongoose model (title, destination, startDate, endDate, description, rating, user)
- [x] Protected CRUD routes: `POST/GET/GET :id/PUT :id/DELETE :id` on `/api/trips`
- [x] Ownership checks on every single-trip route (`403` if the trip belongs to someone else)
- [x] Dashboard renders trips as cards with title, destination, dates, and rating
- [x] Create Trip form (modal), Edit Trip form pre-filled, Delete with confirmation dialog
- [x] Trip list refreshes automatically after create/edit/delete
- [x] Friendly empty state when the user has no trips yet
- [x] Axios interceptor attaches JWT automatically on every request
- [x] Loading and error states handled for trip list, form submission, and delete
- [x] Routes tested in Postman before wiring up the frontend

## Testing with Postman

A ready-to-import collection is included at the repo root: `TripVault.postman_collection.json`.

1. Import it into Postman.
2. Run **Auth → Login** first (or Register, then Login) — its test script automatically saves the returned JWT into the collection's `token` variable.
3. Run **Trips → Create Trip** — its test script saves the new trip's `_id` into the `tripId` variable.
4. Run **Get All My Trips**, **Get Single Trip**, **Update Trip**, and **Delete Trip** using that same `tripId`.
5. To verify ownership checks, log in as a second user and confirm that requesting the first user's `tripId` returns `403 Forbidden`.

Test every route this way against the running server (`npm run dev` in `server/`) before wiring up or trusting the frontend.

## Pushing to GitHub

From the repo root:

```bash
git add .
git commit -m "Week 2: Trip Management CRUD (model, protected routes, dashboard UI)"
git push origin main
```

(Use whatever branch name your team is working from if it isn't `main`.)

## Best Practices Followed

- `.env` excluded via `.gitignore` in both `client/` and `server/`
- Passwords hashed with bcrypt before storage, never returned in API responses
- JWT signed with a secret from environment variables
- Test APIs with Postman before wiring up the frontend
- Trip ownership enforced server-side on every read/update/delete, not just in the UI
