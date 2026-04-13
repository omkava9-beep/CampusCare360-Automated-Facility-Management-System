import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        // Socket.IO only works in development or with a dedicated socket server
        // Vercel serverless doesn't support WebSocket connections
        const isDevelopment = import.meta.env.MODE === 'development';
        
        if (isAuthenticated && user && isDevelopment) {
            try {
                const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
                const newSocket = io(apiUrl, {
                    withCredentials: true,
                    reconnection: true,
                    reconnectionDelay: 1000,
                });

                newSocket.on('connect', () => {
                    console.log('✓ Socket connected');
                    newSocket.emit('join', user._id);
                });

                newSocket.on('error', (error) => {
                    console.warn('Socket error:', error);
                });

                setSocket(newSocket);

                return () => {
                    newSocket.close();
                    setSocket(null);
                };
            } catch (error) {
                console.warn('Socket.IO not available in production:', error);
                setSocket(null);
            }
        }
    }, [isAuthenticated, user]);

    const value = {
        socket,
        isConnected: !!socket?.connected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
