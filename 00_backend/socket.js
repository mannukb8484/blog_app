let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "http://localhost:3000", // Allow React app via
        methods: ["GET", "POST"], // Allow these HTTP verbs
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket-io is not initialized");
    }
    return io;
  },
};
