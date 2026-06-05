#!/usr/bin/env bash
# Helper to download WOFF2 files for required fonts into public/fonts/
# Usage: ./scripts/download-fonts.sh

set -euo pipefail
mkdir -p public/fonts

echo "Downloading fonts via Google Fonts CSS. This script fetches woff2 URLs and downloads them."

auth_headers=("User-Agent: Mozilla/5.0 (X11; Linux x86_64)")

# Function to download fonts for a family and weights
download_family() {
  family=$1
  weights=$2 # e.g. "600;700;800"
  css_url="https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap"
  echo "Fetching CSS for ${family} -> ${css_url}"
  css=$(curl -s -H "${auth_headers[0]}" "${css_url}")
  # extract woff2 urls
  urls=$(echo "$css" | grep -o 'https://fonts.gstatic.com[^)\"]*' | tr -d '"')
  for u in $urls; do
    fname=$(basename "$u")
    out="public/fonts/$fname"
    if [ -f "$out" ]; then
      echo "Skipped existing $out"
    else
      echo "Downloading $u -> $out"
      curl -s -L "$u" -o "$out"
    fi
  done
}

# Sora weights
download_family "Sora" "600;700;800"
# Inter weights
download_family "Inter" "300;400;600;700;900"
# JetBrains Mono (not available via Google Fonts CSS in same format sometimes)
# Attempt to download JetBrains Mono regular/600 via Google Fonts
download_family "JetBrains+Mono" "400;600"

echo "Fonts downloaded into public/fonts/. Rename files to the Sora-600.woff2 style if you prefer."

echo "Done."
