// backend/src/socket.js
 const { Server } = require('socket.io');
 const jwt = require('jsonwebtoken');

 // wrap express server
 let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { 
      origin: 'http://localhost:5173', 
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    allowEIO3: true,
    maxHttpBufferSize: 1e8,
    allowUpgrades: true,
    perMessageDeflate: {
      threshold: 2048
    }
  });

 // authenticate incoming sockets via Bearer token
 io.use((socket, next) => {
   const token = socket.handshake.auth.token;
    if (!token) {
      console.error('Socket authentication failed: No token provided');
      return next(new Error('Auth required'));
    }
   try {
     const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     socket.user = payload;
     next();
   } catch (err) {
      console.error('Socket authentication failed:', err.message);
     next(new Error('Invalid token'));
   }
 });

 io.on('connection', (socket) => {
   const userId = socket.user.userId.toString();
   if (userId) {
    socket.join(userId.toString());
    console.log(`✅ Socket joined room: ${userId}`);
  }

    // Handle client disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      if (userId) {
        console.log(`User ${userId} disconnected`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Handle reconnection
    socket.on('reconnect_attempt', () => {
      console.log('Socket attempting to reconnect...');
    });

    // Handle transport upgrade
    socket.on('upgrade', (transport) => {
      console.log(`Socket transport upgraded to: ${transport.name}`);
    });

    // Handle transport error
    socket.on('transport_error', (error) => {
      console.error('Transport error:', error);
    });

    // Keep track of connection state
    let isConnected = true;
    socket.on('disconnect', () => {
      isConnected = false;
    });

    // Handle ping timeout
    socket.on('ping_timeout', () => {
      console.log('Socket ping timeout');
      if (isConnected) {
        socket.disconnect(true);
      }
    });
  });

  // Handle server-wide errors
  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
 });

 return io;
}

function getIO() {
  if (!io) {
    console.error('Socket.io not initialized!');
    return null;
  }
  return io;
}

 module.exports = { initSocket, getIO };
