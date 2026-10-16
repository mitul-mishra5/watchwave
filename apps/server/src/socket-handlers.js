import { RoomError } from './room-manager.js';

const ACK_TIMEOUT_MS = 8000;
function ackOrEmit(socket, ack, event, payload) {
  if (typeof ack === 'function') ack({ ok: true, data: payload });
  else socket.emit(event, payload);
}

export function registerSocketHandlers(io, manager) {
  io.on('connection', (socket) => {
    socket.on('room:create', (payload = {}, ack) => {
      try {
        const hostId = socket.id;
        const room = manager.createRoom({ ...payload, hostId });
        socket.data.participantId = hostId; socket.data.roomCode = room.code;
        socket.join(room.code);
        ackOrEmit(socket, ack, 'room:created', room);
        io.to(room.code).emit('room:state', manager.snapshot(room.code));
      } catch (error) { sendError(socket, ack, error); }
    });

    socket.on('room:join', (payload = {}, ack) => {
      try {
        const roomCode = String(payload.code || '').toUpperCase();
        const room = manager.joinRoom(roomCode, { id: socket.id, name: payload.name || 'Guest' });
        socket.data.participantId = socket.id; socket.data.roomCode = roomCode;
        socket.join(roomCode);
        ackOrEmit(socket, ack, 'room:joined', room);
        io.to(roomCode).emit('room:state', manager.snapshot(roomCode));
        socket.to(roomCode).emit('participant:joined', room.participants.find((p) => p.id === socket.id));
      } catch (error) { sendError(socket, ack, error); }
    });

    socket.on('playback:action', (action = {}, ack) => withRoom(socket, ack, (code, id) => {
      const state = manager.playbackAction(code, id, action);
      io.to(code).emit('playback:state', state.playback);
      return state.playback;
    }));

    socket.on('chat:send', (payload = {}, ack) => withRoom(socket, ack, (code, id) => {
      const message = manager.addMessage(code, id, payload.body);
      io.to(code).emit('chat:message', message); return message;
    }));

    socket.on('reaction:send', (payload = {}, ack) => withRoom(socket, ack, (code, id) => {
      const reaction = manager.addReaction(code, id, payload.emoji);
      io.to(code).emit('reaction:new', reaction); return reaction;
    }));

    socket.on('playlist:add', (payload = {}, ack) => withRoom(socket, ack, (code, id) => {
      const playlist = manager.addToPlaylist(code, id, payload.movieId);
      io.to(code).emit('playlist:state', playlist); return playlist;
    }));

    socket.on('poll:create', (payload = {}, ack) => withRoom(socket, ack, (code, id) => {
      const poll = manager.createPoll(code, id, payload);
      io.to(code).emit('poll:created', { poll, votes: {} }); return poll;
    }));

    socket.on('poll:vote', (payload = {}, ack) => withRoom(socket, ack, (code, id) => {
      const result = manager.votePoll(code, id, payload);
      io.to(code).emit('poll:results', result); return result;
    }));

    socket.on('host:transfer', (payload = {}, ack) => withRoom(socket, ack, (code, id) => {
      const state = manager.transferHost(code, id, payload.targetId);
      io.to(code).emit('room:state', manager.snapshot(code)); return state;
    }));

    socket.on('room:sync', (_payload, ack) => withRoom(socket, ack, (code, id) => manager.snapshot(code, id)));

    socket.on('disconnect', () => {
      const code = socket.data.roomCode;
      if (!code) return;
      const state = manager.leaveRoom(code, socket.id);
      if (state) io.to(code).emit('room:state', manager.snapshot(code));
      io.to(code).emit('participant:left', { id: socket.id });
    });
  });
}

function withRoom(socket, ack, fn) {
  try {
    if (!socket.data.roomCode || !socket.data.participantId) throw new RoomError('NOT_IN_ROOM', 'Join a room first.');
    const result = fn(socket.data.roomCode, socket.data.participantId);
    ackOrEmit(socket, ack, 'action:complete', result);
  } catch (error) { sendError(socket, ack, error); }
}

function sendError(socket, ack, error) {
  const payload = { code: error.code || 'INTERNAL_ERROR', message: error.message || 'Something went wrong.' };
  if (typeof ack === 'function') ack({ ok: false, error: payload });
  else socket.emit('app:error', payload);
}

export { ACK_TIMEOUT_MS };
