document.addEventListener('DOMContentLoaded', function () {
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotQuestion = document.getElementById('chatbot-question');
    const sendQuestion = document.getElementById('send-question');
    const suggestionsList = document.getElementById('suggestions-list');

    // Toggle chatbot window
    chatbotIcon.addEventListener('click', function () {
        chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
    });

    // Close chatbot
    closeChatbot.addEventListener('click', function () {
        chatbotWindow.style.display = 'none';
    });

    // Send question on button click
    sendQuestion.addEventListener('click', async function () {
        const question = chatbotQuestion.value.trim();
        if (question) {
            await sendQuestionToServer(question);
        }
    });

    // Send question on Enter key
    chatbotQuestion.addEventListener('keypress', async function (e) {
        if (e.key === 'Enter') {
            const question = chatbotQuestion.value.trim();
            if (question) {
                await sendQuestionToServer(question);
            }
        }
    });

    // Show suggestions while typing
    chatbotQuestion.addEventListener('input', async function () {
        const query = this.value.trim();
        if (query.length > 2) {
            try {
                const response = await fetch(`/chatbot/suggestions?query=${encodeURIComponent(query)}`);
                const data = await response.json();
                showSuggestions(data.suggestions);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            suggestionsList.innerHTML = '';
        }
    });

    // Send question to server
    async function sendQuestionToServer(question) {
        addMessage(question, 'user');
        chatbotQuestion.value = '';
        suggestionsList.innerHTML = '';

        try {
            const response = await fetch('/chatbot/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.answer, 'bot');
        } catch (error) {
            console.error('Error:', error);
            addMessage('Hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.', 'bot');
        }
    }

    // Show suggestions
    function showSuggestions(suggestions) {
        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', async function () {
                chatbotQuestion.value = suggestion;
                await sendQuestionToServer(suggestion);
            });
            suggestionsList.appendChild(suggestionItem);
        });
    }

    // Add message to chat
    function addMessage(text, sender) {
        const message = document.createElement('div');
        message.classList.add('message', sender);
        message.textContent = text;
        chatbotMessages.appendChild(message);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});