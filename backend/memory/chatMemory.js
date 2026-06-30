let conversation = [
  {
    role: "system",
    content: "You are Jarvis, a smart AI assistant. You speak in Roman Urdu and English . Be helpful and friendly."
  }
];

function getMemory() {
  return conversation;
}

function addMessage(msg) {
  conversation.push(msg);

  
  if (conversation.length > 16) {
    conversation.splice(1, 1);
  }
}

function resetMemory() {
  conversation = [
    {
      role: "system",
      content: "You are Jarvis, a smart AI assistant. You speak in Roman Urdu and English. Be helpful and friendly."
    }
  ];
}

module.exports = {
  getMemory,
  addMessage,
  resetMemory
};
