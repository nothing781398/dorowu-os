import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DOROWU_LINUX_SYSTEM_PROMPT = `You are the official Dorowu OS AI Assistant Desktop Application, built natively into Dorowu OS.
Dorowu OS is an Arch Linux-based operating system featuring KDE Plasma 6, Calamares 3.3+ installer, Linux Kernel 6.x, and automated CI builds using .github/workflows/build-x86_64.yml.
When asked who you are (e.g., "who are u", "who are you", "what are you", "who r u"), you must always identify yourself as the official Dorowu OS AI Assistant.

You have expert Linux & Dorowu OS capabilities:
1. Arch Linux administration: pacman, AUR, systemd unit management, mkinitcpio, btrfs subvolumes, networkmanager, wireplumber, pipewire.
2. Dorowu OS architecture: Calamares modules, custom airootfs, font configuration, Flatpak Flathub repository, and build automation.
3. Official Workflow: The ONLY official automated ISO build pipeline is .github/workflows/build-x86_64.yml (which runs archiso inside a privileged Arch Linux container, produces SHA256 checksums, and publishes releases).
4. Bash & Terminal scripting: Expert in writing safe bash scripts (set -euo pipefail), command flags, diagnostics, and performance debugging.
5. General AI capabilities: Programming, debugging, problem-solving, math, and general assistance.

Always provide precise, actionable solutions with copyable code blocks and syntax highlighting.`;

const DOROWU_GENERAL_SYSTEM_PROMPT = `You are the official Dorowu OS AI Assistant Desktop Application.
When asked who you are (e.g. "who are u", "who are you"), you must explicitly identify yourself as the official Dorowu OS AI Assistant.
In General Companion mode, you assist with any task: coding, debugging, creative writing, research, math, everyday Q&A, workflow automation, and general knowledge.
You also know everything about Dorowu OS (Arch Linux, KDE Plasma 6, Calamares, and .github/workflows/build-x86_64.yml) if asked.
Provide direct, intelligent, well-structured responses. Use markdown formatting with copyable code snippets where appropriate.`;

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], mode = 'linux' } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const trimmed = message.trim();
    // Fast-path for identity query
    const isIdentity = /^(who\s*(are|r)\s*(u|you)|what\s*are\s*you|who\s*u)[\s?!.]*$/i.test(trimmed);
    if (isIdentity) {
      return res.json({
        reply: "I'm the official AI Assistant of Dorowu OS, an intelligent desktop companion built into Dorowu OS. I can assist you with Arch Linux administration, system diagnostics, bash scripting, Calamares configurations, workflow automation, and any general programming or everyday AI task. How can I help you today?"
      });
    }

    const systemInstruction = mode === 'general' ? DOROWU_GENERAL_SYSTEM_PROMPT : DOROWU_LINUX_SYSTEM_PROMPT;

    // Build chat contents ensuring first turn is 'user'
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      // Find index of first user message
      const firstUserIndex = history.findIndex(h => h.role === 'user');
      const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];
      const slice = validHistory.slice(-8);

      for (const item of slice) {
        if (item.content && typeof item.content === 'string') {
          contents.push({
            role: item.role === 'model' || item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: trimmed }],
    });

    // Call Gemini with low-latency model order
    let reply = '';
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          reply = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt error:`, err?.message || err);
      }
    }

    if (!reply) {
      if (lastError) throw lastError;
      reply = "I processed your request, but received an empty response.";
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error generating Gemini response:', error);
    return res.status(500).json({
      error: error.message || 'Failed to connect to Dorowu AI service.',
    });
  }
});

// Endpoint to fetch the real .github/workflows/build-x86_64.yml workflow
app.get('/api/workflow', (req, res) => {
  try {
    const workflowPath = path.resolve(__dirname, '.github/workflows/build-x86_64.yml');
    if (fs.existsSync(workflowPath)) {
      const content = fs.readFileSync(workflowPath, 'utf8');
      return res.json({
        name: 'Build Dorowu OS ISO (x86_64)',
        path: '.github/workflows/build-x86_64.yml',
        content,
      });
    }
    return res.status(404).json({ error: 'Workflow file not found.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch real Dorowu OS configuration stats
app.get('/api/system-info', (req, res) => {
  try {
    const packagesPath = path.resolve(__dirname, 'dorowu-profile/packages.x86_64');
    let packageCount = 0;
    if (fs.existsSync(packagesPath)) {
      const lines = fs.readFileSync(packagesPath, 'utf8').split('\n');
      packageCount = lines.filter(l => l.trim() && !l.trim().startsWith('#')).length;
    }

    return res.json({
      distro: 'Dorowu OS 2026.10',
      base: 'Arch Linux x86_64',
      kernel: 'Linux 6.x (linux, linux-firmware, linux-headers)',
      desktop: 'KDE Plasma 6 (Wayland / XWayland)',
      installer: 'Calamares 3.3+ (KDE Frameworks 6)',
      aiModel: 'Gemini 3.8 Flash',
      workflowFile: '.github/workflows/build-x86_64.yml',
      totalPreinstalledPackages: packageCount,
      desktopAppEntry: 'dorowu-ai.desktop',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch all real pre-installed Dorowu OS applications
app.get('/api/apps', (req, res) => {
  const apps = [
    {
      id: 'dorowu-ai',
      name: 'Dorowu AI Assistant',
      genericName: 'AI Desktop Companion',
      description: 'Official Dorowu OS desktop AI companion for Linux troubleshooting, development, and general intelligence',
      exec: 'dorowu-ai-ui',
      category: 'Development',
      package: 'dorowu-ai',
      desktopFile: 'dorowu-ai.desktop',
    },
    {
      id: 'dorowu-appstore',
      name: 'Dorowu App Store',
      genericName: 'Software Center',
      description: 'Install applications, utilities, flatpaks, and developer tools via KDE Discover',
      exec: 'plasma-discover',
      category: 'System',
      package: 'discover',
      desktopFile: 'dorowu-appstore.desktop',
    },
    {
      id: 'firefox',
      name: 'Mozilla Firefox',
      genericName: 'Web Browser',
      description: 'Enterprise privacy-hardened web browser with tracking protection enabled',
      exec: 'firefox',
      category: 'Network',
      package: 'firefox',
      desktopFile: 'firefox.desktop',
    },
    {
      id: 'dolphin',
      name: 'Dolphin',
      genericName: 'File Manager',
      description: 'High-performance KDE Plasma file and directory manager',
      exec: 'dolphin',
      category: 'System',
      package: 'dolphin',
      desktopFile: 'org.kde.dolphin.desktop',
    },
    {
      id: 'kitty',
      name: 'Kitty Terminal',
      genericName: 'Terminal Emulator',
      description: 'GPU-accelerated fast terminal emulator with JetBrains Mono font',
      exec: 'kitty',
      category: 'System',
      package: 'kitty',
      desktopFile: 'kitty.desktop',
    },
    {
      id: 'dorowu-installer',
      name: 'Install Dorowu OS',
      genericName: 'System Installer',
      description: 'Calamares 3.3+ graphical live installer with Btrfs/Ext4 and EFI partitioning',
      exec: 'dorowu-install',
      category: 'System',
      package: 'calamares',
      desktopFile: 'dorowu-installer.desktop',
    },
    {
      id: 'kate',
      name: 'Kate',
      genericName: 'Advanced Text Editor',
      description: 'Multi-document code and configuration editor with syntax highlighting and LSP',
      exec: 'kate',
      category: 'Development',
      package: 'kate',
      desktopFile: 'org.kde.kate.desktop',
    },
    {
      id: 'partitionmanager',
      name: 'Partition Manager',
      genericName: 'Disk & Partition Utility',
      description: 'Manage disk drives, partitions, and filesystems with kpmcore',
      exec: 'partitionmanager',
      category: 'System',
      package: 'partitionmanager',
      desktopFile: 'org.kde.partitionmanager.desktop',
    },
    {
      id: 'gdrive',
      name: 'Google Drive Setup',
      genericName: 'Cloud Storage Mount',
      description: 'Mount Google Drive as a local filesystem folder in ~/GoogleDrive via rclone',
      exec: 'dorowu-gdrive-setup',
      category: 'Network',
      package: 'rclone',
      desktopFile: 'dorowu-gdrive.desktop',
    },
    {
      id: 'kcalc',
      name: 'KCalc',
      genericName: 'Scientific Calculator',
      description: 'Scientific and mathematical calculator for KDE Plasma',
      exec: 'kcalc',
      category: 'Utility',
      package: 'kcalc',
      desktopFile: 'org.kde.kcalc.desktop',
    },
    {
      id: 'spectacle',
      name: 'Spectacle',
      genericName: 'Screenshot Utility',
      description: 'Screen and window capture tool with annotation support',
      exec: 'spectacle',
      category: 'Utility',
      package: 'spectacle',
      desktopFile: 'org.kde.spectacle.desktop',
    },
    {
      id: 'okular',
      name: 'Okular',
      genericName: 'Document Viewer',
      description: 'Universal document reader for PDF, ePub, PostScript, and DjVu',
      exec: 'okular',
      category: 'Office',
      package: 'okular',
      desktopFile: 'org.kde.okular.desktop',
    },
    {
      id: 'ark',
      name: 'Ark',
      genericName: 'Archive Manager',
      description: 'Graphical archive tool for tar, zip, 7z, rar, zstd, and gz',
      exec: 'ark',
      category: 'Utility',
      package: 'ark',
      desktopFile: 'org.kde.ark.desktop',
    },
    {
      id: 'gwenview',
      name: 'Gwenview',
      genericName: 'Image Viewer',
      description: 'Fast image viewer with cropping and basic image manipulation',
      exec: 'gwenview',
      category: 'Graphics',
      package: 'gwenview',
      desktopFile: 'org.kde.gwenview.desktop',
    },
    {
      id: 'neovim',
      name: 'Neovim',
      genericName: 'Terminal Editor',
      description: 'Vim-fork focused on extensibility and modern development',
      exec: 'nvim',
      category: 'Development',
      package: 'neovim',
      desktopFile: 'nvim.desktop',
    },
  ];
  return res.json({ apps });
});

// Endpoint to fetch the GNU General Public License v3
app.get('/api/license', (req, res) => {
  try {
    const licensePath = path.resolve(__dirname, 'LICENSE');
    if (fs.existsSync(licensePath)) {
      const content = fs.readFileSync(licensePath, 'utf8');
      return res.json({
        type: 'GNU General Public License v3.0 (GNU GPLv3)',
        spdx: 'GPL-3.0-only',
        copyright: 'Copyright (C) 2026 Dorowu OS Project <https://github.com/SAMI23450/dorowu-os>',
        content,
      });
    }
    return res.status(404).json({ error: 'License file not found.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Mounting Vite in development or static dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dorowu OS] AI Assistant server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
