import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  Menu,
  X,
  Moon,
  Sun,
  BookOpen,
  Info,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'linux' | 'general';
}

interface ChatSession {
  id: string;
  title: string;
  mode: 'linux' | 'general';
  messages: ChatMessage[];
  createdAt: string;
}

interface SystemInfo {
  distro: string;
  base: string;
  kernel: string;
  desktop: string;
  installer: string;
  aiModel: string;
  workflowFile: string;
  totalPreinstalledPackages: number;
  desktopAppEntry: string;
}

interface AppItem {
  id: string;
  name: string;
  genericName: string;
  description: string;
  exec: string;
  category: string;
  package: string;
  desktopFile: string;
}

interface LicenseInfo {
  type: string;
  spdx: string;
  copyright: string;
  content: string;
}

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('dorowu_ai_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'session-default',
        title: 'Dorowu Linux Diagnostics',
        mode: 'linux',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [
          {
            id: 'm-init',
            role: 'assistant',
            content: "Hello! I am the official Dorowu OS AI Assistant desktop application. Dorowu OS is a 100% real Arch Linux distribution featuring KDE Plasma 6, Calamares installer, GNU GPLv3 license, and automated GitHub Actions builds (.github/workflows/build-x86_64.yml). I can help you with pacman, systemd, btrfs, kernel setup, or any general coding and AI query. How can I help you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: 'linux',
          },
        ],
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-default';
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Theme State: 'slate' (default) vs 'light' (high-contrast light mode)
  const [theme, setTheme] = useState<'slate' | 'light'>(() => {
    const saved = localStorage.getItem('dorowu_theme');
    return saved === 'light' ? 'light' : 'slate';
  });

  useEffect(() => {
    localStorage.setItem('dorowu_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-slate');
    } else {
      document.documentElement.classList.add('theme-slate');
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  const isLight = theme === 'light';

  // Modals
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [systemInfoModalOpen, setSystemInfoModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Current session
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Session',
      mode: 'general',
      messages: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newId);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length === 1) return;
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    setCurrentSessionId(filtered[0]?.id || 'session-default');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: currentSession.mode,
    };

    setSessions(
      sessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, userMsg] }
          : s
      )
    );
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: currentSessionId,
          mode: currentSession.mode,
          conversationHistory: currentSession.messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: currentSession.mode,
      };

      setSessions(
        sessions.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
    } catch (error) {
      console.error('Error:', error);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: currentSession.mode,
      };
      setSessions(
        sessions.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errorMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string) => {
    const message = currentSession?.messages.find((m) => m.id === id);
    if (message) {
      navigator.clipboard.writeText(message.content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const sendMessage = () => {
    handleSendMessage();
  };

  // Theme toggle handler
  const toggleTheme = () => {
    setTheme(isLight ? 'slate' : 'light');
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isLight
        ? 'bg-slate-100 text-slate-900'
        : 'bg-slate-900 text-slate-100'
    }`}>
      {/* SIDEBAR */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 overflow-hidden ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-slate-800 border-slate-700'
        } border-r flex flex-col`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-700'
        }`}>
          <button
            onClick={handleNewSession}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isLight
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
            }`}
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="group">
              <button
                onClick={() => setCurrentSessionId(session.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm truncate ${
                  currentSessionId === session.id
                    ? isLight
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-blue-900 text-blue-100'
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MessageSquare size={16} className="inline mr-2" />
                {session.title}
              </button>
              <button
                onClick={() => handleDeleteSession(session.id)}
                className={`opacity-0 group-hover:opacity-100 absolute right-4 p-1 rounded transition-opacity ${
                  isLight
                    ? 'hover:bg-red-100 text-red-600'
                    : 'hover:bg-red-900 text-red-400'
                }`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t space-y-2 ${
          isLight ? 'border-slate-200' : 'border-slate-700'
        }`}>
          <button
            onClick={() => setSystemInfoModalOpen(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Info size={16} />
            System Info
          </button>
          <button
            onClick={() => setWorkflowModalOpen(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap size={16} />
            CI/CD Workflow
          </button>
          <button
            onClick={() => setLicenseModalOpen(true)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen size={16} />
            License
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER WITH THEME TOGGLE */}
        <header className={`border-b ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-800 border-slate-700'
        } px-4 py-3 flex items-center justify-between shadow-sm`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isLight
                  ? 'hover:bg-slate-100'
                  : 'hover:bg-slate-700'
              }`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-bold">
              Dorowu OS AI Assistant
            </h1>
          </div>

          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
            }`}
            title={`Switch to ${isLight ? 'dark (slate)' : 'light'} theme`}
          >
            {isLight ? (
              <>
                <Moon size={18} />
                <span className="text-sm">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={18} />
                <span className="text-sm">Light Mode</span>
              </>
            )}
          </button>
        </header>

        {/* CHAT AREA */}
        {currentSession ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-sm lg:max-w-md rounded-lg p-3 group relative ${
                      msg.role === 'user'
                        ? isLight
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-blue-900 text-blue-100'
                        : isLight
                        ? 'bg-slate-200 text-slate-900'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className={`text-xs mt-1 block ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {msg.timestamp}
                    </span>
                    <button
                      onClick={() => handleCopyMessage(msg.id)}
                      className={`opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded transition-opacity ${
                        isLight
                          ? 'hover:bg-slate-300'
                          : 'hover:bg-slate-600'
                      }`}
                    >
                      {copiedId === msg.id ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`px-3 py-2 rounded-lg ${
                    isLight
                      ? 'bg-slate-200 text-slate-900'
                      : 'bg-slate-700 text-slate-100'
                  }`}>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-slate-800 border-slate-700'
            }`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500'
                      : 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isLoading || !inputMessage.trim()
                      ? isLight
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : isLight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              No session selected
            </p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {workflowModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`rounded-lg p-6 max-w-lg w-full ${
            isLight ? 'bg-white' : 'bg-slate-800'
          }`}>
            <h2 className="text-xl font-bold mb-4">CI/CD Workflow</h2>
            <p className="text-sm mb-4">
              Dorowu OS is built and released using GitHub Actions (.github/workflows/build-x86_64.yml).
            </p>
            <button
              onClick={() => setWorkflowModalOpen(false)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isLight
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {systemInfoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`rounded-lg p-6 max-w-lg w-full ${
            isLight ? 'bg-white' : 'bg-slate-800'
          }`}>
            <h2 className="text-xl font-bold mb-4">System Information</h2>
            <div className="text-sm space-y-2 mb-4">
              <p><strong>Distro:</strong> Dorowu OS 2026.10</p>
              <p><strong>Base:</strong> Arch Linux</p>
              <p><strong>Desktop:</strong> KDE Plasma 6</p>
              <p><strong>Installer:</strong> Calamares</p>
              <p><strong>AI Model:</strong> Google Gemini (via @google/genai)</p>
            </div>
            <button
              onClick={() => setSystemInfoModalOpen(false)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isLight
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {licenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto ${
            isLight ? 'bg-white' : 'bg-slate-800'
          }`}>
            <h2 className="text-xl font-bold mb-4">License</h2>
            <p className="text-sm mb-4">
              Dorowu OS is licensed under the GNU General Public License v3.0 (GPLv3).
            </p>
            <button
              onClick={() => setLicenseModalOpen(false)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isLight
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
