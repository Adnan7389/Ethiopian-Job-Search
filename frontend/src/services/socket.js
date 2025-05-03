import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Socket: No token found. Cannot initialize socket.");
    return null;
  }

  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket'], // optional: enforce websocket only
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('disconnect', () => {
    console.warn('Socket disconnected');
  });
  return socket;
};

export const getSocket = () => socket;