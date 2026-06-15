import { io } from 'socket.io-client';

// The backend port is 8080 as configured in backend .env
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket']
});
