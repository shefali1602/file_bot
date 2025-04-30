const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("user-input");

let hasExited = false;
let typingMessageDiv = null;

// --- Function to format timestamp ---
function formatTimestamp(sender) {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    if (sender === "bot") {
        return `Inquiro | ${timeStr}`;
    } else {
        return timeStr;
    }
}

// --- Function to show typing loader ---
function showTypingLoader() {
    typingMessageDiv = document.createElement("div");
    typingMessageDiv.classList.add("bot-message");

    const indicator = document.createElement("div");
    indicator.classList.add("typing-indicator");

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        indicator.appendChild(dot);
    }

    typingMessageDiv.appendChild(indicator);
    chatbox.appendChild(typingMessageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// --- Function to hide typing loader ---
function hideTypingLoader() {
    if (typingMessageDiv) {
        clearInterval(typingMessageDiv.typingInterval);
        chatbox.removeChild(typingMessageDiv);
        typingMessageDiv = null;
    }
}

// --- Function to send user message ---
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage({type: "text", text: message}, "user");
    userInput.value = "";

    showTypingLoader();

    fetch("/message", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        hideTypingLoader();
        if (data.response) {
            addMessage(data.response, "bot");
        }
    })
    .catch(error => {
        hideTypingLoader();
        console.error("Error:", error);
        addMessage({type: "text", text: "Oops! Something went wrong."}, "bot");
    });
}

// --- Function to open file when file button is clicked ---
function openFile(filePath) {
    fetch("/open_file", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ file_path: filePath })
    })
    .then(response => response.json())
    .then(data => {
        addMessage({type: "text", text: data.message}, "bot");
    });
}

// --- Function to add message to chatbox ---
function addMessage(data, sender = "bot") {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(sender + "-message");

    const messageContent = document.createElement("div");

    if (!data.type) {
        data = { type: "text", text: data.text || data };
    }

    if (data.type === "text") {
        messageContent.textContent = data.text;
        messageDiv.appendChild(messageContent);

    } else if (data.type === "files") {
        data.files.forEach(file => {
            const button = document.createElement("button");
            button.className = "file-button";
            button.textContent = "Open " + file.filename;
            button.onclick = () => openFile(file.filepath);
            messageDiv.appendChild(button);
        });

    } else if (data.type === "file_list") {
        const title = document.createElement("div");
        title.innerHTML = `✅ Found ${data.count} files:<br><br>`;
        messageDiv.appendChild(title);

        data.files.forEach((file, index) => {
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = `${index + 1}. ${file.filename}`;
            link.style.display = "block";
            link.onclick = (e) => {
                e.preventDefault();
                openFile(file.filepath);
            };
            messageDiv.appendChild(link);
        });
    }

    // Add timestamp
    const timeDiv = document.createElement("div");
    timeDiv.classList.add("timestamp");
    timeDiv.textContent = formatTimestamp(sender);
    messageDiv.appendChild(timeDiv);

    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// --- Function to reset chat ---
function resetChat() {
    chatbox.innerHTML = "";
    userInput.value = "";
    userInput.disabled = false;
    document.querySelector(".input-container button").disabled = false;
    userInput.placeholder = "Type your message...";

    hasExited = false;

    fetch("/message", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: "" })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            addMessage(data.response, "bot");
        }
    });
}

// --- Function to exit chat ---
function exitChat() {
    if (hasExited) return;

    hasExited = true;

    const goodbyeMessage = {
        type: "text",
        text: "👋 Thank you for using Inquiro. Have a wonderful day!"
    };
    addMessage(goodbyeMessage, "bot");

    userInput.disabled = true;
    document.querySelector(".input-container button").disabled = true;
    userInput.placeholder = "Chat Ended. Thank you!";
}

// --- On page load, greet the user ---
window.onload = function() {
    fetch("/message", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: "" })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            addMessage(data.response, "bot");
        }
    });
};
