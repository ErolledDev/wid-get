export class ChatWidget {
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right',
      primaryColor: '#2563eb',
      businessName: 'AI Sales Assistant',
      businessInfo: '',
      ...options
    };
    
    this.messages = [];
    this.isMinimized = false;
    this.init();
  }

  init() {
    this.createStyles();
    this.createWidget();
    this.attachEventListeners();
  }

  createStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      .chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: system-ui, -apple-system, sans-serif;
        transition: height 0.3s ease;
      }

      .chat-widget.minimized {
        height: 60px;
      }

      .chat-header {
        background: ${this.options.primaryColor};
        color: white;
        padding: 16px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
      }

      .minimize-button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        font-size: 1.2em;
      }

      .settings-button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        font-size: 1.2em;
        margin-left: 8px;
      }

      .settings-panel {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        padding: 16px;
        display: none;
        flex-direction: column;
        gap: 16px;
        z-index: 2;
      }

      .settings-panel.active {
        display: flex;
      }

      .settings-panel h2 {
        margin: 0;
        color: ${this.options.primaryColor};
      }

      .settings-panel textarea {
        flex: 1;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        resize: none;
        font-family: inherit;
      }

      .settings-panel button {
        background: ${this.options.primaryColor};
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 14px;
        margin: 4px 0;
      }

      .message.user {
        background: ${this.options.primaryColor};
        color: white;
        align-self: flex-end;
      }

      .message.assistant {
        background: #f3f4f6;
        color: black;
        align-self: flex-start;
      }

      .typing-indicator {
        display: none;
        align-self: flex-start;
        background: #f3f4f6;
        padding: 12px 16px;
        border-radius: 14px;
        margin: 4px 0;
      }

      .typing-indicator.active {
        display: flex;
        align-items: center;
      }

      .typing-dots {
        display: flex;
        gap: 4px;
      }

      .typing-dot {
        width: 6px;
        height: 6px;
        background: #666;
        border-radius: 50%;
        animation: typing-animation 1.4s infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing-animation {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        30% {
          transform: translateY(-4px);
          opacity: 1;
        }
      }

      .chat-input {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }

      .chat-input input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        outline: none;
      }

      .chat-input button {
        background: ${this.options.primaryColor};
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }

      .chat-input button:hover {
        opacity: 0.9;
      }

      .error-message {
        color: #ef4444;
        font-size: 0.875rem;
        margin: 4px 0;
      }
    `;
    document.head.appendChild(styles);
  }

  createWidget() {
    this.widget = document.createElement('div');
    this.widget.className = 'chat-widget';

    this.widget.innerHTML = `
      <div class="chat-header">
        <span>${this.options.businessName}</span>
        <div class="header-buttons">
          <button class="minimize-button">−</button>
          <button class="settings-button">⚙️</button>
        </div>
      </div>
      <div class="settings-panel">
        <h2>Business Information</h2>
        <textarea placeholder="Enter your business information, products, services, and any specific sales instructions for the AI...">${this.options.businessInfo}</textarea>
        <button>Save Settings</button>
      </div>
      <div class="chat-messages"></div>
      <div class="typing-indicator">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" placeholder="Type your message..." />
        <button>Send</button>
      </div>
    `;

    document.body.appendChild(this.widget);

    this.messagesContainer = this.widget.querySelector('.chat-messages');
    this.input = this.widget.querySelector('input');
    this.sendButton = this.widget.querySelector('.chat-input button');
    this.settingsButton = this.widget.querySelector('.settings-button');
    this.minimizeButton = this.widget.querySelector('.minimize-button');
    this.settingsPanel = this.widget.querySelector('.settings-panel');
    this.settingsTextarea = this.widget.querySelector('textarea');
    this.settingsSaveButton = this.settingsPanel.querySelector('button');
    this.typingIndicator = this.widget.querySelector('.typing-indicator');

    // Add initial greeting
    this.addMessage({
      role: 'assistant',
      content: 'Hello! How can I help you today?'
    });
  }

  attachEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Minimize functionality
    this.minimizeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });

    this.widget.querySelector('.chat-header').addEventListener('click', () => {
      if (this.isMinimized) {
        this.toggleMinimize();
      }
    });

    // Settings panel events
    this.settingsButton.addEventListener('click', () => {
      this.settingsPanel.classList.toggle('active');
    });

    this.settingsSaveButton.addEventListener('click', () => {
      this.options.businessInfo = this.settingsTextarea.value;
      this.settingsPanel.classList.remove('active');
      
      // Clear chat history and start fresh with new business context
      this.messages = [];
      this.messagesContainer.innerHTML = '';
      
      // Add new greeting with business context
      this.addMessage({
        role: 'assistant',
        content: 'Hello! I\'ve been updated with your business information. How can I help you today?'
      });
    });
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.widget.classList.toggle('minimized');
    this.minimizeButton.textContent = this.isMinimized ? '+' : '−';
  }

  showTypingIndicator() {
    this.typingIndicator.classList.add('active');
  }

  hideTypingIndicator() {
    this.typingIndicator.classList.remove('active');
  }

  async sendMessage() {
    const content = this.input.value.trim();
    if (!content) return;

    // Clear input
    this.input.value = '';

    // Add user message
    this.addMessage({ role: 'user', content });

    // Prepare messages with business context
    const messagesWithContext = [];
    
    // Add business context if available
    if (this.options.businessInfo) {
      messagesWithContext.push({
        role: 'system',
        content: `You are a sales assistant for the following business:\n${this.options.businessInfo}\n\nUse this information to help drive sales and assist customers effectively.`
      });
    }

    // Add conversation history
    messagesWithContext.push(...this.messages, { role: 'user', content });

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesWithContext }),
      });

      // Hide typing indicator
      this.hideTypingIndicator();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from server');
      }

      const data = await response.json();
      
      // Add AI response
      this.addMessage({
        role: 'assistant',
        content: data.response
      });

      // Add to history
      this.messages.push(
        { role: 'user', content },
        { role: 'assistant', content: data.response }
      );
    } catch (error) {
      console.error('Error:', error);
      this.hideTypingIndicator();
      this.addMessage({
        role: 'assistant',
        content: `Error: ${error.message}. Please try again.`
      });
    }
  }

  addMessage({ role, content }) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    messageEl.textContent = content;
    this.messagesContainer.appendChild(messageEl);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}