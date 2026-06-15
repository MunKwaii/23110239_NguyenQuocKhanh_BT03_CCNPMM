let io = null;

const init = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins for development
            methods: ["GET", "POST", "PUT", "DELETE"]
        }
    });

    io.on('connection', (socket) => {
        console.log('⚡ User connected to socket:', socket.id);

        // Clients can join rooms associated with their emails to receive targeted events
        socket.on('register', (email) => {
            if (email) {
                socket.join(email);
                console.log(`✉️ User registered socket room for email: ${email}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ User disconnected socket:', socket.id);
        });
    });

    return io;
};

const getIo = () => {
    return io;
};

const broadcastNotification = (notification) => {
    if (io) {
        // Broadcast globally for general notifications
        io.emit('notification', notification);
        
        // Target specific user room if email is provided
        if (notification.email) {
            io.to(notification.email).emit('user-notification', notification);
        }
        console.log('📢 Broadcasted socket notification:', notification.title);
    } else {
        console.warn('⚠️ Cannot broadcast, socket.io is not initialized!');
    }
};

module.exports = {
    init,
    getIo,
    broadcastNotification
};
