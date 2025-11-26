# Nepal Gen Z — React (Vite)

This repo is a Vite + React migration of the original static site. The original CSS was preserved exactly in `src/index.css`.

Quick start:

```bash
npm install
npm run dev
```

Notes:
- Global styles are in `src/index.css` (copied verbatim from `styles.css`).
- Images remain referenced from `/images/...` to preserve CSS urls and layout.
- Mock API calls are in `src/services/api.js`.

Backend (optional):
This repo includes a small Express backend in `server/` that provides endpoints for contact submissions, gallery listing/upload, and movements persistence.

To run the backend:

```bash
npm install
npm run server
# or for development auto-reload:
npm run dev:server
```

Endpoints:
- `POST /contact` — accepts JSON {name,email,message}
- `GET /gallery` — returns {images:[...]} combining sample images and uploaded files
- `POST /upload` — multipart form upload (field `file`), returns {ok:true,url}
- `GET /movements` — returns persisted movements
- `POST /movements` — accepts JSON movement {title,year,note} and persists it

If you run both frontend (`npm run dev`) and backend (`npm run server`) locally, update `src/services/api.js` to point to the backend URLs (or run the frontend on the same origin proxy). For quick testing the frontend still uses localStorage-based mocks.
