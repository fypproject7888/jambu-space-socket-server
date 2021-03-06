const io = require("socket.io")(process.env.PORT || 8900, {
  cors: {
    origin: "https://jambu-space-client.herokuapp.com",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some(user => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = socketId => {
  users = users.filter(user => user.socketId !== socketId);
};

const getUser = userId => {
  return users.find(user => user.userId === userId);
};

io.on("connection", socket => {
  //when connect
  console.log("New user connected.");

  //take userId and socketId from user
  socket.on("addUser", userId => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderID, receiverID, text }) => {
    const user = getUser(receiverID);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderID,
        text,
      });
    }
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
