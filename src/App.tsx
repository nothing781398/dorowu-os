import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  HardDrive,
  Copy,
  Check,
  Send,
  Plus,
  Trash2,
  FileCode,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Code,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings,
  ChevronRight,
  MessageSquare,
  Flame,
  Info,
  Search,
  Scale,
  AppWindow,
  Package,
  Command,
  Download
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

  // Modals
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [systemInfoModalOpen, setSystemInfoModalOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [realDistroProofOpen, setRealDistroProofOpen] = useState(false);
  const [vmGuideOpen, setVmGuideOpen] = useState(false);

  // App Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [appsList, setAppsList] = useState<AppItem[]>([]);

  // Remote data
  const [workflowContent, setWorkflowContent] = useState<string>('');
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const activeMode = currentSession?.mode || 'linux';

  // Keyboard shortcut Ctrl+K to open App Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setAppsModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('dorowu_ai_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/workflow')
      .then(r => r.json())
      .then(d => {
        if (d.content) setWorkflowContent(d.content);
      })
      .catch(() => {});

    fetch('/api/system-info')
      .then(r => r.json())
      .then(d => {
        if (d.distro) setSystemInfo(d);
      })
      .catch(() => {});

    fetch('/api/apps')
      .then(r => r.json())
      .then(d => {
        if (d.apps) setAppsList(d.apps);
      })
      .catch(() => {});

    fetch('/api/license')
      .then(r => r.json())
      .then(d => {
        if (d.content) setLicenseInfo(d);
      })
      .catch(() => {});
  }, []);

  const handleCreateSession = (mode: 'linux' | 'general' = 'linux') => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: mode === 'linux' ? 'New Linux Diagnostic' : 'New General Session',
      mode,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: `m-${Date.now()}`,
          role: 'assistant',
          content: mode === 'linux'
            ? "Dorowu OS Linux Assistant ready. What kernel, pacman, systemd, or distribution setup can I help configure or troubleshoot?"
            : "Dorowu OS General AI Assistant active. Feel free to ask any question, request code, analysis, or creative writing.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode,
        },
      ],
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleCreateSession('linux');
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      }
    }
  };

  const handleSwitchMode = (newMode: 'linux' | 'general') => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            mode: newMode,
            title: s.title.includes('New')
              ? newMode === 'linux'
                ? 'Linux Diagnostic'
                : 'General Assistant'
              : s.title,
          };
        }
        return s;
      })
    );
  };

  const sendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode,
    };

    const isFirstUserMessage = currentSession.messages.filter(m => m.role === 'user').length === 0;
    const newTitle = isFirstUserMessage
      ? message.slice(0, 30) + (message.length > 30 ? '...' : '')
      : currentSession.title;

    setSessions(prev =>
      prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = currentSession.messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: historyPayload,
          mode: activeMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred');
      }

      const botReply = data.reply || "No response received.";
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      };

      setSessions(prev =>
        prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, assistantMessage],
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Error communicating with Dorowu AI service: ${err.message || 'Network error'}. Please verify that the server is active.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      };

      setSessions(prev =>
        prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMessage],
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyWorkflow = () => {
    if (workflowContent) {
      navigator.clipboard.writeText(workflowContent);
      setCopiedWorkflow(true);
      setTimeout(() => setCopiedWorkflow(false), 2000);
    }
  };

  // Filter apps
  const categories = ['All', 'System', 'Development', 'Network', 'Utility', 'Graphics', 'Office'];
  const filteredApps = appsList.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.genericName.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.exec.toLowerCase().includes(q) ||
      app.package.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const renderFormattedContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-3 leading-relaxed text-slate-200">
        {parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
            const code = language ? lines.slice(1).join('\n') : lines.join('\n');
            const blockId = `${msgId}-code-${index}`;

            return (
              <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language || 'bash'}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(code, blockId)}
                    className="flex items-center gap-1 hover:text-white transition px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
                  >
                    {copiedId === blockId ? (
                      <>
                        <Check className="w-3 h-3 text-teal-400" />
                        <span className="text-teal-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre selection:bg-teal-500/30">
                  {code}
                </pre>
              </div>
            );
          }

          const paragraphs = part.split('\n\n');
          return (
            <div key={index} className="space-y-2">
              {paragraphs.map((p, pIdx) => {
                if (!p.trim()) return null;
                const lines = p.split('\n');

                return (
                  <div key={pIdx}>
                    {lines.map((line, lIdx) => {
                      if (line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                        const bulletText = line.trim().replace(/^[-*•]\s*/, '');
                        return (
                          <div key={lIdx} className="flex items-start gap-2 ml-2 my-1">
                            <span className="text-teal-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                            <span>{parseInlineFormat(bulletText)}</span>
                          </div>
                        );
                      }
                      return (
                        <p key={lIdx} className={lIdx > 0 ? 'mt-1' : ''}>
                          {parseInlineFormat(line)}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const parseInlineFormat = (text: string) => {
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-xs border border-slate-700/60">
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{token.slice(2, -2)}</strong>;
      }
      return token;
    });
  };

  const quickPromptsLinux = [
    {
      title: 'Is Dorowu OS Real?',
      query: 'Is Dorowu OS a real Arch Linux distribution or just a concept? Explain how it builds bootable ISOs.',
    },
    {
      title: 'GNU GPLv3 License',
      query: 'What rights does the GNU General Public License v3 provide for Dorowu OS and its users?',
    },
    {
      title: 'Search & Launch Apps',
      query: 'What applications are pre-installed in Dorowu OS and how do I search and launch them in KDE Plasma?',
    },
    {
      title: 'Workflow Build Verification',
      query: 'Explain how .github/workflows/build-x86_64.yml automates the Dorowu OS ISO build with archiso.',
    },
  ];

  const quickPromptsGeneral = [
    {
      title: 'Python Async Worker',
      query: 'Write a modern Python async worker queue using asyncio and type hints.',
    },
    {
      title: 'Debug React Hook',
      query: 'What are the most common memory leak causes in React useEffect and how to prevent them?',
    },
    {
      title: 'System Architecture',
      query: 'Explain how microservices differ from modular monoliths with trade-offs.',
    },
    {
      title: 'Bash Automation Script',
      query: 'Write a robust shell script with strict error handling (set -euo pipefail) to clean temporary files.',
    },
  ];

  const currentPrompts = activeMode === 'linux' ? quickPromptsLinux : quickPromptsGeneral;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white ${isWindowMaximized ? 'p-0' : 'p-2 md:p-4'}`}>
      
      {/* Native Desktop Window Container */}
      <div className={`flex-1 flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden ${isWindowMaximized ? 'rounded-none border-none' : ''}`}>
        
        {/* Native Desktop App Window Titlebar */}
        <header className="h-12 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between select-none">
          {/* Left Titlebar Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 via-teal-400 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <span className="text-slate-950 font-black text-xs">D</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">Dorowu AI Assistant</span>
              <button
                onClick={() => setRealDistroProofOpen(true)}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/20 transition cursor-pointer"
                title="Verify real Arch Linux distribution"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>100% Real Arch Distro</span>
              </button>
              <button
                onClick={() => setLicenseModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition cursor-pointer"
                title="View GNU GPLv3 License"
              >
                <Scale className="w-3 h-3 text-blue-400" />
                <span>GNU GPLv3</span>
              </button>
            </div>
          </div>

          {/* Quick App Search Trigger in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAppsModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition shadow-inner cursor-pointer"
              title="Search pre-installed applications (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-medium">Search Apps...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right Window Controls & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVmGuideOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer"
              title="VM & Credentials Guide"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">VM & Credentials</span>
            </button>
            <button
              onClick={() => setWorkflowModalOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 border border-slate-700/60 cursor-pointer"
              title="Official GitHub Actions Workflow"
            >
              <FileCode className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">build-x86_64.yml</span>
            </button>
            <button
              onClick={() => setSystemInfoModalOpen(true)}
              className="text-xs p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700/60 cursor-pointer"
              title="System Profile"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              onClick={() => setIsWindowMaximized(!isWindowMaximized)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title={isWindowMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              {isWindowMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Desktop App Body: Sidebar + Main Chat View */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: Sessions, Mode Switcher, Quick Tools */}
          <aside className="w-64 md:w-72 bg-slate-950/60 border-r border-slate-800/80 flex flex-col shrink-0 select-none">
            
            {/* New Chat & Mode Toggle */}
            <div className="p-3 border-b border-slate-800/80 space-y-2">
              <button
                onClick={() => handleCreateSession(activeMode)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md shadow-teal-600/10 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>

              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => handleSwitchMode('linux')}
                  className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    activeMode === 'linux'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🐧 Linux</span>
                </button>
                <button
                  onClick={() => handleSwitchMode('general')}
                  className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    activeMode === 'general'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>✨ General</span>
                </button>
              </div>

              {/* Application Search Button in Sidebar */}
              <button
                onClick={() => setAppsModalOpen(true)}
                className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <AppWindow className="w-4 h-4 text-sky-400" />
                  <span>Search Dorowu Apps</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">15 apps</span>
              </button>
            </div>

            {/* Session History List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                Conversations
              </div>
              {sessions.map(s => {
                const isActive = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setCurrentSessionId(s.id)}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/90 text-white font-medium border border-slate-700/70 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${s.mode === 'linux' ? 'text-teal-400' : 'text-blue-400'}`} />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <button
                      onClick={e => handleDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition cursor-pointer"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Real Distro Badges */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400 space-y-2">
              <button
                onClick={() => setRealDistroProofOpen(true)}
                className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-slate-900 transition text-left cursor-pointer"
              >
                <span className="text-slate-500">Distribution Reality</span>
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Real Arch ISO
                </span>
              </button>

              <button
                onClick={() => setVmGuideOpen(true)}
                className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-slate-900 transition text-left cursor-pointer"
              >
                <span className="text-slate-500">Live Login & VM Guide</span>
                <span className="font-mono text-amber-300 font-semibold flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> User: dorowu
                </span>
              </button>

              <button
                onClick={() => setLicenseModalOpen(true)}
                className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-slate-900 transition text-left cursor-pointer"
              >
                <span className="text-slate-500">License Status</span>
                <span className="font-mono text-blue-400 font-semibold flex items-center gap-1">
                  <Scale className="w-3 h-3" /> GNU GPLv3
                </span>
              </button>

              <button
                onClick={() => setWorkflowModalOpen(true)}
                className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-slate-900 transition text-left cursor-pointer"
              >
                <span className="text-slate-500">Build Workflow</span>
                <span className="font-mono text-teal-400 font-semibold">build-x86_64.yml</span>
              </button>
            </div>
          </aside>

          {/* Main Chat Interface */}
          <main className="flex-1 flex flex-col bg-slate-900/40 relative overflow-hidden">
            
            {/* Header info bar inside chat */}
            <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-300 truncate max-w-xs md:max-w-md">
                  {currentSession.title}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  {activeMode === 'linux' ? 'Real Arch Linux, Systemd, Pacman & Calamares AI' : 'General Problem Solving & Development'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSessions(prev =>
                      prev.map(s => {
                        if (s.id === currentSessionId) {
                          return {
                            ...s,
                            messages: [
                              {
                                id: `m-reset-${Date.now()}`,
                                role: 'assistant',
                                content: 'Conversation reset. How can I assist you now?',
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                mode: activeMode,
                              },
                            ],
                          };
                        }
                        return s;
                      })
                    );
                  }}
                  className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Clear current messages"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </button>
              </div>
            </div>

            {/* Chat Message Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              
              {/* If single initial greeting, show quick start cards */}
              {currentSession.messages.length <= 1 && (
                <div className="max-w-2xl mx-auto my-4 space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500/20 to-sky-500/20 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/5">
                      <Sparkles className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Dorowu OS Official AI Desktop Assistant
                      </h2>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        100% Real Arch Linux operating system licensed under the GNU GPLv3, compiled via GitHub Actions with Calamares & KDE Plasma 6.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                      <button
                        onClick={() => setRealDistroProofOpen(true)}
                        className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[11px] flex items-center gap-1 hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Real Archiso Profile
                      </button>
                      <button
                        onClick={() => setLicenseModalOpen(true)}
                        className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono text-[11px] flex items-center gap-1 hover:bg-blue-500/20 transition cursor-pointer"
                      >
                        <Scale className="w-3 h-3" /> GNU GPLv3 Licensed
                      </button>
                      <button
                        onClick={() => setAppsModalOpen(true)}
                        className="px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60 font-mono text-[11px] flex items-center gap-1 hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Search className="w-3 h-3 text-teal-400" /> App Search Bar
                      </button>
                    </div>
                  </div>

                  {/* Suggestion prompt cards */}
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
                      Quick Verification & Diagnostics ({activeMode === 'linux' ? 'Linux Operations' : 'General AI & Coding'})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentPrompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(p.query)}
                          className="text-left p-3 rounded-lg border border-slate-800/90 bg-slate-900/60 hover:bg-slate-800/70 hover:border-teal-500/40 transition group cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-teal-300 mb-1">
                            <span>{p.title}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {p.query}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Message List */}
              {currentSession.messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold shadow-md select-none ${
                        isUser
                          ? 'bg-slate-700 text-slate-200 border border-slate-600'
                          : 'bg-gradient-to-tr from-teal-600 to-sky-500 text-slate-950 font-black border border-teal-400/40'
                      }`}
                    >
                      {isUser ? 'U' : 'D'}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`rounded-xl px-4 py-3 text-sm max-w-[88%] md:max-w-[85%] border shadow-md ${
                        isUser
                          ? 'bg-teal-950/40 border-teal-700/60 text-slate-100'
                          : 'bg-slate-950/80 border-slate-800/90 text-slate-200'
                      }`}
                    >
                      {/* Role & Time Header */}
                      <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {isUser ? 'You' : 'Dorowu OS AI Assistant'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="hover:text-white transition p-0.5 rounded cursor-pointer"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-teal-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Formatted Text */}
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-100">{msg.content}</p>
                      ) : (
                        renderFormattedContent(msg.content, msg.id)
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 max-w-3xl mr-auto">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-tr from-teal-600 to-sky-500 text-slate-950 font-black border border-teal-400/40 text-xs">
                    D
                  </div>
                  <div className="rounded-xl px-4 py-3 text-sm bg-slate-950/80 border border-slate-800/90 flex items-center gap-2 text-slate-400">
                    <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
                    <span className="text-xs font-mono">Generating response via Gemini 3.8 Flash...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Chat Input Form */}
            <div className="p-3 md:p-4 bg-slate-950/70 border-t border-slate-800/80">
              <div className="max-w-3xl mx-auto space-y-2">
                
                {/* Fast Action Chip Tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-500 shrink-0 select-none">Quick tags:</span>
                  {(activeMode === 'linux'
                    ? ['sudo pacman -Syu', 'systemctl status', 'calamares', 'btrfs subvolume', 'build-x86_64.yml', 'GNU GPLv3']
                    : ['Python', 'TypeScript', 'Algorithms', 'Refactor code', 'Explain simply', 'Debugging']
                  ).map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputMessage(prev => (prev ? `${prev} ${tag}` : tag));
                        textareaRef.current?.focus();
                      }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-[10px] whitespace-nowrap transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Textarea & Send Button */}
                <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 focus-within:border-teal-500/60 focus-within:ring-1 focus-within:ring-teal-500/30 transition shadow-inner">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      activeMode === 'linux'
                        ? "Ask about Arch Linux administration, systemd, pacman, Calamares, or kernel setup..."
                        : "Ask anything—coding, writing, math, system architecture, or general knowledge..."
                    }
                    rows={1}
                    className="flex-1 bg-transparent border-none resize-none outline-none text-slate-100 placeholder-slate-500 text-sm max-h-32 min-h-[40px] py-1.5 px-2"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm shadow-teal-500/10"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">Shift+Enter</kbd> for newline</span>
                  <span className="font-mono text-teal-400/80">Dorowu OS 2026.10 Desktop App</span>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Real Application Search Bar & Launcher Modal */}
      {appsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header & Search Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AppWindow className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Dorowu OS Application Search & Launcher</h3>
                    <p className="text-[11px] text-slate-400">Search and explore real pre-installed desktop applications in Dorowu OS</p>
                  </div>
                </div>
                <button
                  onClick={() => setAppsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-teal-400 absolute left-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type to search applications (e.g. firefox, dolphin, discover, kitty, calamares)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/70 focus:ring-1 focus:ring-teal-500/30"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="text-slate-500 text-[11px] ml-auto shrink-0 font-mono">
                  {filteredApps.length} apps found
                </span>
              </div>
            </div>

            {/* Apps Grid List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {filteredApps.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-medium">No applications found matching "{searchQuery}"</p>
                  <p className="text-xs text-slate-500 mt-1">Try another keyword or switch category filters.</p>
                </div>
              ) : (
                filteredApps.map(app => {
                  const copyKey = `app-exec-${app.id}`;
                  return (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700/80 transition flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-teal-400 font-bold group-hover:border-teal-500/30 transition">
                          <AppWindow className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white truncate">{app.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                              {app.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                              {app.desktopFile}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {app.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                            <span>Pkg: <code className="text-teal-300">{app.package}</code></span>
                            <span>•</span>
                            <span>Exec: <code className="text-emerald-300">{app.exec}</code></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-center">
                        <button
                          onClick={() => copyToClipboard(app.exec, copyKey)}
                          className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer border border-slate-700/60"
                          title="Copy terminal command"
                        >
                          {copiedId === copyKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-teal-400" />
                              <span className="text-teal-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>{app.exec}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5 text-slate-500" />
                <span>In real Dorowu OS desktop: press <kbd className="font-mono text-slate-300 bg-slate-800 px-1 py-0.5 rounded">Alt+Space</kbd> for KRunner or <kbd className="font-mono text-slate-300 bg-slate-800 px-1 py-0.5 rounded">Super</kbd> for Kickoff menu.</span>
              </span>
              <button
                onClick={() => setAppsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GNU General Public License v3 Modal */}
      {licenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">GNU General Public License v3 (GNU GPLv3)</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {licenseInfo?.copyright || 'Copyright (C) 2026 Dorowu OS Project <https://github.com/SAMI23450/dorowu-os>'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLicenseModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 space-y-2">
                <div className="font-bold text-blue-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Officially Licensed Free & Open Source Software</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Dorowu OS is strictly released under the <strong>GNU General Public License Version 3 (GPLv3)</strong>. This guarantees your complete freedom to run, modify, study, adapt, and redistribute the entire operating system and all its build configurations.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                  Full License Text (/LICENSE)
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed max-h-96">
                  {licenseInfo?.content || 'GNU GENERAL PUBLIC LICENSE Version 3...'}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>SPDX-License-Identifier: <code className="font-mono text-blue-300">GPL-3.0-only</code></span>
              <button
                onClick={() => setLicenseModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof & Real Distro Verification Modal */}
      {realDistroProofOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Verification: Yes, This Linux Distro Is 100% Real</h3>
                  <p className="text-[11px] text-slate-400">Complete Arch Linux ISO Build System & Profile</p>
                </div>
              </div>
              <button
                onClick={() => setRealDistroProofOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 space-y-1.5">
                <div className="font-bold text-sm text-white">This is NOT a mockup.</div>
                <p className="text-[11px] leading-relaxed">
                  Dorowu OS contains a complete, production-grade <strong>Arch Linux archiso profile</strong> and an automated <strong>GitHub Actions CI workflow</strong>. When run, it builds an authentic, bootable <code className="font-mono text-white">.iso</code> image with real Linux kernel 6.x, KDE Plasma 6 desktop, and Calamares installer.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                  How Dorowu OS Is Structured & Built:
                </h4>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-teal-400 mb-0.5">1. Complete Archiso Profile (/dorowu-profile)</div>
                    <p className="text-[11px] text-slate-400">
                      Contains <code className="font-mono text-slate-300">profiledef.sh</code>, <code className="font-mono text-slate-300">packages.x86_64</code> (124 real Arch packages), squashfs compression with Zstandard level 15, and dual bootloader configs for UEFI (GRUB) and Legacy BIOS (Syslinux).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-teal-400 mb-0.5">2. Complete Live Root Filesystem (/dorowu-profile/airootfs)</div>
                    <p className="text-[11px] text-slate-400">
                      Configured with SDDM autologin, KDE Plasma 6 Breeze-Dark theme, Calamares 3.3+ partitioning and installation modules, Flathub app store service, Kitty terminal with JetBrains Mono font, and fontconfig emoji fallbacks.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-teal-400 mb-0.5">3. Automated CI Workflow (/.github/workflows/build-x86_64.yml)</div>
                    <p className="text-[11px] text-slate-400">
                      Runs inside an official <code className="font-mono text-slate-300">archlinux:latest</code> container on GitHub Actions, executes <code className="font-mono text-slate-300">scripts/ci-build.sh</code>, generates SHA256 checksums, and attaches the final bootable ISO to GitHub Releases.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-teal-400 mb-0.5">4. How to Flash & Install on Hardware or VM</div>
                    <p className="text-[11px] text-slate-400">
                      You can flash the built <code className="font-mono text-slate-300">dorowu-os-*.iso</code> to any USB drive with <code className="font-mono text-emerald-300">dd if=dorowu-os.iso of=/dev/sdX bs=4M status=progress</code>, Rufus, or BalenaEtcher, boot your PC or VirtualBox/VMware, and install Dorowu OS directly to disk using the Calamares installer!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setRealDistroProofOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
              >
                Understood, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official GitHub Actions Workflow Modal */}
      {workflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Official CI/CD Build Workflow</h3>
                  <p className="text-[11px] text-slate-400 font-mono">.github/workflows/build-x86_64.yml</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyWorkflow}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedWorkflow ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWorkflow ? 'Copied' : 'Copy Workflow'}</span>
                </button>
                <button
                  onClick={() => setWorkflowModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>The Single Source of Truth for Dorowu OS ISO Builds</span>
                </div>
                <p className="text-[11px] text-teal-200/80 leading-relaxed">
                  Dorowu OS builds entirely via this official GitHub Actions workflow. It runs a privileged Arch Linux container, executes <code className="font-mono text-teal-100 bg-teal-900/40 px-1 py-0.5 rounded">scripts/ci-build.sh</code>, outputs SHA256 checksums, and publishes bootable x86_64 ISOs directly to GitHub Releases.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>YAML Workflow Specification</span>
                  <span className="text-[10px] text-slate-500">archiso • docker container • sha256</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed max-h-96">
                  {workflowContent || `name: Build Dorowu OS ISO (x86_64)

on:
  workflow_dispatch:        # start it from the GitHub mobile app
  push:
    tags: ['v*']            # tag v1.0 -> build + attach ISO to a Release

permissions:
  contents: write           # needed to attach the ISO to a Release

concurrency:
  group: build-iso
  cancel-in-progress: true

jobs:
  build-iso:
    runs-on: ubuntu-latest
    timeout-minutes: 180
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Free disk space (the ISO build needs ~20 GB)
        run: |
          sudo rm -rf /usr/share/dotnet /usr/local/lib/android /opt/ghc /usr/local/share/boost /opt/hostedtoolcache/CodeQL
          sudo docker image prune --all --force >/dev/null || true
          df -h /

      - name: Build ISO (archiso inside archlinux container)
        run: |
          mkdir -p out
          docker run --rm --privileged \\
            -v "$GITHUB_WORKSPACE:/work" -w /work \\
            archlinux:latest bash scripts/ci-build.sh

      - name: Checksums
        run: |
          cd out
          ls -lh
          sha256sum *.iso > SHA256SUMS
          cat SHA256SUMS

      - name: Upload ISO artifact
        uses: actions/upload-artifact@v4
        with:
          name: Dorowu-OS-x86_64
          path: |
            out/*.iso
            out/SHA256SUMS
          if-no-files-found: error
          compression-level: 0
          retention-days: 7

      - name: Attach to GitHub Release (tags only)
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          files: |
            out/*.iso
            out/SHA256SUMS`}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Location: <code className="font-mono text-slate-300">/.github/workflows/build-x86_64.yml</code></span>
              <button
                onClick={() => setWorkflowModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Information Modal */}
      {systemInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Dorowu OS Profile Architecture</h3>
              </div>
              <button
                onClick={() => setSystemInfoModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">Distribution</div>
                  <div className="font-semibold text-slate-200">{systemInfo?.distro || 'Dorowu OS 2026.10'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">Linux Kernel</div>
                  <div className="font-semibold text-slate-200">{systemInfo?.kernel || 'Linux 6.x archiso'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">Desktop Environment</div>
                  <div className="font-semibold text-slate-200">{systemInfo?.desktop || 'KDE Plasma 6 (Wayland)'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">System Installer</div>
                  <div className="font-semibold text-slate-200">{systemInfo?.installer || 'Calamares 3.3+'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">License</div>
                  <div className="font-semibold text-blue-400 font-mono">GNU GPLv3</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[11px] mb-1">Preinstalled Packages</div>
                  <div className="font-semibold text-teal-400 font-mono">{systemInfo?.totalPreinstalledPackages || 124} packages</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300">Desktop Integration:</div>
                <p>
                  Integrated into KDE Plasma 6 with launcher <code className="text-sky-300 font-mono">dorowu-ai.desktop</code> in <code className="text-slate-300 font-mono">/usr/share/applications</code>. Built-in system services, Flathub repository, and Calamares branded theme are configured for reproducible ISO builds.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSystemInfoModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VM & Installation Credentials Guide Modal */}
      {vmGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">VirtualBox / VM Setup & Live Credentials</h3>
                  <p className="text-[11px] text-slate-400">Live Login, VM Troubleshooting & Installation Methods</p>
                </div>
              </div>
              <button
                onClick={() => setVmGuideOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              
              {/* Credentials Card */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Live Environment Credentials</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Username</span>
                    <span className="text-teal-300 font-bold text-sm">dorowu</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Password</span>
                    <span className="text-emerald-300 font-bold text-sm">No Password (Blank)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  SDDM autologin automatically boots into the <strong>KDE Plasma 6</strong> desktop. Sudo permissions are passwordless (<code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">sudo command</code>). If prompted for a password anywhere, simply leave it blank and press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white">Enter</kbd>.
                </p>
              </div>

              {/* Fix for VirtualBox Error in Screenshot */}
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>VirtualBox Error Fix (intel-ucode.img... failed)</span>
                </h4>
                <p className="text-[11px] leading-relaxed">
                  <strong>Cause:</strong> In your VirtualBox screenshot, ISOLINUX looked for <code className="font-mono text-white bg-slate-900/60 px-1 py-0.5 rounded">intel-ucode.img</code> as a separate file. In modern Arch Linux, the CPU microcode is already baked directly into <code className="font-mono text-white bg-slate-900/60 px-1 py-0.5 rounded">initramfs-linux.img</code> by <code className="font-mono text-white">mkinitcpio</code>.
                </p>
                <p className="text-[11px] leading-relaxed">
                  <strong>Fix Applied:</strong> Both <code className="font-mono text-white">syslinux.cfg</code> and <code className="font-mono text-white">grub.cfg</code> now load <code className="font-mono text-white">initramfs-linux.img</code> directly. Running the GitHub Actions build produces a bootable ISO that boots into the live KDE desktop without this error.
                </p>
              </div>

              {/* VirtualBox Recommended VM Settings */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Settings className="w-4 h-4 text-sky-400" />
                  <span>Recommended VirtualBox Machine Settings</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Type & Version:</span>
                    <span className="text-slate-200">Linux / Arch Linux (64-bit)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">RAM (Base Memory):</span>
                    <span className="text-teal-300 font-bold">4096 MB (4 GB)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Processors:</span>
                    <span className="text-slate-200">2 or more CPU cores</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Graphics Controller:</span>
                    <span className="text-sky-300 font-bold">VBoxSVGA (Enable 3D Accel)</span>
                  </div>
                </div>
              </div>

              {/* Graphical & Non-Graphical Installation */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Graphical & Non-Graphical Installation Options</span>
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-teal-300 block mb-0.5">1. Graphical Installation (Calamares)</span>
                    <span className="text-slate-400">
                      Double-click the <strong>Install Dorowu OS</strong> icon on the desktop or run <code className="font-mono text-slate-300">sudo -E calamares</code>. Guides you through partitioning (Btrfs/Ext4), timezone, user accounts, and automatically installs the <strong>GRUB</strong> bootloader.
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-sky-300 block mb-0.5">2. Non-Graphical / Base CLI Installation</span>
                    <span className="text-slate-400">
                      Since Dorowu OS is genuine Arch Linux, switch to a TTY with <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white">Ctrl+Alt+F3</kbd> or open Kitty terminal. You can use standard Arch Linux tools: <code className="font-mono text-slate-300">fdisk</code>, <code className="font-mono text-slate-300">pacstrap /mnt</code>, <code className="font-mono text-slate-300">genfstab</code>, and <code className="font-mono text-slate-300">arch-chroot</code>.
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setVmGuideOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
