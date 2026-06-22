document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");           // where messages are appended
  const chatContainer = document.getElementById("chat-container"); // the scrollable container
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const themeBtn = document.getElementById("theme-toggle");

  console.log("Chat script loaded. sendBtn:", sendBtn, "chatContainer:", chatContainer);

  // Safety checks
  if (!chatBox || !chatContainer) {
    console.error("Chat DOM structure mismatched. Make sure #chat-container and #chat-box exist.");
    return;
  }

  function ensureScroll() {
    // Primary: scroll the scrollable container smoothly
    try {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    } catch (e) {
      // Fallback: instant
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = "message " + sender;
    // Use innerHTML only if you trust content; using innerText here to avoid HTML injection
    msg.innerText = text;
    chatBox.appendChild(msg);

    // Best-effort scroll: scroll the new element into view (works even if parent is the scroller)
    requestAnimationFrame(() => {
      try {
        msg.scrollIntoView({ behavior: "smooth", block: "end" });
      } catch (e) {
        // ignore
      }
      // And ensure container is scrolled (double-safety)
      ensureScroll();
    });
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage("user", text);
    userInput.value = "";

    // typing indicator
    const typingMsg = document.createElement("div");
    typingMsg.className = "message bot";
    typingMsg.innerText = "typing...";
    chatBox.appendChild(typingMsg);
    ensureScroll();

    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("Server returned non-JSON response");
      }

      // remove typing
      typingMsg.remove();
      addMessage("bot", data.answer || "No response from AI.");
    } catch (err) {
      // remove typing indicator and show error
      if (typingMsg.parentNode) typingMsg.remove();
      addMessage("bot", "⚠️ Error contacting server: " + err.message);
      console.error("Chatbot error:", err);
    }
  }

  // Button + Enter key
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  const body = document.body;
  

  // Set dark theme by default
  body.classList.add("dark");
  themeBtn.textContent = "☀️";

  themeBtn.addEventListener("click", () => {
    if (body.classList.contains("dark")) {
      body.classList.remove("dark");
      body.classList.add("light");
      themeBtn.textContent = "🌙"; // switch to dark mode icon
    } else {
      body.classList.remove("light");
      body.classList.add("dark");
      themeBtn.textContent = "☀️"; // switch to light mode icon
    }
  });


  // Optional: initial welcome message
  addMessage("bot", "Hi! Ask me something from the document. Try: 'How do I reset my password?'");
});
