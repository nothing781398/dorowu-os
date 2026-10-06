import React, { useState } from 'react';
import { 
  Terminal, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  FileCode, 
  Sparkles,
  ShoppingBag,
  Globe,
  Smile,
  MousePointer,
  Lock,
  Layers,
  FolderGit2
} from 'lucide-react';

export default function App() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'icons' | 'security' | 'guide'>('overview');

  const copyScriptCmd = () => {
    navigator.clipboard.writeText('bash generate_arch_core.sh');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <span className="text-white font-extrabold text-xl tracking-tight">D</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">Dorowu OS</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Arch Linux Kernel 6.x
                </span>
              </div>
              <p className="text-xs text-slate-400">Pure Autonomous OS Generator — 100% Real Linux</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyScriptCmd}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy bash generate_arch_core.sh'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-6 text-sm border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 font-medium border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`py-2.5 font-medium border-b-2 transition ${
              activeTab === 'apps'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            App Store, Firefox & UI
          </button>
          <button
            onClick={() => setActiveTab('icons')}
            className={`py-2.5 font-medium border-b-2 transition ${
              activeTab === 'icons'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Official Icons & Branding
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 font-medium border-b-2 transition ${
              activeTab === 'security'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Private Repo & Gemini Key
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 font-medium border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Mobile Build Guide
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-800 p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
                    <ShieldCheck className="w-4 h-4" /> 100% Real Linux — Zero Mockups
                  </div>
                  <h1 className="text-2xl font-bold text-white">Dorowu OS: Complete Architecture Settled</h1>
                  <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                    Every driver, kernel preset, systemd unit, black cursor theme, Unicode emoji font, official Mozilla Firefox, and Dorowu App Store is deployed and verified with syntax checks.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" /> Stock Arch Kernel + Headers
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> KDE Plasma 6 Wayland
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-teal-400" /> Calamares + GRUB
                  </span>
                </div>
              </div>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <Globe className="w-4 h-4" /> Real Mozilla Firefox
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real <code className="text-teal-300">extra/firefox</code> binary directly from official Arch Linux repositories with enterprise privacy policies pre-installed (telemetry disabled, tracking protection active).
                </p>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                  <ShoppingBag className="w-4 h-4" /> Dorowu App Store
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Powered by KDE Discover + Flatpak + Flathub remote enabled on first boot. Install thousands of apps (Spotify, Discord, VS Code, Steam, OBS, Telegram, VLC) with 1 click.
                </p>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <MousePointer className="w-4 h-4" /> Black Cursor & Emojis
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Default sleek black cursor (<code className="text-teal-300">breeze_cursors</code>) in SDDM and Plasma 6, plus Google Noto Color Emoji font configured system-wide across all apps.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-400" />
                Dorowu App Store & Firefox Integration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                    <ShoppingBag className="w-4 h-4" /> Dorowu App Store
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• Pinned to the center panel dock: <code className="text-teal-300">dorowu-appstore.desktop</code></li>
                    <li>• Backend: KDE Discover + PackageKit + Flatpak</li>
                    <li>• Flathub repository initialized automatically via <code className="text-teal-300">dorowu-flathub.service</code></li>
                    <li>• Installs native Arch Linux packages and Flatpak sandboxed apps seamlessly</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                    <Globe className="w-4 h-4" /> Genuine Mozilla Firefox
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• Official Arch Linux package: <code className="text-teal-300">firefox</code> (not a snap, not a wrapper)</li>
                    <li>• Hardware accelerated video decoding via Mesa / VAAPI</li>
                    <li>• Custom enterprise policy file at <code className="text-teal-300">/etc/firefox/policies/policies.json</code></li>
                    <li>• Telemetry and tracking disabled by default</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <MousePointer className="w-4 h-4" /> Modern Black Cursor
                  </div>
                  <p className="text-xs text-slate-300">
                    Configured in <code className="text-teal-300">kcminputrc</code>, <code className="text-teal-300">sddm.conf.d</code>, and <code className="text-teal-300">icons/default/index.theme</code> using the official Breeze Black Cursor (<code className="text-slate-100">breeze_cursors</code>, size 24).
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                    <Smile className="w-4 h-4" /> Native Unicode Emojis
                  </div>
                  <p className="text-xs text-slate-300">
                    <code className="text-teal-300">noto-fonts-emoji</code> with high-priority fontconfig aliases in <code className="text-teal-300">/etc/fonts/local.conf</code> ensuring emojis render cleanly in terminal, browser, and system dialogs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'icons' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Dorowu OS Visual Branding
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your authentic uploaded assets (Squircle with royal blue-teal gradient, white 'D', and ice-blue mountain silhouette + Dorowu OS wordmark) are configured in all system layers:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                    <svg viewBox="0 0 512 512" className="w-12 h-12">
                      <path d="M 156 122 H 262 C 328 122 376 166 376 256 C 376 346 328 390 262 390 H 156 Z" fill="#ffffff"/>
                      <path d="M 222 178 V 334 H 256 C 298 334 322 308 322 256 C 322 204 298 178 256 178 Z" fill="#0284c7"/>
                      <path d="M 236 334 L 274 262 L 296 306 L 314 282 L 322 298 V 334 Z" fill="#e0f2fe"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">System Application Icon</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Installed at <code className="text-teal-300">/usr/share/pixmaps/dorowu-logo.svg</code> and assigned to Calamares, application launchers, and SDDM greeters.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                    <span className="font-extrabold text-xs text-slate-100">Dorowu</span>
                    <span className="text-[10px] font-bold text-teal-400">os</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Calamares Slideshow & Branding</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Embedded into Calamares QML presentation (<code className="text-teal-300">show.qml</code>) and the 2560x1440 default desktop wallpaper.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center gap-2 text-teal-400 font-semibold text-base">
                  <Lock className="w-5 h-5" /> Private Repository Recommendation
                </div>
                <div className="text-sm text-slate-300 space-y-3">
                  <p>
                    <strong className="text-white">Yes, keep your repository Private!</strong>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    On GitHub Free, Private repositories receive <strong>2,000 free Linux build minutes per month</strong>. An Arch ISO build takes ~20–25 minutes, meaning you can build ~80 full ISO releases a month without paying anything.
                  </p>
                  <p className="text-xs text-slate-400">
                    A private repo keeps your custom ISO configurations and development experiments completely private.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                  <Key className="w-5 h-5" /> Gemini API Key Setup
                </div>
                <div className="text-sm text-slate-300 space-y-3">
                  <p>
                    <strong className="text-white">No need to share your API key with anyone.</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    Whenever you want to use the Terminal AI in Dorowu OS, simply run:
                  </p>
                  <code className="text-teal-300 block bg-slate-950 p-2 rounded text-xs">
                    ai-assistant --config
                  </code>
                  <p className="text-xs text-slate-400">
                    It will prompt for your key with hidden input and store it securely with <code className="text-slate-200">chmod 0600</code> permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-teal-400" />
                How to Build from your Smartphone
              </h2>

              <ol className="text-sm text-slate-300 space-y-3 list-decimal list-inside">
                <li>
                  <strong>Create a new GitHub Repo:</strong> Set it to <em>Private</em> (or Public).
                </li>
                <li>
                  <strong>Add the Generator:</strong> Copy or upload <code className="text-teal-300">generate_arch_core.sh</code> and your logo files.
                </li>
                <li>
                  <strong>Run the Generator:</strong> In your terminal (Termux / SSH / Codespaces):
                  <pre className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-xs text-teal-300">
                    bash generate_arch_core.sh
                  </pre>
                  <em>(This automatically removes index.html and any web template files, creating only the pristine Dorowu OS distribution files).</em>
                </li>
                <li>
                  <strong>Commit & Push:</strong>
                  <pre className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-xs text-teal-300">
                    git add -A && git commit -m "feat: Dorowu OS Linux distribution" && git push origin main
                  </pre>
                </li>
                <li>
                  <strong>Trigger Build:</strong> Open the GitHub mobile app → Repository → <strong>Actions</strong> → <strong>Build Dorowu OS ISO (x86_64)</strong> → Tap <strong>Run workflow</strong>.
                </li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
