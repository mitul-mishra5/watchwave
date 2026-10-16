# Testing and performance validation

## Automated checks

- `npm test` exercises room creation, room capacity, host authorization, idempotent playback actions, timestamp-based playback, input validation, chat membership, poll voting, host transfer and fuzzy catalog search.
- `npm run test:latency` measures 1,000 in-process room-manager playback actions with nine guest records present.
- `npm run build` checks backend JavaScript syntax and compiles the Next.js frontend.

## Performance target

Requirement: playback-control propagation p95 <= 250 ms on a local network with at least 10 concurrent users.

**Status: not yet verified end-to-end.** A room-manager microbenchmark is not a substitute for network propagation. Do not use its p95 as evidence of the full requirement.

## Recommended reproducible end-to-end test

1. Start the backend and frontend on the same local network; record CPU, memory, OS, Node version, browser versions and Wi-Fi/Ethernet topology.
2. Open one host and at least nine participant browser contexts on separate devices or controlled browser contexts.
3. Instrument the host command with a unique action ID and monotonic timestamp. Record the first receipt and application timestamp on every participant using `performance.now()` with a clock-offset calibration strategy, or collect server receipt/emit timings plus client receipt timing with the offset uncertainty documented.
4. Run 100 warm-up actions, then at least 1,000 play/pause/seek actions with randomized intervals. Avoid measuring only repeated synchronous calls.
5. Report p50, p95, p99, max, dropped/duplicate actions, reconnect recovery time, drift before correction, drift after correction, and number of clients.
6. Repeat under normal local network conditions and an intentionally degraded network (latency/jitter/loss), clearly separating those results.
7. Verify that post-correction drift is <= 500 ms using the same client-side measurement definition for all participants.

## Failure cases to verify manually

- Host disconnects: the oldest remaining participant becomes host.
- A room reaches capacity: the next distinct participant receives `ROOM_FULL`.
- A client reconnects: it requests a fresh room snapshot.
- Two host commands arrive quickly: the server revision increments and duplicate action IDs do not apply twice.
- Non-host playback controls: rejected with `HOST_ONLY`.
- Invalid room code, unknown movie, invalid seek, oversized chat, invalid poll and vote against a missing poll: rejected with typed errors.
- Browser blocks autoplay: user can initiate playback after a gesture.
- Remote sample video is unavailable: show an actionable playback error in a production pass (current UI may require refreshing/selecting another demo).
