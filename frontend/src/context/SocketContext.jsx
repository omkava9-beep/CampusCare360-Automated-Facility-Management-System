import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            const newSocket = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                newSocket.emit('join', user._id);
            });

            setSocket(newSocket);

            return () => newSocket.close();
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
