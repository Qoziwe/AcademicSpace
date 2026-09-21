# AcademicSpace

Персонализированное приложение для школьников 9–11 классов: подбор
университетов (Safety / Match / Reach), ИИ-анализ портфолио, ИИ-ментор,
копилка документов, геймификация, инструменты фокусировки.

Монорепо: **`frontend/`** — React Native + TypeScript + Expo (Expo Router),
единая кодовая база под iOS / Android / Web. **`backend/`** — Flask + PostgreSQL
(Фаза 8, в разработке). `docs/` — общий контракт между ними.

> Полные правила процесса и стека — в [`CLAUDE.md`](./CLAUDE.md).
> Фазы работ — в [`docs/00-roadmap.md`](./docs/00-roadmap.md).
> Контракт данных фронтенд↔бекенд — в [`docs/api-contract.md`](./docs/api-contract.md).

## Демо (веб, на моках)

**https://qoziwe.github.io/AcademicSpace/**

Веб-сборка фронтенда (`expo export --platform web`, SPA) публикуется на GitHub
Pages воркфлоу [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)
на каждый push в `main`. Данные — мок-слой (`frontend/mocks/`), бекенд ещё не подключён.
Мобильная раскладка в телефонном фрейме; полноценный desktop — Фаза 7.

## Структура репозитория

```
frontend/       — Expo-проект (app/, components/, hooks/, services/, mocks/, ...)
backend/        — Flask-проект (Фаза 8, см. backend/README.md)
docs/           — общий контракт: roadmap, design-tokens, api-contract, screen-inventory
```

## Требования к окружению

- **Node.js 22 LTS** (зафиксировано в `frontend/.nvmrc`). `nvm use` перед работой.
  На Node 24+ Metro/Expo не поддерживаются.
- npm workspaces — единый `package-lock.json` в корне.
- Backend (когда появится): Python + [`uv`](https://docs.astral.sh/uv/), Docker
  (Postgres через `docker-compose`) — см. `backend/README.md`.

## Быстрый старт (фронтенд)

```bash
nvm use                       # переключиться на Node 22
npm install                   # поставит зависимости workspace'а + husky-хуки
cp frontend/.env.example frontend/.env
npm run start --workspace frontend    # expo start — Metro-бандлер
npm run web --workspace frontend      # запуск в браузере
```

## Скрипты (frontend workspace)

| Скрипт                                                    | Назначение                    |
| ---------------------------------------------------------- | ----------------------------- |
| `npm run start\|android\|ios\|web --workspace frontend`    | Expo dev-сервер                |
| `npm run lint\|lint:fix --workspace frontend`               | ESLint (0 warnings tolerated) |
| `npm run format\|format:check --workspace frontend`         | Prettier                      |
| `npm run typecheck --workspace frontend`                    | `tsc --noEmit`                |

## Git-процесс

- Прямые пуши в `main` запрещены. Feature-branch → Pull Request → **Squash and Merge**.
- Сообщения коммитов — **Conventional Commits** (`commit-msg` хук через commitlint).
- `pre-commit` — lint-staged (ESLint + Prettier на staged frontend-файлах, ruff/black
  на staged backend-файлах).
- CI (`.github/workflows/ci.yml`) — `frontend-quality` (Prettier + ESLint + typecheck)
  и `backend-quality` (ruff + black + pytest, с Фазы 8.1) на каждый PR.

### Защита ветки `main` (настраивается в GitHub → Settings → Branches)

Правило для `main`:

- Require a pull request before merging (Require approvals ≥ 0, по желанию 1).
- Require status checks to pass → выбрать job **`Frontend — Lint & Typecheck`**
  (и **`Backend — Lint & Tests`** с Фазы 8.1).
- Require branches to be up to date before merging.
- Do not allow bypassing the above settings / Restrict who can push → запретить прямой push.
- Allow squash merging только (Squash and Merge), выключить merge-commit и rebase.
