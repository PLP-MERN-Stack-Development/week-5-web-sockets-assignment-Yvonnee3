const socketIo = require('socket.io');

const configureSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
 
  });

  return io;
};

module.exports = configureSocket;