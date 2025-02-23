export class ChatWidget {
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right',
      primaryColor: '#2563eb',
      businessName: 'AI Sales Assistant',
      ...options
    };
    
    this.messages = [];
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
      }

      .chat-header {
        background: ${this.options.primaryColor};
        color: white;
        padding: 16px;
        font-weight: bold;
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
    `;
    document.head.appendChild(styles);
  }

  createWidget() {
    this.widget = document.createElement('div');
    this.widget.className = 'chat-widget';

    this.widget.innerHTML = `
      <div class="chat-header">${this.options.businessName}</div>
      <div class="chat-messages"></div>
      <div class="chat-input">
        <input type="text" placeholder="Type your message..." />
        <button>Send</button>
      </div>
    `;

    document.body.appendChild(this.widget);

    this.messagesContainer = this.widget.querySelector('.chat-messages');
    this.input = this.widget.querySelector('input');
    this.sendButton = this.widget.querySelector('button');

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
  }

  async sendMessage() {
    const content = this.input.value.trim();
    if (!content) return;

    // Clear input
    this.input.value = '';

    // Add user message
    this.addMessage({ role: 'user', content });

    // Add messages to history
    this.messages.push({ role: 'user', content });

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: this.messages }),
      });

      const data = await response.json();
      
      // Add AI response
      this.addMessage({
        role: 'assistant',
        content: data.response
      });

      // Add to history
      this.messages.push({
        role: 'assistant',
        content: data.response
      });
    } catch (error) {
      console.error('Error:', error);
      this.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
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