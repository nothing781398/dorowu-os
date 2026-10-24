import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Cpu,
  Copy,
  Download,
  HardDrive,
  Layers,
  Moon,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Sun,
  Terminal,
  Zap,
} from 'lucide-react';

export type ThemeMode = 'black' | 'white' | 'monochrome';
type ActiveTab = 'overview' | 'health' | 'updates' | 'ai' | 'legal';

interface SystemApp {
  id: string;
  name: string;
  genericName: string;
  description: string;
  exec: string;
  category: string;
  package: string;
  desktopFile: string;
  iconUrl?: string;
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
    loadAverage: { '1m': string; '5m': string; '15m': string };
  };
  metrics: {
    cpu: { percent: number; cores: number; model: string; load1m: string };
    ram: {
      percent: number;
      totalFormatted: string;
      usedFormatted: string;
      freeFormatted: string;
    };
    disk: {
      percent: number;
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

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'health', label: 'Health' },
  { id: 'updates', label: 'Updates' },
  { id: 'ai', label: 'AI' },
  { id: 'legal', label: 'Legal' },
] as const;

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('dorowu_theme');
    if (saved === 'white' || saved === 'light') return 'white';
    if (saved === 'monochrome' || saved === 'bw') return 'monochrome';
    return 'black';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apps, setApps] = useState<SystemApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [appCategory, setAppCategory] = useState('all');
  const [workflowContent, setWorkflowContent] = useState('');
  const [tosContent, setTosContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [legalTab, setLegalTab] = useState<'tos' | 'privacy'>('tos');
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);
  const [isPingingAi, setIsPingingAi] = useState(false);
  const [testQuery, setTestQuery] = useState('pacman -Syu best practices for Dorowu OS');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingQuery, setIsTestingQuery] = useState(false);
  const [updatesStatus, setUpdatesStatus] = useState<UpdatesStatusResponse | null>(null);
  const [updatesCheck, setUpdatesCheck] = useState<UpdatesCheckResponse | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse | null>(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [healthLivePolling, setHealthLivePolling] = useState(true);

  useEffect(() => {
    localStorage.setItem('dorowu_theme', theme);
    document.documentElement.classList.remove('theme-light', 'theme-slate', 'theme-white', 'theme-black', 'theme-monochrome');
    if (theme === 'white') document.documentElement.classList.add('theme-white', 'theme-light');
    else if (theme === 'monochrome') document.documentElement.classList.add('theme-monochrome');
    else document.documentElement.classList.add('theme-black', 'theme-slate');
  }, [theme]);

  const fetchSystemHealth = async () => {
    try {
      setIsRefreshingHealth(true);
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = (await res.json()) as SystemHealthResponse;
        setSystemHealth(data);
      }
    } catch (error) {
      console.warn('Unable to load system health metrics.', error);
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    if (!healthLivePolling) return;
    const id = window.setInterval(fetchSystemHealth, 3000);
    return () => window.clearInterval(id);
  }, [healthLivePolling]);

  const fetchAiStatus = async () => {
    try {
      setIsPingingAi(true);
      const res = await fetch('/api/ai-status');
      if (res.ok) {
        const data = (await res.json()) as AiStatusResponse;
        setAiStatus(data);
      }
    } catch (error) {
      console.warn('Failed to ping AI engine.', error);
    } finally {
      setIsPingingAi(false);
    }
  };

  const fetchUpdatesStatus = async () => {
    try {
      const res = await fetch('/api/updates/status');
      if (res.ok) setUpdatesStatus((await res.json()) as UpdatesStatusResponse);
    } catch (error) {
      console.warn('Failed to load updates status.', error);
    }
  };

  const checkLiveUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const res = await fetch('/api/updates/check');
      if (res.ok) setUpdatesCheck((await res.json()) as UpdatesCheckResponse);
    } catch (error) {
      console.warn('Failed to fetch package update status.', error);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  useEffect(() => {
    fetchAiStatus();
    fetchUpdatesStatus();
    checkLiveUpdates();

    fetch('/api/apps')
      .then((r) => r.json())
      .then((data) => setApps(data.apps || []))
      .catch((err) => console.warn('Failed to load OS apps:', err));

    fetch('/api/workflow')
      .then((r) => r.json())
      .then((data) => setWorkflowContent(data.content || ''))
      .catch((err) => console.warn('Failed to load workflow:', err));

    fetch('/api/legal/tos')
      .then((r) => r.json())
      .then((data) => setTosContent(data.content || ''))
      .catch((err) => console.warn('Failed to load TOS:', err));

    fetch('/api/legal/privacy')
      .then((r) => r.json())
      .then((data) => setPrivacyContent(data.content || ''))
      .catch((err) => console.warn('Failed to load privacy policy:', err));
  }, []);

  const handleTestQuery = async () => {
    if (!testQuery.trim() || isTestingQuery) return;
    setIsTestingQuery(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testQuery, mode: 'linux' }),
      });
      const data = await res.json();
      if (data.reply) setTestResult(data.reply);
      else if (data.error) setTestResult(`[API Error]: ${data.error}`);
    } catch (error: any) {
      setTestResult(`[Network Error]: ${error?.message || 'Connection failed'}`);
    } finally {
      setIsTestingQuery(false);
    }
  };

  const copyToClipboard = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch (error) {
      console.warn('Clipboard copy failed.', error);
    }
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

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const search = appSearch.toLowerCase();
      const matchesSearch =
        app.name.toLowerCase().includes(search) ||
        app.description.toLowerCase().includes(search) ||
        app.package.toLowerCase().includes(search);
      const matchesCat = appCategory === 'all' || app.category.toLowerCase() === appCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [apps, appCategory, appSearch]);

  const isLight = theme === 'white';
  const isMono = theme === 'monochrome';
  const cardBg = isLight
    ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
    : isMono
      ? 'bg-black border-white text-white'
      : 'bg-zinc-900/75 border-zinc-800 text-zinc-100 shadow-lg';
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

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isLight ? 'bg-zinc-50 text-zinc-900' : isMono ? 'bg-black text-white' : 'bg-[#050816] text-zinc-100'}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isLight ? 'bg-white/90 border-zinc-200' : isMono ? 'bg-black border-white' : 'bg-[#0b1120]/85 border-zinc-800'}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg font-black ${isLight ? 'border-blue-200 bg-blue-600 text-white' : isMono ? 'border-white bg-white text-black' : 'border-blue-500/50 bg-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.35)]'}`}>
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">Dorowu OS</h1>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeBg}`}>
                  Arch x86_64
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                KDE Plasma 6 • Calamares • Live CI build
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center rounded-xl border p-1 text-xs ${isLight ? 'bg-zinc-100 border-zinc-200' : isMono ? 'bg-black border-white' : 'bg-zinc-900 border-zinc-800'}`}>
              {(['black', 'white', 'monochrome'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${theme === mode ? (mode === 'white' ? 'bg-white text-black' : mode === 'monochrome' ? 'bg-white text-black font-bold' : 'bg-zinc-800 text-white') : 'text-zinc-500 hover:text-zinc-200'}`}
                  title={mode === 'black' ? 'Dark theme' : mode === 'white' ? 'Light theme' : 'Monochrome'}
                >
                  {mode === 'black' ? <Moon className="h-3.5 w-3.5" /> : mode === 'white' ? <Sun className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                  <span>{mode === 'black' ? 'Dark' : mode === 'white' ? 'Light' : 'B/W'}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${aiStatus?.apiKeyWorking ? (isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : isMono ? 'border-white bg-black text-white' : 'border-emerald-700/80 bg-emerald-950/60 text-emerald-300') : (isLight ? 'border-zinc-300 bg-zinc-100 text-zinc-700' : 'border-zinc-700 bg-zinc-900 text-zinc-300')}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${aiStatus?.apiKeyWorking ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">AI</span>
              <span className="font-semibold">{aiStatus?.apiKeyWorking ? 'Online' : 'Checking...'}</span>
              <Zap className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <nav className="mx-auto max-w-7xl overflow-x-auto px-4 pb-2 sm:px-6">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t-lg border-b-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition ${activeTab === tab.id ? (isLight ? 'border-blue-600 text-blue-600' : isMono ? 'border-white text-white font-bold' : 'border-blue-500 text-blue-400') : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Base Distribution', value: 'Arch Linux x86_64', detail: 'Kernel 6.x • rolling', icon: <HardDrive className="h-4 w-4 text-blue-400" /> },
            { label: 'Desktop', value: 'KDE Plasma 6', detail: 'Wayland • Breeze', icon: <Cpu className="h-4 w-4 text-violet-400" /> },
            { label: 'Installer', value: 'Calamares 3.3+', detail: 'EFI + Btrfs', icon: <Layers className="h-4 w-4 text-emerald-400" /> },
            { label: 'AI Runtime', value: aiStatus?.apiKeyWorking ? 'Live' : 'Standby', detail: aiStatus?.activeModel || 'Gemini ready', icon: <Sparkles className="h-4 w-4 text-amber-400" /> },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border p-3.5 ${cardBg}`}>
              <div className="mb-2 flex items-center gap-2 text-[11px] text-zinc-400">
                {card.icon}
                <span>{card.label}</span>
              </div>
              <div className="text-sm font-bold">{card.value}</div>
              <div className="mt-1 text-[11px] text-zinc-400">{card.detail}</div>
            </div>
          ))}
        </section>

        {activeTab === 'overview' && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className={`rounded-3xl border p-5 ${cardBg}`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-blue-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    System overview
                  </div>
                  <h2 className="mt-2 text-2xl font-black">Dorowu OS control center</h2>
                </div>
                <button
                  onClick={() => setActiveTab('updates')}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  View updates
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-400">
                    <Terminal className="h-4 w-4" />
                    Build pipeline
                  </div>
                  <p className="text-sm text-zinc-300">
                    ISO generation runs in GitHub Actions using a containerized Arch build environment and publishes artifact checksums for release builds.
                  </p>
                  <div className={`mt-3 rounded-xl border p-2 font-mono text-[11px] ${codeBg}`}>
                    mkarchiso -v -w /tmp/archiso-work -o out dorowu-profile
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <Shield className="h-4 w-4" />
                    System integrity
                  </div>
                  <p className="text-sm text-zinc-300">
                    Dorowu OS uses a transparent Arch base, package verification, and open-source policies with local-first AI data handling.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Zero telemetry promise
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono">Workflow file</span>
                  <button onClick={() => copyToClipboard(workflowContent || 'Workflow unavailable', 'workflow')} className="hover:text-white">
                    {copiedKey === 'workflow' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <pre className={`max-h-56 overflow-auto rounded-xl border p-3 font-mono text-[11px] leading-relaxed ${codeBg}`}>
                  <code>{workflowContent || '# loading workflow file...'}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`rounded-3xl border p-5 ${cardBg}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">AI status</h3>
                  <button onClick={fetchAiStatus} className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-[11px] hover:opacity-90">
                    <RefreshCw className={`h-3.5 w-3.5 ${isPingingAi ? 'animate-spin' : ''}`} />
                    Ping
                  </button>
                </div>
                <div className="space-y-3">
                  <div className={`rounded-2xl border p-3 ${badgeBg}`}>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">API key</div>
                    <div className="mt-1 text-lg font-black text-emerald-400">
                      {aiStatus?.apiKeyWorking ? 'Authenticated' : aiStatus?.apiKeyConfigured ? 'Configured' : 'Not configured'}
                    </div>
                  </div>
                  <div className={`rounded-2xl border p-3 ${badgeBg}`}>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Active model</div>
                    <div className="mt-1 font-mono text-sm text-blue-400">{aiStatus?.activeModel || 'gemini-3.1-flash-lite'}</div>
                  </div>
                  <div className={`rounded-2xl border p-3 ${badgeBg}`}>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Latency</div>
                    <div className="mt-1 text-lg font-black text-violet-400">{aiStatus?.latencyMs ? `${aiStatus.latencyMs} ms` : 'Ready'}</div>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border p-5 ${cardBg}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">Live upgrade path</h3>
                  <button onClick={checkLiveUpdates} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500">
                    Refresh
                  </button>
                </div>
                <div className="space-y-2 text-sm text-zinc-300">
                  <div className="flex items-center justify-between"><span>Arch mirrors</span><span className="font-mono text-emerald-400">{updatesCheck?.mirrorsSynchronized ? 'Synced' : 'Pending'}</span></div>
                  <div className="flex items-center justify-between"><span>OS updates</span><span className="font-mono text-cyan-400">{updatesCheck?.liveArchUpstreamStatus || 'Checking'}</span></div>
                  <div className="flex items-center justify-between"><span>AI assistant</span><span className="font-mono text-amber-400">{aiStatus?.apiKeyWorking ? 'Live' : 'Fallback mode'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className={`rounded-3xl border p-5 ${cardBg}`}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-400">
                    <Activity className="h-3.5 w-3.5" />
                    Real-time system health
                  </div>
                  <h2 className="mt-2 text-xl font-black">Hardware and workload telemetry</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setHealthLivePolling(!healthLivePolling)} className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium ${healthLivePolling ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}>
                    {healthLivePolling ? 'Live polling on' : 'Polling paused'}
                  </button>
                  <button onClick={fetchSystemHealth} className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-500">
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  {
                    title: 'CPU processor',
                    percent: systemHealth?.metrics.cpu.percent ?? 0,
                    value: `${systemHealth?.metrics.cpu.percent ?? 0}%`,
                    detail: systemHealth?.metrics.cpu.model || 'x86_64 processor',
                    color: 'bg-cyan-400',
                  },
                  {
                    title: 'RAM memory',
                    percent: systemHealth?.metrics.ram.percent ?? 0,
                    value: `${systemHealth?.metrics.ram.percent ?? 0}%`,
                    detail: `${systemHealth?.metrics.ram.usedFormatted ?? '0 B'} used / ${systemHealth?.metrics.ram.totalFormatted ?? '0 B'}`,
                    color: 'bg-violet-400',
                  },
                  {
                    title: 'Disk storage',
                    percent: systemHealth?.metrics.disk.percent ?? 0,
                    value: `${systemHealth?.metrics.disk.percent ?? 0}%`,
                    detail: `${systemHealth?.metrics.disk.usedFormatted ?? '0 B'} used / ${systemHealth?.metrics.disk.totalFormatted ?? '0 B'}`,
                    color: 'bg-emerald-400',
                  },
                ].map((metric) => (
                  <div key={metric.title} className={`rounded-2xl border p-4 ${badgeBg}`}>
                    <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                      <span>{metric.title}</span>
                      <span className="font-mono text-[11px] text-zinc-300">{metric.value}</span>
                    </div>
                    <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-zinc-800">
                      <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${Math.min(100, metric.percent)}%` }} />
                    </div>
                    <div className="text-[11px] text-zinc-400">{metric.detail}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                  <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">Kernel and architecture</div>
                  <div className="space-y-2 font-mono text-xs text-zinc-300">
                    <div className="flex justify-between gap-3 border-b border-zinc-800 pb-2"><span>OS</span><span>{systemHealth?.system.distro || 'Dorowu OS'}</span></div>
                    <div className="flex justify-between gap-3 border-b border-zinc-800 pb-2"><span>Kernel</span><span>{systemHealth?.system.kernel || '6.x.x'}</span></div>
                    <div className="flex justify-between gap-3 border-b border-zinc-800 pb-2"><span>Arch</span><span>{systemHealth?.system.arch || 'x86_64'}</span></div>
                    <div className="flex justify-between gap-3"><span>Uptime</span><span>{systemHealth?.system.uptimeFormatted || '0h 0m'}</span></div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                  <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">Load averages</div>
                  <div className="space-y-2 font-mono text-xs text-zinc-300">
                    <div className="flex justify-between gap-3 border-b border-zinc-800 pb-2"><span>1m</span><span>{systemHealth?.system.loadAverage['1m'] || '0.00'}</span></div>
                    <div className="flex justify-between gap-3 border-b border-zinc-800 pb-2"><span>5m</span><span>{systemHealth?.system.loadAverage['5m'] || '0.00'}</span></div>
                    <div className="flex justify-between gap-3 border-b border-zinc-800 pb-2"><span>15m</span><span>{systemHealth?.system.loadAverage['15m'] || '0.00'}</span></div>
                    <div className="flex justify-between gap-3"><span>Mount</span><span>{systemHealth?.metrics.disk.mount || '/'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className={`rounded-3xl border p-5 ${cardBg}`}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400">
                    <RefreshCw className="h-3.5 w-3.5" />
                    System and app updates
                  </div>
                  <h2 className="mt-2 text-xl font-black">Upgrade engine</h2>
                </div>
                <button onClick={checkLiveUpdates} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">
                  {isCheckingUpdates ? 'Checking...' : 'Check upstream'}
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {updatesStatus ? (
                  <>
                    <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400">System engine</div>
                      <div className="text-sm font-bold">{updatesStatus.systemUpdater.engine}</div>
                    </div>
                    <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400">Desktop updater</div>
                      <div className="text-sm font-bold">{updatesStatus.appUpdater.engine}</div>
                    </div>
                    <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400">Package mirror</div>
                      <div className="text-sm font-bold">{updatesStatus.systemUpdater.mirrorRanker}</div>
                    </div>
                  </>
                ) : (
                  <div className="lg:col-span-3 rounded-2xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">Waiting for updater status…</div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-bold">Live Arch package list</div>
                  <div className="font-mono text-[11px] text-zinc-400">{updatesCheck?.timestamp ? new Date(updatesCheck.timestamp).toLocaleTimeString() : 'Not fetched yet'}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className={`border-b border-zinc-800 ${codeBg}`}>
                      <tr>
                        <th className="px-3 py-2">Package</th>
                        <th className="px-3 py-2">Repo</th>
                        <th className="px-3 py-2">Version</th>
                        <th className="px-3 py-2">Arch</th>
                        <th className="px-3 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                      {updatesCheck?.trackedPackages && updatesCheck.trackedPackages.length > 0 ? (
                        updatesCheck.trackedPackages.map((pkg) => (
                          <tr key={pkg.name}>
                            <td className="px-3 py-2 font-medium text-white">{pkg.name}</td>
                            <td className="px-3 py-2 text-cyan-400">[{pkg.repo}]</td>
                            <td className="px-3 py-2 text-emerald-400">{pkg.latestVersion}</td>
                            <td className="px-3 py-2">{pkg.arch}</td>
                            <td className="px-3 py-2 text-zinc-400">{pkg.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">{isCheckingUpdates ? 'Querying official Arch mirrors…' : 'No upstream packages loaded yet.'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {updatesCheck?.supportedCommands && Object.entries(updatesCheck.supportedCommands).map(([key, value]) => (
                  <div key={key} className={`flex items-center justify-between rounded-xl border p-3 ${codeBg}`}>
                    <span className="font-mono text-[11px] text-zinc-400">{key}</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-emerald-300">{value}</code>
                      <button onClick={() => copyToClipboard(value, `cmd-${key}`)} className="hover:text-white">
                        {copiedKey === `cmd-${key}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className={`rounded-3xl border p-5 ${cardBg}`}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-400">
                    <Zap className="h-3.5 w-3.5" />
                    AI diagnostics
                  </div>
                  <h2 className="mt-2 text-xl font-black">System assistant validation</h2>
                </div>
                <button onClick={fetchAiStatus} className="rounded-xl border px-3 py-2 text-xs font-medium hover:opacity-90">
                  {isPingingAi ? 'Checking…' : 'Ping AI'}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">API status</div>
                  <div className="mt-1 text-lg font-black text-emerald-400">{aiStatus?.apiKeyWorking ? 'Live' : 'Fallback'}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Model</div>
                  <div className="mt-1 font-mono text-sm text-blue-400">{aiStatus?.activeModel || 'gemini-3.1-flash-lite'}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${badgeBg}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Latency</div>
                  <div className="mt-1 text-lg font-black text-violet-400">{aiStatus?.latencyMs ? `${aiStatus.latencyMs} ms` : 'Ready'}</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs focus:outline-none ${badgeBg}`}
                    placeholder="Ask the AI a Dorowu OS or Linux question"
                  />
                  <button onClick={handleTestQuery} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60" disabled={isTestingQuery}>
                    {isTestingQuery ? 'Generating…' : 'Run test'}
                  </button>
                </div>

                {testResult && (
                  <div className="rounded-2xl border border-zinc-800 bg-black/50 p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-mono">Live response</span>
                      <button onClick={() => copyToClipboard(testResult, 'ai-test')} className="hover:text-white">
                        {copiedKey === 'ai-test' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-200">{testResult}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div className={`rounded-3xl border p-5 ${cardBg}`}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-400">
                    <Shield className="h-3.5 w-3.5" />
                    Governing documents
                  </div>
                  <h2 className="mt-2 text-xl font-black">Terms and privacy</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex rounded-xl border p-1 ${badgeBg}`}>
                    <button onClick={() => setLegalTab('tos')} className={`rounded-lg px-3 py-1.5 text-[11px] ${legalTab === 'tos' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}>Terms</button>
                    <button onClick={() => setLegalTab('privacy')} className={`rounded-lg px-3 py-1.5 text-[11px] ${legalTab === 'privacy' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}>Privacy</button>
                  </div>
                  <button onClick={() => downloadTextFile(legalTab === 'tos' ? 'TERMS_OF_SERVICE.md' : 'PRIVACY_POLICY.md', legalTab === 'tos' ? tosContent : privacyContent)} className="rounded-xl border px-3 py-2 text-[11px] hover:opacity-90">
                    Download
                  </button>
                </div>
              </div>

              <pre className={`max-h-[500px] overflow-auto rounded-2xl border p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap ${codeBg}`}>
                {legalTab === 'tos' ? tosContent : privacyContent}
              </pre>
            </div>
          </div>
        )}

        <section className={`rounded-3xl border p-5 ${cardBg}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-400">
                <Search className="h-3.5 w-3.5" />
                Installed software
              </div>
              <h3 className="mt-2 text-xl font-black">System packages and apps</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search apps…"
                className={`rounded-xl border px-3 py-2 text-xs focus:outline-none ${badgeBg}`}
              />
              <select value={appCategory} onChange={(e) => setAppCategory(e.target.value)} className={`rounded-xl border px-3 py-2 text-xs focus:outline-none ${badgeBg}`}>
                <option value="all">All</option>
                <option value="system">System</option>
                <option value="network">Network</option>
                <option value="development">Development</option>
                <option value="utility">Utility</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredApps.map((app) => (
              <div key={app.id} className={`rounded-2xl border p-3 ${badgeBg}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {app.iconUrl ? <img src={app.iconUrl} alt={app.name} className="h-7 w-7 rounded-xl border border-cyan-500/40 bg-zinc-950 p-1" /> : null}
                    <div>
                      <div className="text-sm font-bold">{app.name}</div>
                      <div className="text-[11px] text-zinc-400">{app.genericName}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-300">{app.category}</span>
                </div>
                <p className="text-xs text-zinc-400">{app.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px] font-mono text-zinc-300">
                  <span>pkg: {app.package}</span>
                  <span>{app.exec}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={`border-t py-4 text-xs ${isLight ? 'border-zinc-200 bg-white text-zinc-500' : isMono ? 'border-white bg-black text-zinc-400' : 'border-zinc-800 bg-[#0b1120] text-zinc-500'}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
          <div>Dorowu OS Project • Arch Linux x86_64 • GPLv3</div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setActiveTab('legal'); setLegalTab('tos'); }} className="hover:text-white">Terms</button>
            <button onClick={() => { setActiveTab('legal'); setLegalTab('privacy'); }} className="hover:text-white">Privacy</button>
            <a href="https://github.com/SAMI23450/dorowu-os" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
