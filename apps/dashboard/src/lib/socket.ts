import { type Socket, io } from 'socket.io-client';

// Singleton socket — connects once for the whole app lifetime.
// The server URL is empty string so Vite's proxy handles the upgrade.
export const socket: Socket = io({
  autoConnect: true,
  reconnectionAttempts: Number.POSITIVE_INFINITY,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});
