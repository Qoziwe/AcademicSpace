#!/usr/bin/env bash
#
# Одноразовый разлив Фаз 0 и 1 в GitHub «как надо»:
#   push обеих веток → PR Phase 0 → зелёный CI → squash-merge →
#   защита ветки main → rebase Phase 1 на main → PR Phase 1 → CI → squash-merge.
#
# Требуется установленный и авторизованный GitHub CLI:
#   sudo pacman -S --needed github-cli
#   gh auth login          # GitHub.com → HTTPS → Login with a web browser
#
# Запуск:
#   bash scripts/setup-github.sh
#
# Скрипт идемпотентен по возможности: повторный запуск не падает, если PR
# уже создан или ветка уже влита.

set -euo pipefail

REPO="Qoziwe/AcademicSpace"
P0="chore/phase-0-bootstrap"
P1="feat/phase-1-navigation"

cd "$(git rev-parse --show-toplevel)"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31m✖ %s\033[0m\n' "$*" >&2; exit 1; }

# ── 0. Предусловия ───────────────────────────────────────────────────────────
command -v gh >/dev/null 2>&1 || die "Нет gh. Установи: sudo pacman -S --needed github-cli, затем gh auth login"
gh auth status >/dev/null 2>&1 || die "gh не авторизован. Выполни: gh auth login"

# ── 1. Merge-режим репозитория: только Squash and Merge ──────────────────────
say "Настраиваю merge-режим репозитория (только squash, авто-удаление веток)"
gh api -X PATCH "repos/$REPO" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true >/dev/null

# ── 2. Пуш веток ────────────────────────────────────────────────────────────
say "Пушу ветку $P0"
git push -u origin "$P0"
say "Пушу ветку $P1"
git push -u origin "$P1"

# ── 3. PR Phase 0 → main ────────────────────────────────────────────────────
say "PR: Phase 0 → main"
gh pr create --repo "$REPO" --base main --head "$P0" \
  --title "chore: bootstrap Expo + Expo Router project (Phase 0)" \
  --body-file scripts/pr-body-phase-0.md \
  || echo "  (PR уже существует — продолжаю)"

say "Жду CI Phase 0 (может занять пару минут)…"
sleep 10
gh pr checks "$P0" --repo "$REPO" --watch --interval 15 \
  || die "CI Phase 0 не зелёный. Логи: gh pr checks $P0 --repo $REPO"

say "Squash-merge Phase 0"
gh pr merge "$P0" --repo "$REPO" --squash --delete-branch || echo "  (уже влит — продолжаю)"

# ── 4. Защита ветки main ────────────────────────────────────────────────────
say "Включаю защиту ветки main (PR обязателен, нужен зелёный «Lint & Typecheck», линейная история)"
gh api -X PUT "repos/$REPO/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  --input scripts/branch-protection.json >/dev/null

# ── 5. Rebase Phase 1 на свежий main ────────────────────────────────────────
say "Ребейз Phase 1 на main (сбрасываю уже влитые коммиты Phase 0)"
git fetch origin
git checkout "$P1"
git rebase --onto origin/main "$P0" "$P1"
git push --force-with-lease origin "$P1"

# локальную ветку Phase 0 удаляем — она влита и удалена на origin
git branch -D "$P0" 2>/dev/null || true

# ── 6. PR Phase 1 → main ────────────────────────────────────────────────────
say "PR: Phase 1 → main"
gh pr create --repo "$REPO" --base main --head "$P1" \
  --title "feat: navigation skeleton — route files + Auth/Premium guards + tab bar (Phase 1)" \
  --body-file scripts/pr-body-phase-1.md \
  || echo "  (PR уже существует — продолжаю)"

say "Жду CI Phase 1…"
sleep 10
gh pr checks "$P1" --repo "$REPO" --watch --interval 15 \
  || die "CI Phase 1 не зелёный. Логи: gh pr checks $P1 --repo $REPO"

say "Squash-merge Phase 1"
gh pr merge "$P1" --repo "$REPO" --squash --delete-branch || echo "  (уже влит)"

# ── 7. Локальный main = origin/main ─────────────────────────────────────────
git checkout main
git pull --ff-only origin main
git branch -D "$P1" 2>/dev/null || true

printf '\n\033[1;32m✅ Готово.\033[0m main = Phase 0 + Phase 1, защита ветки включена, gh авторизован.\n'
printf '   Следующая фаза:  git checkout -b feat/phase-2-ui-kit\n\n'
