# TripVault 🧳

TripVault is a travel memory journal app.

- **Week 1:** project foundation + full user authentication (register, login, protected dashboard).
- **Week 2:** Trip Management CRUD — create, view, edit, and delete trips from the dashboard, with every trip scoped to its owner.
- **Week 3:** Photo uploads (Cloudinary) + public user profiles — trips can now carry a cover image and photo gallery, and every user gets a shareable public profile page.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Multer, Cloudinary
- **Frontend:** React (Vite), React Router, Axios

## Folder Structure

```
tripvault/
│
├── client/
│   └── src/
│       ├── api/
│       │   ├── axios.js
│       │   ├── trips.js
│       │   └── users.js
│       ├── pages/
│       │   ├── Register.jsx
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── TripDetail.jsx
│       │   └── Profile.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── TripCard.jsx
│       │   ├── TripForm.jsx
│       │   ├── ConfirmDialog.jsx
│       │   └── EditProfileForm.jsx
│       └── App.jsx
│
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Trip.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trips.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── index.js
│   └── .env (not committed — see .env.example)
│
├── TripVault.postman_collection.json
└── README.md
```

## Setup Instructions

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env and fill in your own MONGO_URI, JWT_SECRET, and Cloudinary credentials
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
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard — never commit this |

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

### 3. Cloudinary Setup

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com).
2. From your Cloudinary dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Paste them into `server/.env` as shown above. Never hardcode them in source files or commit them.

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user (name, username, email, password), returns JWT |
| POST | `/api/auth/login` | Public | Validate credentials, returns JWT |
| GET | `/api/auth/me` | Private (Bearer token) | Returns current user's info (including username, bio) |

### Trips

All trip routes require a valid `Authorization: Bearer <token>` header and only ever operate on trips owned by the requesting user. Accessing or modifying another user's trip returns `403 Forbidden`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/trips` | Private | Create a trip linked to the authenticated user |
| GET | `/api/trips` | Private | Get all trips belonging to the logged-in user |
| GET | `/api/trips/:id` | Private (owner only) | Get a single trip by ID |
| PUT | `/api/trips/:id` | Private (owner only) | Update a trip |
| DELETE | `/api/trips/:id` | Private (owner only) | Delete a trip |
| POST | `/api/trips/:id/upload` | Private (owner only) | Upload a photo (`multipart/form-data`, field name `image`); attaches the Cloudinary URL to the trip |

**Trip fields:** `title` (String, required), `destination` (String, required), `startDate` (Date), `endDate` (Date), `description` (String), `rating` (Number, 1–5), `coverImage` (String — Cloudinary URL), `photos` (Array of Strings — Cloudinary URLs), `user` (ObjectId, set automatically from the JWT).

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/:username/profile` | Public (no auth) | Returns the user's name, bio, member-since date, and all their trips (title, destination, dates, rating, coverImage) |
| PUT | `/api/users/profile` | Private | Update the logged-in user's `username` and/or `bio` |

The public profile route explicitly `.select()`s only safe fields — `email` and `password` are never returned, even indirectly.

**User fields:** `name` (String, required), `username` (String, required, unique, lowercase letters/numbers/`_`/`.` only), `email` (String, required, unique), `password` (String, hashed, never returned by any route), `bio` (String, optional, max 280 chars).

## Auth Flow

1. User registers on `/register` (name, username, email, password) → backend hashes password, saves user, returns JWT.
2. Frontend stores JWT in `localStorage` and redirects to `/dashboard`.
3. `/dashboard` is a protected route — it calls `GET /api/auth/me` with the token to fetch and display the user's name.
4. If no valid token exists, the user is redirected to `/login`.

## Trip Management Flow (Week 2)

1. On load, `/dashboard` calls `GET /api/trips` and renders each trip as a card (cover image, title, destination, date range, star rating, description).
2. **Create:** "+ New Trip" opens a modal form (`TripForm`); submitting `POST`s to `/api/trips` and refreshes the list.
3. **Edit:** clicking a card opens its detail page; clicking "Edit" on the dashboard card opens the same form pre-filled with that trip's data; submitting `PUT`s to `/api/trips/:id` and refreshes the list.
4. **Delete:** clicking "Delete" opens a confirmation dialog (`ConfirmDialog`); confirming `DELETE`s `/api/trips/:id` and refreshes the list.
5. If the user has no trips, a friendly empty state is shown instead of an empty grid, with a shortcut to add the first trip.
6. Every trip request automatically carries the JWT via the axios request interceptor (`client/src/api/axios.js`) — no manual header wiring needed per call.
7. Ownership is enforced server-side: `GET /api/trips` only ever returns the logged-in user's trips, and `GET/PUT/DELETE /api/trips/:id` check `trip.user` against the authenticated user before allowing access, returning `403` otherwise.
8. Loading and error states are handled independently for the trip list, the create/edit form, and the delete action, so a failure in one doesn't block the others.

## Photo Uploads & Public Profiles Flow (Week 3)

**Photo uploads**

1. The Create/Edit Trip form (`TripForm`) has a file input with a live preview (`URL.createObjectURL`) before anything is sent to the server.
2. Because a trip has to exist before a photo can be attached to it, the dashboard first creates/updates the trip via JSON, then — if a photo was selected — uploads it separately via `POST /api/trips/:id/upload` using `FormData` and `multipart/form-data`.
3. On the backend, `multer` parses the incoming file and `multer-storage-cloudinary` streams it straight to Cloudinary; the route never touches raw file bytes. The returned secure URL is pushed into `trip.photos[]`, and becomes `trip.coverImage` if the trip didn't have one yet.
4. Trip cards on the dashboard show `coverImage`. Clicking a card opens `/trips/:id`, which shows the full trip plus a photo grid of everything in `trip.photos[]`, with an "+ Add Photo" button to upload more.
5. Uploads are capped at 5MB and restricted to image mimetypes by the `upload.js` middleware; both multer errors and Cloudinary errors are caught and returned as clean JSON instead of a raw 500.

**Public profiles**

1. Every user has a unique `username` (set at registration) and an optional `bio` (editable later).
2. `GET /api/users/:username/profile` is intentionally mounted without the `protect` middleware and explicitly `.select()`s only `name username bio createdAt` on the user and `title destination startDate endDate rating coverImage` on trips — email and password are structurally impossible to leak from this route.
3. `/profile/:username` in React is a public route (not wrapped in `ProtectedRoute`), so it renders correctly even in an incognito window with no token. It shows the user's name, bio, and a read-only grid of their trip cards (no Edit/Delete controls — `TripCard` takes a `readOnly` prop for this).
4. From the dashboard, "My Profile" links to the logged-in user's own public page, and "Edit Profile" opens a modal (`EditProfileForm`) that `PUT`s to `/api/users/profile` to update `username`/`bio`.

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

**Week 3**
- [x] Cloudinary account set up, credentials stored in `.env`, SDK configured (`server/middleware/upload.js`)
- [x] Multer + Cloudinary upload middleware accepts and uploads image files (5MB limit, image-only filter)
- [x] `Trip` model updated with `coverImage` (String) and `photos` (Array)
- [x] `POST /api/trips/:id/upload` — attaches Cloudinary URL to a trip, owner-only
- [x] Photo upload UI on the Create/Edit Trip form, with image preview
- [x] Cover image displayed on each trip card in the dashboard
- [x] Trip detail page (`/trips/:id`) shows all uploaded photos in a grid
- [x] `User` model updated with `username` (unique) and `bio`
- [x] `GET /api/users/:username/profile` — public, no auth, only safe fields
- [x] `/profile/:username` React page — viewable without login
- [x] "Edit Profile" option on the dashboard to update bio/username
- [x] "My Profile" link on the dashboard to the logged-in user's public page

## Testing with Postman

A ready-to-import collection is included at the repo root: `TripVault.postman_collection.json`.

1. Import it into Postman.
2. Run **Auth → Login** first (or Register, then Login) — its test script automatically saves the returned JWT into the collection's `token` variable.
3. Run **Trips → Create Trip** — its test script saves the new trip's `_id` into the `tripId` variable.
4. Run **Get All My Trips**, **Get Single Trip**, **Update Trip**, and **Delete Trip** using that same `tripId`.
5. For **Upload Trip Photo**: open the request body (form-data), click the `image` field's file picker, and select a local image before sending.
6. For **Users → Get Public Profile**: no token needed — try it with the Authorization header removed entirely to confirm it works unauthenticated. Update the URL's username to match a real registered user.
7. To verify ownership checks, log in as a second user and confirm that requesting the first user's `tripId` returns `403 Forbidden`, and that the public profile route never returns `email` or `password` for any user.

Test every route this way against the running server (`npm run dev` in `server/`) before wiring up or trusting the frontend.

## Pushing to GitHub

From the repo root:

```bash
git add .
git commit -m "Week 3: Photo uploads (Cloudinary) + public user profiles"
git push origin main
```

Per the assignment's own tip, it's fine (and often clearer) to split this into two commits:

```bash
git add server/middleware/upload.js server/models/Trip.js server/routes/trips.js client/src/api/trips.js client/src/components/TripForm.jsx client/src/components/TripCard.jsx client/src/pages/TripDetail.jsx client/src/App.jsx
git commit -m "Week 3: Photo uploads with Cloudinary"

git add server/models/User.js server/routes/users.js server/routes/auth.js client/src/api/users.js client/src/components/EditProfileForm.jsx client/src/pages/Profile.jsx client/src/pages/Register.jsx client/src/pages/Dashboard.jsx
git commit -m "Week 3: Public user profiles"

git push origin main
```

(Use whatever branch name your team is working from if it isn't `main`.)

## Best Practices Followed

- `.env` excluded via `.gitignore` in both `client/` and `server/`
- Passwords hashed with bcrypt before storage, never returned in API responses
- JWT signed with a secret from environment variables
- Cloudinary credentials stored in `.env` only, never hardcoded or committed
- Public profile route uses explicit `.select()` allowlists, never a blocklist, to keep sensitive fields out
- File uploads size-limited and filtered to image mimetypes before reaching Cloudinary
- Test APIs with Postman before wiring up the frontend
- Trip ownership enforced server-side on every read/update/delete, not just in the UI
