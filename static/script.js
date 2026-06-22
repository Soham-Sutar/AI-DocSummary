document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const chatContainer = document.getElementById("chat-container");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const summarizeBtn = document.getElementById("summarize-btn");
  const themeBtn = document.getElementById("theme-toggle");
  const fileInput = document.getElementById("file-input");
  const uploadBtn = document.getElementById("upload-btn");
  const fileStatus = document.getElementById("file-status");
  const modeSelector = document.getElementById("mode-selector");
  const inputContainer = document.getElementById("input-container");
  const modeRadios = document.querySelectorAll('input[name="mode"]');

  let currentMode = "ask";
  let documentUploaded = false;

  function ensureScroll() {
    try {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    } catch (e) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = "message " + sender;
    msg.innerText = text;
    chatBox.appendChild(msg);

    requestAnimationFrame(() => {
      try {
        msg.scrollIntoView({ behavior: "smooth", block: "end" });
      } catch (e) {
        // ignore
      }
      ensureScroll();
    });
  }

  // File upload handler
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      fileStatus.textContent = "❌ Please select a file";
      fileStatus.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fileStatus.textContent = "⏳ Uploading...";
    fileStatus.style.color = "orange";

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        fileStatus.textContent = `✅ ${data.message}`;
        fileStatus.style.color = "green";
        documentUploaded = true;
        modeSelector.style.display = "flex";
        inputContainer.style.display = "flex";
        chatBox.innerHTML = "";
        addMessage("bot", `Document loaded! You can now ask questions or summarize it.`);
      } else {
        fileStatus.textContent = `❌ ${data.error}`;
        fileStatus.style.color = "red";
      }
    } catch (err) {
      fileStatus.textContent = `❌ Error: ${err.message}`;
      fileStatus.style.color = "red";
      console.error("Upload error:", err);
    }
  });

  // Mode selector
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      currentMode = e.target.value;
      if (currentMode === "summarize") {
        sendBtn.style.display = "none";
        summarizeBtn.style.display = "inline-block";
        userInput.style.display = "none";
      } else {
        sendBtn.style.display = "inline-block";
        summarizeBtn.style.display = "none";
        userInput.style.display = "flex";
        userInput.style.flex = "1";
      }
    });
  });

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!documentUploaded) {
      addMessage("bot", "Please upload a document first.");
      return;
    }

    addMessage("user", text);
    userInput.value = "";

    const typingMsg = document.createElement("div");
    typingMsg.className = "message bot";
    typingMsg.innerText = "⏳ Thinking...";
    chatBox.appendChild(typingMsg);
    ensureScroll();

    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const data = await res.json();
      typingMsg.remove();
      addMessage("bot", data.answer || "No response from AI.");
    } catch (err) {
      if (typingMsg.parentNode) typingMsg.remove();
      addMessage("bot", "⚠️ Error: " + err.message);
      console.error("Error:", err);
    }
  }

  async function summarizeDocument() {
    if (!documentUploaded) {
      addMessage("bot", "Please upload a document first.");
      return;
    }

    addMessage("user", "Summarize this document");

    const typingMsg = document.createElement("div");
    typingMsg.className = "message bot";
    typingMsg.innerText = "⏳ Summarizing...";
    chatBox.appendChild(typingMsg);
    ensureScroll();

    try {
      const res = await fetch("/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      typingMsg.remove();
      addMessage("bot", data.answer || "No summary generated.");
    } catch (err) {
      if (typingMsg.parentNode) typingMsg.remove();
      addMessage("bot", "⚠️ Error: " + err.message);
      console.error("Error:", err);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  summarizeBtn.addEventListener("click", summarizeDocument);

  // Theme toggle
  const body = document.body;
  body.classList.add("dark");
  themeBtn.textContent = "☀️";

  themeBtn.addEventListener("click", () => {
    if (body.classList.contains("dark")) {
      body.classList.remove("dark");
      body.classList.add("light");
      themeBtn.textContent = "🌙";
    } else {
      body.classList.remove("light");
      body.classList.add("dark");
      themeBtn.textContent = "☀️";
    }
  });
});
