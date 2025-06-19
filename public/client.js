const socket = io();

let username = "";
let isTyping = false;
const typingUsers = new Set();

while (!username) {
  username = prompt("Enter your name:");
}

socket.emit("new-user", username);
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
let typingTimeout;

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

input.addEventListener("keydown", function (event) {
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing", username);
  }

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit("stop-typing", username);
  }, 2000);
});

socket.on("chat message", function (msg) {
  const item = document.createElement("li");
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

document.getElementById("disconnect").addEventListener("click", () => {
  socket.emit("user-left", username);
  socket.disconnect();
  location.reload();
});

socket.on('typing', (username) => {
  typingUsers.add(username);
  updateTypingIndicator();
});

socket.on('stop-typing', (username) => {
  typingUsers.delete(username);
  updateTypingIndicator();
});


function updateTypingIndicator() {
  const hm = document.getElementById('HM');
  if (typingUsers.size === 0) {
    hm.style.visibility = 'hidden';
  } else {
    hm.style.visibility = 'visible';
    const usersArray = Array.from(typingUsers);
    if (usersArray.length === 1) {
      hm.textContent = `${usersArray[0]} is typing...`;
    } else {
      hm.textContent = `${usersArray.join(', ')} are typing...`;
    }
  }
}
