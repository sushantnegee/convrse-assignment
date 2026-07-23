# Sales Kiosk Application

A two-device kiosk for real-estate sales executives: an **executive** device drives Gallery / Videos / Inventory, and a **display** device mirrors every action in real time. See `PLAN.md` (or the conversation this was built from) for the full architecture — this file covers setup and current status.

> Status: all 6 build stages complete — scaffold/schema/seed, backend APIs with atomic booking, Gallery/Videos, Inventory (tower + SVG overlay + booking), loading/error/validation polish, and the realtime mirroring + live inventory sync layer.

## Stack

- Frontend: React + Vite + Tailwind + Framer Motion
- Backend: Node.js + Express + Socket.IO (persistent process — required for WebSockets)
- Database: PostgreSQL, accessed via Prisma (with a raw-SQL transaction for the atomic booking path)

## Project layout

```
backend/    Express API + Socket.IO + Prisma schema/migrations/seed
frontend/   Vite React app — /executive and /display routes
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, PUBLIC_BASE_URL, etc.
npm run prisma:deploy  # applies migrations (no shadow DB required)
npm run prisma:seed    # seeds one demo project, 2 towers, 20 units, gallery + videos
npm run dev            # starts the API on http://localhost:4000
```

`DATABASE_URL` must point at a real Postgres instance (Render/Railway/Neon/Supabase all work). `PUBLIC_BASE_URL` is used only by the seed script to build absolute URLs for the generated tower images.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL should point at the backend above
npm run dev             # http://localhost:5173
```

Open `http://localhost:5173/executive?projectId=<id>` on the executive's device and `http://localhost:5173/display?projectId=<id>` on the display device, using the same `<id>` on both (get it from `GET /api/projects/:id`, the seed script's DB row, or wherever the external project-picker app redirects from). Every screen-mirroring and inventory-sync feature requires **the same `projectId` on both URLs** — that's what pairs them.

## Seed data

The seed script (`backend/prisma/seed.ts`) is fully re-runnable (`npm run prisma:seed`) — it wipes and recreates one project ("Skyline Residences") with:
- 8 gallery images (placeholder stock photos) and 3 short sample videos, self-hosted under `backend/public/assets/videos/` and served via `express.static` — deliberately **not** linked to an external sample-video bucket, since the one originally used for placeholders started returning 403 mid-build with no warning. Self-hosting removes that risk for the deployed app and for grading.
- 2 towers, each rendered as a generated SVG "elevation" (`backend/public/assets/towers/*.svg`) with unit polygons authored against the exact same coordinate grid, so hover/click hit areas line up precisely without needing real tower photography
- 20 units total, one pre-booked to demonstrate the "Booked" state out of the box

## Atomic booking (the core guarantee)

Booking is enforced at the database layer via two independent Postgres mechanisms, not application logic:
1. A conditional `UPDATE units SET status = 'booked' WHERE id = $1 AND status = 'available'` — a single statement, so Postgres's row-level lock makes the check-and-flip atomic; a losing concurrent request matches zero rows.
2. A `UNIQUE` constraint on `bookings.unit_id` as a second, independent guarantee against double-booking.

Both run inside one transaction with the booking insert, so there's never an orphaned unit-status flip without a matching booking row.

## Realtime layer

Two independent Socket.IO channels, both namespaced by `projectId`:

- **Mirroring** (`mirror:{projectId}`) — the executive is the only emitter. Every `dispatch()` call on the executive both updates its own local state and emits the resulting full `SessionState` to the server, which relays it to any connected display and caches it in memory. A display that connects (or reconnects) mid-session immediately receives a `mirror:sync` snapshot instead of starting blank. The display never dispatches or emits anything — every interactive callback on its components is a no-op; it only ever renders what it's sent.
- **Inventory sync** (`inventory:{projectId}`) — *every* connected viewer of a project (executive, display, or any other browser tab) joins this room and receives `unit:booked` broadcasts, so a booking made anywhere updates everyone without a refresh. This is separate from mirroring on purpose: two people should see live inventory even if they're not the paired executive/display.

Known limitation: the display's video mirroring plays muted, since browsers block programmatic unmuted autoplay on a device with no prior user gesture — reasonable for a showroom display screen, which isn't expected to carry audio anyway.
