// Chat widget implementation
class ChatWidget {
  constructor(options = {}) {
    // Ensure this is only initialized in browser environment
    if (typeof window === 'undefined') return;
    
    // Require uid parameter
    if (!options.uid) {
      console.error('ChatWidget: uid parameter is required');
      return;
    }

    this.options = {
      position: 'bottom-right',
      primaryColor: '#2563eb',
      businessName: 'AI Sales Assistant',
      businessInfo: '',
      salesRepName: ''
    };
    
    this.messages = [];
    this.isMinimized = false;
    this.initialized = false;
    this.uid = options.uid;

    // Create base widget structure
    this.createBaseWidget();
    
    // Fetch settings from API
    this.fetchSettings();
  }

  async fetchSettings() {
    try {
      const response = await fetch(`https://chatwidgetai.netlify.app/.netlify/functions/settings?uid=${this.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const settings = await response.json();
      this.options = {
        ...this.options,
        primaryColor: settings.primary_color || this.options.primaryColor,
        businessName: settings.business_name || this.options.businessName,
        businessInfo: settings.business_info || this.options.businessInfo,
        salesRepName: settings.sales_rep_name || this.options.salesRepName
      };
      
      // Update or initialize the widget
      if (this.initialized) {
        this.updateWidgetStyles();
        this.updateWidgetContent();
      } else {
        this.init();
      }
    } catch (error) {
      console.error('Error fetching widget settings:', error);
      // Initialize with defaults if settings fetch fails
      if (!this.initialized) {
        this.init();
      }
    }
  }

  createBaseWidget() {
    this.widget = document.createElement('div');
    this.widget.className = 'chat-widget';
    document.body.appendChild(this.widget);
  }

  init() {
    if (typeof window === 'undefined' || this.initialized) return;
    
    this.createStyles();
    this.createWidgetContent();
    this.attachEventListeners();
    this.initialized = true;
  }

  updateWidgetStyles() {
    // Remove old styles
    const oldStyle = document.getElementById('chat-widget-styles');
    if (oldStyle) {
      oldStyle.remove();
    }
    // Create new styles
    this.createStyles();
  }

  updateWidgetContent() {
    // Update header text
    const headerText = this.widget.querySelector('.chat-header span');
    if (headerText) {
      headerText.textContent = this.options.businessName;
    }

    // Update button colors
    const sendButton = this.widget.querySelector('.chat-input button');
    if (sendButton) {
      sendButton.style.backgroundColor = this.options.primaryColor;
    }

    // Update header background
    const header = this.widget.querySelector('.chat-header');
    if (header) {
      header.style.backgroundColor = this.options.primaryColor;
    }

    // Update user message bubbles
    const userMessages = this.widget.querySelectorAll('.message.user');
    userMessages.forEach(msg => {
      msg.style.backgroundColor = this.options.primaryColor;
    });
  }

  createStyles() {
    const styles = document.createElement('style');
    styles.id = 'chat-widget-styles';
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
        z-index: 999999;
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
        transition: background-color 0.3s ease;
      }

      .minimize-button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        font-size: 1.2em;
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
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        line-height: 1.4;
        transition: background-color 0.3s ease;
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
        transition: background-color 0.3s ease;
      }

      .chat-input button:hover {
        opacity: 0.9;
      }
    `;
    document.head.appendChild(styles);
  }

  createWidgetContent() {
    this.widget.innerHTML = `
      <div class="chat-header">
        <span>${this.options.businessName}</span>
        <button class="minimize-button">−</button>
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

    this.messagesContainer = this.widget.querySelector('.chat-messages');
    this.input = this.widget.querySelector('input');
    this.sendButton = this.widget.querySelector('.chat-input button');
    this.typingIndicator = this.widget.querySelector('.typing-indicator');

    // Add initial greeting
    const greeting = this.options.salesRepName 
      ? `Hello! I'm ${this.options.salesRepName} from ${this.options.businessName}. How can I help you today?`
      : `Hello! Welcome to ${this.options.businessName}. How can I help you today?`;
    
    this.addMessage({
      role: 'assistant',
      content: greeting
    });
  }

  attachEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    this.widget.querySelector('.minimize-button').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });

    this.widget.querySelector('.chat-header').addEventListener('click', () => {
      if (this.isMinimized) {
        this.toggleMinimize();
      }
    });
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.widget.classList.toggle('minimized');
    this.widget.querySelector('.minimize-button').textContent = this.isMinimized ? '+' : '−';
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
        content: `You are a sales assistant for the following business:\n${this.options.businessInfo}\n\nUse this information to help drive sales and assist customers effectively.${this.options.salesRepName ? `\n\nYour name is ${this.options.salesRepName}.` : ''}`
      });
    }

    // Add conversation history
    messagesWithContext.push(...this.messages);

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await fetch('https://chatwidgetai.netlify.app/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesWithContext }),
        mode: 'cors'
      });

      // Hide typing indicator
      this.hideTypingIndicator();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        content: 'I apologize, but I encountered an error. Please try again in a moment.'
      });
    }
  }

  addMessage({ role, content }) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    messageEl.textContent = content;
    this.messagesContainer.appendChild(messageEl);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    // Update message styling if it's a user message
    if (role === 'user') {
      messageEl.style.backgroundColor = this.options.primaryColor;
    }
  }
}

// Make ChatWidget available both as a module export and global variable
if (typeof window !== 'undefined') {
  window.ChatWidget = ChatWidget;
}

export { ChatWidget };