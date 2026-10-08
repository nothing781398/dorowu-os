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

mkdir -p "${REPO_DIR}"
chown -R "${BUILD_USER}:${BUILD_USER}" "${REPO_DIR}"

# Build packages in the local repo
su - "${BUILD_USER}" -c "
  set -euo pipefail
  rm -rf /tmp/ckbcomp
  git clone --depth 1 https://aur.archlinux.org/ckbcomp.git /tmp/ckbcomp
  cd /tmp/ckbcomp
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
