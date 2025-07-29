import io  from 'socket.io-client';
import { config } from './config/config';

// Derive Socket.IO server URL from API_BASE_URL (strip path if needed)
const baseUrl = config.API_BASE_URL;

const socket = io(baseUrl, {
  transportOptions: {
    polling: {
      withCredentials: true,
    },
  },
});

export default socket;
