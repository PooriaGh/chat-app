const socket = io();

// Templates
const roomTemplate = document.querySelector("#room-template").innerHTML;

socket.on("rooms", (rooms) => {
  const html = Mustache.render(roomTemplate, { rooms });
  document.querySelector("#rooms").innerHTML = html;
});
