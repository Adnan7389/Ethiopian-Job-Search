// backend/src/socket.js
 const { Server } = require('socket.io');
 const jwt = require('jsonwebtoken');

 // wrap express server
 let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173', credentials: true }
  });

 // authenticate incoming sockets via Bearer token
 io.use((socket, next) => {
   const token = socket.handshake.auth.token;
   if (!token) return next(new Error('Auth required'));
   try {
     const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     socket.user = payload;
     next();
   } catch (err) {
     next(new Error('Invalid token'));
   }
 });

 io.on('connection', (socket) => {
   const userId = socket.user.userId.toString();
   if (userId) {
    socket.join(userId.toString());
    console.log(`✅ Socket joined room: ${userId}`);
  }
 });

 return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

 module.exports = { initSocket, getIO };
