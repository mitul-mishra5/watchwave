import Database from 'better-sqlite3';

export function createDatabase(path = process.env.DATABASE_PATH || './watchwave.db') {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS room_state (
    room_code TEXT PRIMARY KEY,
    updated_at INTEGER NOT NULL,
    payload TEXT NOT NULL
  );`);
  const upsert = db.prepare('INSERT INTO room_state (room_code, updated_at, payload) VALUES (?, ?, ?) ON CONFLICT(room_code) DO UPDATE SET updated_at=excluded.updated_at, payload=excluded.payload');
  const remove = db.prepare('DELETE FROM room_state WHERE room_code = ?');
  const save = db.transaction((rooms) => {
    const active = new Set(rooms.map((room) => room.code));
    for (const room of rooms) upsert.run(room.code, Date.now(), JSON.stringify(room));
    for (const row of db.prepare('SELECT room_code FROM room_state').all()) if (!active.has(row.room_code)) remove.run(row.room_code);
  });
  return {
    db,
    saveRoomStates(rooms) { save(rooms); },
    loadRoomStates() { return db.prepare('SELECT payload FROM room_state').all().map((row) => JSON.parse(row.payload)); },
    close() { db.close(); }
  };
}
