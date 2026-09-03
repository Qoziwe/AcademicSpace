# scripts/

## `setup-github.sh` — одноразовый

Разливает Фазы 0 и 1 в GitHub по правилам `CLAUDE.md` §5: push → PR →
зелёный CI → **Squash and Merge**, плюс включает защиту ветки `main`.

Перед запуском один раз поставить и авторизовать GitHub CLI:

```bash
# вариант А — системный пакет (если база пакетов свежая)
sudo pacman -Syu --needed github-cli
# вариант Б — без sudo, локально в ~/.local/bin
bash scripts/install-gh-local.sh

gh auth login          # GitHub.com → HTTPS → Login with a web browser
bash scripts/setup-github.sh
```

`setup-github.sh` сам добавляет `~/.local/bin` в `PATH`, так что вариант Б
работает без правки `~/.bashrc`.

После этого `gh` остаётся авторизованным — дальнейшие фазы Claude
проводит через feature-ветку + PR сам.

## `branch-protection.json`

Тело запроса к `PUT /repos/:owner/:repo/branches/main/protection`.
Правила для `main`: PR обязателен, требуется статус-чек **`Lint & Typecheck`**,
линейная история, запрет force-push и удаления ветки. Админ (владелец
репо) может мержить свой PR без апрува (`enforce_admins: false`,
`required_approving_review_count: 0`).

## `pr-body-phase-*.md`

Тексты описаний Pull Request для соответствующих фаз (передаются в
`gh pr create --body-file`).
