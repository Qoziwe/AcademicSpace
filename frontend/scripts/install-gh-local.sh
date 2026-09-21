#!/usr/bin/env bash
#
# Ставит GitHub CLI (`gh`) в ~/.local/bin без sudo — на случай, когда
# системный пакет-менеджер недоступен или база пакетов устарела.
#
#   bash scripts/install-gh-local.sh
#   gh --version   # если ~/.local/bin в PATH; иначе ~/.local/bin/gh --version

set -euo pipefail

DEST="$HOME/.local/bin"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

arch="$(uname -m)"
case "$arch" in
  x86_64 | amd64) GHARCH=amd64 ;;
  aarch64 | arm64) GHARCH=arm64 ;;
  *) echo "Неизвестная архитектура: $arch" >&2; exit 1 ;;
esac

echo "==> Узнаю последнюю версию gh"
VER="$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest \
  | grep -oP '"tag_name":\s*"v\K[^"]+' | head -n1)"
[ -n "$VER" ] || { echo "Не удалось определить версию" >&2; exit 1; }
echo "    gh v$VER ($GHARCH)"

TARBALL="gh_${VER}_linux_${GHARCH}.tar.gz"
URL="https://github.com/cli/cli/releases/download/v${VER}/${TARBALL}"

echo "==> Скачиваю $URL"
curl -fsSL "$URL" -o "$TMP/$TARBALL"

echo "==> Распаковываю в $DEST"
mkdir -p "$DEST"
tar -xzf "$TMP/$TARBALL" -C "$TMP"
install -m 0755 "$TMP/gh_${VER}_linux_${GHARCH}/bin/gh" "$DEST/gh"

echo
if command -v gh >/dev/null 2>&1 && [ "$(command -v gh)" = "$DEST/gh" ]; then
  gh --version
else
  echo "✅ Установлено: $DEST/gh"
  echo "   \$HOME/.local/bin не в PATH. Либо добавь строку в ~/.bashrc:"
  echo "       export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo "   либо просто запускай: $DEST/gh ..."
  "$DEST/gh" --version
fi
