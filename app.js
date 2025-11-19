/* ===============================
   Discord-Style Chat — app.js
   =============================== */

/* ---------- BAD WORD FILTER ---------- */
const badWords = ["fuck","shit","bitch","ass","bastard","hoe","slut","dick","cunt","nigger","retard"];
function cleanName(name) {
  let clean = name;
  for (const w of badWords) {
    clean = clean.replace(new RegExp(w, "gi"), "***");
  }
  return clean;
}

/* ---------- LOAD / SAVE USERS ---------- */
let users = JSON.parse(localStorage.getItem("users") || "{}");
let currentUser = null;
let currentServer = null;
let currentChannel = null;

function save() {
  localStorage.setItem("users", JSON.stringify(users));
}

/* ---------- LOGIN / ACCOUNT CREATION ---------- */
function showMsg(txt) {
  document.getElementById("login-msg").innerText = txt;
}

document.getElementById("createAccountBtn").onclick = () => {
  let user = cleanName(document.getElementById("username").value.trim());
  let pass = document.getElementById("password").value;

  if (!user || !pass) return showMsg("Enter username and password");

  if (users[user]) return showMsg("User already exists");

  users[user] = {
    password: pass,
    servers: {}
  };

  save();
  showMsg("Account created. Now login.");
};

document.getElementById("loginBtn").onclick = () => {
  let user = document.getElementById("username").value.trim();
  let pass = document.getElementById("password").value;

  if (!users[user] || users[user].password !== pass)
    return showMsg("Invalid username or password");

  currentUser = user;
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "flex";
  loadServers();
};

/* ---------- SERVERS ---------- */
function loadServers() {
  const list = document.getElementById("serverList");
  list.innerHTML = "";

  const userData = users[currentUser].servers;

  Object.keys(userData).forEach(code => {
    const btn = document.createElement("button");
    btn.className = "server-btn";
    btn.textContent = code;
    btn.onclick = () => openServer(code);
    list.appendChild(btn);
  });

  const plus = document.createElement("button");
  plus.className = "server-add";
  plus.textContent = "+";
  plus.onclick = createServer;
  list.appendChild(plus);
}

function createServer() {
  let name = prompt("Server name:");
  if (!name) return;

  name = cleanName(name);
  let code = Math.random().toString(36).substring(2, 7);

  users[currentUser].servers[code] = {
    name,
    channels: {}
  };

  save();
  loadServers();
}

function openServer(code) {
  currentServer = code;
  const serverData = users[currentUser].servers[code];

  document.getElementById("serverName").textContent =
    `${serverData.name} (${code})`;

  loadChannels();
}

/* ---------- CHANNELS ---------- */
function loadChannels() {
  const list = document.getElementById("channelList");
  list.innerHTML = "";

  const channels = users[currentUser].servers[currentServer].channels;

  Object.keys(channels).forEach(ch => {
    const btn = document.createElement("button");
    btn.className = "channel-btn";
    btn.textContent = "#" + ch;
    btn.onclick = () => openChannel(ch);
    list.appendChild(btn);
  });
}

document.getElementById("createChannelBtn").onclick = () => {
  if (!currentServer) return alert("Open a server first");
  const name = cleanName(document.getElementById("newChannel").value.trim());
  if (!name) return;

  users[currentUser].servers[currentServer].channels[name] = [];
  save();
  document.getElementById("newChannel").value = "";
  loadChannels();
};

function openChannel(ch) {
  currentChannel = ch;
  document.getElementById("headerChannel").textContent = "#" + ch;
  loadMessages();
}

/* ---------- MESSAGES ---------- */
function loadMessages() {
  const box = document.getElementById("messages");
  box.innerHTML = "";

  if (!currentServer || !currentChannel) return;

  const msgs =
    users[currentUser]
      .servers[currentServer]
      .channels[currentChannel];

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<span class="sender">${m.user}:</span> ${m.text}`;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function sendMessage() {
  if (!currentServer || !currentChannel) return;

  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  users[currentUser]
    .servers[currentServer]
    .channels[currentChannel]
    .push({
      user: currentUser,
      text
    });

  input.value = "";
  save();
  loadMessages();
}

document.getElementById("sendBtn").onclick = sendMessage;

document.getElementById("msgInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

/* ---------- SERVER ACTIONS ---------- */
document.getElementById("deleteServerBtn").onclick = () => {
  if (!currentServer) return alert("No server selected");

  if (!confirm("Delete this server?")) return;

  delete users[currentUser].servers[currentServer];
  save();
  currentServer = null;
  currentChannel = null;
  loadServers();
  document.getElementById("serverName").textContent = "Select a server";
  document.getElementById("messages").innerHTML = "";
};

document.getElementById("leaveServerBtn").onclick = () => {
  if (!currentServer) return alert("No server selected");

  delete users[currentUser].servers[currentServer];
  save();
  currentServer = null;
  currentChannel = null;
  loadServers();
  document.getElementById("serverName").textContent = "Select a server";
  document.getElementById("messages").innerHTML = "";
};

/* ---------- MEMBERS (placeholder for now) ---------- */
function loadMembers() {
  const list = document.getElementById("membersList");
  list.innerHTML = "";

  const div = document.createElement("div");
  div.className = "member";
  div.textContent = currentUser + " (You)";
  list.appendChild(div);
}

setInterval(loadMembers, 1000);
