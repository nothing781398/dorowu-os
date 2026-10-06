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
