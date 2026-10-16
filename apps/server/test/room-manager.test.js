import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomManager, RoomError } from '../src/room-manager.js';
import { searchMovies, recommendations } from '../src/catalog.js';

function fixture(options = {}) { let time = 1_000_000; const manager = new RoomManager({ now: () => time, capacity: 2, ...options }); return { manager, advance: (ms) => { time += ms; } }; }

test('creates a room and assigns its creator as host', () => {
  const { manager } = fixture(); const room = manager.createRoom({ hostId: 'a', hostName: 'Ava' });
  assert.equal(room.isHost, true); assert.equal(room.participants.length, 1); assert.equal(room.capacity, 2); assert.equal(room.code.length, 6);
});

test('enforces room capacity and returns typed errors', () => {
  const { manager } = fixture(); const room = manager.createRoom({ hostId: 'a', hostName: 'Ava' }); manager.joinRoom(room.code, { id: 'b', name: 'Ben' });
  assert.throws(() => manager.joinRoom(room.code, { id: 'c', name: 'Cam' }), (error) => error instanceof RoomError && error.code === 'ROOM_FULL');
});

test('only host can control playback and duplicate action IDs are idempotent', () => {
  const { manager, advance } = fixture(); const room = manager.createRoom({ hostId: 'a' }); manager.joinRoom(room.code, { id: 'b', name: 'Bee' });
  assert.throws(() => manager.playbackAction(room.code, 'b', { type: 'play' }), { code: 'HOST_ONLY' });
  const first = manager.playbackAction(room.code, 'a', { type: 'play', actionId: 'unique-1' }); advance(1000);
  const second = manager.playbackAction(room.code, 'a', { type: 'play', actionId: 'unique-1' });
  assert.equal(second.playback.revision, first.playback.revision); assert.equal(second.playback.playing, true);
});

test('playback clock advances from server timestamps and seek validates input', () => {
  const { manager, advance } = fixture(); const room = manager.createRoom({ hostId: 'a' });
  manager.playbackAction(room.code, 'a', { type: 'play' }); advance(2500);
  assert.ok(manager.snapshot(room.code).playback.position >= 2.5);
  assert.throws(() => manager.playbackAction(room.code, 'a', { type: 'seek', position: -1 }), { code: 'INVALID_POSITION' });
});

test('chat is bounded, sanitized and requires room membership', () => {
  const { manager } = fixture(); const room = manager.createRoom({ hostId: 'a', hostName: 'Ava' });
  assert.throws(() => manager.addMessage(room.code, 'stranger', 'hello'), { code: 'NOT_IN_ROOM' });
  assert.throws(() => manager.addMessage(room.code, 'a', '  '), { code: 'INVALID_MESSAGE' });
  assert.equal(manager.addMessage(room.code, 'a', '  hello  ').body, 'hello');
});

test('polls validate options and permit one current vote per participant', () => {
  const { manager } = fixture(); const room = manager.createRoom({ hostId: 'a' }); manager.joinRoom(room.code, { id: 'b', name: 'Bee' });
  assert.throws(() => manager.createPoll(room.code, 'a', { question: 'Pick?', options: ['Same', 'Same'] }), { code: 'INVALID_POLL' });
  const poll = manager.createPoll(room.code, 'a', { question: 'Pick?', options: ['One', 'Two'] });
  manager.votePoll(room.code, 'b', { pollId: poll.id, optionId: '0' }); manager.votePoll(room.code, 'b', { pollId: poll.id, optionId: '1' });
  assert.equal(manager.snapshot(room.code).pollVotes[poll.id].b, '1');
});

test('host transfer is restricted and updates room state', () => {
  const { manager } = fixture(); const room = manager.createRoom({ hostId: 'a' }); manager.joinRoom(room.code, { id: 'b', name: 'Bee' });
  assert.throws(() => manager.transferHost(room.code, 'b', 'a'), { code: 'HOST_ONLY' });
  assert.equal(manager.transferHost(room.code, 'a', 'b').hostId, 'b');
});

test('fuzzy catalog search and genre filtering work', () => {
  assert.ok(searchMovies({ q: 'big buck buny' }).some((movie) => movie.id === 'big-buck-bunny'));
  assert.ok(searchMovies({ genre: 'Sci-Fi' }).every((movie) => movie.genres.includes('Sci-Fi')));
  assert.equal(recommendations('big-buck-bunny').length, 4);
});
