<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Hosted%20on-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

<h1 align="center">TestCase Tracker</h1>

<p align="center">
  A minimalist checklist-based test case tracker.<br>
  Organize tests into categories, track pass/fail status with a single click, and sync everything automatically to PostgreSQL.
</p>

<p align="center">
  <strong>→ <a href="https://testcase-tracker.vercel.app">testcase-tracker.vercel.app</a> ←</strong>
</p>

---

## Features

- **Passwordless auth** — register with just a username, no email or password needed
- **Category-based organization** — group test cases into custom categories (Feature, Unit, API, etc.)
- **One-click tracking** — check/uncheck tests, auto-saves instantly
- **Live search** — filter categories in real-time
- **Full CRUD** — add/delete categories and individual test items
- **Export / Import** — download your test data as JSON or restore from a backup
- **Reset all** — clear every checkbox in one click

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│           (vanilla HTML / CSS / JS)                  │
└──────────────────┬──────────────────────────────────┘
                   │  HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│                    Vercel                             │
│           (serverless — api/index.js)                 │
│                                                       │
│    ┌─────────────────────────────────────────────┐    │
│    │         Express (Node.js)                   │    │
│    │    api/auth  api/data  api/export  static    │    │
│    └─────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────┘
                   │  TLS
                   ▼
┌─────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                    │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│    │ profiles │→│categories│→│  items   │         │
│    └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Hosting** | [Vercel](https://vercel.com) (serverless functions) |
| **Runtime** | Node.js 18+ |
| **Framework** | [Express](https://expressjs.com) |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) |
| **ORM / Schema** | [Prisma](https://prisma.io) |
| **Query library** | [postgres](https://github.com/porsager/postgres) |
| **Frontend** | HTML + CSS + vanilla JavaScript |
| **Auth** | Username + token (passwordless) |

---

## Database Schema

Three normalized tables with cascade deletes:

<p align="center">
<pre>
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  profiles   │       │  categories  │       │    items    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id • UUID   │──┐    │ id • UUID    │──┐    │ id • UUID   │
│ username    │  │    │ name         │  │    │ name        │
│ token       │  │    │ profile_id   │◄─┘    │ checked     │
│ created_at  │  │    │ created_at   │       │ category_id │◄─┘
└─────────────┘  │    └──────────────┘       │ created_at  │
                 │    UNIQUE(profile_id,      └─────────────┘
                 │           name)            UNIQUE(category_id,
                 │                                  name)
                 └── ON DELETE CASCADE ──────── ON DELETE CASCADE
</pre>
</p>

Managed via Prisma — run `npm run db:push` to sync.

---

## Project Structure

```
.
├── api/
│   └── index.js              # Vercel serverless entry point
│
├── src/
│   ├── app.js                # Express app (middleware + routes + static)
│   ├── config/
│   │   └── db.js             # PostgreSQL connection
│   ├── models/
│   │   ├── Profile.js        # User queries
│   │   ├── Category.js       # Category queries
│   │   ├── Item.js           # Item queries
│   │   ├── Data.js           # Combined fetch/replace operations
│   │   └── seed.js           # Default seed data + token generator
│   └── routes/
│       ├── auth.js           # POST /api/auth/register, /login
│       ├── data.js           # GET/PUT /api/data
│       └── export.js         # GET /api/export, POST /api/import
│
├── public/
│   ├── index.html            # SPA shell
│   ├── style.css             # All styling
│   └── js/
│       ├── auth.js           # Auth UI logic
│       └── app.js            # Dashboard + CRUD + export/import
│
├── server.js                 # Local dev (npm start)
├── vercel.json               # Vercel deployment config
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── prisma.config.ts          # Prisma v7 config
├── package.json
├── .env                      # DATABASE_URL, DIRECT_URL
└── .env.example              # Template for environment variables
```

---

## API Reference

All endpoints return JSON.

### Auth

```
POST /api/auth/register
POST /api/auth/login
```

**Request body:**

```json
{ "username": "your-name" }
```

**Response (200):**

```json
{ "username": "your-name", "token": "a1b2c3d4..." }
```

> The token is stored in `sessionStorage` and sent as the `Authorization` header on subsequent requests.

### Data

```
GET  /api/data          →  { "username": "...", "data": { ... } }
PUT  /api/data          →  { "success": true }
```

**PUT body:**

```json
{
  "data": {
    "Feature": {
      "User can login": true,
      "User can register": false
    },
    "API": {
      "GET /users": true
    }
  }
}
```

### Export / Import

```
GET  /api/export        →  JSON file download
POST /api/import        →  { "success": true }
```

**Import body:**

```json
{
  "data": {
    "Feature": { "User can login": true }
  }
}
```

> Registration automatically seeds 5 default categories (Feature, Unit, API, Browser, Security) with sample test items.

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Supabase](https://supabase.com))

### Setup

```bash
# Clone the repository
git clone https://github.com/AliQassim2/testcase-tracker.git
cd testcase-tracker

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"
```

```bash
# Sync the database schema
npm run db:push

# Start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

### Hosting: Vercel

The app is deployed as a Vercel serverless function.

1. Push your repository to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add these environment variables in your Vercel project settings:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Supabase pooled connection string (port **6543**) |
   | `DIRECT_URL` | Supabase direct connection string (port **5432**) |

4. Deploy — `vercel.json` handles the routing automatically

**Live at:** [https://testcase-tracker.vercel.app](https://testcase-tracker.vercel.app)

### Database: Supabase

The app uses Supabase for PostgreSQL with two connection modes:

- **Pooled** (`DATABASE_URL`, port 6543) — used at runtime by the `postgres` library for running queries
- **Direct** (`DIRECT_URL`, port 5432) — used by Prisma for schema migrations (`npx prisma db push`)

Run migrations locally after deployment:

```bash
npm run db:push
```

---

<p align="center">
  Built with Node.js, Express, Supabase &amp; Vercel.
</p>
