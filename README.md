# Entra ID Insights Dashboard

A full-stack employee portal that integrates with **Microsoft 365** using
**Microsoft Entra ID (Azure AD)** for authentication and the **Microsoft Graph API**
to surface organizational data — including user profiles, calendar events,
tasks (To Do & Planner), and department directory listings.

---

## Features

- **Dashboard** — At-a-glance view of your profile, upcoming events, and pending tasks
- **Profile Card** — Displays your MS365 profile info and photo
- **Calendar Events** — Next 10 upcoming events from Outlook calendar
- **My Tasks** — Unified view of incomplete tasks from Microsoft To Do and Planner, with source badges, due dates, importance levels, and progress bars
- **Directory** — Browse and search all users in your tenant with detail panel
- **Settings** — Session info and app details
- **Dark/Light Theme** — Toggle via sidebar

---

## Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Frontend     | React 19 + Vite 6 + TypeScript                      |
| Styling      | Tailwind CSS + shadcn/ui + Radix UI                  |
| Auth (FE)    | MSAL.js (`@azure/msal-browser`, `@azure/msal-react`) |
| Backend      | Node.js 18+ + Express 4                              |
| Auth (BE)    | `@azure/msal-node` (On-Behalf-Of flow)               |
| API          | Microsoft Graph API v1.0                              |

---

## Prerequisites

- **Node.js 18 or higher** — [nodejs.org](https://nodejs.org)
- **npm 9 or higher** (included with Node.js)
- **Microsoft 365 Developer account** — [developer.microsoft.com/microsoft-365](https://developer.microsoft.com/en-us/microsoft-365/dev-program)
- An **Azure App Registration** in your Microsoft Entra ID tenant with:
  - Redirect URI set to `http://localhost:5173` (SPA type)
  - An **Expose an API** scope: `api://<CLIENT_ID>/access_as_user`
  - API permissions (Delegated):
    - `User.Read` — User profile and photo
    - `Calendars.Read` — Calendar events
    - `Tasks.Read` — Microsoft To Do tasks
    - `Group.Read.All` — Planner tasks
  - A client secret created for server-side OBO calls
  - Admin consent granted for the above permissions

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/JD117parra/ms365-employee-portal.git
cd ms365-employee-portal
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Azure App Registration values (see [Environment Variables](#environment-variables) below).

### 3. Install dependencies

```bash
# Client
cd client
npm install

# Server
cd ../server
npm install
```

### 4. Start the development servers

```bash
# Terminal 1 — Express backend
cd server
npm run dev

# Terminal 2 — Vite frontend
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

---

## Environment Variables

Copy `.env.example` to `.env` at the project root and populate each variable:

| Variable         | Description                                                                   |
|------------------|-------------------------------------------------------------------------------|
| `TENANT_ID`      | Your Microsoft Entra ID tenant ID                                            |
| `CLIENT_ID`      | Application (client) ID from your Azure App Registration                     |
| `CLIENT_SECRET`  | Client secret from Certificates & Secrets                                    |
| `PORT`           | Port for the Express server (default: `5000`)                                |
| `CLIENT_URL`     | Vite dev server URL for CORS (default: `http://localhost:5173`)              |
| `VITE_TENANT_ID` | Same as `TENANT_ID` — exposed to the browser bundle by Vite                 |
| `VITE_CLIENT_ID` | Same as `CLIENT_ID` — exposed to the browser bundle by Vite                 |

> **Security note:** Never commit `.env` to version control. It is listed in `.gitignore`.

---

## API Endpoints

All endpoints require a valid Bearer token and are prefixed with `/api/graph`.

| Method | Endpoint              | Description                                  |
|--------|-----------------------|----------------------------------------------|
| GET    | `/me`                 | Authenticated user's profile                 |
| GET    | `/me/photo`           | User's profile photo (base64)                |
| GET    | `/me/events`          | Upcoming calendar events (top 10)            |
| GET    | `/me/tasks`           | Pending tasks from To Do + Planner           |
| GET    | `/users`              | List tenant users (top 50, supports `?search=`) |
| GET    | `/users/:id`          | Specific user's profile                      |
| GET    | `/users/:id/photo`    | Specific user's photo (base64)               |

---

## Project Structure

```
ms365-employee-portal/
├── client/                          React + Vite frontend
│   ├── src/
│   │   ├── main.tsx                 Entry point — MSAL provider setup
│   │   ├── App.tsx                  Root component + page routing
│   │   ├── index.css                Global styles + CSS variables
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          Navigation + user info + theme toggle
│   │   │   ├── ProfileCard.tsx      User profile display
│   │   │   ├── EventsList.tsx       Upcoming calendar events
│   │   │   ├── TasksList.tsx        To Do + Planner tasks
│   │   │   ├── Directory.tsx        User directory with search
│   │   │   └── SettingsPage.tsx     Session and app settings
│   │   └── hooks/
│   │       └── useGraphData.ts      Graph API data fetching hook
│   ├── index.html
│   ├── vite.config.ts               Vite config — API proxy + aliases
│   ├── tailwind.config.js           Tailwind + shadcn/ui theme
│   └── tsconfig*.json               TypeScript configs
│
├── server/                          Node.js + Express backend
│   └── src/
│       ├── index.js                 Server entry — security + CORS + rate limiting
│       ├── routes/
│       │   └── graphRoutes.js       Graph API route definitions
│       ├── controllers/
│       │   └── graphController.js   Graph API request handlers
│       └── middleware/
│           └── authMiddleware.js    MSAL On-Behalf-Of token acquisition
│
├── .env.example                     Environment variable template
├── .gitignore
└── README.md
```

---

## License

MIT License — Copyright (c) 2026
