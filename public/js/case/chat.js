// AI assistant chat panel.
const CHAT_WELCOME = "Hi, I'm your AI Dental assistant! If you have any questions about this case, feel free to ask!";

let chatHistory = [];
let chatPending = false;

function appendChatMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `chat-message ${sender}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

function resetChat() {
  chatHistory = [];
  chatMessages.innerHTML = "";
  appendChatMessage(CHAT_WELCOME, "ai");
}

function setChatPending(pending) {
  chatPending = pending;
  chatInput.disabled = pending;
  chatSendBtn.disabled = pending;
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  const currentCase = cases[currentCaseIndex];

  if (!text || chatPending || !currentCase) {
    return;
  }

  appendChatMessage(text, "user");
  chatInput.value = "";
  const replyBubble = appendChatMessage("Thinking...", "ai");
  replyBubble.classList.add("is-pending");
  setChatPending(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        caseId: currentCase.caseId,
        message: text,
        history: chatHistory,
        partTwoComplete: partTwoComplete
      })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "The AI assistant couldn't answer right now. Please try again.");
    }

    if (replyBubble.isConnected) {
      replyBubble.textContent = data.reply;
      chatHistory.push({role: "user", content: text}, {role: "assistant", content: data.reply});
    }
  } catch (error) {
    replyBubble.textContent = error.message;
    replyBubble.classList.add("is-error");
  } finally {
    replyBubble.classList.remove("is-pending");
    setChatPending(false);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.focus();
  }
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
});

resetChat();
