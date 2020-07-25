const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getRooms,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  io.emit("rooms", getRooms());

  socket.on("join", (options, callBack) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callBack(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("chat app", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("chat app", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    io.emit("rooms", getRooms());
  });

  socket.on("message", (message, callBack) => {
    const user = getUser(socket.id);

    if (user) {
      const filter = new Filter();

      if (filter.isProfane(message)) {
        return callBack("Profinity is not allowed!");
      }

      io.to(user.room).emit("message", generateMessage(user.username, message));
      callBack();
    }
  });

  socket.on("sendLocation", (coords, callBack) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://www.google.com/maps?${coords.lat},${coords.long}`
        )
      );

      callBack();
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("chat app", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

      io.emit("rooms", getRooms());
    }
  });
});

server.listen(port, () => {
  console.log("Server is up on port " + port);
});
