import React, { useState, useEffect, useRef } from 'react';
import { Shield, Plus, X, ChevronLeft, ChevronRight, RotateCw, Star, LayoutTemplate, Sparkles, Search, Cpu, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalAI } from './hooks/useLocalAI';
import './App.css';

// --- Components ---

const Tab = ({ active, title, onClose, onClick }: { active: boolean; title: string; onClose: (e: React.MouseEvent) => void; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`tab ${active ? 'tab-active' : ''}`}
  >
    <div className="tab-title">{title || 'New Tab'}</div>
    <button onClick={onClose} className="tab-close">
      <X size={12} />
    </button>
  </div>
);

function App() {
  const [tabs, setTabs] = useState([
    { id: 1, title: 'New Tab', url: 'about:blank' },
    { id: 2, title: 'GitHub', url: 'https://github.com' }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [urlInput, setUrlInput] = useState('');
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const webviewRef = useRef<HTMLWebViewElement>(null);

  const { isLoading, progress, messages, sendMessage, isGenerating, isReady, error, resetError } = useLocalAI();

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    setUrlInput(activeTab.url === 'about:blank' ? '' : activeTab.url);
  }, [activeTab.id, activeTab.url]);

  const handleAddTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { id: newId, title: 'New Tab', url: 'about:blank' }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let url = urlInput.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    const newTabs = tabs.map(t => t.id === activeTabId ? { ...t, url, title: new URL(url).hostname } : t);
    setTabs(newTabs);
    setUrlInput(url);
  };

  return (
    <div className="app-container">
      {/* Titlebar / Tab Bar */}
      <div className="titlebar">
        <div className="logo">
          <div className="logo-icon">
            <Shield size={18} color="white" />
          </div>
          <span className="logo-text">Antigravity</span>
        </div>

        <div className="tabs-container">
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              active={tab.id === activeTabId}
              title={tab.title}
              onClose={(e) => handleCloseTab(e, tab.id)}
              onClick={() => setActiveTabId(tab.id)}
            />
          ))}
          <button onClick={handleAddTab} className="add-tab-btn">
            <Plus size={18} />
          </button>
        </div>

        <div className="titlebar-actions">
          <button
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
            className={`ai-toggle-btn ${isAiSidebarOpen ? 'active' : ''}`}
          >
            <LayoutTemplate size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="navbar glass">
        <div className="nav-buttons">
          <button className="nav-btn"><ChevronLeft size={20} /></button>
          <button className="nav-btn"><ChevronRight size={20} /></button>
          <button className="nav-btn"><RotateCw size={18} /></button>
        </div>

        <div className="url-bar-container">
          <form className="url-bar" onSubmit={handleNavigate}>
            <Search size={16} className="url-icon" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter website name"
              className="url-input"
            />
            <button type="button" className="bookmark-btn"><Star size={16} /></button>
          </form>
        </div>

        <div className="nav-spacer" />
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Browser Viewport */}
        <div className="browser-viewport">
          {activeTab.url !== 'about:blank' ? (
            // @ts-ignore - webview is an Electron tag
            <webview
              ref={webviewRef}
              src={activeTab.url}
              className="webview"
              // @ts-ignore
              allowpopups="true"
            />
          ) : (
            <div className="new-tab-page">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="new-tab-content"
              >
                <div className="new-tab-logo">
                  <Shield size={48} color="white" />
                </div>
                <h1 className="new-tab-title">Antigravity</h1>
                <p className="new-tab-subtitle">
                  The local-first AI browser.<br />
                  <span>Powered by WebGPU & Llama 3</span>
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        <AnimatePresence>
          {isAiSidebarOpen && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="ai-sidebar glass"
            >
              {/* Sidebar Header */}
              <div className="sidebar-header">
                <div className="sidebar-title">
                  <Sparkles size={18} className="sidebar-icon" />
                  <span>Neural Engine</span>
                </div>
                <div className={`status-badge ${isReady ? 'online' : error ? 'error' : ''}`}>
                  {error ? 'Error' : isLoading ? 'Loading...' : isReady ? 'Active' : 'Offline'}
                </div>
              </div>

              {/* Chat Area */}
              <div className="chat-area">
                {error ? (
                  <div className="chat-state error-state">
                    <AlertCircle size={32} className="state-icon error" />
                    <p className="state-title error">Failed to load model</p>
                    <p className="state-subtitle">{error}</p>
                    <button onClick={resetError} className="retry-btn">
                      Retry Connection
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="chat-state loading-state">
                    <div className="spinner">
                      <div className="spinner-track"></div>
                      <div className="spinner-fill"></div>
                    </div>
                    <p className="state-title">Initializing Neural Core</p>
                    <p className="state-subtitle">{progress || "Allocating GPU memory..."}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-state empty-state">
                    <Cpu size={48} className="state-icon" />
                    <p className="state-subtitle">Ask me anything about the web.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={idx}
                      className={`message ${msg.role}`}
                    >
                      <div className="message-bubble">{msg.content}</div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('prompt') as HTMLInputElement;
                    if (input.value.trim()) {
                      sendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="chat-form"
                >
                  <input
                    name="prompt"
                    type="text"
                    placeholder={isReady ? "Ask Antigravity..." : "Waiting for engine..."}
                    disabled={!isReady || isGenerating || !!error}
                    className="chat-input"
                    autoComplete="off"
                  />
                  {isGenerating && <div className="input-spinner" />}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
