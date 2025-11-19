// ===== SIMPLE DISCORD-STYLE CHAT ENGINE =====

// Create a random ID for messages
function genId() {
  return Math.random().toString(36).substring(2, 10);
}

// Default system state (if no saved data)
const defaultState = {
  channels: {
    general: {
      name: "general",
      messages: [
        { id: genId(), author: "System", text: "Welcome!", t: Date.now() }
      ]
    }
  },
  current: "general",
  user: "You"
};

// Load from localStorage or use default
let state = JSON.parse(localStorage.getItem("chatState")) || defaultState;

// Save to localStorage
function save() {
  localStorage.setItem("chatState", JSON.stringify(state));
}

// ===== DOM ELEMENTS =====
const msgInput = document.getElementById("messageInput");
const msgs = document.getElementById("messages");
const header = document.getElementById("headerChannel");
const sendBtn = document.getElementById("sendBtn");
const channelList = document.getElementById("channelList");
const newChannelInput = document.getElementById("newChannelInput");
const addChannelBtn = document.getElementById("addChannelBtn");

// ===== RENDER CHANNEL LIST =====
function renderChannels() {
  document.querySelectorAll(".channel").forEach(c => c.remove());

  const keys = Object.keys(state.channels);

  keys.forEach(key => {
    const c = document.createElement("div");
    c.className = "channel" + (state.current === key ? " active" : "");
    c.textContent = "# " + state.channels[key].name;
    c.dataset.key = key;

    c.onclick = () => {
      state.current = key;
      save();
      render();
    };

    channelList.insertBefore(c, channelList.children[1]);
  });
}

// ===== RENDER MESSAGES =====
function renderMessages() {
  msgs.innerHTML = "";

  let channel = state.channels[state.current];
  header.textContent = "# " + channel.name;

  channel.messages.forEach(m => {
    const row = document.createElement("div");
    row.className = "msg";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = m.author.charAt(0).toUpperCase();

    const content = document.createElement("div");
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${m.author} • ${new Date(m.t).toLocaleString()}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = m.text;

    content.appendChild(meta);
    content.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(content);

    msgs.appendChild(row);
  });

  msgs.scrollTop = msgs.scrollHeight;
}

// ===== SEND MESSAGE =====
function sendMessage() {
  let txt = msgInput.value.trim();
  if (!txt) return;

  state.channels[state.current].messages.push({
    id: genId(),
    author: state.user,
    text: txt,
    t: Date.now()
  });

  msgInput.value = "";
  save();
  renderMessages();
}

// ===== CREATE NEW CHANNEL =====
addChannelBtn.onclick = () => {
  let name = newChannelInput.value.trim().toLowerCase();
  if (!name) return;

  if (state.channels[name]) {
    alert("This channel already exists.");
    return;
  }

  state.channels[name] = { name, messages: [] };
  state.current = name;

  newChannelInput.value = "";
  save();
  render();
};

// ===== KEYBOARD + BUTTON SEND =====
sendBtn.onclick = sendMessage;

msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// ===== INITIAL RENDER =====
function render() {
  renderChannels();
  renderMessages();
}

render();
