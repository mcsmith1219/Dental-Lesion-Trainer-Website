// AI assistant chat panel.
const CHAT_PLACEHOLDER_REPLIES = [
  "This is a placeholder for now, I'll implement the actual AI reasoning later. - Matthew"
];

let chatReplyIndex = 0;

function appendChatMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `chat-message ${sender}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
  const text = chatInput.value.trim();

  if (!text) {
    return;
  }

  appendChatMessage(text, "user");
  chatInput.value = "";

  window.setTimeout(function () {
    const reply = CHAT_PLACEHOLDER_REPLIES[chatReplyIndex % CHAT_PLACEHOLDER_REPLIES.length];
    chatReplyIndex += 1;
    appendChatMessage(reply, "ai");
  }, 400);
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
});

appendChatMessage("Hi, I'm your AI Dental assistant! If you have any questions about this case, feel free to ask!", "ai");
