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
  ["/usr/local/bin/dorowu-ai-ui"]="0:0:0755"
  ["/etc/skel/.config/autostart/dorowu-live-setup.desktop"]="1000:1000:0755"
  ["/etc/skel/Desktop/dorowu-installer.desktop"]="1000:1000:0755"
)
