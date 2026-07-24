# Sales Kiosk Application

A two-device kiosk for real-estate sales executives. An **executive** device (tablet, held by the sales person) drives three screens — Gallery, Videos, and Inventory — while a paired **display** device (the screen facing the customer) mirrors every action in real time: the same tab, the same open image, the same playing video, the same selected unit, the same booking dialog, even the same scroll position and pointer location. The display has zero local control of its own — it only ever moves because the executive moved.

> Status: all Must Have requirements complete — Gallery/Videos/Inventory, backend APIs + Postgres, real-time inventory sync, cross-device mirroring, atomic booking, loading/error states — plus several additions beyond the stated scope (see **Beyond the Scope** below).

## Live URL

- **Live deployed URL:** _TODO — not yet deployed, see "Deployment" below._
- **Demo video:** _TODO_

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + Framer Motion, `react-router-dom` for `/executive` and `/display` routes.
- **Backend:** Node.js + Express + Socket.IO, one persistent process (required for WebSockets — rules out serverless hosts like plain Vercel functions).
- **Database:** PostgreSQL via Prisma for schema/migrations/reads; the booking mutation specifically drops to a raw parameterized SQL statement inside a transaction so the atomic-booking mechanism is transparent, not hidden behind ORM magic.
- **Realtime:** `socket.io` / `socket.io-client`, two independent room families (see Architecture).

## Project Layout

```
backend/
  prisma/
    schema.prisma        Projects, gallery images, videos, towers, units, bookings
    seed.ts              Parses real tower photos + hand-traced SVG overlays, seeds one demo project
  src/
    routes/               REST endpoints (projects, gallery, videos, inventory, bookings)
    sockets/               Socket.IO room logic (mirroring + inventory sync)
    middleware/            Validation, error handling
  public/assets/
    towers/                 Real tower photos + unit-polygon SVG overlays
    videos/                  Self-hosted project videos

frontend/
  src/
    pages/                  ExecutivePage.jsx (drives state) / DisplayPage.jsx (pure consumer)
    components/
      gallery/, videos/, inventory/, layout/, splash/, common/
      Each interactive screen has a shared component (an `interactive` prop) or a parallel
      Mirror*View.jsx that reuses the same sub-components with every callback wired to a no-op.
    hooks/                  useMirrorEmitter, useMirrorReceiver, useScrollMirror, usePointerEmitter,
                            useInventoryLive, useTowers/useUnits/useGallery/useVideos (data fetching)
    state/
      sessionState.js       The single mirrored session-state shape + reducer (see Architecture)
    socket/                 socket.io-client singleton
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in DATABASE_URL at minimum
npm run prisma:deploy     # applies migrations (no shadow DB required, safe for managed Postgres)
npm run prisma:seed       # seeds one demo project: 2 towers, 28 units, 8 gallery images, 3 videos
npm run dev               # http://localhost:4000
```

`DATABASE_URL` must point at a real Postgres instance (Render/Railway/Neon/Supabase all work — this project was built against a Render-managed Postgres). `PUBLIC_BASE_URL` is only used by the seed script, to build absolute URLs for the tower photos and self-hosted videos it writes into the database — change it if you reseed against a different host (e.g. your LAN IP for two-device testing, or your deployed backend's URL).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_BASE_URL should point at the backend above
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173/executive?projectId=<id>` on the executive's device and `http://localhost:5173/display?projectId=<id>` on the display device, using **the same `<id>` on both** — that shared id is what pairs them into one mirrored session. Get the id from `GET /api/projects/:slug` equivalent, the seed script's console output / DB row, or wherever an external project-picker app would redirect from (this app assumes it receives a `projectId` from elsewhere; it doesn't have its own project picker).

### Environment variables

| File | Variable | Purpose |
|---|---|---|
| `backend/.env` | `DATABASE_URL` | Postgres connection string. |
| `backend/.env` | `PORT` | Backend HTTP port (default 4000). |
| `backend/.env` | `CORS_ORIGIN` | Allowed origin for the Express + Socket.IO CORS config. Use the frontend's exact origin in production; `*` is fine for local/LAN testing. |
| `backend/.env` | `PUBLIC_BASE_URL` | Base URL baked into seeded tower photo / video URLs. Must match wherever the backend is actually reachable from the browser. |
| `frontend/.env` | `VITE_API_BASE_URL` | Backend's base URL, used for both REST calls and the Socket.IO connection. |

### Deployment

Not yet deployed. Planned shape: backend on Render/Railway (persistent process, required for Socket.IO), frontend as a static Vite build on Vercel/Netlify, with `VITE_API_BASE_URL` pointed at the deployed backend and `CORS_ORIGIN`/`PUBLIC_BASE_URL` updated to match before reseeding.

## Architecture

### Data model

`projects` → `gallery_images`, `videos`, `towers` → `units` → `bookings`. Single-project-per-session by design (this kiosk expects a `projectId` handed to it, not to run its own project picker), but nothing in the schema prevents seeding multiple projects.

### Atomic booking (the core guarantee)

Booking is enforced at the database layer via two independent Postgres mechanisms, not application logic:
1. A single conditional statement — `UPDATE units SET status = 'booked' WHERE id = $1 AND status = 'available'` — inside a transaction. Postgres's row-level lock makes the check-and-flip atomic: two concurrent requests serialize on the row lock, and the loser's `WHERE` clause matches zero rows once it's unblocked, since the winner already committed.
2. A `UNIQUE` constraint on `bookings.unit_id` as a second, independent guarantee — even in a hypothetical bug where two transactions both thought their `UPDATE` succeeded, the second `INSERT INTO bookings` would violate the unique constraint and abort.

Both statements run in one transaction with the booking insert, so there's never an orphaned unit-status flip without a matching booking row. The route converts either failure mode into the same `409` response: `"This unit has already been booked."`

### Realtime layer

Two independent Socket.IO room families, both namespaced by `projectId`:

- **Inventory sync** (`inventory:{projectId}`) — every connected viewer (executive, display, or any other browser tab) joins this room and receives `unit:booked` broadcasts, so a booking made anywhere updates everyone without a refresh. Deliberately separate from mirroring: two people should see live inventory even if they aren't the paired executive/display.
- **Mirroring** (`mirror:{projectId}`) — the executive is the sole emitter. Every `dispatch()` on the executive updates its own local state via a reducer (`state/sessionState.js`) and, through a `useEffect`, emits the *entire* resulting session state to the server, which relays it to the paired display and caches it in memory. A display that connects (or reconnects) mid-session immediately receives a `mirror:sync` snapshot instead of showing nothing until the next action. The display never dispatches or emits anything — every interactive callback on its components is a no-op, and every scrollable/clickable container also gets `pointer-events: none`, so it's a mirror by both data flow *and* enforcement, not just convention.

What mirrors: active tab, gallery preview open/close and which image, video selection/play/pause/seek, tower and unit selection, hover state on units/tiles/buttons, the booking dialog, scroll position per screen (as a 0–1 ratio of `scrollTop / maxScrollTop`, not raw pixels, so it lands correctly even if the two devices render at different sizes), and the live pointer position (also ratio-based) so the customer can see exactly where the sales person is pointing.

## Assumptions

- No authentication — the kiosk is a trusted internal tool, reachable only via the `/executive` and `/display` URLs plus a shared `projectId`. No pairing codes: a given `projectId` has exactly one active executive/display session.
- Project selection happens elsewhere (an external app is assumed to redirect in with `?projectId=`); this app doesn't need its own project picker.
- Phone number validation is format-only (digit count, optional `+country`), not real carrier verification.
- One executive per project at a time. If two executives opened the same `projectId`, both would emit to the same mirror room and the display would flicker between them — not a supported scenario.

## Known Limitations

- **Display video playback is muted.** Browsers block programmatic unmuted autoplay on a page with no prior user gesture, which the display page never has by design (zero local interaction). Reasonable for a showroom screen that isn't expected to carry its own audio, but worth calling out.
- **Gallery images and video thumbnails are external `picsum.photos` URLs**, not self-hosted. The project videos themselves were switched to self-hosted files after the original external sample-video bucket started returning 403s mid-build with no warning — the same risk still exists for the still-external gallery/thumbnail images. If `picsum.photos` becomes slow or unreachable during a live demo, gallery tiles will render as empty boxes even though nothing else in the app is broken.
- **No automated test suite.** All verification during development was done through ad-hoc Playwright scripts (screenshots, computed-style checks, concurrent-request simulations), not a committed test suite.
- **No offline support.** Losing connectivity mid-session shows failed requests rather than a graceful offline state or a retry queue.
- **No reconnection UI.** Socket.IO's client reconnects automatically under the hood, but there's no visible "reconnecting…" indicator for the user during a drop.
- **Not tested on real mobile hardware** — responsive breakpoints were verified at common viewport sizes (390px, 820px, 1600px) in a headless browser, not on physical phones/tablets.

## Future Improvements

- Cache gallery/video data for offline viewing; queue booking requests made while offline and retry on reconnect (explicitly out of scope for conflict resolution per the assignment brief, but a queued booking could still hit the same atomic-booking 409 on retry and surface it normally).
- Optimistic UI for booking submission (currently waits for the real API response before reflecting success/failure, which is deliberate given booking is the safety-critical path, but a subtle optimistic spinner-then-confirm pattern could feel faster without weakening the guarantee).
- A visible reconnection/connection-health indicator.
- Docker Compose for one-command local spin-up of Postgres + backend + frontend.
- Automated tests: at minimum, a concurrency test for the atomic booking endpoint and an integration test for the mirroring round-trip.
- Search inventory by unit number, in addition to the existing status/config filters.

## Beyond the Scope - implimented

The assignment's required mirroring list is: active tab, image previews, video playback, inventory selection, and dialogs. Everything below goes past that list — built because a real sales executive standing next to a customer would expect the *entire* screen, not just the major state transitions, to be shared.

- **Live pointer mirroring.** The executive's cursor position mirrors to the display as a small glowing indicator, so the customer can see exactly where the sales person is pointing on a tower elevation or a gallery image — the kind of nonverbal cue that matters in an actual in-person pitch and is completely absent from a "just sync the data" implementation. Implemented as a throttled, ratio-based `xRatio`/`yRatio` (not raw pixels), so it lands in the same relative spot regardless of the two devices' actual screen resolutions.
- **Scroll-position mirroring**, for the same reason: if the executive scrolls down a unit list or an image grid while talking, the customer's screen scrolls with them. Also ratio-based (`scrollTop / maxScrollTop`), with a throttle-plus-trailing-flush emitter so the exact resting scroll position always arrives even if a scroll gesture ends inside a throttle window.
- **Hover-state mirroring.** Grid tile highlights, the video play-button overlay, and modal close/prev/next button highlights are driven by mirrored data rather than pure CSS `:hover` (which by definition can only ever fire on whichever device's mouse is physically over the element) — so the display shows the same visual feedback the executive sees, not just the same underlying selection.
- **Strict display-side lockdown.** Every interactive element on the display — scrollable containers, grid tiles, modal buttons, the tower SVG overlay — has both a no-op callback *and* `pointer-events: none`, so the "display never controls anything" requirement is structurally enforced, not just assumed from convention. Verified directly: simulated local clicks/scrolls/hovers on the display produce zero effect.
- **Inventory status/config filters.** Beyond the required tower/unit browsing, the sidebar has quick filter pills for status (All/Available/Booked) and unit configuration (auto-derived from whatever configs exist in the data, e.g. 2BHK/3BHK) — the filter selection itself mirrors to the display like everything else.
- **Responsive layout.** The grid layouts (Gallery/Videos) collapse from a 12-column desktop grid to a single stacked column below `lg`, and the Inventory sidebar+tower-stage layout stacks vertically instead of side-by-side on narrow viewports, so the app is at least usable — not just "not catastrophically broken" — on a tablet-portrait or phone-width screen, verified with zero horizontal overflow at 390px/820px/1600px.
