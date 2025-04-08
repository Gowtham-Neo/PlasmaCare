const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});


const { socketHandler, onlineUsers } = require("./socket/socketHandler");
socketHandler(io);

app.set("io", io);

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const userStatusRoutes = require("./routes/userStatusroutes");
const requestRoutes = require("./routes/request");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/userstatus", userStatusRoutes);
app.use("/api/request", requestRoutes);


const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
