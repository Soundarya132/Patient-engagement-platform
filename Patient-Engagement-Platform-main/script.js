document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Sample initial messages
    const initialMessages = [
        { text: "Hello, how can I help you today?", sender: "doctor", time: "10:00 AM" },
        { text: "I have a fever and headache.", sender: "patient", time: "10:05 AM" },
        { text: "Can you tell me more about your symptoms?", sender: "doctor", time: "10:10 AM" },
    ];

    // Function to render messages
    function renderMessages() {
        chatMessages.innerHTML = '';
        initialMessages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', message.sender);
            messageDiv.innerHTML = `
                <p>${message.text}</p>
                <span>${message.time}</span>
            `;
            chatMessages.appendChild(messageDiv);
        });
    }

    // Function to add a new message
    function addMessage(text, sender) {
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes()}`;
        initialMessages.push({ text, sender, time });
        renderMessages();
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }

    // Event listener for the send button
    sendButton.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        if (messageText) {
            addMessage(messageText, 'patient');
            messageInput.value = '';
            // Simulate a doctor response
            setTimeout(() => {
                addMessage("I'll look into that. Please wait.", 'doctor');
            }, 1000);
        }
    });

    // Initial render
    renderMessages();
});
