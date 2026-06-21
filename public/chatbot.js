document.addEventListener('DOMContentLoaded', function() {
    const chatbotBtn = document.getElementById('chatbot-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closeChat = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    // Your Gemini API key - Replace with your actual API key
    const GEMINI_API_KEY = 'YOUR_API_KEY';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Open chat popup
    chatbotBtn.addEventListener('click', function() {
        chatPopup.style.display = 'block';
        chatbotBtn.style.display = 'none';
    });
    
    // Close chat popup
    closeChat.addEventListener('click', function() {
        chatPopup.style.display = 'none';
        chatbotBtn.style.display = 'flex';
    });
    
    // Send message
    function sendMessage() {
        const message = userInput.value.trim();
        if (message !== '') {
            // Add user message to chat
            addMessage(message, 'user');
            userInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Send message to Gemini API
            getGeminiResponse(message);
        }
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const typingBubble = document.createElement('div');
        typingBubble.className = 'bot-message';
        typingBubble.innerHTML = 'Typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
        
        typingDiv.appendChild(typingBubble);
        chatMessages.appendChild(typingDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Get response from Gemini API
    async function getGeminiResponse(userMessage) {
        try {
            // Prepare the request data
            const requestData = {
                contents: [{
                    parts: [{
                        text: `You are a blood donation assistant for a platform that connects blood donors and recipients. 
Provide information about donor eligibility, nearby donation centers, blood types, and emergency assistance. 
Keep responses concise and helpful. 
User query: ${userMessage}`

                    }]
                }]
            };
            
            // Make API request
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Check if we have a valid response
            if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                addMessage(aiResponse, 'bot');
            } else {
                // Fallback if API call fails or returns unexpected format
                addMessage("I'm sorry, I couldn't process your request. Please try again later.", 'bot');
            }
        } catch (error) {
            console.error('Error fetching response from Gemini:', error);
            removeTypingIndicator();
            addMessage("I'm having trouble connecting to my knowledge base. Please try again in a moment.", 'bot');
        }
    }
    
    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const textDiv = document.createElement('div');
        textDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
        textDiv.textContent = text;
        
        messageDiv.appendChild(textDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Handle send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Handle Enter key press
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add some CSS for the typing indicator
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
            60% { transform: translateY(-3px); }
        }
        .typing-indicator .dot {
            display: inline-block;
            animation: bounce 1.5s infinite;
        }
        .typing-indicator .dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        .typing-indicator .dot:nth-child(3) {
            animation-delay: 0.4s;
        }
    `;
    document.head.appendChild(style);
});
