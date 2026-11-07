# CivicConnect - Bridging Communities with Local Government

CivicConnect is a full-stack web application that connects citizens with local authorities. Users can report civic issues like waste management, road damage, or water leakage with descriptions, images, and real-time location. Officials can monitor, manage, and resolve these issues via an admin dashboard.

## Features
- Submit civic complaints with descriptions, images, and location
- Admin dashboard to monitor and resolve complaints
- Role-based access for citizens and administrators
- Analytics dashboard to track issue resolution
- Responsive design for desktop and mobile

## Technologies Used
- Frontend: React.js, HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Image storage: complaint photo data URLs (Cloudinary is not configured in this repository)
- Routing: React Router
- State Management: React Hooks

## Installation
1. Clone the repository:
```bash
git clone https://github.com/Rohan-Codes702/Civic_Connect.git
cd CivicConnect
```

## Production deployment

The repository contains two independent deployable services:

```text
client/                 Vite + React static site
  public/_redirects     Render SPA fallback
server/                 Express + Mongoose web service
  src/index.js          Backend entry point
render.yaml             Optional Render Blueprint for both services
```

The Render error `ENOENT ... /opt/render/project/src/package.json` means the
service was created with the repository root as its root directory. Either use
the root directories and commands below, or create both services from
`render.yaml`.

### Render frontend (Static Site)

- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-backend>.onrender.com/api`

In the Render dashboard, set **Root Directory** to `client`. Do not use the
repository root for this service.
The client also normalizes a backend URL without `/api`, but setting the full
`/api` URL explicitly is recommended. Redeploy the static site after changing
this variable because Vite embeds it at build time.

### Render backend (Web Service)

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_URL/CivicConnect`
  - `JWT_SECRET=<long-random-secret>`
  - `CLIENT_URL=https://civic-connect-1-8ieg.onrender.com,http://localhost:5173`
  - Node version: 18 or newer

In the Render dashboard, set **Root Directory** to `server`. Do not use the
repository root for this service.

`CLIENT_URL` may contain a comma-separated list when multiple frontend origins
must be allowed. The MongoDB Atlas user must have access to the
`CivicConnect` database and Atlas network access must allow the Render service.
Never commit a `.env` file or credentials.
