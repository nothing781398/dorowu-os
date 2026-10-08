#!/usr/bin/env bash
set -euo pipefail

require_package() {
    local pkg="$1"
    if ! pacman -Q "$pkg" >/dev/null 2>&1; then
        echo "[ERROR] Missing required build dependency: ${pkg}"
        exit 1
    fi
}

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
  grub \
  syslinux \
  dosfstools \
  mtools

for dep in \
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
  grub \
  syslinux \
  dosfstools \
  mtools; do
    require_package "$dep"
done

echo "==> Removing conflicting filesystem files before building"
rm -rf /work/dorowu-profile/airootfs/usr/lib/os-release 2>/dev/null || true
rm -rf /work/dorowu-profile/airootfs/etc/os-release 2>/dev/null || true
rm -rf /work/dorowu-profile/airootfs/etc/issue 2>/dev/null || true
rm -rf /work/dorowu-profile/airootfs/etc/hostname 2>/dev/null || true
rm -rf /work/dorowu-profile/airootfs/etc/locale.conf 2>/dev/null || true

# Extra guard: if the file still exists because of another copy, remove it.
if [[ -e /work/dorowu-profile/airootfs/usr/lib/os-release ]]; then
    echo "[ERROR] /usr/lib/os-release still exists in airootfs; refusing to continue."
    exit 1
fi

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
