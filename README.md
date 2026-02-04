# Rodeo Connect

## Project Overview

A centralized directory and event discovery platform for Western Sports (Rodeo, Bull Riding, etc.) in North America.

## Documentation

- **Product Requirements:** [PRD.md](docs/PRD.md)
- **Database Schema:** [SCHEMA.md](docs/SCHEMA.md)
- **Design System:** [Figma File](See Project Config)

## Quick Start

1. **Install:** `npm install`
2. **Env:** Copy `.env.example` to `.env.local` and fill in Supabase keys.
3. **Run:** `npm run dev`
4. **Tasks:** Run `bd ready` to see available tasks.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (client safe)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox public token
- `NEXT_PUBLIC_APP_URL` - Base app URL (used for metadata)

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Maps:** Mapbox GL JS
