const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
            credentials: true,
        }
    });

    console.log('Socket.io initialized');

    io.on('connection', (socket) => {

        // Join a room based on userId (for targeted notifications)
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(userId);
            }
        });

        socket.on('joinTicket', (ticketId) => {
            if (ticketId) {
                socket.join(ticketId);
            }
        });

        socket.on('disconnect', () => {
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper for sending notifications to specific user
const notifyUser = (userId, event, data) => {
    if (io) {
        io.to(userId.toString()).emit(event, data);
    }
};

module.exports = { initSocket, getIO, notifyUser };
