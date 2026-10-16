'use client';
import { io, Socket } from 'socket.io-client';
let socket: Socket | null = null;
export function getSocket() {
  if (!socket) socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000', { autoConnect: true, reconnection: true, reconnectionAttempts: Infinity, reconnectionDelay: 500, reconnectionDelayMax: 5000, timeout: 8000 });
  return socket;
}
export function emitAck<T = any>(event: string, payload: unknown = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const client = getSocket();
    client.timeout(8000).emit(event, payload, (timeoutError: Error | null, response: any) => {
      if (timeoutError) return reject(new Error('The server did not respond. Check your connection and retry.'));
      if (!response?.ok) return reject(new Error(response?.error?.message || 'That action could not be completed.'));
      resolve(response.data as T);
    });
  });
}
