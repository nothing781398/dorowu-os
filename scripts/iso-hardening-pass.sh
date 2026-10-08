#!/usr/bin/env bash
set -euo pipefail

PROFILE_DIR="${1:-dorowu-profile}"
AIROOTFS="${PROFILE_DIR}/airootfs"

if [[ ! -d "$AIROOTFS" ]]; then
    echo "[ERROR] airootfs directory not found at $AIROOTFS"
    exit 1
fi

echo "[+] Applying Dorowu OS ISO hardening..."
rm -rf "$AIROOTFS/usr/lib/os-release" 2>/dev/null || true
rm -rf "$AIROOTFS/etc/os-release" 2>/dev/null || true
rm -rf "$AIROOTFS/etc/issue" 2>/dev/null || true
rm -rf "$AIROOTFS/etc/hostname" 2>/dev/null || true
rm -rf "$AIROOTFS/etc/locale.conf" 2>/dev/null || true

if [[ -f "$AIROOTFS/etc/shadow" ]]; then
    chmod 0400 "$AIROOTFS/etc/shadow"
fi
if [[ -f "$AIROOTFS/etc/gshadow" ]]; then
    chmod 0400 "$AIROOTFS/etc/gshadow"
fi

mkdir -p "$AIROOTFS/etc/sudoers.d"
cat > "$AIROOTFS/etc/sudoers.d/99-dorowu-live" <<'EOF'
# LIVE SESSION ONLY - temporary convenience for install tools
# MUST be removed after installation
# install user: dorowu
# root password: must be set by the user during installation
# no public passwordless root access on the installed system
EOF
chmod 0440 "$AIROOTFS/etc/sudoers.d/99-dorowu-live"

cat > "$AIROOTFS/etc/profile.d/dorowu-security-notice.sh" <<'EOF'
#!/bin/bash
if [[ "$TERM" == "linux" ]] || [[ -z "$TERM" ]]; then
  echo ""
  echo "====================================================="
  echo "Dorowu OS Live Session"
  echo "====================================================="
  echo "This is a LIVE session. No data persists after reboot."
  echo "When installing, choose your own user password."
  echo "Do not rely on a default root password."
  echo "====================================================="
  echo ""
fi
EOF
chmod 0755 "$AIROOTFS/etc/profile.d/dorowu-security-notice.sh"

echo "[✓] ISO hardening pass completed."
