# Entra ID Insights Dashboard

A full-stack employee portal that integrates with **Microsoft 365** using
**Microsoft Entra ID (Azure AD)** for authentication and the **Microsoft Graph API**
to surface organizational data — including user profiles, calendar events, emails,
Teams activity, and department directory listings.

---

## Tech Stack

| Layer        | Technology                                       |
|--------------|--------------------------------------------------|
| Frontend     | React 19 + Vite 6 + TypeScript                   |
| Styling      | Tailwind CSS + shadcn/ui                         |
| Auth (FE)    | MSAL.js (`@azure/msal-browser`, `@azure/msal-react`) |
| Backend      | Node.js 22 + Express 5                           |
| Auth (BE)    | `@azure/msal-node`                               |
| API          | Microsoft Graph API v1.0                         |

---

## Prerequisites

- **Node.js 18 or higher** (v22 recommended) — [nodejs.org](https://nodejs.org)
- **npm 9 or higher** (included with Node.js)
- **Microsoft 365 Developer account** — [developer.microsoft.com/microsoft-365](https://developer.microsoft.com/en-us/microsoft-365/dev-program)
- An **Azure App Registration** in your Microsoft Entra ID tenant with:
  - Redirect URI set to `http://localhost:5173` (SPA type)
  - API permissions: `User.Read`, `Calendars.Read`, `Mail.Read`, `offline_access`
  - A client secret created for server-side calls

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/ms365-employee-portal.git
cd ms365-employee-portal
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Azure App Registration values (see [Environment Variables](#environment-variables) below).

### 3. Install client dependencies

```bash
cd client
npm install
```

### 4. Install server dependencies

```bash
cd ../server
npm install
```

### 5. Start the development servers

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

| Variable         | Description                                                                      |
|------------------|----------------------------------------------------------------------------------|
| `TENANT_ID`      | Your Microsoft Entra ID tenant ID (Azure Portal > Overview)                     |
| `CLIENT_ID`      | Application (client) ID from your Azure App Registration                        |
| `CLIENT_SECRET`  | Client secret from Azure Portal > App Registrations > Certificates & Secrets    |
| `PORT`           | Port for the Express server (default: `5000`)                                   |
| `CLIENT_URL`     | Vite dev server URL for CORS (default: `http://localhost:5173`)                 |
| `VITE_TENANT_ID` | Same as `TENANT_ID` — exposed to the browser bundle by Vite                    |
| `VITE_CLIENT_ID` | Same as `CLIENT_ID` — exposed to the browser bundle by Vite                    |

> **Security note:** Never commit `.env` to version control. It is listed in `.gitignore`.

---

## Project Structure

```
ms365-employee-portal/
├── client/                      React + Vite frontend
│   ├── src/
│   │   ├── main.tsx             Entry point — MSAL provider setup
│   │   ├── App.tsx              Root application component
│   │   ├── index.css            Global styles + shadcn/ui CSS variables
│   │   └── vite-env.d.ts        Vite + custom env variable types
│   ├── index.html               HTML entry point
│   ├── vite.config.ts           Vite config — @ alias + API proxy
│   ├── tailwind.config.js       Tailwind CSS + shadcn/ui theme tokens
│   ├── tsconfig.json            TypeScript project references
│   ├── tsconfig.app.json        Browser app TypeScript config
│   └── tsconfig.node.json       Vite config TypeScript config
│
├── server/                      Node.js + Express backend
│   └── src/
│       ├── index.js             Server entry point
│       ├── routes/
│       │   └── graphRoutes.js   Microsoft Graph API route definitions
│       ├── controllers/
│       │   └── graphController.js  Graph API request handlers
│       └── middleware/
│           └── authMiddleware.js   MSAL OBO token acquisition
│
├── .env.example                 Environment variable template
├── .gitignore                   Git ignore rules
└── README.md                    This file
```

---

## License

MIT License — Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
