const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const users = {};
const PORT = process.env.PORT || 3001;

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("new-user", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("chat message", `${username} joined the chat`);
  });

  socket.on("chat message", (msg) => {
    const name = users[socket.id] || "Unknown";
    io.emit("chat message", `${name}: ${msg}`);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("stop-typing", (username) => {
    socket.broadcast.emit("stop-typing", username);
  });

  socket.on("disconnect", () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit("chat message", `${name} left the chat`);
    }
    delete users[socket.id];
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
