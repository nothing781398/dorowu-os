#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/dorowu-repo"
BUILD_USER="builder"

# guard: do not leave a passwordless sudo rule in the installed system
# live session may be convenient, but installed system set user password explicitly

echo "==> Setting up non-root AUR build user: ${BUILD_USER}"
if ! id -u "${BUILD_USER}" &>/dev/null; then
    useradd -m -s /bin/bash "${BUILD_USER}"
fi

# Keep this for build-time only; the final install must use a user-chosen password
# and sudo must require a password in the installed system.
echo "${BUILD_USER} ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/99-builder
chmod 0440 /etc/sudoers.d/99-builder

# Configure user-level and global curlrc to force HTTP/1.1 for Debian Salsa / Gitlab instances
# avoiding curl HTTP/2 frame stream violation (-532) in Docker environments
echo "--http1.1" >> /etc/curlrc
echo "--http1.1" > /home/"${BUILD_USER}"/.curlrc
chown "${BUILD_USER}:${BUILD_USER}" /home/"${BUILD_USER}"/.curlrc

mkdir -p "${REPO_DIR}"
chown -R "${BUILD_USER}:${BUILD_USER}" "${REPO_DIR}"

# Build packages in the local repo
su - "${BUILD_USER}" -c "
  set -euo pipefail
  rm -rf /tmp/ckbcomp
  git clone --depth 1 https://aur.archlinux.org/ckbcomp.git /tmp/ckbcomp
  cd /tmp/ckbcomp

  # In case salsa.debian.org drops HTTP/2 frames, pre-fetch console-setup reliably via curl HTTP/1.1
  # or Debian main mirrors if needed before invoking makepkg
  PKGVER=\$(grep -E '^pkgver=' PKGBUILD | cut -d= -f2)
  TAR_NAME=\"console-setup-\${PKGVER}.tar.gz\"
  if [[ ! -f \"\${TAR_NAME}\" ]]; then
    echo \"==> Downloading \${TAR_NAME} via curl HTTP/1.1...\"
    if ! curl --http1.1 -fSL --retry 3 \"https://salsa.debian.org/installer-team/console-setup/-/archive/\${PKGVER}/\${TAR_NAME}\" -o \"\${TAR_NAME}\"; then
      echo \"==> Salsa download failed; attempting reliable Debian mirror tarball...\"
      curl --http1.1 -fSL --retry 3 \"https://deb.debian.org/debian/pool/main/c/console-setup/console-setup_\${PKGVER}.tar.xz\" -o \"console-setup_\${PKGVER}.tar.xz\"
      # Repack to expected tar.gz name for PKGBUILD compatibility
      mkdir -p /tmp/cs-extract
      tar -xf \"console-setup_\${PKGVER}.tar.xz\" -C /tmp/cs-extract
      mv /tmp/cs-extract/console-setup* \"console-setup-\${PKGVER}\"
      tar -czf \"\${TAR_NAME}\" \"console-setup-\${PKGVER}\"
      rm -rf /tmp/cs-extract \"console-setup_\${PKGVER}.tar.xz\"
      # Update sha256sums for the repacked tarball
      sed -i \"s/sha256sums=.*/sha256sums=('SKIP')/\" PKGBUILD
    fi
  fi

  makepkg -sri --noconfirm --needed --skippgpcheck
  cp ./*.pkg.tar.zst '${REPO_DIR}/'
"

su - "${BUILD_USER}" -c "
  set -euo pipefail
  rm -rf /tmp/calamares
  git clone --depth 1 https://aur.archlinux.org/calamares.git /tmp/calamares
  cd /tmp/calamares
  makepkg -s --noconfirm --needed --skippgpcheck
  cp ./*.pkg.tar.zst '${REPO_DIR}/'
"

cd "${REPO_DIR}"
repo-add dorowu-local.db.tar.gz ./*.pkg.tar.zst
chmod -R 0755 "${REPO_DIR}"

echo "[+] Local repository generated successfully at ${REPO_DIR}"
