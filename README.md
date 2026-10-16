# WatchWave

**A real-time watch-party app for synchronized playback, shared movie discovery and group interaction.** Built with Next.js/React/TypeScript, Node.js/Express, Socket.IO and SQLite.

## What is implemented

- Create and join private rooms using six-character invite codes and shareable URLs.
- Ten-person default room cap (configurable with `ROOM_CAPACITY`).
- Server-authoritative play/pause/seek/movie selection with monotonically increasing revisions and idempotency keys.
- Late-join state snapshots and reconnect recovery through `room:sync`.
- Client drift correction: periodic clock comparison and gentle playback-rate adjustment; hard correction beyond 500 ms.
- Movie catalog with category filters, title/description search, typo-tolerant title matching and genre-based recommendations.
- Shared playlist, live chat, emoji reactions, polls with one current vote per participant, and host transfer.
- SQLite room snapshots retained across server restarts; active sockets/participants are intentionally reset on restart and the first returning participant becomes host.
- Automated backend/domain tests and an in-process latency microbenchmark.
- Premium responsive interface with a landing page, discovery grid, room player, participant list, chat and poll UI.

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- npm 10+
- Internet access for npm installation and poster assets; movie MP4s are supplied locally by the developer

## Start fresh on Windows

1. Extract this ZIP into a new folder such as `Desktop\WatchWave`.
2. In VS Code, choose **File → Open Folder** and select the extracted `watchwave` folder (the one containing this `package.json`).
3. Open a VS Code terminal in that folder and run `npm install`.
4. Follow [`docs/MEDIA_SETUP.md`](docs/MEDIA_SETUP.md) to add the eight movie MP4s. The ZIP intentionally does not bundle copyrighted/large media files.
5. Start the app with `npm run dev`, then visit `http://localhost:3000`.

Do not extract this ZIP over an older WatchWave folder. Keep the old folder as a backup until the new copy is running.

## Run locally

From this directory:

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`. The API and Socket.IO server runs on `http://localhost:4000`.

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API + Socket.IO port |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed frontend origin; comma-separated origins are supported |
| `DATABASE_PATH` | `./watchwave.db` | SQLite database path, relative to server process working directory |
| `ROOM_CAPACITY` | `10` | Maximum participants per room |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:4000` | API and Socket.IO base URL used by the browser |

For a deployed frontend, set `NEXT_PUBLIC_SERVER_URL` to the deployed API URL and `CLIENT_ORIGIN` to the deployed frontend origin. Configure HTTPS/WSS at the hosting layer.

## Verification

```bash
npm test
npm run test:latency
npm run build
```

The latency command reports p50/p95/p99 for the in-process room manager only. It **does not** measure end-to-end control propagation over Socket.IO and browser playback, so it intentionally reports `requirement_verified: false`. To validate the 250 ms p95 requirement, run clients on the target local network and measure from host action timestamp to participant-side receipt/application, under at least 10 concurrent clients, with warm-up and repeated trials. Record the OS, hardware, browser versions, network topology, sample count, percentiles and reconnect/error cases in `docs/TESTING.md`.

## Movie media

The catalogue contains eight Blender Open Movies and points to distinct local MP4 paths under `apps/web/public/videos/`. The movie files are intentionally not bundled in this ZIP because they are large. Follow [`docs/MEDIA_SETUP.md`](docs/MEDIA_SETUP.md) to obtain them from official sources, place them in the correct folder, and run the PowerShell checker. The player reports a missing file rather than silently falling back to another movie.

## Architecture

```text
Next.js UI
  ├─ Catalog REST endpoints ───────┐
  └─ Socket.IO events               │
          │                         ▼
          └────────────── Express + RoomManager
                                   │
                                   ├─ Authoritative playback clock + revisions
                                   ├─ Membership, host permissions, chat, polls, playlist
                                   └─ SQLite room snapshots
```

The server is authoritative for shared state. Browser playback is an approximate local rendering of that state. The drift controller compares the browser's playback time with the server timestamp and corrects larger deviations; measured end-to-end accuracy still depends on network jitter, media buffering and browser scheduling.

## Socket event contract

All client commands accept an optional final acknowledgement callback and respond with `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.

| Client event | Purpose | Authorization |
|---|---|---|
| `room:create` | Create room and assign host | Any connected client |
| `room:join` | Join by code | Any connected client; capacity enforced |
| `room:sync` | Request current room snapshot | Joined client |
| `playback:action` | `play`, `pause`, `seek`, `selectMovie` | Host only |
| `chat:send` | Send a message (max 500 chars) | Joined client |
| `reaction:send` | Send an allow-listed emoji | Joined client |
| `playlist:add` | Add catalog item | Joined client |
| `poll:create` | Create poll (2–6 distinct options) | Joined client |
| `poll:vote` | Set/update vote | Joined client |
| `host:transfer` | Transfer host to active participant | Host only |

Server events include `room:state`, `playback:state`, `chat:message`, `reaction:new`, `playlist:state`, `poll:created`, `poll:results`, `participant:joined`, `participant:left`, and `app:error`.

## Current scope and production hardening

This is a functional starter implementation, not a claim of production certification. Before a public deployment, add identity/authentication, invite abuse controls, per-event rate limits, profanity/spam controls, structured logging/metrics, Redis adapter and distributed room state for multiple server instances, database migrations/backups, CSP and security headers, a licensed media provider, accessibility testing, and a real browser-based load/latency test. The 10-user cap is per room and is enforced in the current in-memory room manager.
