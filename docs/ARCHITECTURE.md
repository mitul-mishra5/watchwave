# Architecture notes

## Playback model

A room stores `movieId`, `playing`, `position`, `updatedAt`, `revision`, and `lastActionId`. The server clock is the reference clock. While playing, the effective position is `position + (serverNow - updatedAt) / 1000`. A host command commits a new base position and timestamp, then broadcasts the updated playback state. Revisions let clients reject stale states in future hardening; action IDs make retries idempotent.

## Drift correction

Clients compare local `video.currentTime` with the server-derived expected position. If absolute drift exceeds 500 ms, they seek to the expected position. If drift is between 120 and 500 ms, playback speed is nudged to 0.96x or 1.04x until near alignment. This is a practical browser-side correction loop, not a guarantee of frame-perfect synchronization. Media buffering, hidden tabs, autoplay policies and device clocks can affect observed drift.

## Room lifecycle

Room codes are random six-character strings excluding visually ambiguous characters. Room membership is socket-scoped. The current host is the only participant authorized to change shared playback or transfer host. If the host leaves while others remain, the earliest joined participant becomes host. When the last participant leaves, the room is removed from memory and persisted state.

## Extension seams

- Replace or extend `catalog.js` with licensed movie metadata and provider-specific playback adapters.
- Add authentication and stable user IDs rather than relying on socket IDs.
- Add Redis Socket.IO adapter and shared room state before running multiple API instances.
- Add an event/metrics pipeline to collect control propagation and drift measurements.
