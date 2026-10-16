import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { RoomManager } from './room-manager.js';
import { createDatabase } from './database.js';
import { catalog, genres, searchMovies, recommendations } from './catalog.js';
import { registerSocketHandlers } from './socket-handlers.js';

const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN.split(',').map((x) => x.trim()), methods: ['GET', 'POST'] }, pingInterval: 25000, pingTimeout: 20000, maxHttpBufferSize: 1e6 });
const database = createDatabase();
const manager = new RoomManager({ capacity: Number(process.env.ROOM_CAPACITY || 10), initialState: database.loadRoomStates(), persist: (rooms) => database.saveRoomStates(rooms) });

app.use(cors({ origin: CLIENT_ORIGIN.split(',').map((x) => x.trim()) }));
app.use(express.json({ limit: '32kb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'watchwave-server', time: new Date().toISOString(), realtime: io.engine.clientsCount }));
app.get('/api/catalog', (req, res) => res.json({ items: searchMovies({ q: req.query.q || '', genre: req.query.genre || 'All', sort: req.query.sort || 'recommended' }), genres }));
app.get('/api/catalog/:id', (req, res) => {
  const movie = catalog.find((item) => item.id === req.params.id);
  if (!movie) return res.status(404).json({ error: { code: 'MOVIE_NOT_FOUND', message: 'Movie not found.' } });
  return res.json({ movie, recommendations: recommendations(movie.id) });
});
app.get('/api/rooms/:code', (req, res) => {
  try { return res.json({ room: manager.snapshot(req.params.code) }); }
  catch (error) { return res.status(404).json({ error: { code: error.code || 'ROOM_NOT_FOUND', message: error.message } }); }
});
app.use((error, _req, res, _next) => res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } }));
registerSocketHandlers(io, manager);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`WatchWave API + Socket.IO listening on port ${PORT}`);
});

function shutdown() { io.close(); server.close(() => { database.close(); process.exit(0); }); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
