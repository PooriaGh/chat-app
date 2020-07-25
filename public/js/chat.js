const socket = io();

// Elements
const $messageForm = document.querySelector("#form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("button#send-location");
const $messages = document.querySelector("div#messages");

// Templates
const messageTemplate = document.querySelector("#messages-template").innerHTML;
const locationMessagesTemplate = document.querySelector(
  "#location-messages-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room, existingRoom } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  $messageFormButton.setAttribute("disabled", "disabled");
  $messageFormInput.value = "";
  $messageFormInput.focus();

  socket.emit("message", message, (error) => {
    $messageFormButton.removeAttribute("disabled");

    if (error) {
      return console.log(error);
    }

    console.log("Message delivered!");
  });
});

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationMessagesTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return alert("It's not supported, please update your browser!");
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit(
        "sendLocation",
        {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        },
        () => {
          console.log("Location shared!");
          $sendLocationButton.removeAttribute("disabled");
        }
      );
    },
    (error) => {
      console.log(error);
    }
  );
});

if (room === "" && existingRoom === "none") {
  alert("Write a new room or choose one of existing rooms!");
  location.href = "/";
} else {
  if (existingRoom === "none") {
    socket.emit("join", { username, room }, (error) => {
      if (error) {
        alert("Username is in use!");
        location.href = "/";
      }
    });
  }
  if (room === "") {
    socket.emit("join", { username, room: existingRoom }, (error) => {
      if (error) {
        alert("Username is in use!");
        location.href = "/";
      }
    });
  }
}

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  document.querySelector("#sidebar").innerHTML = html;
});
