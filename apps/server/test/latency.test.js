import { performance } from 'node:perf_hooks';
import { RoomManager } from '../src/room-manager.js';

const manager = new RoomManager({ capacity: 10 });
const room = manager.createRoom({ hostId: 'host', hostName: 'Host' });
for (let i = 1; i < 10; i++) manager.joinRoom(room.code, { id: `guest-${i}`, name: `Guest ${i}` });
const samples = [];
for (let i = 0; i < 1000; i++) {
  const start = performance.now();
  manager.playbackAction(room.code, 'host', { type: i % 2 ? 'play' : 'pause', actionId: `latency-${i}` });
  samples.push(performance.now() - start);
}
samples.sort((a, b) => a - b);
const percentile = (p) => samples[Math.min(samples.length - 1, Math.ceil(samples.length * p) - 1)];
console.log(JSON.stringify({ scope: 'in-process RoomManager operation only; excludes socket transport, browser scheduling and rendering', samples: samples.length, p50_ms: +percentile(.50).toFixed(3), p95_ms: +percentile(.95).toFixed(3), p99_ms: +percentile(.99).toFixed(3), max_ms: +samples.at(-1).toFixed(3), requirement_ms: 250, requirement_verified: false }, null, 2));
console.log('NOTE: This is a microbenchmark, not a measurement of end-to-end playback-control propagation.');
