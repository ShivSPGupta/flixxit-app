# Flixxit

Flixxit is a full-stack Netflix-style movie app built with React, Redux Toolkit, Express, MongoDB, TMDb, and the YouTube Data API. It includes authentication, movie browsing, cached TMDb data, trailer lookup, search, profile management, and a responsive streaming-style UI.

## Features

- JWT authentication with access and refresh tokens
- Login and signup forms with inline validation, normalized emails, and protected routes
- TMDb-powered movie rows, search, details, posters, ratings, genres, cast, and metadata
- Backend TMDb caching with memory cache plus MongoDB `TmdbCache`
- YouTube trailer lookup with memory cache plus MongoDB `TrailerCache`
- Request validation middleware for auth, movie, and favorites APIs
- Centralized backend 404 and error handling
- Trending banner with TMDb trending-first and popular fallback behavior
- Movie detail fallback UI using cached/navigation data when TMDb is temporarily unavailable
- Movie rows for trending, action, Marvel, Batman, comedy, horror, romance, sci-fi, documentary, and thriller
- Search page with backend cache-first TMDb search
- Quota-safe search bar suggestions from already-loaded Redux rows
- My List favorites stored in MongoDB
- Profile page with display name, avatar, member-since account details, and inline update feedback
- Responsive navbar, search suggestions, banner, rows, cards, and detail page

## Tech Stack

### Frontend

- React 19
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Centralized error middleware
- Route-level validation middleware
- Helmet
- Express rate limiting

### External APIs

- TMDb API for movie data
- TMDb image CDN for posters
- YouTube Data API for trailers

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
frontend/
  public/
  src/
    api/
    components/
    pages/
    redux/
    utils/
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
TMDB_API_KEY=your_tmdb_api_key
YOUTUBE_API_KEY=your_youtube_api_key
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
NODE_ENV=development
TRUST_PROXY=1
```

Optional debugging:

```env
DEBUG_TMDB=true
DEBUG_LOGS=movies,tmdb
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, set `VITE_API_URL` to your deployed backend API URL.

## Local Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
GET /health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## API Overview

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/update-email
PUT  /api/auth/update-password
PUT  /api/auth/update-profile
DELETE /api/auth/delete-account
```

### Movies

```text
GET /api/movies/row/:keyword?page=1
GET /api/movies/search?query=mortal%20kombat
GET /api/movies/search/:query
GET /api/movies/detail/:id
GET /api/movies/trailer/:title
```

### Favorites

```text
GET    /api/user/list
POST   /api/user/list
DELETE /api/user/list/:imdbID
```

## Backend Architecture

Backend requests follow a route-first architecture:

```text
route -> auth middleware -> validation middleware -> controller -> service/util -> response
```

Validation is centralized in:

```text
backend/middleware/validate.js
```

It validates and normalizes:

```text
auth payloads
movie route params and query params
favorites payloads and params
```

Unexpected backend errors are handled by:

```text
backend/middleware/errorHandler.js
```

Unknown routes return a consistent `404` response, and production server errors hide stack traces.

Each request receives an `x-request-id` through `backend/utils/requestContext.js`. Debug logs use this request id so controller and TMDb utility logs can be traced together.

## Caching Behavior

### TMDb Cache

TMDb data is cached in two layers:

```text
memory cache -> MongoDB TmdbCache -> TMDb API
```

Cache TTLs:

```text
search: 12 hours
movie detail: 7 days
trending row: 30 minutes
category rows: 6 hours
```

Empty search and row responses are ignored as usable cache, so a temporary empty response should not block fresh data later.

### Trailer Cache

YouTube trailer keys are cached in two layers:

```text
memory cache -> MongoDB TrailerCache -> YouTube API
```

Trailer cache behavior:

```text
successful trailer key in memory: 7 days
successful trailer key in MongoDB: 30 days
negative no-trailer result in memory: 10 minutes
network/quota/server failures: not cached as no-trailer
```

Trailer cache is shared for all users and keyed by normalized movie title.

## Movie Data Flow

Homepage category rows are defined in `frontend/src/pages/Home.jsx`.

Each `Row` component dispatches:

```js
getMovieRow({ keyword })
```

The backend handles:

```text
GET /api/movies/row/:keyword
```

`trending` uses:

```text
TMDb /trending/movie/week first
TMDb /movie/popular fallback
```

Other genre rows use TMDb discover/search logic in `backend/utils/tmdbApi.js`.

## Movie Detail Behavior

Movie detail pages are loaded through:

```text
GET /api/movies/detail/:id
```

The backend detail flow is:

```text
memory detail cache
MongoDB TmdbCache detail cache
TMDb /movie/:id
stale detail cache if TMDb is temporarily failing
cached row/search summary fallback
```

After TMDb detail data is loaded, the backend looks up the trailer key through YouTube:

```text
memory trailer cache
MongoDB TrailerCache
YouTube Data API
```

The frontend also passes basic movie data during navigation from cards, banner, search results, and My List. If the detail API temporarily fails, `MovieDetail.jsx` can still show a limited cached detail page instead of a broken screen.

## Search Behavior

The search bar is designed to reduce TMDb quota usage.

While typing:

```text
searches already-loaded Redux rows only
no backend request
no TMDb request
```

On Enter:

```text
opens /search?q=...
calls backend search once
backend checks cache first
TMDb is called only on cache miss
```

Multi-word searches are handled through the query-string endpoint:

```text
GET /api/movies/search?query=mortal%20kombat
```

Backend search can also retry fallback terms for multi-word queries when TMDb has a transient network issue.

## Auth Behavior

Authentication is handled with Redux Toolkit on the frontend and JWT on the backend.

Frontend behavior:

```text
login/register normalize email before sending
stored user data is safely parsed from localStorage
broken localStorage auth data is cleared automatically
protected routes require a valid stored token
login/register errors are shown inline instead of browser alerts
profile/email/password updates use inline success and error feedback
display name is shown in the navbar account menu and profile header
```

Backend behavior:

```text
register/login/update-email trim and lowercase email
email format is validated before database queries
passwords are hashed with bcrypt
access token is returned to the frontend
refresh token is stored in an httpOnly cookie
```

The refresh endpoint is available at:

```text
POST /api/auth/refresh
```

The frontend Axios interceptor calls the refresh endpoint automatically when an authenticated request receives an expired-token response.

## Profile Behavior

Users can manage:

```text
display name
avatar URL
email address
password
account deletion
```

Profile updates are validated on the frontend and backend. Display names are limited to 40 characters and are shown in the navbar dropdown and profile header, with email as a fallback.

## Deployment Notes

### Frontend on Vercel

`frontend/vercel.json` rewrites all routes to `index.html` for React Router:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Set:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Backend on Render or Similar

Set all backend environment variables in the hosting dashboard. Make sure `CORS_ORIGIN` includes the deployed frontend domain.

Example:

```env
CORS_ORIGIN=http://localhost:5173,https://your-vercel-app.vercel.app
```

## Useful Commands

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend build:

```bash
cd frontend
npm run build
```

Frontend dev server:

```bash
cd frontend
npm run dev
```

`frontend/vite.config.js` pins local dev to `localhost:5173` and configures Vite HMR WebSocket settings for local development. This only affects `npm run dev`; production builds do not use Vite HMR.

Backend start:

```bash
cd backend
npm start
```

Backend dev:

```bash
cd backend
npm run dev
```

## Known Notes

- TMDb API requests are cached, but TMDb poster images load from the TMDb image CDN.
- Poster image loading does not consume normal TMDb API query quota.
- Some networks may block specific TMDb or YouTube endpoints.
- YouTube Data API quota can be limited, so trailer keys are cached aggressively.
- Chrome may still show a red `503` network entry if TMDb is unreachable, but the UI can fall back to cached/basic movie data when available.
- Vite WebSocket/HMR messages are development-only and do not affect production builds.
- If stale movie rows show old poster URLs, clear the `tmdbcaches` collection or wait for TTL expiry.

## Author

Shiv Shankar Gupta

- GitHub: [@ShivSPGupta](https://github.com/ShivSPGupta)
- LinkedIn: [Shiv Shankar Gupta](https://linkedin.com/in/shiv-shankar-gupta)
- Portfolio: [Portfolio](https://my-portfolio-six-azure-30.vercel.app/)
