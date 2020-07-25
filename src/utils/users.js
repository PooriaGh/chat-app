const users = [];
const rooms = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  addRoom(room);

  if (!username || !room) {
    return { error: "Username and room are required!" };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return { error: "Username is in use!" };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const addRoom = (room) => {
  if (!rooms.find((item) => item === room)) {
    rooms.push(room);
  }
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    removeRoom(id);
    return users.splice(index, 1)[0];
  }

  return { error: "User not found!" };
};

const removeRoom = (id) => {
  const room = users.find((user) => user.id === id).room;

  if (getUsersInRoom(room).length === 1) {
    const index = rooms.findIndex((item) => item === room);
    if (index !== -1) {
      rooms.splice(index, 1)[0];
    }
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => {
  if (room) {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
  }
  return [];
};

const getRooms = () => {
  return rooms;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getRooms,
};
