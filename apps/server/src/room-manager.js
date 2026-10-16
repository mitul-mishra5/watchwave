import { randomBytes } from 'node:crypto';
import { catalog } from './catalog.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
function randomToken(alphabet, length) { const bytes = randomBytes(length); return [...bytes].map((byte) => alphabet[byte % alphabet.length]).join(''); }
const makeCode = () => randomToken(CODE_ALPHABET, 6);
const makeId = () => randomToken(ID_ALPHABET, 12);

export class RoomError extends Error {
  constructor(code, message) { super(message); this.name = 'RoomError'; this.code = code; }
}

export class RoomManager {
  constructor({ capacity = 10, now = () => Date.now(), persist = () => {}, initialState = [] } = {}) {
    this.capacity = capacity;
    this.now = now;
    this.persist = persist;
    this.rooms = new Map();
    for (const saved of initialState) {
      this.rooms.set(saved.code, { ...saved, hostId: null, participants: new Map(), messages: saved.messages || [], reactions: saved.reactions || [], polls: saved.polls || [], pollVotes: saved.pollVotes || {}, playlist: saved.playlist || [], playback: { ...saved.playback, playing: false, updatedAt: this.now() } });
    }
  }

  save() {
    this.persist([...this.rooms.values()].map((room) => ({ ...room, participants: [...room.participants.values()] })));
  }

  createRoom({ name, hostName, hostId, movieId = catalog[0].id }) {
    const movie = catalog.find((item) => item.id === movieId);
    if (!movie) throw new RoomError('MOVIE_NOT_FOUND', 'That movie is not in the demo catalog.');
    let code;
    do { code = makeCode(); } while (this.rooms.has(code));
    const room = {
      code, name: String(name || `${hostName || 'Your'} watch party`).slice(0, 60), hostId,
      createdAt: this.now(), participants: new Map(),
      playback: { movieId, playing: false, position: 0, updatedAt: this.now(), revision: 0, lastActionId: null },
      playlist: [movieId], messages: [], reactions: [], polls: [], pollVotes: {},
      eventSequence: 0
    };
    this.rooms.set(code, room);
    this.joinRoom(code, { id: hostId, name: hostName || 'Host' });
    this.save();
    return this.snapshot(code, hostId);
  }

  joinRoom(code, { id, name }) {
    const room = this.getRoom(code);
    const existing = room.participants.get(id);
    if (!existing && room.participants.size >= this.capacity) throw new RoomError('ROOM_FULL', `This room is limited to ${this.capacity} concurrent users.`);
    if (!existing && room.participants.size === 0 && !room.hostId) room.hostId = id;
    const participant = existing || { id, name: String(name || 'Guest').slice(0, 24), joinedAt: this.now(), isHost: id === room.hostId, lastSeen: this.now() };
    participant.lastSeen = this.now();
    room.participants.set(id, participant);
    this.save();
    return this.snapshot(code, id);
  }

  leaveRoom(code, participantId) {
    const room = this.rooms.get(String(code).toUpperCase());
    if (!room) return null;
    room.participants.delete(participantId);
    if (room.hostId === participantId && room.participants.size) {
      const nextHost = [...room.participants.values()].sort((a, b) => a.joinedAt - b.joinedAt)[0];
      room.hostId = nextHost.id;
      nextHost.isHost = true;
    }
    if (!room.participants.size) this.rooms.delete(room.code);
    this.save();
    return this.rooms.has(room.code) ? this.snapshot(room.code) : null;
  }

  getRoom(code) {
    const room = this.rooms.get(String(code || '').toUpperCase());
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 'Room not found. Check the invite code and try again.');
    return room;
  }

  snapshot(code, viewerId = null) {
    const room = this.getRoom(code);
    const elapsed = room.playback.playing ? (this.now() - room.playback.updatedAt) / 1000 : 0;
    const movie = catalog.find((item) => item.id === room.playback.movieId) || catalog[0];
    return {
      code: room.code, name: room.name, hostId: room.hostId, isHost: viewerId === room.hostId,
      createdAt: room.createdAt, capacity: this.capacity,
      participants: [...room.participants.values()].map((p) => ({ ...p, isHost: p.id === room.hostId })),
      playback: { ...room.playback, position: Math.max(0, room.playback.position + elapsed), movie },
      playlist: room.playlist.map((id) => catalog.find((item) => item.id === id)).filter(Boolean),
      messages: room.messages.slice(-100), reactions: room.reactions.slice(-30), polls: room.polls,
      pollVotes: room.pollVotes, eventSequence: room.eventSequence
    };
  }

  playbackAction(code, participantId, action) {
    const room = this.getRoom(code);
    if (room.hostId !== participantId) throw new RoomError('HOST_ONLY', 'Only the host can control playback.');
    if (!action || !['play', 'pause', 'seek', 'selectMovie'].includes(action.type)) throw new RoomError('INVALID_ACTION', 'Unsupported playback action.');
    if (action.actionId && room.playback.lastActionId === action.actionId) return this.snapshot(code, participantId);
    const now = this.now();
    const currentPosition = room.playback.playing ? room.playback.position + (now - room.playback.updatedAt) / 1000 : room.playback.position;
    if (action.type === 'play') { room.playback.position = currentPosition; room.playback.playing = true; }
    if (action.type === 'pause') { room.playback.position = currentPosition; room.playback.playing = false; }
    if (action.type === 'seek') {
      const position = Number(action.position);
      if (!Number.isFinite(position) || position < 0) throw new RoomError('INVALID_POSITION', 'Seek position must be a non-negative number.');
      room.playback.position = Math.min(position, 24 * 60 * 60);
    }
    if (action.type === 'selectMovie') {
      const movie = catalog.find((item) => item.id === action.movieId);
      if (!movie) throw new RoomError('MOVIE_NOT_FOUND', 'That movie is not available.');
      room.playback.movieId = movie.id; room.playback.position = 0; room.playback.playing = false;
      if (!room.playlist.includes(movie.id)) room.playlist.push(movie.id);
    }
    room.playback.updatedAt = now;
    room.playback.revision += 1;
    room.playback.lastActionId = action.actionId || null;
    room.eventSequence += 1;
    this.save();
    return this.snapshot(code, participantId);
  }

  addMessage(code, participantId, body) {
    const room = this.getRoom(code);
    const participant = room.participants.get(participantId);
    if (!participant) throw new RoomError('NOT_IN_ROOM', 'Join the room before sending messages.');
    const text = String(body || '').trim();
    if (!text || text.length > 500) throw new RoomError('INVALID_MESSAGE', 'Messages must contain 1–500 characters.');
    const message = { id: makeId(), participantId, name: participant.name, body: text, createdAt: this.now() };
    room.messages.push(message); room.messages = room.messages.slice(-200); room.eventSequence += 1; this.save();
    return message;
  }

  addReaction(code, participantId, emoji) {
    const room = this.getRoom(code);
    const allowed = ['😂', '❤️', '🔥', '👏', '😮', '😭', '🍿', '💀'];
    if (!room.participants.has(participantId)) throw new RoomError('NOT_IN_ROOM', 'Join the room before reacting.');
    if (!allowed.includes(emoji)) throw new RoomError('INVALID_REACTION', 'That reaction is not supported.');
    const reaction = { id: makeId(), participantId, emoji, createdAt: this.now() };
    room.reactions.push(reaction); room.reactions = room.reactions.slice(-50); room.eventSequence += 1; this.save();
    return reaction;
  }

  addToPlaylist(code, participantId, movieId) {
    const room = this.getRoom(code);
    if (!room.participants.has(participantId)) throw new RoomError('NOT_IN_ROOM', 'Join the room before editing the playlist.');
    if (!catalog.some((movie) => movie.id === movieId)) throw new RoomError('MOVIE_NOT_FOUND', 'Movie not found.');
    if (!room.playlist.includes(movieId)) room.playlist.push(movieId);
    room.eventSequence += 1; this.save();
    return this.snapshot(code, participantId).playlist;
  }

  createPoll(code, participantId, { question, options }) {
    const room = this.getRoom(code);
    if (!room.participants.has(participantId)) throw new RoomError('NOT_IN_ROOM', 'Join the room before creating a poll.');
    const cleanQuestion = String(question || '').trim().slice(0, 160);
    const cleanOptions = [...new Set((Array.isArray(options) ? options : []).map((x) => String(x).trim().slice(0, 80)).filter(Boolean))].slice(0, 6);
    if (!cleanQuestion || cleanOptions.length < 2) throw new RoomError('INVALID_POLL', 'A poll needs a question and at least two distinct options.');
    const poll = { id: makeId(), question: cleanQuestion, options: cleanOptions.map((label, index) => ({ id: String(index), label })), createdBy: participantId, createdAt: this.now(), closed: false };
    room.polls.push(poll); room.pollVotes[poll.id] = {}; room.eventSequence += 1; this.save();
    return poll;
  }

  votePoll(code, participantId, { pollId, optionId }) {
    const room = this.getRoom(code);
    const poll = room.polls.find((item) => item.id === pollId);
    if (!poll || poll.closed) throw new RoomError('POLL_CLOSED', 'This poll is no longer accepting votes.');
    if (!room.participants.has(participantId)) throw new RoomError('NOT_IN_ROOM', 'Join the room before voting.');
    if (!poll.options.some((option) => option.id === String(optionId))) throw new RoomError('INVALID_VOTE', 'Choose one of the available options.');
    room.pollVotes[pollId][participantId] = String(optionId); room.eventSequence += 1; this.save();
    return { pollId, votes: room.pollVotes[pollId] };
  }

  transferHost(code, participantId, targetId) {
    const room = this.getRoom(code);
    if (room.hostId !== participantId) throw new RoomError('HOST_ONLY', 'Only the current host can transfer hosting.');
    if (!room.participants.has(targetId)) throw new RoomError('PARTICIPANT_NOT_FOUND', 'That participant is no longer in the room.');
    room.hostId = targetId; room.participants.forEach((p) => { p.isHost = p.id === targetId; }); room.eventSequence += 1; this.save();
    return this.snapshot(code, targetId);
  }
}
