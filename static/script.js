const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("user-input");

function addMessage(data, sender = "bot") {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(sender + "-message");

    if (data.type === "text") {
        messageDiv.textContent = data.text;
    } else if (data.type === "files") {
        data.files.forEach(file => {
            const button = document.createElement("button");
            button.className = "file-button";
            button.textContent = "Open " + file.filename;
            button.onclick = () => openFile(file.filepath);
            messageDiv.appendChild(button);
        });
    }

    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage({type: "text", text: message}, "user");
    userInput.value = "";

    fetch("/message", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        addMessage(data.response, "bot");
    })
    .catch(error => {
        console.error("Error:", error);
        addMessage({type: "text", text: "Oops! Something went wrong."}, "bot");
    });
}

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

userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

function resetChat() {
    chatbox.innerHTML = "";
    userInput.value = "";
    fetch("/message", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: "" })
    })
    .then(response => response.json())
    .then(data => {
        addMessage(data.response, "bot");
    });
}

function exitChat() {
    window.location.href = "/";
}

window.onload = function() {
    fetch("/message", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: "" })
    })
    .then(response => response.json())
    .then(data => {
        addMessage(data.response, "bot");
    });
};
