#!/usr/bin/env python3
"""
Generates clean PNG assets for Dorowu OS (Calamares branding, pixmaps, wallpapers).
Pure Python standard library (struct + zlib) - zero external dependencies required.
"""
import os
import struct
import zlib

def create_png(width, height, color_fn, output_path):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = color_fn(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), 6)
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff))
    
    # IDAT
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    # IEND
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    
    with open(output_path, 'wb') as f:
        f.write(png)
    print(f"[+] Successfully wrote {output_path} ({width}x{height})")

def dorowu_badge_color(x, y, w, h):
    nx = x / float(w)
    ny = y / float(h)
    
    # Rounded badge bounds
    cx = nx - 0.5
    cy = ny - 0.5
    dist = (cx*cx + cy*cy)**0.5
    if dist > 0.48:
        return 0, 0, 0, 0
    
    # High-tech cyan-blue gradient (#2563eb to #00c49f)
    t = (nx + ny) * 0.5
    r = int(37 * (1 - t) + 0 * t)
    g = int(99 * (1 - t) + 196 * t)
    b = int(235 * (1 - t) + 159 * t)
    
    # Stylized white "D" glyph
    if 0.32 <= nx <= 0.68 and 0.28 <= ny <= 0.72:
        # Inner cutout
        if 0.44 <= nx <= 0.56 and 0.40 <= ny <= 0.60:
            return r, g, b, 255
        # Subtle angled cut for the modern letterform
        if nx > 0.58 and (ny < 0.35 or ny > 0.65):
            return r, g, b, 255
        return 255, 255, 255, 255
        
    return r, g, b, 255

def default_wallpaper_color(x, y, w, h):
    nx = x / float(w)
    ny = y / float(h)
    
    # Deep slate / night gradient (#090d16 to #1a233a)
    r = int(9 + 17 * (nx * 0.7 + ny * 0.3))
    g = int(13 + 22 * (nx * 0.7 + ny * 0.3))
    b = int(22 + 36 * (nx * 0.7 + ny * 0.3))
    
    # Center ambient glow
    dx = (nx - 0.5) * 1.5
    dy = (ny - 0.5)
    d = (dx*dx + dy*dy)**0.5
    if d < 0.6:
        glow = (1.0 - d / 0.6)
        r = min(255, int(r + 20 * glow))
        g = min(255, int(g + 45 * glow))
        b = min(255, int(b + 90 * glow))
        
    return r, g, b, 255

if __name__ == '__main__':
    brand_dir = "dorowu-profile/airootfs/etc/calamares/branding/dorowu"
    pixmaps_dir = "dorowu-profile/airootfs/usr/share/pixmaps"
    bg_dir = "dorowu-profile/airootfs/usr/share/backgrounds/dorowu"
    
    # Calamares brand icons
    create_png(256, 256, dorowu_badge_color, os.path.join(brand_dir, "dorowu-logo.png"))
    create_png(256, 256, dorowu_badge_color, os.path.join(brand_dir, "welcome.png"))
    create_png(256, 256, dorowu_badge_color, os.path.join(pixmaps_dir, "dorowu-logo.png"))
    
    # Default wallpaper
    create_png(1280, 720, default_wallpaper_color, os.path.join(bg_dir, "default.png"))
    
    print("[*] All Dorowu OS visual PNG assets generated.")
