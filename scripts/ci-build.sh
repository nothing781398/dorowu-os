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
  npm \
  grub # <--- FIXED: Added grub to prevent uefi-x64.grub.esp validation crash

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
