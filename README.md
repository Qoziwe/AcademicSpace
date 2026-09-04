# AcademicSpace — фронтенд

Персонализированное приложение для школьников 9–11 классов: подбор
университетов (Safety / Match / Reach), ИИ-анализ портфолио, ИИ-ментор,
копилка документов, геймификация, инструменты фокусировки.

Стек: **React Native + TypeScript + Expo (Expo Router)** — единая кодовая
база под iOS / Android / Web. Бекенд (Flask) появится позже — сейчас весь
фронтенд на моках.

> Полные правила процесса и стека — в [`CLAUDE.md`](./CLAUDE.md).
> Фазы работ — в [`docs/00-roadmap.md`](./docs/00-roadmap.md).

## Демо (веб, на моках)

**https://qoziwe.github.io/AcademicSpace/**

Веб-сборка (`expo export --platform web`, SPA) публикуется на GitHub Pages
воркфлоу [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)
на каждый push в `main`. Данные — мок-слой (`mocks/`), бекенда нет.
Мобильная раскладка в телефонном фрейме; полноценный desktop — Фаза 7.

## Требования к окружению

- **Node.js 22 LTS** (зафиксировано в `.nvmrc` и `package.json → engines`).
  `nvm use` перед работой. На Node 24+ Metro/Expo не поддерживаются.
- npm (lock-файл — `package-lock.json`).

## Быстрый старт

```bash
nvm use            # переключиться на Node 22
npm install        # поставит зависимости + husky-хуки (postinstall → prepare)
cp .env.example .env
npm start          # expo start — Metro-бандлер
npm run web        # запуск в браузере
```

## Скрипты

| Скрипт                                  | Назначение                    |
| --------------------------------------- | ----------------------------- |
| `npm start` / `android` / `ios` / `web` | Expo dev-сервер               |
| `npm run lint` / `lint:fix`             | ESLint (0 warnings tolerated) |
| `npm run format` / `format:check`       | Prettier                      |
| `npm run typecheck`                     | `tsc --noEmit`                |

## Структура

```
app/            — роуты Expo Router (файловая маршрутизация 1:1 с docs/source/03-routes.md)
components/      — атомарный дизайн: atoms / molecules / organisms
theme/          — дизайн-токены (обе палитры, шрифты, радиусы, отступы, тени)
constants/      — brand.ts (брендинг, deep link scheme), env.ts (EXPO_PUBLIC_*)
providers/      — корневые провайдеры (QueryClient, SafeArea, GestureHandler)
hooks/api/      — TanStack Query хуки (за мок-адаптером, контракт в docs/api-contract.md)
stores/         — Zustand (тема, premium-флаг на моках, UI-стейт)
mocks/          — централизованный мок-слой (handlers по ресурсам + мок-сессия)
```

## Git-процесс

- Прямые пуши в `main` запрещены. Feature-branch → Pull Request → **Squash and Merge**.
- Сообщения коммитов — **Conventional Commits** (`commit-msg` хук через commitlint).
- `pre-commit` — lint-staged (ESLint + Prettier на staged-файлах).
- CI (`.github/workflows/ci.yml`) — Prettier check + ESLint + typecheck на каждый PR.

### Защита ветки `main` (настраивается в GitHub → Settings → Branches)

Правило для `main`:

- Require a pull request before merging (Require approvals ≥ 0, по желанию 1).
- Require status checks to pass → выбрать job **`Lint & Typecheck`**.
- Require branches to be up to date before merging.
- Do not allow bypassing the above settings / Restrict who can push → запретить прямой push.
- Allow squash merging только (Squash and Merge), выключить merge-commit и rebase.
