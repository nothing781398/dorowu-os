#!/usr/bin/env bash
# ==============================================================================
# Dorowu OS Core Generator: generate_arch_core.sh
# Generates the complete archiso profile, AUR local-repo builder, asset generator,
# CI container script, and GitHub Actions workflow for building Dorowu OS ISO.
# ==============================================================================
set -euo pipefail

trap 'echo "[-] Error on line ${LINENO}: command \"${BASH_COMMAND}\" failed with exit code $?" >&2' ERR

echo "==> Initializing Dorowu OS generation..."

# Keep web portal files intact

PROJECT_DIR="$(pwd)"
PROFILE_DIR="${PROJECT_DIR}/dorowu-profile"
AIROOTFS="${PROFILE_DIR}/airootfs"
SCRIPTS_DIR="${PROJECT_DIR}/scripts"
WORKFLOW_DIR="${PROJECT_DIR}/.github/workflows"

# Clean up previous generated directories for full idempotency
rm -rf "${PROFILE_DIR}" "${SCRIPTS_DIR}" "${WORKFLOW_DIR}"

mkdir -p "${PROFILE_DIR}" "${SCRIPTS_DIR}" "${WORKFLOW_DIR}" \
  "${AIROOTFS}/etc/calamares/modules" \
  "${AIROOTFS}/etc/calamares/branding/dorowu" \
  "${AIROOTFS}/etc/sddm.conf.d" \
  "${AIROOTFS}/etc/sudoers.d" \
  "${AIROOTFS}/etc/profile.d" \
  "${AIROOTFS}/etc/fonts" \
  "${AIROOTFS}/etc/firefox/policies" \
  "${AIROOTFS}/etc/systemd/system/multi-user.target.wants" \
  "${AIROOTFS}/etc/systemd/system/sysinit.target.wants" \
  "${AIROOTFS}/etc/skel/.config/autostart" \
  "${AIROOTFS}/etc/skel/.config/kitty" \
  "${AIROOTFS}/etc/skel/.config/systemd/user/default.target.wants" \
  "${AIROOTFS}/etc/skel/.icons/default" \
  "${AIROOTFS}/etc/skel/Desktop" \
  "${AIROOTFS}/usr/share/icons/default" \
  "${AIROOTFS}/usr/local/bin" \
  "${AIROOTFS}/usr/share/applications" \
  "${AIROOTFS}/usr/share/backgrounds/dorowu" \
  "${AIROOTFS}/usr/share/pixmaps" \
  "${AIROOTFS}/usr/lib/systemd/system" \
  "${AIROOTFS}/usr/lib/systemd/user" \
  "${PROFILE_DIR}/grub" \
  "${PROFILE_DIR}/syslinux"

echo "==> Generating profiledef.sh..."
cat <<'EOF_PROFILEDEF' > "${PROFILE_DIR}/profiledef.sh"
#!/usr/bin/env bash
# Dorowu OS profiledef.sh
iso_name="dorowu-os"
iso_label="DOROWU_$(date --date="@${SOURCE_DATE_EPOCH:-$(date +%s)}" +%Y%m)"
iso_publisher="Dorowu OS Project <https://github.com>"
iso_application="Dorowu OS Live / Installer"
iso_version="$(date --date="@${SOURCE_DATE_EPOCH:-$(date +%s)}" +%Y.%m.%d)"
install_dir="dorowu"
buildmodes=('iso')

# bootmodes: GRUB is used for UEFI x86_64, Syslinux for legacy BIOS.
bootmodes=('bios.syslinux.mbr' 'bios.syslinux.eltorito' 'uefi-x64.grub.esp' 'uefi-x64.grub.eltorito')
arch="x86_64"
pacman_conf="pacman.conf"
airootfs_image_type="squashfs"
airootfs_image_tool_options=('-comp' 'zstd' '-Xcompression-level' '15')

file_permissions=(
  ["/etc/shadow"]="0:0:0400"
  ["/etc/gshadow"]="0:0:0400"
  ["/etc/sudoers.d/99-dorowu-live"]="0:0:0440"
  ["/usr/local/bin/dorowu-install"]="0:0:0755"
  ["/usr/local/bin/dorowu-set-wallpaper"]="0:0:0755"
  ["/usr/local/bin/dorowu-gdrive-setup"]="0:0:0755"
  ["/usr/local/bin/ai-assistant"]="0:0:0755"
  ["/etc/skel/.config/autostart/dorowu-live-setup.desktop"]="1000:1000:0755"
  ["/etc/skel/Desktop/dorowu-installer.desktop"]="1000:1000:0755"
)
EOF_PROFILEDEF

echo "==> Generating pacman.conf..."
cat <<'EOF_PACMAN' > "${PROFILE_DIR}/pacman.conf"
[options]
HoldPkg     = pacman glibc
Architecture = auto
Color
CheckSpace
VerbosePkgLists
ParallelDownloads = 5
SigLevel    = Required DatabaseOptional
LocalFileSigLevel = Optional

# Local repository created by build-local-repo.sh for AUR packages
[dorowu-local]
SigLevel = Optional TrustAll
Server = file:///opt/dorowu-repo

[core]
Include = /etc/pacman.d/mirrorlist

[extra]
Include = /etc/pacman.d/mirrorlist

[multilib]
Include = /etc/pacman.d/mirrorlist
EOF_PACMAN

echo "==> Generating packages.x86_64..."
cat <<'EOF_PACKAGES' > "${PROFILE_DIR}/packages.x86_64"
# --- Base Linux Kernel & Hardware Essentials ---
base
base-devel
linux
linux-firmware
linux-headers
intel-ucode
amd-ucode
mkinitcpio-archiso
archlinux-keyring
sudo
which
grub
efibootmgr
os-prober
mtools
squashfs-tools
rsync
libpwquality
kpmcore
yaml-cpp
boost-libs
upower
power-profiles-daemon

# --- Complete Filesystem Support ---
btrfs-progs
dosfstools
e2fsprogs
exfatprogs
f2fs-tools
ntfs-3g

# --- Graphics & Display Drivers ---
mesa
vulkan-intel
vulkan-radeon
libva-mesa-driver
xf86-video-amdgpu
xf86-video-ati
xf86-video-nouveau
xorg-server
xorg-xwayland
qt6-wayland

# --- KDE Plasma 6 Desktop Environment ---
sddm
sddm-kcm
plasma-desktop
plasma-workspace
plasma-nm
plasma-pa
kscreen
kwin
breeze
breeze-gtk
papirus-icon-theme
kvantum
xdg-desktop-portal-kde
xdg-user-dirs
xdg-utils

# --- Audio & Networking Stack ---
pipewire
pipewire-pulse
pipewire-alsa
wireplumber
pavucontrol
networkmanager
bluez
bluez-utils
bluedevil
cups

# --- Archive Utilities ---
p7zip
unzip
unrar
tar
gzip
bzip2
xz
zstd
gvfs
gvfs-smb

# --- Dorowu App Store & Flatpak Center ---
discover
packagekit-qt6
archlinux-appstream-data
flatpak
fwupd

# --- Real Mozilla Firefox & Core System Apps ---
firefox
dolphin
kate
kcalc
ark
okular
gwenview
spectacle
partitionmanager

# --- Google Drive Cloud Integration ---
rclone
fuse3
kio-gdrive
kaccounts-providers

# --- Hardcore Developer & Terminal Environment ---
kitty
python
python-pip
python-pipx
python-virtualenv
nodejs
npm
git
gcc
make
cmake
jq
curl
wget
openssh
neovim
nano
ripgrep
fd
bat
htop
tmux
bash-completion
man-db
reflector
imagemagick

# --- Fonts & Complete Emojis ---
noto-fonts
noto-fonts-emoji
ttf-liberation
ttf-jetbrains-mono

# --- AUR Packages (Built in [dorowu-local]) ---
ckbcomp
calamares
EOF_PACKAGES

echo "==> Configuring Fontconfig for system-wide Emoji rendering..."
cat <<'EOF_FONTS' > "${AIROOTFS}/etc/fonts/local.conf"
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Noto Sans</family>
      <family>Noto Color Emoji</family>
    </prefer>
  </alias>
  <alias>
    <family>serif</family>
    <prefer>
      <family>Noto Serif</family>
      <family>Noto Color Emoji</family>
    </prefer>
  </alias>
  <alias>
    <family>monospace</family>
    <prefer>
      <family>JetBrains Mono</family>
      <family>Noto Color Emoji</family>
    </prefer>
  </alias>
</fontconfig>
EOF_FONTS

echo "==> Configuring Mozilla Firefox enterprise policies..."
cat <<'EOF_FIREFOX' > "${AIROOTFS}/etc/firefox/policies/policies.json"
{
  "policies": {
    "DisableTelemetry": true,
    "DisableFirefoxStudies": true,
    "EnableTrackingProtection": {
      "Value": true,
      "Locked": false,
      "Cryptomining": true,
      "Fingerprinting": true
    },
    "Homepage": {
      "URL": "https://duckduckgo.com",
      "Locked": false,
      "StartPage": "homepage"
    }
  }
}
EOF_FIREFOX

echo "==> Writing user accounts and sudo configuration..."
cat <<'EOF_PASSWD' > "${AIROOTFS}/etc/passwd"
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/usr/bin/nologin
daemon:x:2:2:daemon:/sbin:/usr/bin/nologin
mail:x:8:12:mail:/var/spool/mail:/usr/bin/nologin
ftp:x:14:11:ftp:/srv/ftp:/usr/bin/nologin
nobody:x:65534:65534:Nobody:/:/usr/bin/nologin
dbus:x:81:81:System Message Bus:/:/usr/bin/nologin
systemd-journal-remote:x:982:982:systemd Journal Remote:/:/usr/bin/nologin
systemd-network:x:981:981:systemd Network Management:/:/usr/bin/nologin
systemd-resolve:x:980:980:systemd Resolver:/:/usr/bin/nologin
systemd-timesync:x:979:979:systemd Time Synchronization:/:/usr/bin/nologin
systemd-coredump:x:978:978:systemd Core Dumper:/:/usr/bin/nologin
sddm:x:977:977:SDDM Greeter:/var/lib/sddm:/usr/bin/nologin
dorowu:x:1000:1000:Dorowu Live User:/home/dorowu:/bin/bash
EOF_PASSWD

cat <<'EOF_SHADOW' > "${AIROOTFS}/etc/shadow"
root:!::0:99999:7:::
bin:!::0:99999:7:::
daemon:!::0:99999:7:::
mail:!::0:99999:7:::
ftp:!::0:99999:7:::
nobody:!::0:99999:7:::
dbus:!::0:99999:7:::
systemd-journal-remote:!::0:99999:7:::
systemd-network:!::0:99999:7:::
systemd-resolve:!::0:99999:7:::
systemd-timesync:!::0:99999:7:::
systemd-coredump:!::0:99999:7:::
sddm:!::0:99999:7:::
dorowu::19700:0:99999:7:::
EOF_SHADOW

cat <<'EOF_GROUP' > "${AIROOTFS}/etc/group"
root:x:0:root
bin:x:1:root,bin,daemon
daemon:x:2:root,bin,daemon
sys:x:3:bin
adm:x:4:daemon
tty:x:5:
disk:x:6:
lp:x:7:daemon
mail:x:8:
kmem:x:9:
wheel:x:998:dorowu
uucp:x:10:
ftp:x:11:
audio:x:995:dorowu
video:x:994:dorowu
optical:x:993:dorowu
storage:x:992:dorowu
input:x:991:dorowu
network:x:990:dorowu
power:x:989:dorowu
nobody:x:65534:
dbus:x:81:
systemd-journal:x:984:
systemd-journal-remote:x:982:
systemd-network:x:981:
systemd-resolve:x:980:
systemd-timesync:x:979:
systemd-coredump:x:978:
sddm:x:977:
dorowu:x:1000:
EOF_GROUP

cat <<'EOF_GSHADOW' > "${AIROOTFS}/etc/gshadow"
root:::root
bin:::root,bin,daemon
daemon:::root,bin,daemon
sys:::bin
adm:::daemon
tty:::
disk:::
lp:::daemon
mail:::
kmem:::
wheel:::dorowu
uucp:::
ftp:::
audio:::dorowu
video:::dorowu
optical:::dorowu
storage:::dorowu
input:::dorowu
network:::dorowu
power:::dorowu
nobody:::
dbus:::
systemd-journal:::
systemd-journal-remote:::
systemd-network:::
systemd-resolve:::
systemd-timesync:::
systemd-coredump:::
sddm:::
dorowu:::
EOF_GSHADOW

cat <<'EOF_SUDOERS' > "${AIROOTFS}/etc/sudoers.d/99-dorowu-live"
dorowu ALL=(ALL:ALL) NOPASSWD: ALL
EOF_SUDOERS

echo "==> Configuring system defaults and SDDM autologin with Black Cursor..."
echo "dorowu" > "${AIROOTFS}/etc/hostname"
echo "en_US.UTF-8 UTF-8" > "${AIROOTFS}/etc/locale.gen"
echo "LANG=en_US.UTF-8" > "${AIROOTFS}/etc/locale.conf"
ln -sf /usr/share/zoneinfo/UTC "${AIROOTFS}/etc/localtime"

cat <<'EOF_SDDM' > "${AIROOTFS}/etc/sddm.conf.d/autologin.conf"
[Autologin]
User=dorowu
Session=plasma

[Theme]
Current=breeze
CursorTheme=breeze_cursors
CursorSize=24
EOF_SDDM

# Wayland session compatibility for Plasma 6
mkdir -p "${AIROOTFS}/usr/share/wayland-sessions"
ln -sf plasma.desktop "${AIROOTFS}/usr/share/wayland-sessions/plasmawayland.desktop"

# Default Black Cursor configuration (Breeze Black Cursor)
cat <<'EOF_CURSOR_SKEL' > "${AIROOTFS}/etc/skel/.icons/default/index.theme"
[Icon Theme]
Name=Default
Comment=Dorowu OS Default Black Cursor Theme
Inherits=breeze_cursors
EOF_CURSOR_SKEL

cat <<'EOF_CURSOR_SYS' > "${AIROOTFS}/usr/share/icons/default/index.theme"
[Icon Theme]
Name=Default
Comment=Dorowu OS Default Black Cursor Theme
Inherits=breeze_cursors
EOF_CURSOR_SYS

echo "==> Configuring systemd service symlinks..."
ln -sf /usr/lib/systemd/system/NetworkManager.service "${AIROOTFS}/etc/systemd/system/multi-user.target.wants/NetworkManager.service"
ln -sf /usr/lib/systemd/system/bluetooth.service "${AIROOTFS}/etc/systemd/system/multi-user.target.wants/bluetooth.service"
ln -sf /usr/lib/systemd/system/systemd-timesyncd.service "${AIROOTFS}/etc/systemd/system/sysinit.target.wants/systemd-timesyncd.service"
ln -sf /usr/lib/systemd/system/graphical.target "${AIROOTFS}/etc/systemd/system/default.target"
ln -sf /usr/lib/systemd/system/sddm.service "${AIROOTFS}/etc/systemd/system/display-manager.service"

cat <<'EOF_FLATHUB' > "${AIROOTFS}/usr/lib/systemd/system/dorowu-flathub.service"
[Unit]
Description=Initialize Flathub remote repository for Dorowu App Store
After=network-online.target
Wants=network-online.target
ConditionPathExists=!/var/lib/flatpak/repo/flathub.ready

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/sh -c 'mkdir -p /var/lib/flatpak/repo && flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo || true; touch /var/lib/flatpak/repo/flathub.ready'

[Install]
WantedBy=multi-user.target
EOF_FLATHUB
ln -sf /usr/lib/systemd/system/dorowu-flathub.service "${AIROOTFS}/etc/systemd/system/multi-user.target.wants/dorowu-flathub.service"

echo "==> Creating Dorowu App Store desktop shortcut..."
cat <<'EOF_APPSTORE_DESK' > "${AIROOTFS}/usr/share/applications/dorowu-appstore.desktop"
[Desktop Entry]
Type=Application
Name=Dorowu App Store
GenericName=Software Center
Comment=Install applications, utilities, games, and developer tools
Exec=plasma-discover %F
Icon=org.kde.discover
Terminal=false
Categories=System;PackageManager;
StartupNotify=true
EOF_APPSTORE_DESK

echo "==> Configuring Google Drive systemd user service & setup helper..."
cat <<'EOF_GDRIVE_SVC' > "${AIROOTFS}/usr/lib/systemd/user/rclone-gdrive.service"
[Unit]
Description=Rclone Google Drive Mount
Documentation=man:rclone(1)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
ExecStartPre=/usr/bin/mkdir -p %h/GoogleDrive
ExecStart=/usr/bin/rclone mount gdrive: %h/GoogleDrive \
    --vfs-cache-mode full \
    --vfs-cache-max-size 10G \
    --vfs-read-chunk-size 32M \
    --dir-cache-time 72h \
    --drive-chunk-size 64M \
    --umask 022
ExecStop=/usr/bin/fusermount3 -u %h/GoogleDrive
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
EOF_GDRIVE_SVC

cat <<'EOF_GDRIVE_SH' > "${AIROOTFS}/usr/local/bin/dorowu-gdrive-setup"
#!/usr/bin/env bash
set -euo pipefail
echo "=== Dorowu OS: Google Drive Cloud Mount Setup ==="
mkdir -p "${HOME}/.config/rclone" "${HOME}/GoogleDrive"

if ! rclone listremotes 2>/dev/null | grep -q "^gdrive:"; then
    echo "[+] Configuring Google Drive remote 'gdrive'..."
    rclone config create gdrive drive scope drive
fi

systemctl --user daemon-reload
systemctl --user enable --now rclone-gdrive.service
echo "[+] Google Drive mounted at ~/GoogleDrive and enabled on login."
EOF_GDRIVE_SH

cat <<'EOF_GDRIVE_DESK' > "${AIROOTFS}/usr/share/applications/dorowu-gdrive.desktop"
[Desktop Entry]
Name=Google Drive Setup
Comment=Mount Google Drive as a local folder in Dorowu OS
Exec=/usr/local/bin/dorowu-gdrive-setup
Icon=folder-google-drive
Terminal=true
Type=Application
Categories=Network;Utility;
EOF_GDRIVE_DESK

echo "==> Configuring Kitty terminal and Developer Environment..."
cat <<'EOF_KITTY' > "${AIROOTFS}/etc/skel/.config/kitty/kitty.conf"
# Dorowu OS Kitty Terminal Configuration
font_family      JetBrains Mono
bold_font        auto
italic_font      auto
font_size        11.5

background_opacity 0.85
dynamic_background_opacity yes
allow_remote_control no

scrollback_lines 10000
cursor_shape beam
cursor_blink_interval 0.5

# Dark Slate / Breeze Dark Color Palette
background #131722
foreground #d5d9e2
selection_background #28344e
selection_foreground #f8fafd

color0  #1e222b
color8  #545c7e
color1  #f7768e
color9  #ff8b94
color2  #73daca
color10 #98e8c8
color3  #e0af68
color11 #f1cf8a
color4  #7aa2f7
color12 #8db4ff
color5  #bb9af7
color13 #d1afff
color6  #7dcfff
color14 #99e2ff
color7  #c0caf5
color15 #ffffff
EOF_KITTY

cat <<'EOF_DEV_SH' > "${AIROOTFS}/etc/profile.d/dorowu-dev.sh"
# Dorowu OS Developer Environment Setup
export NPM_CONFIG_PREFIX="${HOME}/.npm-global"
export PATH="${HOME}/.npm-global/bin:${HOME}/.local/bin:${PATH}"

# PEP 668 Virtual Environment Helper
dorowu-venv() {
    local venv_name="${1:-.venv}"
    if [[ ! -d "${venv_name}" ]]; then
        echo "[+] Creating Python virtual environment in ${venv_name}..."
        python -m venv "${venv_name}"
    fi
    echo "[+] Activating ${venv_name}..."
    # shellcheck source=/dev/null
    source "${venv_name}/bin/activate"
}
EOF_DEV_SH

cat <<'EOF_BASHRC' > "${AIROOTFS}/etc/skel/.bashrc"
# Dorowu OS Shell Configuration
[[ $- != *i* ]] && return

# Load developer path and PEP 668 helper
if [[ -f /etc/profile.d/dorowu-dev.sh ]]; then
    # shellcheck source=/dev/null
    source /etc/profile.d/dorowu-dev.sh
fi

# Clean modern prompt
PS1='\[\033[01;36m\]dorowu\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Aliases
alias ls='ls --color=auto'
alias ll='ls -lah --color=auto'
alias grep='grep --color=auto'
alias cat='bat --paging=never 2>/dev/null || cat'
alias py='python'
alias ai='ai-assistant'

echo -e "\033[01;36mDorowu OS 2026.10\033[00m - Terminal Ready."
echo -e "Type \033[01;33mai-assistant --help\033[00m for AI terminal assistance."
EOF_BASHRC

echo "==> Creating AI Assistant (/usr/local/bin/ai-assistant)..."
cat <<'EOF_AI_ASSISTANT' > "${AIROOTFS}/usr/local/bin/ai-assistant"
#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${HOME}/.config/dorowu"
CONFIG_FILE="${CONFIG_DIR}/ai-assistant.conf"

PROVIDER="gemini"
MODEL="gemini-2.5-flash"
DEFAULT_KEY="AQ.Ab8RN6JngjqaiZjgdaDbezb_iVdIpP8qUtnf1NO6MQHUgp596Q"
API_KEY="${GEMINI_API_KEY:-${DEFAULT_KEY}}"
OPENAI_BASE_URL="https://api.openai.com/v1"
SYSTEM_PROMPT="You are the Dorowu OS Terminal AI Assistant. When asked who you are (such as 'who are u', 'who are you', 'who are u?'), you must always explicitly state: \"I'm an AI assistant of Dorowu OS\". You are an expert Linux, Arch Linux, and software development companion built into Dorowu OS. Provide clear, concise, actionable terminal commands and explanations."

load_config() {
    if [[ -f "${CONFIG_FILE}" ]]; then
        # shellcheck source=/dev/null
        source "${CONFIG_FILE}"
    fi
    if [[ "${PROVIDER}" == "gemini" && -z "${API_KEY:-}" ]]; then
        API_KEY="${GEMINI_API_KEY:-${DEFAULT_KEY}}"
    elif [[ "${PROVIDER}" == "openai" && -z "${API_KEY:-}" ]]; then
        API_KEY="${OPENAI_API_KEY:-}"
    fi
}

print_help() {
    cat <<'HLP'
Dorowu OS Terminal AI Assistant
Usage:
  ai-assistant [options] [prompt]
  ai "who are u"
  cat error.log | ai "how do I fix this?"

Options:
  -h, --help            Show this help documentation
  -m, --model MODEL     Specify model (default: gemini-2.5-flash)
  -p, --provider TYPE   Set provider: 'gemini' (default) or 'openai'
  -c, --config          Run interactive configuration wizard
  -r, --reset           Reset local conversation history

Environment:
  GEMINI_API_KEY        API key for Google Gemini (pre-configured by default)
  OPENAI_API_KEY        API key for OpenAI-compatible endpoints
HLP
}

interactive_config() {
    mkdir -p "${CONFIG_DIR}"
    echo "=== Dorowu OS AI Assistant Setup ==="
    read -r -p "Provider [gemini/openai] (default: gemini): " chosen_prov
    chosen_prov="${chosen_prov:-gemini}"

    if [[ "${chosen_prov}" == "openai" ]]; then
        read -r -p "OpenAI Base URL (default: https://api.openai.com/v1): " chosen_url
        chosen_url="${chosen_url:-https://api.openai.com/v1}"
        read -r -p "Model (default: gpt-4o-mini): " chosen_mod
        chosen_mod="${chosen_mod:-gpt-4o-mini}"
        read -r -s -p "API Key: " chosen_key
        echo ""
        cat > "${CONFIG_FILE}" <<CFG
PROVIDER="openai"
OPENAI_BASE_URL="${chosen_url}"
MODEL="${chosen_mod}"
API_KEY="${chosen_key}"
CFG
    else
        read -r -p "Gemini Model (default: gemini-2.5-flash): " chosen_mod
        chosen_mod="${chosen_mod:-gemini-2.5-flash}"
        read -r -s -p "Gemini API Key (press Enter to keep default): " chosen_key
        echo ""
        chosen_key="${chosen_key:-${DEFAULT_KEY}}"
        cat > "${CONFIG_FILE}" <<CFG
PROVIDER="gemini"
MODEL="${chosen_mod}"
API_KEY="${chosen_key}"
CFG
    fi
    chmod 0600 "${CONFIG_FILE}"
    echo "[+] Configuration saved to ${CONFIG_FILE}"
    exit 0
}

check_credentials() {
    if [[ -z "${API_KEY:-}" ]]; then
        if [[ "${PROVIDER}" == "gemini" ]]; then
            API_KEY="${DEFAULT_KEY}"
        else
            echo -e "\033[01;31mError: No API key found for provider '${PROVIDER}'.\033[00m" >&2
            echo "Run 'ai-assistant --config' to set your OpenAI credentials." >&2
            exit 1
        fi
    fi
}

is_identity_query() {
    local q
    q=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr -d '[:punct:]' | xargs)
    if [[ "$q" == "who are u"* || "$q" == "who are you"* || "$q" == "who r u"* || "$q" == "what are you"* || "$q" == "who u"* ]]; then
        return 0
    fi
    return 1
}

json_quote() {
    local raw="$1"
    if command -v jq &>/dev/null; then
        jq -Rs . <<< "${raw}"
    elif command -v python3 &>/dev/null; then
        python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))" <<< "${raw}"
    elif command -v python &>/dev/null; then
        python -c "import sys, json; print(json.dumps(sys.stdin.read()))" <<< "${raw}"
    elif command -v node &>/dev/null; then
        node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>process.stdout.write(JSON.stringify(d)))' <<< "${raw}"
    else
        echo -n "\"${raw//\"/\\\"}\""
    fi
}

parse_gemini_response() {
    local tmp_file="$1"
    if command -v jq &>/dev/null; then
        jq -r '.candidates[0].content.parts[0].text // empty' "${tmp_file}" 2>/dev/null || true
    elif command -v python3 &>/dev/null; then
        python3 -c "
import json
try:
    with open('${tmp_file}') as f:
        data = json.load(f)
    print(data['candidates'][0]['content']['parts'][0]['text'])
except Exception:
    pass
" 2>/dev/null || true
    fi
}

parse_openai_response() {
    local tmp_file="$1"
    if command -v jq &>/dev/null; then
        jq -r '.choices[0].message.content // empty' "${tmp_file}" 2>/dev/null || true
    elif command -v python3 &>/dev/null; then
        python3 -c "
import json
try:
    with open('${tmp_file}') as f:
        data = json.load(f)
    print(data['choices'][0]['message']['content'])
except Exception:
    pass
" 2>/dev/null || true
    fi
}

call_gemini() {
    local prompt_text="$1"
    local url="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}"
    local quoted_prompt
    quoted_prompt=$(json_quote "${prompt_text}")
    local quoted_sys
    quoted_sys=$(json_quote "${SYSTEM_PROMPT}")

    local payload
    payload="{\"systemInstruction\":{\"parts\":[{\"text\":${quoted_sys}}]},\"contents\":[{\"role\":\"user\",\"parts\":[{\"text\":${quoted_prompt}}]}],\"generationConfig\":{\"temperature\":0.7}}"

    local tmp_out
    tmp_out=$(mktemp)
    local http_code
    http_code=$(curl -s -S -w "%{http_code}" -X POST "${url}" \
        -H "Content-Type: application/json" \
        -d "${payload}" \
        -o "${tmp_out}" || echo "000")

    if [[ "${http_code}" == "000" ]]; then
        echo "Error: Network request failed. Check internet connectivity." >&2
        rm -f "${tmp_out}"
        return 1
    fi

    if [[ "${http_code}" -ne 200 ]]; then
        echo "API Error (${http_code}):" >&2
        cat "${tmp_out}" >&2
        rm -f "${tmp_out}"
        return 1
    fi

    local text_res
    text_res=$(parse_gemini_response "${tmp_out}")
    rm -f "${tmp_out}"

    if [[ -z "${text_res}" ]]; then
        echo "Warning: Model returned empty content." >&2
        return 1
    fi

    echo "${text_res}"
}

call_openai() {
    local prompt_text="$1"
    local url="${OPENAI_BASE_URL}/chat/completions"
    local quoted_prompt
    quoted_prompt=$(json_quote "${prompt_text}")
    local quoted_sys
    quoted_sys=$(json_quote "${SYSTEM_PROMPT}")

    local payload
    payload="{\"model\":\"${MODEL}\",\"messages\":[{\"role\":\"system\",\"content\":${quoted_sys}},{\"role\":\"user\",\"content\":${quoted_prompt}}]}"

    local tmp_out
    tmp_out=$(mktemp)
    local http_code
    http_code=$(curl -s -S -w "%{http_code}" -X POST "${url}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${API_KEY}" \
        -d "${payload}" \
        -o "${tmp_out}" || echo "000")

    if [[ "${http_code}" == "000" ]]; then
        echo "Error: Network request failed." >&2
        rm -f "${tmp_out}"
        return 1
    fi

    if [[ "${http_code}" -ne 200 ]]; then
        echo "API Error (${http_code}):" >&2
        cat "${tmp_out}" >&2
        rm -f "${tmp_out}"
        return 1
    fi

    local text_res
    text_res=$(parse_openai_response "${tmp_out}")
    rm -f "${tmp_out}"

    if [[ -z "${text_res}" ]]; then
        echo "Warning: Empty response from provider." >&2
        return 1
    fi

    echo "${text_res}"
}

load_config

PROMPT_ARGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            print_help
            exit 0
            ;;
        -c|--config)
            interactive_config
            ;;
        -m|--model)
            MODEL="$2"
            shift 2
            ;;
        -p|--provider)
            PROVIDER="$2"
            shift 2
            ;;
        *)
            PROMPT_ARGS+=("$1")
            shift
            ;;
    esac
done

check_credentials

# Handle piped input
STDIN_INPUT=""
if [[ ! -t 0 ]] && read -t 0; then
    STDIN_INPUT=$(cat)
fi

if [[ -n "${STDIN_INPUT}" || ${#PROMPT_ARGS[@]} -gt 0 ]]; then
    FULL_QUERY="${PROMPT_ARGS[*]:-}"
    if [[ -n "${STDIN_INPUT}" ]]; then
        if [[ -n "${FULL_QUERY}" ]]; then
            FULL_QUERY="${FULL_QUERY}"$'\n\nInput Context:\n'"${STDIN_INPUT}"
        else
            FULL_QUERY="${STDIN_INPUT}"
        fi
    fi

    if is_identity_query "${FULL_QUERY}"; then
        echo "I'm an AI assistant of Dorowu OS, an expert Linux and software development companion built into Dorowu OS. How can I help you today?"
        exit 0
    fi

    if [[ "${PROVIDER}" == "gemini" ]]; then
        call_gemini "${FULL_QUERY}"
    else
        call_openai "${FULL_QUERY}"
    fi
    exit 0
fi

# Interactive REPL session
echo -e "\033[01;36mDorowu OS AI Terminal Assistant [Model: ${MODEL}]\033[00m"
echo -e "Pre-configured with official Dorowu OS AI intelligence."
echo "Type your message or 'exit' / 'quit' to end session."
echo ""

while true; do
    read -r -e -p "dorowu-ai> " user_input || break
    [[ -z "${user_input}" ]] && continue
    if [[ "${user_input}" == "exit" || "${user_input}" == "quit" ]]; then
        break
    fi

    if is_identity_query "${user_input}"; then
        echo -e "\nI'm an AI assistant of Dorowu OS, an expert Linux and software development companion built into Dorowu OS. How can I help you today?\n"
        continue
    fi

    if [[ "${PROVIDER}" == "gemini" ]]; then
        reply=$(call_gemini "${user_input}") || continue
        echo -e "\n${reply}\n"
    else
        reply=$(call_openai "${user_input}") || continue
        echo -e "\n${reply}\n"
    fi
done
EOF_AI_ASSISTANT

echo "==> Configuring KDE Plasma 6 Desktop and Dorowu OS Layout..."
cat <<'EOF_KDEGLOBALS' > "${AIROOTFS}/etc/skel/.config/kdeglobals"
[General]
TerminalApplication=kitty
TerminalService=kitty.desktop
ColorScheme=BreezeDark

[Icons]
Theme=Papirus-Dark

[KDE]
LookNFeelPackage=org.kde.breezedark.desktop
SingleClick=false
EOF_KDEGLOBALS

cat <<'EOF_KCMINPUTRC' > "${AIROOTFS}/etc/skel/.config/kcminputrc"
[Mouse]
cursorTheme=breeze_cursors
cursorSize=24
EOF_KCMINPUTRC

cat <<'EOF_KWINRC' > "${AIROOTFS}/etc/skel/.config/kwinrc"
[Plugins]
blurEnabled=true
translucencyEnabled=true
glideEnabled=true

[Windows]
FocusPolicy=FocusFollowsMouse
GeometryTip=false

[org.kde.kdecoration2]
ButtonsOnRight=IAX
BorderSize=Normal
EOF_KWINRC

cat <<'EOF_PLASMA_APPLET' > "${AIROOTFS}/etc/skel/.config/plasma-org.kde.plasma.desktop-appletsrc"
[ActionPlugins][1]
RightButton;NoModifier=org.kde.contextmenu

[Containments][1]
activityId=
formfactor=2
immutability=1
lastScreen=0
location=4
plugin=org.kde.panel
wallpaperplugin=org.kde.image

[Containments][1][Applets][2]
immutability=1
plugin=org.kde.plasma.kickoff

[Containments][1][Applets][3]
immutability=1
plugin=org.kde.plasma.icontasks

[Containments][1][Applets][3][Configuration][General]
launchers=applications:org.kde.dolphin.desktop,applications:kitty.desktop,applications:firefox.desktop,applications:dorowu-appstore.desktop

[Containments][1][Applets][4]
immutability=1
plugin=org.kde.plasma.systemtray

[Containments][1][Applets][5]
immutability=1
plugin=org.kde.plasma.digitalclock

[Containments][1][General]
alignment=center
floating=1
panelLengthMode=1
EOF_PLASMA_APPLET

echo "==> Creating wallpaper script and autostart..."
cat <<'EOF_WP_SCRIPT' > "${AIROOTFS}/usr/local/bin/dorowu-set-wallpaper"
#!/usr/bin/env bash
set -euo pipefail
WP="${1:-/usr/share/backgrounds/dorowu/default.png}"
if [[ ! -f "${WP}" ]]; then
    if [[ -f "/usr/share/backgrounds/dorowu/secondary.jpg" ]]; then
        WP="/usr/share/backgrounds/dorowu/secondary.jpg"
    elif [[ -f "/usr/share/backgrounds/dorowu/mountain-backup.jpg" ]]; then
        WP="/usr/share/backgrounds/dorowu/mountain-backup.jpg"
    fi
fi

if [[ -f "${WP}" ]] && command -v plasma-apply-wallpaperimage &>/dev/null; then
    plasma-apply-wallpaperimage "${WP}" || true
fi
EOF_WP_SCRIPT

cat <<'EOF_WP_DESK' > "${AIROOTFS}/etc/skel/.config/autostart/dorowu-wallpaper.desktop"
[Desktop Entry]
Type=Application
Name=Dorowu Wallpaper Setter
Exec=/usr/local/bin/dorowu-set-wallpaper
Hidden=false
NoDisplay=true
X-GNOME-Autostart-enabled=true
EOF_WP_DESK

echo "==> Creating Calamares configuration and branding..."
cat <<'EOF_CAL_SETTINGS' > "${AIROOTFS}/etc/calamares/settings.conf"
---
modules-search: [ local ]

instances:
  - id:       cleanup
    module:   shellprocess
    config:   shellprocess.conf

sequence:
  - show:
      - welcome
      - locale
      - keyboard
      - partition
      - users
      - summary
  - exec:
      - partition
      - mount
      - unpackfs
      - machineid
      - fstab
      - locale
      - keyboard
      - localecfg
      - users
      - displaymanager
      - networkcfg
      - hwclock
      - services-systemd
      - initcpio
      - bootloader
      - shellprocess@cleanup
      - umount
  - show:
      - finished

branding: dorowu
prompt-install: false
dont-chroot: false
oem-setup: false
disable-cancel: false
disable-cancel-during-exec: false
hide-back-and-next-during-exec: false
quit-at-end: false
EOF_CAL_SETTINGS

cat <<'EOF_CAL_FSTAB' > "${AIROOTFS}/etc/calamares/modules/fstab.conf"
---
mountOptions:
    default: defaults,noatime
    btrfs: defaults,noatime,compress=zstd
    ext4: defaults,noatime
ssdExtraMountOptions:
    ext4: discard
    btrfs: discard=async
EOF_CAL_FSTAB

cat <<'EOF_CAL_MACHINEID' > "${AIROOTFS}/etc/calamares/modules/machineid.conf"
---
systemd: true
dbus: true
symlink: true
EOF_CAL_MACHINEID

cat <<'EOF_CAL_LOCALECFG' > "${AIROOTFS}/etc/calamares/modules/localecfg.conf"
---
EOF_CAL_LOCALECFG

cat <<'EOF_CAL_NETWORKCFG' > "${AIROOTFS}/etc/calamares/modules/networkcfg.conf"
---
EOF_CAL_NETWORKCFG

cat <<'EOF_CAL_HWCLOCK' > "${AIROOTFS}/etc/calamares/modules/hwclock.conf"
---
EOF_CAL_HWCLOCK

cat <<'EOF_CAL_WELCOME' > "${AIROOTFS}/etc/calamares/modules/welcome.conf"
---
showSupportUrl: false
showKnownIssuesUrl: false
showReleaseNotesUrl: false
requirements:
    requiredStorage:    15.0
    requiredRam:        2.0
    internetCheckUrl:   https://archlinux.org
    check:
        - storage
        - ram
        - power
    required:
        - storage
        - ram
EOF_CAL_WELCOME

cat <<'EOF_CAL_LOCALE' > "${AIROOTFS}/etc/calamares/modules/locale.conf"
---
region: "America"
zone: "New_York"
localeGenPath: "/etc/locale.gen"
geoip:
    style: "none"
EOF_CAL_LOCALE

cat <<'EOF_CAL_KEYBOARD' > "${AIROOTFS}/etc/calamares/modules/keyboard.conf"
---
searchWorkaround: true
xOrg:
  layout: "us"
  model: "pc105"
EOF_CAL_KEYBOARD

cat <<'EOF_CAL_PARTITION' > "${AIROOTFS}/etc/calamares/modules/partition.conf"
---
efiSystemPartition: "/boot/efi"
efiSystemPartitionSize: 512M
userSwapChoices:
    - none
    - small
    - suspend
    - file
drawNestedPartitions: false
alwaysShowPartitionLabels: true
initialPartitioningChoice: erase
initialSwapChoice: none
defaultFileSystemType: "ext4"
EOF_CAL_PARTITION

cat <<'EOF_CAL_USERS' > "${AIROOTFS}/etc/calamares/modules/users.conf"
---
defaultGroups:
    - wheel
    - video
    - audio
    - storage
    - power
    - network
    - input
autologinGroup: wheel
doAutologin: false
sudoersGroup: wheel
setRootPassword: true
doReusePassword: true
EOF_CAL_USERS

cat <<'EOF_CAL_MOUNT' > "${AIROOTFS}/etc/calamares/modules/mount.conf"
---
extraMounts:
    -   device: proc
        fs: proc
        mountPoint: /proc
    -   device: sysfs
        fs: sysfs
        mountPoint: /sys
    -   device: /dev
        mountPoint: /dev
        options: bind
    -   device: tmpfs
        fs: tmpfs
        mountPoint: /run
    -   device: /run/udev
        mountPoint: /run/udev
        options: bind
    -   device: efivarfs
        fs: efivarfs
        mountPoint: /sys/firmware/efi/efivars
        efi: true
EOF_CAL_MOUNT

cat <<'EOF_CAL_UNPACK' > "${AIROOTFS}/etc/calamares/modules/unpackfs.conf"
---
unpack:
    -   source: "/run/archiso/bootmnt/dorowu/x86_64/airootfs.sfs"
        sourcefs: "squashfs"
        destination: ""
EOF_CAL_UNPACK

cat <<'EOF_CAL_INITCPIO' > "${AIROOTFS}/etc/calamares/modules/initcpio.conf"
---
kernel: linux
EOF_CAL_INITCPIO

cat <<'EOF_CAL_DM' > "${AIROOTFS}/etc/calamares/modules/displaymanager.conf"
---
displaymanagers:
  - sddm
defaultDesktopEnvironment:
    executable: "startplasma-wayland"
    desktopFile: "plasma"
basicSetup: false
EOF_CAL_DM

cat <<'EOF_CAL_SVCS' > "${AIROOTFS}/etc/calamares/modules/services-systemd.conf"
---
services:
  - NetworkManager
  - bluetooth
  - sddm
  - systemd-timesyncd
targets:
  - graphical
EOF_CAL_SVCS

cat <<'EOF_CAL_BOOT' > "${AIROOTFS}/etc/calamares/modules/bootloader.conf"
---
efiBootLoader: "GRUB"
kernel: "/vmlinuz-linux"
img: "/initramfs-linux.img"
fallback: "/initramfs-linux-fallback.img"
timeout: "10"
bootloaderCommandLine: "quiet splash"
grubInstall: "grub-install"
grubMkconfig: "grub-mkconfig"
grubCfg: "/boot/grub/grub.cfg"
grubProbe: "grub-probe"
efiBootMgr: "efibootmgr"
installEpoxy: false
EOF_CAL_BOOT

cat <<'EOF_CAL_CLEANUP' > "${AIROOTFS}/etc/calamares/modules/shellprocess.conf"
---
dontChroot: false
timeout: 300
script:
  - name: "Remove live session autologin and temporary sudo permissions"
    command: "/bin/sh -c 'rm -f /etc/sudoers.d/99-dorowu-live /etc/sddm.conf.d/autologin.conf /home/*/.config/autostart/dorowu-*.desktop /home/*/Desktop/dorowu-installer.desktop /usr/share/applications/dorowu-installer.desktop /usr/local/bin/dorowu-install || true'"
  - name: "Rebuild target initramfs without archiso hooks"
    command: "mkinitcpio -P"
  - name: "Generate target locales"
    command: "/bin/sh -c 'locale-gen || true'"
EOF_CAL_CLEANUP

cat <<'EOF_CAL_FINISHED' > "${AIROOTFS}/etc/calamares/modules/finished.conf"
---
restartNowEnabled: true
restartNowChecked: false
restartNowCommand: "systemctl reboot"
EOF_CAL_FINISHED

cat <<'EOF_CAL_BRAND' > "${AIROOTFS}/etc/calamares/branding/dorowu/branding.desc"
---
componentName:  dorowu
welcomeStyleCalamares:   false
welcomeExpandingLogo:   true
windowExpanding:    normal
windowSize: 850px,560px
windowPlacement: center

strings:
    productName:         Dorowu OS
    shortProductName:    Dorowu
    version:             "2026.10"
    shortVersion:        "2026.10"
    versionedName:       Dorowu OS 2026.10
    shortVersionedName:  Dorowu 2026.10
    bootloaderEntryName: Dorowu OS
    productUrl:          https://github.com
    supportUrl:          https://github.com
    knownIssuesUrl:      https://github.com
    releaseNotesUrl:     https://github.com

images:
    productLogo:         "dorowu-logo.png"
    productIcon:         "dorowu-logo.png"
    productWelcome:      "welcome.png"

slideshow:               "show.qml"

style:
   SidebarBackground:    "#131722"
   SidebarText:          "#e2e8f0"
   SidebarTextSelect:    "#ffffff"
   SidebarTextHighlight: "#38bdf8"
   SidebarBackgroundSelect: "#1e2638"
EOF_CAL_BRAND

cat <<'EOF_CAL_QML' > "${AIROOTFS}/etc/calamares/branding/dorowu/show.qml"
import QtQuick 2.15
import QtQuick.Controls 2.15

Rectangle {
    id: presentation
    color: "#0f172a"
    anchors.fill: parent

    Column {
        anchors.centerIn: parent
        spacing: 18

        Image {
            source: "welcome.png"
            width: 240
            height: 240
            fillMode: Image.PreserveAspectFit
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: "Welcome to Dorowu OS"
            color: "#ffffff"
            font.pixelSize: 22
            font.bold: true
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: "A clean, modern Arch-based system with full developer tooling & App Store."
            color: "#94a3b8"
            font.pixelSize: 14
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }
}
EOF_CAL_QML

cat <<'EOF_INSTALL_WRAPPER' > "${AIROOTFS}/usr/local/bin/dorowu-install"
#!/usr/bin/env bash
set -euo pipefail
exec sudo -E calamares -d
EOF_INSTALL_WRAPPER

cat <<'EOF_INSTALL_DESK' > "${AIROOTFS}/usr/share/applications/dorowu-installer.desktop"
[Desktop Entry]
Type=Application
Version=1.0
Name=Install Dorowu OS
Comment=Install Dorowu OS permanently to disk
Exec=/usr/local/bin/dorowu-install
Icon=dorowu-logo
Terminal=false
StartupNotify=true
Categories=System;
EOF_INSTALL_DESK

cp "${AIROOTFS}/usr/share/applications/dorowu-installer.desktop" "${AIROOTFS}/etc/skel/Desktop/dorowu-installer.desktop"

cat <<'EOF_LIVE_SETUP' > "${AIROOTFS}/etc/skel/.config/autostart/dorowu-live-setup.desktop"
[Desktop Entry]
Type=Application
Name=Dorowu Live Desktop Setup
Exec=/bin/sh -c 'mkdir -p ~/Desktop && cp /usr/share/applications/dorowu-installer.desktop ~/Desktop/ && chmod +x ~/Desktop/dorowu-installer.desktop'
Hidden=false
NoDisplay=true
X-GNOME-Autostart-enabled=true
EOF_LIVE_SETUP

echo "==> Generating GRUB and Syslinux live boot configurations..."
cat <<'EOF_GRUB_CFG' > "${PROFILE_DIR}/grub/grub.cfg"
# Dorowu OS Live GRUB Configuration
insmod part_gpt
insmod part_msdos
insmod fat
insmod iso9660
insmod all_video
insmod font

set default="dorowu-os"
set timeout=15

menuentry "Dorowu OS (x86_64, UEFI)" --class arch --class gnu-linux --class gnu --class os --id 'dorowu-os' {
    set gfxpayload=keep
    linux /%INSTALL_DIR%/boot/x86_64/vmlinuz-linux archisobasedir=%INSTALL_DIR% archisosearchuuid=%ARCHISO_UUID% cow_spacesize=10G copytoram=n
    initrd /%INSTALL_DIR%/boot/x86_64/intel-ucode.img /%INSTALL_DIR%/boot/x86_64/amd-ucode.img /%INSTALL_DIR%/boot/x86_64/initramfs-linux.img
}

menuentry "Dorowu OS (x86_64, Copy to RAM)" --class arch --class gnu-linux --class gnu --class os --id 'dorowu-os-ram' {
    set gfxpayload=keep
    linux /%INSTALL_DIR%/boot/x86_64/vmlinuz-linux archisobasedir=%INSTALL_DIR% archisosearchuuid=%ARCHISO_UUID% cow_spacesize=10G copytoram=y
    initrd /%INSTALL_DIR%/boot/x86_64/intel-ucode.img /%INSTALL_DIR%/boot/x86_64/amd-ucode.img /%INSTALL_DIR%/boot/x86_64/initramfs-linux.img
}

menuentry "UEFI Firmware Settings" --id 'uefi-firmware' {
    fwsetup
}

menuentry "Reboot System" --id 'reboot' {
    reboot
}

menuentry "Power Off System" --id 'poweroff' {
    halt
}
EOF_GRUB_CFG

cp "${PROFILE_DIR}/grub/grub.cfg" "${PROFILE_DIR}/grub/loopback.cfg"

cat <<'EOF_SYSLINUX' > "${PROFILE_DIR}/syslinux/syslinux.cfg"
DEFAULT dorowu
TIMEOUT 150
PROMPT 0

LABEL dorowu
    MENU LABEL Dorowu OS (x86_64, BIOS)
    LINUX /%INSTALL_DIR%/boot/x86_64/vmlinuz-linux
    INITRD /%INSTALL_DIR%/boot/x86_64/intel-ucode.img,/%INSTALL_DIR%/boot/x86_64/amd-ucode.img,/%INSTALL_DIR%/boot/x86_64/initramfs-linux.img
    APPEND archisobasedir=%INSTALL_DIR% archisosearchuuid=%ARCHISO_UUID% cow_spacesize=10G copytoram=n
EOF_SYSLINUX

echo "==> Generating build-local-repo.sh for AUR packages..."
cat <<'EOF_BUILD_AUR' > "${PROJECT_DIR}/build-local-repo.sh"
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/dorowu-repo"
BUILD_USER="builder"

echo "==> Setting up non-root AUR build user: ${BUILD_USER}"
if ! id -u "${BUILD_USER}" &>/dev/null; then
    useradd -m -s /bin/bash "${BUILD_USER}"
fi

echo "${BUILD_USER} ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/99-builder
chmod 0440 /etc/sudoers.d/99-builder

mkdir -p "${REPO_DIR}"
chown -R "${BUILD_USER}:${BUILD_USER}" "${REPO_DIR}"

echo "==> Compiling ckbcomp from AUR..."
su - "${BUILD_USER}" -c "
  set -euo pipefail
  rm -rf /tmp/ckbcomp
  git clone --depth 1 https://aur.archlinux.org/ckbcomp.git /tmp/ckbcomp
  cd /tmp/ckbcomp
  makepkg -sri --noconfirm --needed
  cp ./*.pkg.tar.zst '${REPO_DIR}/'
"

echo "==> Compiling calamares from AUR..."
su - "${BUILD_USER}" -c "
  set -euo pipefail
  rm -rf /tmp/calamares
  git clone --depth 1 https://aur.archlinux.org/calamares.git /tmp/calamares
  cd /tmp/calamares
  makepkg -s --noconfirm --needed
  cp ./*.pkg.tar.zst '${REPO_DIR}/'
"

echo "==> Generating local pacman repository database..."
cd "${REPO_DIR}"
repo-add dorowu-local.db.tar.gz ./*.pkg.tar.zst
chmod -R 0755 "${REPO_DIR}"

echo "[+] Local repository generated successfully at ${REPO_DIR}"
EOF_BUILD_AUR

echo "==> Generating asset renderer script: scripts/generate-assets.sh..."
cat <<'EOF_ASSETS_SH' > "${SCRIPTS_DIR}/generate-assets.sh"
#!/usr/bin/env bash
set -euo pipefail

DEST_PIXMAPS="dorowu-profile/airootfs/usr/share/pixmaps"
DEST_BRAND="dorowu-profile/airootfs/etc/calamares/branding/dorowu"
DEST_BG="dorowu-profile/airootfs/usr/share/backgrounds/dorowu"

mkdir -p "${DEST_PIXMAPS}" "${DEST_BRAND}" "${DEST_BG}"

# 1. Check for user-provided SVG/PNG in root, or write authentic Dorowu vector art
if [[ -f "dorowu-logo.svg" ]]; then
    echo "[+] Using existing dorowu-logo.svg from repository"
    cp "dorowu-logo.svg" "${DEST_PIXMAPS}/dorowu-logo.svg"
else
    cat <<'SVG_EOF' > "${DEST_PIXMAPS}/dorowu-logo.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="dorowu_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="45%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#00c49f"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" ry="112" fill="url(#dorowu_grad)"/>
  <path d="M 156 122 H 262 C 328 122 376 166 376 256 C 376 346 328 390 262 390 H 156 Z" fill="#ffffff"/>
  <path d="M 222 178 V 334 H 256 C 298 334 322 308 322 256 C 322 204 298 178 256 178 Z" fill="url(#dorowu_grad)"/>
  <path d="M 236 334 L 274 262 L 296 306 L 314 282 L 322 298 V 334 Z" fill="#e0f2fe"/>
</svg>
SVG_EOF
fi

if [[ -f "dorowu-logo-wordmark.svg" ]]; then
    cp "dorowu-logo-wordmark.svg" "${DEST_PIXMAPS}/dorowu-logo-wordmark.svg"
fi

# 2. Generate PNG raster assets for Calamares & SDDM
if [[ -f "dorowu-logo-512.png" ]]; then
    cp "dorowu-logo-512.png" "${DEST_BRAND}/dorowu-logo.png"
    cp "dorowu-logo-512.png" "${DEST_BRAND}/welcome.png"
    cp "dorowu-logo-512.png" "${DEST_PIXMAPS}/dorowu-logo.png"
elif command -v magick &>/dev/null; then
    magick -background none "${DEST_PIXMAPS}/dorowu-logo.svg" -resize 512x512 "${DEST_BRAND}/dorowu-logo.png" || true
    magick -background none "${DEST_PIXMAPS}/dorowu-logo.svg" -resize 512x512 "${DEST_BRAND}/welcome.png" || true
    cp "${DEST_BRAND}/dorowu-logo.png" "${DEST_PIXMAPS}/dorowu-logo.png" || true
fi

# 3. Generate high-resolution desktop wallpaper
if command -v magick &>/dev/null; then
    magick -size 2560x1440 "gradient:#0d121f-#1a233a" \
        \( "${DEST_PIXMAPS}/dorowu-logo.svg" -resize 300x300 \) -gravity center -composite \
        "${DEST_BG}/default.png" || true
fi

# 4. Install Secondary & Backup Alpine Mountain Wallpaper
if [[ -f "dorowu-profile/airootfs/usr/share/backgrounds/dorowu/mountain-backup.jpg" ]]; then
    cp "dorowu-profile/airootfs/usr/share/backgrounds/dorowu/mountain-backup.jpg" "${DEST_BG}/mountain-backup.jpg" || true
    cp "dorowu-profile/airootfs/usr/share/backgrounds/dorowu/mountain-backup.jpg" "${DEST_BG}/secondary.jpg" || true
elif ls src/assets/images/mountain_wallpaper_*.jpg &>/dev/null; then
    cp src/assets/images/mountain_wallpaper_*.jpg "${DEST_BG}/mountain-backup.jpg" || true
    cp src/assets/images/mountain_wallpaper_*.jpg "${DEST_BG}/secondary.jpg" || true
fi
EOF_ASSETS_SH

echo "==> Generating CI build script: scripts/ci-build.sh..."
cat <<'EOF_CI_BUILD' > "${SCRIPTS_DIR}/ci-build.sh"
#!/usr/bin/env bash
set -euo pipefail

echo "==> Initializing pacman keys and system packages"
pacman-key --init
pacman-key --populate archlinux

echo "==> Updating mirrors with Reflector"
reflector --latest 10 --protocol https --sort rate --save /etc/pacman.d/mirrorlist || true

echo "==> Installing build dependencies"
pacman -Syu --noconfirm --needed \
  archiso \
  base-devel \
  git \
  reflector \
  imagemagick \
  jq \
  curl \
  python \
  nodejs \
  npm

echo "==> Building AUR packages into local repository"
bash build-local-repo.sh

echo "==> Generating visual and branding assets"
bash scripts/generate-assets.sh || true

echo "==> Validating development environment inside build container"
python --version
node --version
npm --version

echo "==> Building Dorowu OS ISO with mkarchiso"
rm -rf /tmp/archiso-work
mkdir -p out /tmp/archiso-work

mkarchiso -v -w /tmp/archiso-work -o out dorowu-profile

echo "==> Build complete! Output ISO(s):"
ls -lh out/*.iso
EOF_CI_BUILD

echo "==> Generating GitHub Actions workflow: .github/workflows/build-x86_64.yml..."
cat <<'EOF_WORKFLOW' > "${WORKFLOW_DIR}/build-x86_64.yml"
name: Build Dorowu OS ISO (x86_64)

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

      # The whole build runs inside a privileged Arch Linux container.
      # (A docker step is used instead of "container:" so the disk cleanup above works on the host.)
      - name: Build ISO (archiso inside archlinux container)
        run: |
          mkdir -p out
          docker run --rm --privileged \
            -v "$GITHUB_WORKSPACE:/work" -w /work \
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
            out/SHA256SUMS
EOF_WORKFLOW

echo "==> Setting executable permissions on scripts..."
chmod +x "${PROJECT_DIR}/build-local-repo.sh" \
         "${SCRIPTS_DIR}/ci-build.sh" \
         "${SCRIPTS_DIR}/generate-assets.sh" \
         "${AIROOTFS}/usr/local/bin/dorowu-install" \
         "${AIROOTFS}/usr/local/bin/dorowu-set-wallpaper" \
         "${AIROOTFS}/usr/local/bin/dorowu-gdrive-setup" \
         "${AIROOTFS}/usr/local/bin/ai-assistant"

echo "==> Running local asset generator step..."
bash "${SCRIPTS_DIR}/generate-assets.sh" || true

echo "==> Validating generated files and syntax..."
CHECK_FILES=(
  "${PROFILE_DIR}/profiledef.sh"
  "${PROFILE_DIR}/pacman.conf"
  "${PROFILE_DIR}/packages.x86_64"
  "${PROFILE_DIR}/grub/grub.cfg"
  "${PROFILE_DIR}/grub/loopback.cfg"
  "${PROFILE_DIR}/syslinux/syslinux.cfg"
  "${AIROOTFS}/etc/passwd"
  "${AIROOTFS}/etc/shadow"
  "${AIROOTFS}/etc/group"
  "${AIROOTFS}/etc/gshadow"
  "${AIROOTFS}/etc/sudoers.d/99-dorowu-live"
  "${AIROOTFS}/etc/calamares/settings.conf"
  "${AIROOTFS}/etc/calamares/modules/fstab.conf"
  "${AIROOTFS}/etc/calamares/modules/machineid.conf"
  "${AIROOTFS}/etc/calamares/branding/dorowu/branding.desc"
  "${AIROOTFS}/etc/calamares/branding/dorowu/show.qml"
  "${AIROOTFS}/etc/skel/.config/kitty/kitty.conf"
  "${AIROOTFS}/etc/skel/.config/kdeglobals"
  "${AIROOTFS}/etc/skel/.config/kwinrc"
  "${AIROOTFS}/etc/skel/.config/kcminputrc"
  "${AIROOTFS}/etc/skel/.config/plasma-org.kde.plasma.desktop-appletsrc"
  "${AIROOTFS}/usr/share/applications/dorowu-appstore.desktop"
  "${AIROOTFS}/etc/firefox/policies/policies.json"
  "${AIROOTFS}/etc/fonts/local.conf"
  "${AIROOTFS}/usr/local/bin/dorowu-install"
  "${AIROOTFS}/usr/local/bin/dorowu-set-wallpaper"
  "${AIROOTFS}/usr/local/bin/dorowu-gdrive-setup"
  "${AIROOTFS}/usr/local/bin/ai-assistant"
  "${PROJECT_DIR}/build-local-repo.sh"
  "${SCRIPTS_DIR}/ci-build.sh"
  "${SCRIPTS_DIR}/generate-assets.sh"
  "${WORKFLOW_DIR}/build-x86_64.yml"
)

for file in "${CHECK_FILES[@]}"; do
    if [[ ! -f "${file}" ]]; then
        echo "Validation error: Missing expected file ${file}" >&2
        exit 1
    fi
done

# Run bash syntax check on every generated shell script
bash -n "${PROFILE_DIR}/profiledef.sh"
bash -n "${PROJECT_DIR}/build-local-repo.sh"
bash -n "${SCRIPTS_DIR}/ci-build.sh"
bash -n "${SCRIPTS_DIR}/generate-assets.sh"
bash -n "${AIROOTFS}/usr/local/bin/dorowu-install"
bash -n "${AIROOTFS}/usr/local/bin/dorowu-set-wallpaper"
bash -n "${AIROOTFS}/usr/local/bin/dorowu-gdrive-setup"
bash -n "${AIROOTFS}/usr/local/bin/ai-assistant"
bash -n "${AIROOTFS}/etc/profile.d/dorowu-dev.sh"

echo "[✓] All files generated successfully and verified with bash -n."
echo "[✓] Ready to push to GitHub and run workflow."
