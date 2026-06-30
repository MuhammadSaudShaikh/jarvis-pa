// Check if user is logged in
const token = localStorage.getItem('jarvis_token');
const username = localStorage.getItem('jarvis_user');

if (!token || !username) {
    // No token, redirect to login
    window.location.href = '/login.html';
}

// Display username
document.getElementById('userName').textContent = username;

// DOM Elements
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// Send message function
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Add user message to UI
    addMessageToUI('user', message);
    
    // Show loading indicator
    const loadingId = showLoading();
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove loading
        removeLoading(loadingId);
        
        if (response.ok) {
            // Add assistant reply to UI
            addMessageToUI('assistant', data.reply);
        } else {
            addMessageToUI('assistant', `Error: ${data.error || 'Something went wrong'}`);
        }
    } catch (err) {
        removeLoading(loadingId);
        addMessageToUI('assistant', `Network error: ${err.message}`);
    }
    
    // Scroll to bottom
    scrollToBottom();
}

// Add message to UI
function addMessageToUI(role, content) {
    // Remove welcome message if it exists
    const welcomeMsg = messagesArea.querySelector('.welcome-message');
    if (welcomeMsg && messagesArea.children.length === 1) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
    messagesArea.appendChild(messageDiv);
    scrollToBottom();
}

// Show loading animation
function showLoading() {
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'message assistant';
    loadingDiv.innerHTML = `<div class="message-content">🤔 Thinking<span class="dots"></span></div>`;
    messagesArea.appendChild(loadingDiv);
    scrollToBottom();
    return loadingId;
}

// Remove loading
function removeLoading(loadingId) {
    const loading = document.getElementById(loadingId);
    if (loading) loading.remove();
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll to bottom
function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Load chat history
async function loadHistory() {
    try {
        const response = await fetch('/chat/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.history && data.history.length > 0) {
            // Clear welcome message
            const welcomeMsg = messagesArea.querySelector('.welcome-message');
            if (welcomeMsg) welcomeMsg.remove();
            
            // Add all messages
            data.history.forEach(msg => {
                addMessageToUI(msg.role, msg.content);
            });
        }
    } catch (err) {
        console.error('Failed to load history:', err);
    }
}

// Clear history
async function clearHistory() {
    if (!confirm('Are you sure you want to clear all chat history?')) return;
    
    try {
        const response = await fetch('/chat/history', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Clear UI
            messagesArea.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🤖</div>
                    <h3>Welcome to Jarvis!</h3>
                    <p>Your personal AI assistant. Ask me anything!</p>
                    <p style="font-size: 12px; margin-top: 10px;">💡 Try: "Mera naam kya hai?" — I remember our conversation</p>
                </div>
            `;
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to clear history'));
        }
    } catch (err) {
        alert('Network error: ' + err.message);
    }
}

// Logout
function logout() {
    localStorage.removeItem('jarvis_token');
    localStorage.removeItem('jarvis_user');
    window.location.href = '/login.html';
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
clearHistoryBtn.addEventListener('click', clearHistory);
logoutBtn.addEventListener('click', logout);


messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Load history on page load
loadHistory();

// Add dot animation CSS
const style = document.createElement('style');
style.textContent = `
    .dots::after {
        content: '...';
        animation: dots 1.5s steps(4, end) infinite;
        display: inline-block;
        width: 20px;
        text-align: left;
    }
    @keyframes dots {
        0%, 20% { content: ''; }
        40% { content: '.'; }
        60% { content: '..'; }
        80%, 100% { content: '...'; }
    }
`;
document.head.appendChild(style);