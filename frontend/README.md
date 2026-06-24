# Flixxit Frontend

React frontend for the Flixxit movie streaming-style app.

## Stack

- React 19
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios

## Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, set `VITE_API_URL` to the deployed backend API URL.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Auth Notes

- Login and signup normalize email before calling the API.
- Form errors are shown inline.
- Protected pages require a stored auth token.
- The Axios interceptor refreshes expired access tokens through the backend refresh endpoint.

## Movie UI Notes

- Homepage rows are loaded through Redux.
- Search suggestions use already-loaded rows while typing to reduce API usage.
- Full search runs when the user presses Enter.
- Poster URLs are resolved through `src/utils/posterUrl.js`.
