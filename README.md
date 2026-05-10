# TestCase Tracker

A checklist-based test case tracker with username-only auth, auto-save checkboxes, and PostgreSQL persistence. Organize tests into categories, track pass/fail status, and sync everything automatically.

## Features

- **Username-based auth** — no password needed; just register with a name
- **Category management** — create/delete test categories (Feature, Unit, API, etc.)
- **Checkbox tracking** — mark tests as passing/failing with auto-save
- **Search** — filter categories by name
- **Export/Import** — download your data as JSON or restore it later
- **Reset all** — clear all checkboxes at once

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
| Schema | Prisma ORM |
| Frontend | Vanilla HTML, CSS, JS |
| Runtime query | [postgres](https://github.com/porsager/postgres) library |

## Project Structure

```
.
├── api/
│   └── index.js           # Vercel serverless entry — re-exports Express app
├── src/
│   ├── app.js             # Express app setup (middleware + routes)
│   ├── config/
│   │   └── db.js          # PostgreSQL connection (postgres library)
│   ├── models/
│   │   ├── Profile.js     # Profile DB queries (find, create)
│   │   ├── Category.js    # Category DB queries (get, create, delete)
│   │   ├── Item.js        # Item DB queries (upsert, delete, seed)
│   │   ├── Data.js        # Combined fetch/replace for profile data
│   │   └── seed.js        # Default seed data + token generator
│   └── routes/
│       ├── auth.js        # POST /api/auth/register, /api/auth/login
│       ├── data.js        # GET/PUT /api/data
│       └── export.js      # GET /api/export, POST /api/import
├── public/
│   ├── index.html         # Single-page app
│   ├── style.css          # Styling
│   └── js/
│       ├── auth.js        # Auth UI + login/register logic
│       └── app.js         # Dashboard, CRUD, export/import
├── server.js              # Local dev entry — starts Express on port 3000
├── prisma/
│   └── schema.prisma      # Database schema (Profile → Category → Item)
├── prisma.config.ts       # Prisma v7 config
├── package.json
└── .env                   # DATABASE_URL, DIRECT_URL
```

## Database Schema

Three normalized tables managed via Prisma:

```
profiles → categories → items
  id          id           id
  username    name         name
  token       profile_id   checked
  created_at  created_at   category_id
                           created_at
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase connection strings

# 3. Sync database schema
npm run db:push

# 4. Start server
npm start
```

Open `http://localhost:3000` in your browser.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account (username only) |
| POST | `/api/auth/login` | Login (returns token) |
| GET | `/api/data` | Fetch user's categories + items |
| PUT | `/api/data` | Save categories + items |
| GET | `/api/export` | Download data as JSON |
| POST | `/api/import` | Restore data from JSON |

Registration seeds 5 default categories (Feature, Unit, API, Browser, Security) with sample test items.

## Deployment

### Vercel (recommended)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub and import your repo in Vercel
2. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` — your Supabase pooled connection string (port 6543)
   - `DIRECT_URL` — your Supabase direct connection string (port 5432)
3. Deploy — Vercel auto-detects `api/index.js` as the serverless entry
4. Run `npm run db:push` locally (or via Vercel CLI) to sync the schema

### Traditional server

Requires PostgreSQL. [Supabase](https://supabase.com) is recommended — use the pooled URL for runtime and direct URL for migrations.

```bash
npm install
cp .env.example .env   # fill in your DB credentials
npm run db:push         # sync schema
npm start               # starts on port 3000
```
