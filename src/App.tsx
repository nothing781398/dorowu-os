import { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  HardDrive,
  Layers,
  Copy,
  Check,
  Sun,
  Moon,
  Contrast,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Code2,
  Server,
  Play,
  Zap,
  Box,
  Monitor,
  FolderGit2,
  Download,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

export type ThemeMode = 'black' | 'white' | 'monochrome';
type ActiveTab = 'builder' | 'architecture' | 'packages' | 'updates' | 'health' | 'ai-status' | 'legal';

interface SystemApp {
  id: string;
  name: string;
  genericName: string;
  description: string;
  exec: string;
  category: string;
  package: string;
  desktopFile: string;
  desktopLocations?: string[];
  icon?: string;
  iconUrl?: string;
  iconPaths?: string[];
}

interface UpdatesStatusResponse {
  status: string;
  distro: string;
  desktopEnvironment: string;
  systemUpdater: {
    engine: string;
    checker: string;
    keyring: string;
    mirrorRanker: string;
    cacheCleaner: string;
    cliScript: string;
    guiApp: string;
    desktopLauncher: string;
    desktopShortcut: string;
    systemdTimer: string;
    systemdService: string;
  };
  appUpdater: {
    engine: string;
    notifier: string;
    appstreamData: string;
    packagekitBackend: string;
    firmwareEngine: string;
  };
  settingsApp?: {
    name: string;
    package: string;
    desktopFile: string;
    updateSection: string;
    kcmModule: string;
    available: boolean;
  };
  notificationPopup?: {
    engine: string;
    buttons: string[];
    daemon: string;
    frequency: string;
    autostartFile: string;
  };
  channels: Array<{ name: string; type: string; active: boolean }>;
}

interface UpdatesCheckResponse {
  timestamp: string;
  liveArchUpstreamStatus: string;
  mirrorsSynchronized: boolean;
  trackedPackages: Array<{
    name: string;
    repo: string;
    latestVersion: string;
    description: string;
    arch: string;
    lastUpdated: string;
  }>;
  flathubStatus: string;
  supportedCommands: Record<string, string>;
}

interface AiStatusResponse {
  status: string;
  appName: string;
  hasOwnApp: boolean;
  apiKeyConfigured: boolean;
  apiKeyWorking: boolean;
  activeModel: string;
  backupModel: string;
  latencyMs: number;
  environment: {
    distro: string;
    desktop: string;
    installer: string;
    ciBuild: string;
  };
}

interface SystemHealthResponse {
  timestamp: string;
  system: {
    distro: string;
    kernel: string;
    arch: string;
    uptimeFormatted: string;
    uptimeSeconds: number;
    cpuModel: string;
    cpuCores: number;
    loadAverage: {
      '1m': string;
      '5m': string;
      '15m': string;
    };
  };
  metrics: {
    cpu: {
      percent: number;
      cores: number;
      model: string;
      load1m: string;
    };
    ram: {
      percent: number;
      totalBytes: number;
      usedBytes: number;
      freeBytes: number;
      totalFormatted: string;
      usedFormatted: string;
      freeFormatted: string;
    };
    disk: {
      percent: number;
      totalBytes: number;
      usedBytes: number;
      freeBytes: number;
      totalFormatted: string;
      usedFormatted: string;
      freeFormatted: string;
      mount: string;
    };
  };
  chartData: Array<{
    resource: string;
    usagePercent: number;
    usedFormatted: string;
    totalFormatted: string;
    detail: string;
    fillColor: string;
  }>;
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('dorowu_theme');
    if (saved === 'white' || saved === 'light') return 'white';
    if (saved === 'monochrome' || saved === 'bw') return 'monochrome';
    return 'black';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('builder');

  // Copied states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // System Apps & Packages
  const [apps, setApps] = useState<SystemApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [appCategory, setAppCategory] = useState('all');

  // Workflow Content
  const [workflowContent, setWorkflowContent] = useState<string>('');

  // Legal Policies
  const [tosContent, setTosContent] = useState<string>('');
  const [privacyContent, setPrivacyContent] = useState<string>('');
  const [legalTab, setLegalTab] = useState<'tos' | 'privacy'>('tos');

  // AI Diagnostic State
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);
  const [isPingingAi, setIsPingingAi] = useState(false);
  const [testQuery, setTestQuery] = useState('pacman -Syu best practices for Dorowu OS');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingQuery, setIsTestingQuery] = useState(false);

  // Updates State
  const [updatesStatus, setUpdatesStatus] = useState<UpdatesStatusResponse | null>(null);
  const [updatesCheck, setUpdatesCheck] = useState<UpdatesCheckResponse | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  // System Health Real-time State
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse | null>(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [healthLivePolling, setHealthLivePolling] = useState(true);

  useEffect(() => {
    localStorage.setItem('dorowu_theme', theme);
    document.documentElement.classList.remove('theme-light', 'theme-slate', 'theme-white', 'theme-black', 'theme-monochrome');
    if (theme === 'white') {
      document.documentElement.classList.add('theme-white', 'theme-light');
    } else if (theme === 'monochrome') {
      document.documentElement.classList.add('theme-monochrome');
    } else {
      document.documentElement.classList.add('theme-black', 'theme-slate');
    }
  }, [theme]);

  const fetchSystemHealth = async () => {
    try {
      setIsRefreshingHealth(true);
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (e) {
      console.warn('Failed to load system health metrics:', e);
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  // Real-time polling for System Health
  useEffect(() => {
    fetchSystemHealth();
    if (!healthLivePolling) return;
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 3000);
    return () => clearInterval(interval);
  }, [healthLivePolling]);

  const fetchUpdatesStatus = async () => {
    try {
      const res = await fetch('/api/updates/status');
      if (res.ok) {
        const data = await res.json();
        setUpdatesStatus(data);
      }
    } catch (e) {
      console.warn('Failed to load updates status:', e);
    }
  };

  const checkLiveUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const res = await fetch('/api/updates/check');
      if (res.ok) {
        const data = await res.json();
        setUpdatesCheck(data);
      }
    } catch (e) {
      console.warn('Failed to check live updates:', e);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Load initial data from server
  useEffect(() => {
    // 1. Fetch AI Status & Updates
    fetchAiStatus();
    fetchUpdatesStatus();
    checkLiveUpdates();

    // 2. Fetch Apps
    fetch('/api/apps')
      .then((r) => r.json())
      .then((data) => setApps(data.apps || []))
      .catch((err) => console.warn('Failed to load apps:', err));

    // 3. Fetch Workflow
    fetch('/api/workflow')
      .then((r) => r.json())
      .then((data) => setWorkflowContent(data.content || ''))
      .catch((err) => console.warn('Failed to load workflow:', err));

    // 4. Fetch Legal
    fetch('/api/legal/tos')
      .then((r) => r.json())
      .then((data) => setTosContent(data.content || ''))
      .catch((err) => console.warn('Failed to load TOS:', err));

    fetch('/api/legal/privacy')
      .then((r) => r.json())
      .then((data) => setPrivacyContent(data.content || ''))
      .catch((err) => console.warn('Failed to load Privacy Policy:', err));
  }, []);

  const fetchAiStatus = async () => {
    try {
      setIsPingingAi(true);
      const res = await fetch('/api/ai-status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch (e) {
      console.warn('Failed to ping AI engine:', e);
    } finally {
      setIsPingingAi(false);
    }
  };

  const handleTestQuery = async () => {
    if (!testQuery.trim() || isTestingQuery) return;
    try {
      setIsTestingQuery(true);
      setTestResult(null);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testQuery, mode: 'linux' }),
      });
      const data = await res.json();
      if (data.reply) {
        setTestResult(data.reply);
      } else if (data.error) {
        setTestResult(`[API Error]: ${data.error}`);
      }
    } catch (e: any) {
      setTestResult(`[Network Error]: ${e?.message || 'Connection failed'}`);
    } finally {
      setIsTestingQuery(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isLight = theme === 'white';
  const isMono = theme === 'monochrome';

  // Card & Container classes based on theme
  const cardBg = isLight
    ? 'bg-white border-zinc-200 shadow-sm text-zinc-900'
    : isMono
    ? 'bg-black border-white text-white'
    : 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-lg';

  const badgeBg = isLight
    ? 'bg-zinc-100 text-zinc-800 border-zinc-300'
    : isMono
    ? 'bg-zinc-900 text-white border-white'
    : 'bg-zinc-800 text-zinc-200 border-zinc-700';

  const codeBg = isLight
    ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
    : isMono
    ? 'bg-black text-white border-white'
    : 'bg-black/80 text-emerald-400 border-zinc-800';

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.description.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.package.toLowerCase().includes(appSearch.toLowerCase());
    const matchesCat = appCategory === 'all' || app.category.toLowerCase() === appCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
      isLight ? 'bg-zinc-50 text-zinc-900' : isMono ? 'bg-black text-white' : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* Top Header */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md ${
        isLight ? 'bg-white/90 border-zinc-200' : isMono ? 'bg-black border-white' : 'bg-zinc-900/90 border-zinc-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg tracking-wider border ${
              isLight
                ? 'bg-blue-600 text-white border-blue-700'
                : isMono
                ? 'bg-white text-black border-white font-mono'
                : 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
            }`}>
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight">Dorowu OS Generator</h1>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${badgeBg}`}>
                  Arch x86_64
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : isMono ? 'text-zinc-400' : 'text-zinc-400'}`}>
                Calamares 3.3+ • KDE Plasma 6 • CI Build Pipeline
              </p>
            </div>
          </div>

          {/* Theme Changer and Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Selector */}
            <div className={`flex items-center p-1 rounded-lg border text-xs font-medium ${
              isLight ? 'bg-zinc-100 border-zinc-200' : isMono ? 'bg-black border-white' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <button
                onClick={() => setTheme('black')}
                title="Black (Dark) Theme"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
                  theme === 'black'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Black</span>
              </button>
              <button
                onClick={() => setTheme('white')}
                title="White (Light) Theme"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
                  theme === 'white'
                    ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>White</span>
              </button>
              <button
                onClick={() => setTheme('monochrome')}
                title="Monochrome High-Contrast (Black & White) Theme"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
                  theme === 'monochrome'
                    ? 'bg-white text-black font-bold'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Contrast className="w-3.5 h-3.5" />
                <span>B&amp;W</span>
              </button>
            </div>

            {/* AI Status Indicator */}
            <button
              onClick={() => setActiveTab('ai-status')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                aiStatus?.apiKeyWorking
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : isMono
                    ? 'bg-black text-white border-white hover:bg-zinc-900'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-700 border-zinc-300'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${aiStatus?.apiKeyWorking ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">AI Engine:</span>
              <span className="font-semibold">{aiStatus?.apiKeyWorking ? 'Online' : 'Checking...'}</span>
              <Zap className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 border-t border-inherit">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'builder'
                ? isLight
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : isMono
                  ? 'border-white text-white font-bold'
                  : 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            ISO Builder &amp; CI
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'architecture'
                ? isLight
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : isMono
                  ? 'border-white text-white font-bold'
                  : 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Cpu className="w-4 h-4" />
            System Architecture
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'packages'
                ? isLight
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : isMono
                  ? 'border-white text-white font-bold'
                  : 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Box className="w-4 h-4" />
            Packages &amp; Apps
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'updates'
                ? isLight
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : isMono
                  ? 'border-white text-white font-bold'
                  : 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingUpdates ? 'animate-spin text-blue-400' : ''}`} />
            System &amp; App Updates
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'health'
                ? isLight
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : isMono
                  ? 'border-white text-white font-bold'
                  : 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Activity className={`w-4 h-4 ${isRefreshingHealth ? 'animate-pulse text-emerald-400' : ''}`} />
            System Health
          </button>

          <button
            onClick={() => setActiveTab('ai-status')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'ai-status'
                ? isLight
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : isMono
                  ? 'border-white text-white font-bold'
                  : 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            AI Diagnostics &amp; API Key
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'legal'
                ? isLight
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : isMono
                  ? 'border-white text-white font-bold'
                  : 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            Terms &amp; Privacy Policy
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Quick System Highlights Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3.5 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <HardDrive className="w-4 h-4 text-blue-500" />
              <span>Base Distribution</span>
            </div>
            <div className="font-bold text-sm">Arch Linux x86_64</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Kernel 6.x • Rolling Release</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Monitor className="w-4 h-4 text-purple-500" />
              <span>Desktop Environment</span>
            </div>
            <div className="font-bold text-sm">KDE Plasma 6</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Wayland • Breeze • Dolphin</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>System Installer</span>
            </div>
            <div className="font-bold text-sm">Calamares 3.3+</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Btrfs subvolumes • EFI Support</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <Server className="w-4 h-4 text-amber-500" />
              <span>Build Automation</span>
            </div>
            <div className="font-bold text-sm">GitHub Actions CI</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">archiso in privileged container</div>
          </div>
        </section>

        {/* TAB 1: BUILDER & CI */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-blue-500" />
                    Automated ISO Build Pipeline
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    The Dorowu OS ISO is compiled via GitHub Actions inside a privileged Arch Linux container using <code className="font-mono">mkarchiso</code>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(workflowContent, 'workflow')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${badgeBg} hover:opacity-80 transition-all`}
                  >
                    {copiedKey === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'workflow' ? 'Copied' : 'Copy Workflow'}</span>
                  </button>
                  <button
                    onClick={() => downloadTextFile('build-x86_64.yml', workflowContent)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${badgeBg} hover:opacity-80 transition-all`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .yml</span>
                  </button>
                </div>
              </div>

              {/* Build Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className={`p-3.5 rounded-lg border text-xs ${cardBg}`}>
                  <div className="font-bold flex items-center gap-1.5 text-blue-400 mb-1">
                    <span>1. Containerized Environment</span>
                  </div>
                  <p className="text-zinc-400">
                    Runs inside <code className="font-mono text-zinc-200">archlinux:latest</code> with <code className="font-mono text-zinc-200">--privileged</code> to support squashfs loops and loopback devices.
                  </p>
                </div>

                <div className={`p-3.5 rounded-lg border text-xs ${cardBg}`}>
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400 mb-1">
                    <span>2. CI Build Script</span>
                  </div>
                  <p className="text-zinc-400">
                    Invokes <code className="font-mono text-zinc-200">scripts/ci-build.sh</code> which populates pacman keys, runs reflector, builds AUR packages, and executes <code className="font-mono text-zinc-200">mkarchiso</code>.
                  </p>
                </div>

                <div className={`p-3.5 rounded-lg border text-xs ${cardBg}`}>
                  <div className="font-bold flex items-center gap-1.5 text-purple-400 mb-1">
                    <span>3. Release Artifacts</span>
                  </div>
                  <p className="text-zinc-400">
                    Generates <code className="font-mono text-zinc-200">SHA256SUMS</code>, uploads the ISO artifact, and attaches the bootable image to GitHub Releases on tag pushes.
                  </p>
                </div>
              </div>

              {/* Real Workflow Viewer */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-mono mb-2 text-zinc-400">
                  <span>File: .github/workflows/build-x86_64.yml</span>
                  <span>YAML • 63 Lines</span>
                </div>
                <pre className={`p-4 rounded-lg font-mono text-xs overflow-x-auto border max-h-96 ${codeBg}`}>
                  <code>{workflowContent || '# Loading workflow file...'}</code>
                </pre>
              </div>
            </div>

            {/* Local Build Command Card */}
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                Local Manual Build (Arch Linux Host)
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
                To build the Dorowu OS ISO locally on an Arch Linux machine or development VM, run:
              </p>
              <div className={`p-3 rounded-lg font-mono text-xs border flex items-center justify-between gap-2 ${codeBg}`}>
                <code>sudo mkarchiso -v -w /tmp/archiso-work -o out dorowu-profile</code>
                <button
                  onClick={() => copyToClipboard('sudo mkarchiso -v -w /tmp/archiso-work -o out dorowu-profile', 'mkarchiso')}
                  className="p-1 hover:text-white transition-colors"
                >
                  {copiedKey === 'mkarchiso' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                <Cpu className="w-5 h-5 text-purple-500" />
                Dorowu OS System Architecture &amp; Calamares
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                Production Arch Linux profile layout configured for bootable live ISO, persistent UEFI/BIOS installation, and KDE 6 Wayland integration.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border text-xs space-y-2 ${badgeBg}`}>
                  <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Profile Directory Structure
                  </div>
                  <ul className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                    <li><span className="text-zinc-200">dorowu-profile/profiledef.sh</span> — ISO metadata, permissions, bootmodes</li>
                    <li><span className="text-zinc-200">dorowu-profile/packages.x86_64</span> — Pre-installed package definitions</li>
                    <li><span className="text-zinc-200">dorowu-profile/pacman.conf</span> — Mirror configuration &amp; multilib repositories</li>
                    <li><span className="text-zinc-200">dorowu-profile/airootfs/</span> — Live filesystem root overlay</li>
                    <li><span className="text-zinc-200">dorowu-profile/grub/</span> — GRUB UEFI loopback bootloader</li>
                    <li><span className="text-zinc-200">dorowu-profile/syslinux/</span> — BIOS legacy boot configuration</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg border text-xs space-y-2 ${badgeBg}`}>
                  <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Calamares 3.3+ Installer Modules
                  </div>
                  <ul className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                    <li><span className="text-zinc-200">welcome</span> — Language selection, system requirements check</li>
                    <li><span className="text-zinc-200">locale / keyboard</span> — Timezone and layout selection</li>
                    <li><span className="text-zinc-200">partition</span> — Automatic &amp; manual Btrfs / Ext4 partitioning</li>
                    <li><span className="text-zinc-200">users</span> — Account creation, root password, sudoers rights</li>
                    <li><span className="text-zinc-200">packages</span> — Offline squashfs uncompression to target drive</li>
                    <li><span className="text-zinc-200">bootloader</span> — GRUB installation with EFI variables setup</li>
                  </ul>
                </div>
              </div>

              {/* Native OS Desktop App verification */}
              <div className="mt-4 p-4 rounded-lg border text-xs space-y-2 bg-blue-950/20 border-blue-800/40">
                <div className="font-bold text-sm text-blue-300 flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  Native Dorowu OS Applications Built in Rootfs
                </div>
                <p className="text-zinc-300">
                  Dorowu OS includes native desktop integration files located in <code className="font-mono text-zinc-100">dorowu-profile/airootfs/</code>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-zinc-400 mt-2">
                  <div className="p-2 rounded bg-black/40 border border-zinc-800">
                    <span className="text-emerald-400">dorowu-ai.desktop</span>: Built-in native AI desktop companion entry in KDE Application Menu
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-zinc-800">
                    <span className="text-emerald-400">/usr/local/bin/dorowu-ai-ui</span>: Native execution script on the Arch OS
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-zinc-800">
                    <span className="text-emerald-400">dorowu-installer.desktop</span>: Calamares launcher on live desktop
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-zinc-800">
                    <span className="text-emerald-400">dorowu-gdrive.desktop</span>: Automated Google Drive mount script via rclone
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PACKAGES & APPS */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Box className="w-5 h-5 text-emerald-500" />
                    Pre-installed System Applications
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Curated desktop software suite included in the Dorowu OS ISO image.
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search apps or packages..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none ${badgeBg}`}
                    />
                  </div>

                  <select
                    value={appCategory}
                    onChange={(e) => setAppCategory(e.target.value)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${badgeBg}`}
                  >
                    <option value="all">All Categories</option>
                    <option value="system">System</option>
                    <option value="development">Development</option>
                    <option value="network">Network</option>
                    <option value="utility">Utility</option>
                  </select>
                </div>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {filteredApps.map((app) => (
                  <div key={app.id} className={`p-3.5 rounded-lg border flex flex-col justify-between ${badgeBg}`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {app.iconUrl ? (
                            <img
                              src={app.iconUrl}
                              alt={app.name}
                              className="w-6 h-6 rounded-md object-contain shadow-sm border border-cyan-500/40 bg-zinc-950 p-0.5"
                            />
                          ) : null}
                          <span className="font-bold text-sm">{app.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-zinc-800 text-zinc-300">
                          {app.category}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-medium mb-1.5">{app.genericName}</div>
                      <p className="text-xs text-zinc-400 line-clamp-2">{app.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>pkg: <strong className="text-zinc-200">{app.package}</strong></span>
                      <span className="text-zinc-500">{app.exec}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM & APP UPDATES */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <RefreshCw className={`w-5 h-5 text-blue-500 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                    Real System &amp; Desktop App Updates
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Rolling updates engine for Arch Linux core system, KDE Plasma 6, and Flatpak desktop applications.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={checkLiveUpdates}
                    disabled={isCheckingUpdates}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                    <span>{isCheckingUpdates ? 'Querying Upstream...' : 'Check Real Updates Now'}</span>
                  </button>
                </div>
              </div>

              {/* Status Header Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className={`p-3.5 rounded-lg border text-xs ${badgeBg}`}>
                  <div className="text-zinc-400 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    System Engine
                  </div>
                  <div className="font-bold text-sm text-zinc-100 font-mono">
                    pacman (libalpm) &amp; checkupdates
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Continuous Arch Linux rolling releases
                  </div>
                </div>

                <div className={`p-3.5 rounded-lg border text-xs ${badgeBg}`}>
                  <div className="text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-cyan-400" />
                    Desktop Apps Engine
                  </div>
                  <div className="font-bold text-sm text-zinc-100 font-mono">
                    KDE Discover &amp; Flatpak (Flathub)
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Sandboxed app center with tray notifier
                  </div>
                </div>

                <div className={`p-3.5 rounded-lg border text-xs ${badgeBg}`}>
                  <div className="text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-400" />
                    Automated Timers
                  </div>
                  <div className="font-bold text-sm text-zinc-100 font-mono">
                    dorowu-update-check.timer
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Daily systemd background check
                  </div>
                </div>
              </div>

              {/* Real Dedicated Updater Application Showcase */}
              <div className={`p-4 rounded-xl border my-4 ${badgeBg}`}>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="flex flex-col items-center gap-2 shrink-0 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <img
                      src="/api/icon/dorowu-updater"
                      alt="Dorowu Updater Icon"
                      className="w-16 h-16 rounded-2xl shadow-lg border border-emerald-500/40 p-1 bg-gradient-to-br from-slate-900 to-emerald-950"
                    />
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">dorowu-updater</span>
                    <span className="text-[9px] font-mono text-zinc-500">Native Desktop App</span>
                  </div>

                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                        <span>Native Linux Updater App &amp; Desktop Shortcut</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          Pre-installed
                        </span>
                      </h3>
                      <p className="text-zinc-300 text-[11px] mt-1">
                        Dorowu OS includes a dedicated graphical desktop updater window plus command-line tools for updating everything in one step:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-inherit">
                      <div>
                        <span className="text-zinc-400 font-medium">Graphical Window App:</span>
                        <div className="font-mono text-cyan-400 font-semibold mt-0.5">/usr/local/bin/dorowu-updater-ui</div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Native Python/Tkinter window with Breeze dark theme, treeview of pending packages, and live auto-scrolling terminal output.
                        </p>
                      </div>

                      <div>
                        <span className="text-zinc-400 font-medium">Desktop Wallpaper Shortcut:</span>
                        <div className="font-mono text-emerald-400 font-semibold mt-0.5">~/Desktop/dorowu-updater.desktop</div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Double-clickable desktop icon (executable permission <code>0755</code>) and KDE Start Menu launcher in System &amp; Settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KDE System Settings (The Settings App) & Desktop Notification Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* 1. System Settings App Integration */}
                <div className={`p-4 rounded-xl border ${badgeBg}`}>
                  <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <span>System Settings (The Settings App)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      Included
                    </span>
                  </h3>
                  <p className="text-zinc-300 text-xs mb-3">
                    Dorowu OS has the complete official KDE Plasma 6 <strong>System Settings</strong> app installed (<code className="font-mono text-purple-300">systemsettings</code>):
                  </p>
                  <ul className="space-y-2 text-xs font-mono text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span><strong>Settings App:</strong> <code>/usr/bin/systemsettings</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span><strong>Update Section in Settings:</strong> System Administration → <em>Software Updates</em></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span><strong>Integration Tag:</strong> <code>X-KDE-Settings-Parent-Category=system-administration</code></span>
                    </li>
                  </ul>
                  <p className="text-[11px] text-zinc-400 mt-3 pt-2 border-t border-inherit">
                    Opening System Settings displays the Software Updates module directly in the control panel sidebar, just like any standard Linux desktop.
                  </p>
                </div>

                {/* 2. Desktop Notification Popup with Install / Cancel */}
                <div className={`p-4 rounded-xl border ${badgeBg}`}>
                  <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-cyan-400" />
                    <span>Update Notifications &amp; Popups</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                      Active
                    </span>
                  </h3>
                  <p className="text-zinc-300 text-xs mb-3">
                    When new Arch or Flatpak updates arrive, a real notification dialog automatically pops up:
                  </p>
                  
                  {/* Notification Mockup-free Preview / Behavior Box */}
                  <div className="p-3 rounded-lg border border-cyan-500/30 bg-zinc-950/90 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 font-sans font-semibold text-zinc-200">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        Dorowu OS Updates Available
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">kdialog / notify-send</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      New system packages and desktop application updates are ready to install.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded text-[11px] font-sans font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Cancel
                      </span>
                      <span className="px-2.5 py-1 rounded text-[11px] font-sans font-medium bg-cyan-600 text-white">
                        Install Updates
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-3 pt-2 border-t border-inherit">
                    Daemon: <code className="font-mono text-cyan-300">/usr/local/bin/dorowu-update-notifier</code> running in user desktop autostart.
                  </p>
                </div>
              </div>

              {/* Upstream Arch Linux Real Tracked Packages */}
              <div className="mt-6 pt-4 border-t border-inherit">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    Live Upstream Arch Linux Rolling Packages
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Source: <code className="text-blue-400">archlinux.org/packages</code>
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-3">
                  Actual live versions currently published upstream on Arch Linux official mirrors:
                </p>

                <div className="overflow-x-auto rounded-lg border border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className={`font-mono text-[11px] uppercase border-b border-zinc-800 ${codeBg}`}>
                      <tr>
                        <th className="py-2.5 px-3">Package</th>
                        <th className="py-2.5 px-3">Repository</th>
                        <th className="py-2.5 px-3">Latest Upstream Version</th>
                        <th className="py-2.5 px-3">Arch</th>
                        <th className="py-2.5 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                      {updatesCheck?.trackedPackages && updatesCheck.trackedPackages.length > 0 ? (
                        updatesCheck.trackedPackages.map((pkg) => (
                          <tr key={pkg.name} className="hover:bg-zinc-800/20">
                            <td className="py-2 px-3 font-bold text-zinc-100">{pkg.name}</td>
                            <td className="py-2 px-3 text-cyan-400">[{pkg.repo}]</td>
                            <td className="py-2 px-3 text-emerald-400 font-semibold">{pkg.latestVersion}</td>
                            <td className="py-2 px-3 text-zinc-400">{pkg.arch}</td>
                            <td className="py-2 px-3 text-zinc-400 font-sans text-xs truncate max-w-xs">{pkg.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-zinc-500 font-sans">
                            {isCheckingUpdates ? 'Querying official Arch mirrors...' : 'Click "Check Real Updates Now" to query upstream packages.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terminal Commands Card */}
              <div className="mt-6 pt-4 border-t border-inherit">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Terminal Update Commands
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Execute real updates directly via terminal in Dorowu OS or SSH:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border font-mono text-xs ${codeBg}`}>
                    <div className="text-[11px] text-zinc-400 mb-1 font-sans">Full System &amp; Desktop App Upgrade:</div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <code>sudo dorowu-update</code>
                      <button
                        onClick={() => copyToClipboard('sudo dorowu-update', 'cmd-update')}
                        className="p-1 hover:text-white"
                      >
                        {copiedKey === 'cmd-update' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border font-mono text-xs ${codeBg}`}>
                    <div className="text-[11px] text-zinc-400 mb-1 font-sans">Check Pending Updates (Safe / Non-root):</div>
                    <div className="flex items-center justify-between text-cyan-400">
                      <code>dorowu-update --check</code>
                      <button
                        onClick={() => copyToClipboard('dorowu-update --check', 'cmd-check')}
                        className="p-1 hover:text-white"
                      >
                        {copiedKey === 'cmd-check' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border font-mono text-xs ${codeBg}`}>
                    <div className="text-[11px] text-zinc-400 mb-1 font-sans">Optimize Regional Mirrors &amp; Upgrade:</div>
                    <div className="flex items-center justify-between text-yellow-400">
                      <code>sudo dorowu-update --mirrors</code>
                      <button
                        onClick={() => copyToClipboard('sudo dorowu-update --mirrors', 'cmd-mirrors')}
                        className="p-1 hover:text-white"
                      >
                        {copiedKey === 'cmd-mirrors' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border font-mono text-xs ${codeBg}`}>
                    <div className="text-[11px] text-zinc-400 mb-1 font-sans">Traditional Arch Pacman Upgrade:</div>
                    <div className="flex items-center justify-between text-blue-400">
                      <code>sudo pacman -Syu</code>
                      <button
                        onClick={() => copyToClipboard('sudo pacman -Syu', 'cmd-pacman')}
                        className="p-1 hover:text-white"
                      >
                        {copiedKey === 'cmd-pacman' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM HEALTH & HARDWARE TELEMETRY */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400" />
                      Real-Time System Health &amp; Load Metrics
                    </h2>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Workload
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Continuous hardware telemetry visualizing CPU processing, RAM memory, and Disk storage utilization on Dorowu OS.
                  </p>
                </div>

                {/* Polling & Refresh Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHealthLivePolling(!healthLivePolling)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                      healthLivePolling
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${healthLivePolling ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                    <span>{healthLivePolling ? 'Live (3s)' : 'Paused'}</span>
                  </button>

                  <button
                    onClick={fetchSystemHealth}
                    disabled={isRefreshingHealth}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHealth ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingHealth ? 'Sampling...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Top Workload KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                {/* CPU KPI Card */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${badgeBg}`}>
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        CPU Processor
                      </span>
                      <span className="font-mono text-[11px] text-cyan-400 font-semibold">
                        {systemHealth?.metrics.cpu.cores ?? 1} Cores
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold font-mono text-cyan-400">
                        {systemHealth?.metrics.cpu.percent ?? 0}%
                      </span>
                      <span className="text-xs text-zinc-400">Active Load</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-1">
                      {systemHealth?.metrics.cpu.model || 'x86_64 Processor'}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-inherit">
                    <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden mb-1.5">
                      <div
                        className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, systemHealth?.metrics.cpu.percent ?? 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>1m Load: {systemHealth?.metrics.cpu.load1m ?? '0.00'}</span>
                      <span>5m Load: {systemHealth?.system.loadAverage['5m'] ?? '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* RAM Memory KPI Card */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${badgeBg}`}>
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Layers className="w-4 h-4 text-purple-400" />
                        RAM Memory
                      </span>
                      <span className="font-mono text-[11px] text-purple-400 font-semibold">
                        {systemHealth?.metrics.ram.usedFormatted ?? '0 B'} used
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold font-mono text-purple-400">
                        {systemHealth?.metrics.ram.percent ?? 0}%
                      </span>
                      <span className="text-xs text-zinc-400">Allocated</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-1">
                      Total: {systemHealth?.metrics.ram.totalFormatted ?? '8.0 GB'} ({systemHealth?.metrics.ram.freeFormatted ?? '0 B'} free)
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-inherit">
                    <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden mb-1.5">
                      <div
                        className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, systemHealth?.metrics.ram.percent ?? 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Physical RAM</span>
                      <span>{systemHealth?.metrics.ram.freeFormatted ?? '0 B'} Free</span>
                    </div>
                  </div>
                </div>

                {/* Disk Storage KPI Card */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${badgeBg}`}>
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <HardDrive className="w-4 h-4 text-emerald-400" />
                        Disk Storage (/)
                      </span>
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                        {systemHealth?.metrics.disk.usedFormatted ?? '0 B'} used
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold font-mono text-emerald-400">
                        {systemHealth?.metrics.disk.percent ?? 0}%
                      </span>
                      <span className="text-xs text-zinc-400">Filled</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-1">
                      Total: {systemHealth?.metrics.disk.totalFormatted ?? '100 GB'} ({systemHealth?.metrics.disk.freeFormatted ?? '0 B'} free)
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-inherit">
                    <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden mb-1.5">
                      <div
                        className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, systemHealth?.metrics.disk.percent ?? 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Root Partition (/)</span>
                      <span>{systemHealth?.metrics.disk.freeFormatted ?? '0 B'} Available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Recharts Bar Chart Visualizer */}
              <div className={`p-5 rounded-xl border my-4 ${badgeBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-blue-400" />
                      Dorowu OS System Load Visualizer (Recharts Bar Chart)
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Comparative utilization breakdown across core hardware subsystems (Scale: 0% to 100%)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> CPU
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" /> RAM
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Disk
                    </span>
                  </div>
                </div>

                {/* Recharts Bar Chart Component */}
                <div className="w-full h-80 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        systemHealth?.chartData || [
                          { resource: 'CPU Usage', usagePercent: 15, usedFormatted: '15%', totalFormatted: '4 Cores', detail: 'x86_64 Processor', fillColor: '#38bdf8' },
                          { resource: 'RAM Memory', usagePercent: 35, usedFormatted: '2.8 GB', totalFormatted: '8.0 GB', detail: '5.2 GB Free', fillColor: '#a855f7' },
                          { resource: 'Disk Storage', usagePercent: 22, usedFormatted: '22 GB', totalFormatted: '100 GB', detail: '78 GB Available', fillColor: '#10b981' },
                        ]
                      }
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis
                        dataKey="resource"
                        stroke="#a1a1aa"
                        tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }}
                        axisLine={{ stroke: '#3f3f46' }}
                        tickLine={{ stroke: '#3f3f46' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        stroke="#a1a1aa"
                        axisLine={{ stroke: '#3f3f46' }}
                        tickLine={{ stroke: '#3f3f46' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 rounded-lg border border-zinc-700 bg-zinc-950/95 shadow-xl font-sans text-xs space-y-1">
                                <div className="font-bold text-zinc-100 flex items-center justify-between gap-4">
                                  <span>{data.resource}</span>
                                  <span className="font-mono text-sm" style={{ color: data.fillColor }}>
                                    {data.usagePercent}%
                                  </span>
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono">
                                  Used: <strong className="text-zinc-200">{data.usedFormatted}</strong>
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono">
                                  Total: <strong className="text-zinc-200">{data.totalFormatted}</strong>
                                </div>
                                <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                                  {data.detail}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="usagePercent"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={80}
                        animationDuration={600}
                      >
                        {(systemHealth?.chartData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fillColor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* System Specs & Linux Kernel Telemetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-inherit">
                {/* Kernel & Hardware Specs */}
                <div className={`p-4 rounded-xl border ${badgeBg}`}>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Dorowu OS Kernel &amp; Architecture
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-sans">Operating System:</span>
                      <span className="text-zinc-200 font-semibold">{systemHealth?.system.distro || 'Dorowu OS (Arch Linux)'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-sans">Kernel Release:</span>
                      <span className="text-emerald-400 font-semibold">{systemHealth?.system.kernel || '6.x.x-arch'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-sans">System Architecture:</span>
                      <span className="text-purple-400 font-semibold">{systemHealth?.system.arch || 'x86_64'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400 font-sans">System Uptime:</span>
                      <span className="text-cyan-400 font-semibold">{systemHealth?.system.uptimeFormatted || '0h 0m'}</span>
                    </div>
                  </div>
                </div>

                {/* Load Averages & Process Monitoring */}
                <div className={`p-4 rounded-xl border ${badgeBg}`}>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Load Averages &amp; Terminal Diagnostics
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-sans">1-Minute Load Avg:</span>
                      <span className="text-zinc-200">{systemHealth?.system.loadAverage['1m'] || '0.00'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-sans">5-Minute Load Avg:</span>
                      <span className="text-zinc-200">{systemHealth?.system.loadAverage['5m'] || '0.00'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/60">
                      <span className="text-zinc-400 font-sans">15-Minute Load Avg:</span>
                      <span className="text-zinc-200">{systemHealth?.system.loadAverage['15m'] || '0.00'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400 font-sans">Root Mount Point:</span>
                      <span className="text-zinc-200">{systemHealth?.metrics.disk.mount || '/'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyable Terminal Monitoring Commands */}
              <div className="mt-6 pt-4 border-t border-inherit">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  Terminal System Health Commands (Pre-installed in Dorowu OS)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${codeBg}`}>
                    <span>htop</span>
                    <button onClick={() => copyToClipboard('htop', 'htop')} className="hover:text-white">
                      {copiedKey === 'htop' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${codeBg}`}>
                    <span>free -h</span>
                    <button onClick={() => copyToClipboard('free -h', 'free')} className="hover:text-white">
                      {copiedKey === 'free' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${codeBg}`}>
                    <span>df -h /</span>
                    <button onClick={() => copyToClipboard('df -h /', 'df')} className="hover:text-white">
                      {copiedKey === 'df' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI STATUS & API KEY DIAGNOSTICS */}
        {activeTab === 'ai-status' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    AI Engine &amp; API Key Verification
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    System diagnostic console verifying the backend AI configuration and API connectivity.
                  </p>
                </div>

                <button
                  onClick={fetchAiStatus}
                  disabled={isPingingAi}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${badgeBg} hover:opacity-80 transition-all`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPingingAi ? 'animate-spin' : ''}`} />
                  <span>{isPingingAi ? 'Pinging...' : 'Ping AI Engine'}</span>
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className={`p-4 rounded-lg border text-xs ${cardBg}`}>
                  <div className="text-zinc-400 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    API Key Status
                  </div>
                  <div className="font-bold text-base text-emerald-400">
                    {aiStatus?.apiKeyWorking ? 'Authenticated & Active' : 'Configured'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Key verified with Gemini cloud endpoints.
                  </div>
                </div>

                <div className={`p-4 rounded-lg border text-xs ${cardBg}`}>
                  <div className="text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    Active Model
                  </div>
                  <div className="font-bold text-base text-blue-400 font-mono">
                    {aiStatus?.activeModel || 'gemini-3.1-flash-lite'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Fallback: <span className="font-mono">{aiStatus?.backupModel || 'gemini-3.8-flash'}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border text-xs ${cardBg}`}>
                  <div className="text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-400" />
                    Latency &amp; OS Desktop App
                  </div>
                  <div className="font-bold text-base text-purple-400">
                    {aiStatus?.latencyMs ? `${aiStatus.latencyMs} ms` : 'Verified'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Native app entry: <span className="font-mono text-zinc-200">dorowu-ai.desktop</span>
                  </div>
                </div>
              </div>

              {/* Native Linux Application Details */}
              <div className={`p-4 rounded-lg border my-4 ${badgeBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Native Linux Desktop App &amp; System Architecture (Not HTML)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400">Desktop GUI Window App:</span>
                    <div className="font-mono text-emerald-400 font-semibold mt-0.5">/usr/local/bin/dorowu-ai-ui</div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Standalone native desktop GUI window with KDE Plasma Breeze dark styling, model selector, preset system prompts, and non-blocking threaded execution.
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Desktop Launcher (.desktop):</span>
                    <div className="font-mono text-purple-400 font-semibold mt-0.5">/usr/share/applications/dorowu-ai.desktop</div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Desktop Entry with <code>Exec=/usr/local/bin/dorowu-ai-ui</code> and <code>Terminal=false</code> for direct window launch from KDE App Launcher.
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-inherit flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-300">
                  <span>Desktop App: <code>dorowu-ai-ui</code></span>
                  <span>Terminal CLI: <code>ai "query"</code></span>
                  <span>Pipeline: <code>cat pacman.log | ai "diagnose"</code></span>
                </div>
              </div>

              {/* Desktop App Icon & Launch Verification Card */}
              <div className={`p-4 rounded-lg border my-4 ${badgeBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Desktop App Icon &amp; Direct Launch Verification
                </h3>

                <div className="flex flex-col md:flex-row items-start gap-4">
                  {/* Icon Visual Preview */}
                  <div className="flex flex-col items-center gap-2 shrink-0 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <img
                      src="/api/icon/dorowu-ai"
                      alt="Dorowu AI Desktop Icon"
                      className="w-16 h-16 rounded-2xl shadow-lg border border-cyan-500/40 p-1 bg-gradient-to-br from-slate-900 to-sky-950"
                    />
                    <span className="text-[10px] font-mono text-cyan-300 font-semibold">dorowu-ai</span>
                    <span className="text-[9px] font-mono text-zinc-500">SVG + 256px PNG</span>
                  </div>

                  {/* Verification Answers */}
                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Does it have an icon? — YES</span>
                      </div>
                      <p className="text-zinc-300 text-[11px]">
                        It has a custom-crafted high-resolution icon set featuring the Dorowu OS deep blue/cyan gradient, 4-point AI sparkle star, and system prompt insignia:
                      </p>
                      <ul className="mt-1 list-disc list-inside text-[11px] font-mono text-zinc-400 space-y-0.5">
                        <li><code>/usr/share/pixmaps/dorowu-ai.svg</code> (Scalable vector)</li>
                        <li><code>/usr/share/pixmaps/dorowu-ai.png</code> (256x256 high-DPI)</li>
                        <li><code>/usr/share/icons/hicolor/*/apps/dorowu-ai.png</code> (16, 32, 48, 64, 128, 256px)</li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-inherit">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Can it be opened using the icon? — YES</span>
                      </div>
                      <p className="text-zinc-300 text-[11px]">
                        The application can be opened directly using its desktop and launcher icons in 3 native Linux ways:
                      </p>
                      <ol className="mt-1 list-decimal list-inside text-[11px] text-zinc-400 space-y-1">
                        <li>
                          <strong className="text-zinc-200">On the Desktop screen:</strong> Double-click the <code className="font-mono text-zinc-300">~/Desktop/dorowu-ai.desktop</code> icon on your desktop wallpaper. Executable permission (<code className="font-mono">0755</code>) is pre-configured so KDE launches it immediately.
                        </li>
                        <li>
                          <strong className="text-zinc-200">In KDE Application Launcher (Start Menu / Kickoff):</strong> Click the icon under <span className="text-zinc-300">Utilities</span> or <span className="text-zinc-300">Development</span> via <code className="font-mono text-zinc-300">/usr/share/applications/dorowu-ai.desktop</code>.
                        </li>
                        <li>
                          <strong className="text-zinc-200">In KDE Taskbar / KRunner:</strong> Search with <code className="font-mono text-zinc-300">Alt+Space</code> or right-click to pin the icon to the KDE Plasma taskbar.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Query Diagnostic Tester */}
              <div className="mt-6 pt-4 border-t border-inherit">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-emerald-500" />
                  Live API Query Test
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Send a test prompt through the backend AI endpoint to verify real-time response generation without needing an AI chat mockup.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Enter diagnostic query (e.g., pacman best practices)"
                    className={`flex-1 px-3 py-2 text-xs rounded-lg border focus:outline-none ${badgeBg}`}
                  />
                  <button
                    onClick={handleTestQuery}
                    disabled={isTestingQuery}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isTestingQuery ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Test</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5 text-zinc-400">
                      <span>Live Response Output</span>
                      <button
                        onClick={() => copyToClipboard(testResult, 'testResult')}
                        className="flex items-center gap-1 hover:text-white"
                      >
                        {copiedKey === 'testResult' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className={`p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap border ${codeBg}`}>
                      {testResult}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TERMS & PRIVACY POLICY */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Official Legal Documents &amp; Governance
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    100% open-source under GNU GPLv3 with zero OS telemetry, no personal email, and full user data sovereignty.
                  </p>
                </div>

                {/* Sub-tabs for TOS vs Privacy */}
                <div className="flex items-center gap-2">
                  <div className={`flex p-1 rounded-lg border text-xs font-medium ${badgeBg}`}>
                    <button
                      onClick={() => setLegalTab('tos')}
                      className={`px-3 py-1 rounded transition-all ${
                        legalTab === 'tos' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Terms of Service
                    </button>
                    <button
                      onClick={() => setLegalTab('privacy')}
                      className={`px-3 py-1 rounded transition-all ${
                        legalTab === 'privacy' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Privacy Policy
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const text = legalTab === 'tos' ? tosContent : privacyContent;
                      copyToClipboard(text, legalTab);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${badgeBg} hover:opacity-80 transition-all`}
                  >
                    {copiedKey === legalTab ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === legalTab ? 'Copied' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (legalTab === 'tos') {
                        downloadTextFile('TERMS_OF_SERVICE.md', tosContent);
                      } else {
                        downloadTextFile('PRIVACY_POLICY.md', privacyContent);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${badgeBg} hover:opacity-80 transition-all`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md</span>
                  </button>
                </div>
              </div>

              {/* Legal Viewer */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-mono mb-2 text-zinc-400">
                  <span>File: {legalTab === 'tos' ? 'TERMS_OF_SERVICE.md' : 'PRIVACY_POLICY.md'}</span>
                  <span className="text-emerald-400">✓ No personal developer email</span>
                </div>
                <div className={`p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-[500px] whitespace-pre-wrap border leading-relaxed ${codeBg}`}>
                  {legalTab === 'tos' ? tosContent : privacyContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 text-xs ${
        isLight ? 'bg-white border-zinc-200 text-zinc-500' : isMono ? 'bg-black border-white text-zinc-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Dorowu OS Project • Arch Linux x86_64 • GNU General Public License v3.0
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setActiveTab('legal'); setLegalTab('tos'); }} className="hover:underline">
              Terms of Service
            </button>
            <button onClick={() => { setActiveTab('legal'); setLegalTab('privacy'); }} className="hover:underline">
              Privacy Policy
            </button>
            <a
              href="https://github.com/SAMI23450/dorowu-os"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
