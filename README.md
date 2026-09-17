# RaPal-AI-Chatbot

A lightweight web-based conversational assistant designed to answer questions regarding local regional policies, civic regulations, and public inquiries.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5 / CSS3](https://img.shields.io/badge/HTML5-CSS3-orange)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Installation

Clone the repository to your machine:

```bash
git clone https://github.com/DiaztMF/RaPal-AI-Chatbot.git
cd RaPal-AI-Chatbot
```

No build compilation or server installation is required.

## Quick Start

Open `index.html` in any web browser, or serve it locally:

```bash
npx serve .
```

Visit [http://localhost:3000](http://localhost:3000) to test the chatbot conversation interface.

## What is RaPal-AI-Chatbot?

`RaPal-AI-Chatbot` is a client-side conversational prototype engineered to assist citizens in discovering municipal regulations and civic programs. It presents a clean chat interface with automated prompts, helpful suggestion pills, and responsive layout scaling.

## Why RaPal-AI-Chatbot?

Navigating government documents and policy PDFs is tedious for citizens seeking quick answers. `RaPal-AI-Chatbot` provides an accessible, instant-response conversational UI pattern that simplifies civic knowledge retrieval.

## API / Routes

### Architecture Components
- `index.html`: Main chat bubble layout and message history viewport.
- `style.css`: Chat bubble typography, message animations, and avatar styling.
- `script.js`: Conversation state controller, input listeners, and simulated response delay triggers.

## Examples

Handling user messages inside `script.js`:

```javascript
function appendMessage(sender, text) {
  const chatContainer = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.textContent = text;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
```

## Architecture & Development Guides

- Zero Dependencies: Pure HTML5, CSS3, and modern Vanilla JS.
- Responsive Viewport: Optimized for both mobile browsers and desktop displays.

## License

MIT License. See [LICENSE](LICENSE) for full details.