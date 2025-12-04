# Antigravity Browser 🛡️✨

**The Local-First AI Browser.**

Antigravity is a concept browser that runs advanced AI models **entirely on your device**. No cloud, no subscriptions, no data leaks. Just you, the web, and a powerful neural engine running in your browser tab.

![Antigravity Preview](https://via.placeholder.com/1200x600?text=Antigravity+Browser+Preview)

## Features

-   **Local Intelligence**: Powered by `WebLLM` and WebGPU, running models like Llama 3 and Gemma 2 locally.
-   **Privacy First**: Your chats and browsing data never leave your machine.
-   **Premium UI**: A sleek, dark-mode interface designed for focus and flow.
-   **Instant Answers**: Ask questions about the web, summarize content, and generate ideas without latency.

## Getting Started

### Prerequisites

-   A modern browser with **WebGPU** support (Chrome 113+, Edge, or others).
-   A GPU with at least 4GB of VRAM (recommended for decent performance).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/antigravity-browser.git
    cd antigravity-browser
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` and start browsing!

## How it Works

Antigravity uses [WebLLM](https://github.com/mlc-ai/web-llm) to download and execute Large Language Models (LLMs) directly in the browser's runtime using WebGPU. This means the "backend" is actually running inside your frontend application.

## Roadmap

- [ ] **Context Awareness**: Allow the AI to read the current tab's content (DOM).
- [ ] **History & Memory**: persistent local vector database for long-term memory.
- [ ] **Extensions**: Support for standard web extensions.
- [ ] **Multi-Model Support**: Switch between Llama, Gemma, Phi, and more.

## License

MIT
