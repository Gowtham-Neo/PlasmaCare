const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("register", (userData) => {
      if (userData?.userId) {
        onlineUsers.set(userData.userId, { socketId: socket.id });
        console.log("Current Online Users:", onlineUsers);
      }
    });

    socket.on("accept-request", ({ requestId, donorId }) => {
      io.emit("request-accepted", { requestId, donorId });
    });

    socket.on("disconnect", () => {
      onlineUsers.forEach((value, key) => {
        if (value.socketId === socket.id) {
          onlineUsers.delete(key);
        }
      });
      console.log("User Disconnected:", socket.id);
    });
  });
};

module.exports = { socketHandler, onlineUsers };
