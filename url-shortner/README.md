# URL Shortener

A simple URL shortener built with React, Express, and MongoDB.

## Features

- Enter long URL
- Generate short URL
- Redirect to original URL
- View click count
- User management backed by `server/data/user.json`

## Setup

1. Install dependencies:
   - `npm install`
   - `npm install --prefix client`
2. Start the app:
   - `npm run dev`
3. Open `http://localhost:3000`

## Notes

- Backend uses MongoDB for URL storage.
- Users are stored in `server/data/user.json`.
- Short links redirect via `/r/:code`.
