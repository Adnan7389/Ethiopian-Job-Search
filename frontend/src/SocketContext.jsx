import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { receiveNotification, fetchNotifications } from './features/notification/notificationSlice';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token) {
      console.error("Socket: No token found. Cannot initialize socket.");
      return;
    }

    let socketInstance = null;
    let reconnectTimer = null;

    const initializeSocket = () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }

      socketInstance = io('http://localhost:5000', {
      auth: { token },
        transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
        autoConnect: true
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      if (userId) {
        socketInstance.emit('join', userId);
        console.log(`✅ Socket joined room: ${userId}`);
      }
        // Clear any pending reconnect timer
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
        // If connection fails, try to reconnect after a delay
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect...');
            initializeSocket();
          }, 5000);
        }
      });

      socketInstance.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Server initiated disconnect or transport closed, try to reconnect
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              console.log('Attempting to reconnect after disconnect...');
              initializeSocket();
            }, 5000);
          }
        }
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        if (userId) {
          socketInstance.emit('join', userId);
        }
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        // Try to reconnect with polling only
        if (socketInstance.io.opts.transports[0] !== 'polling') {
          socketInstance.io.opts.transports = ['polling'];
          initializeSocket();
        }
      });

    setSocket(socketInstance);
    };

    // Initial connection
    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (socketInstance) {
      socketInstance.disconnect();
      setSocket(null);
      }
    };
  }, [token, userId]);

  useEffect(() => {
    if (!socket) return;

    // Set up event listeners
    socket.on('notification', (notification) => {
      dispatch(receiveNotification(notification));
    });

    socket.on('notificationUpdated', (data) => {
      dispatch(fetchNotifications());
    });

    socket.on('notificationDeleted', (data) => {
      dispatch(fetchNotifications());
    });

    socket.on('notificationCleared', () => {
      dispatch(fetchNotifications());
    });

    // Cleanup event listeners
    return () => {
      socket.off('notification');
      socket.off('notificationUpdated');
      socket.off('notificationDeleted');
      socket.off('notificationCleared');
    };
  }, [socket, dispatch]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};