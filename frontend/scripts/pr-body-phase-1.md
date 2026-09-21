# feat: navigation skeleton — route files + Auth/Premium guards + tab bar (Phase 1)

Закрывает **Фазу 1** из `docs/00-roadmap.md` — скелет навигации.
Кода экранов ещё нет (Фаза 3), только каркас: по приложению можно вручную
«пройти» по пустым экранам, ни одна кнопка не ведёт в никуда.

## Что сделано

### Реестр роутов в коде — `navigation/registry.ts`

Типизированная копия таблицы `docs/source/03-routes.md` (35 роутов):
`id · path · file · auth · premium · navType · destinations · back · demoHref · note`.
Единственный источник для guard'ов, заглушек и клик-теста «Entry points →
Destinations → Back behavior».

### Route-файлы Expo Router (`app/**`)

- **Честный отдельный файл на каждый ID реестра** (`CLAUDE.md` §7), в том
  числе там, где прототип рисует несколько роутов одним компонентом:
  `auth/signup` + `auth/signin`, 6 шагов `universities/filters/*` +
  `questionnaire`, `system/{error,offline,maintenance,update}`,
  `subscription/{offer,plans,payment}`.
- **32 заглушки** — `<ScreenStub id="…" />`: показывает метаданные роута
  (path, Auth/Premium/navType бейджи, note) и делает **каждый** переход из
  `destinations` и «назад» рабочей кнопкой.
- **Кастомные экраны** на общем `<BrandLoading>` (навy-фон, вне темы):
  - `SPLASH` (`/`) — redirect на `/dashboard` или `/welcome` по мок-сессии
    после гидратации AsyncStorage;
  - `AUTH_LOADING` — `signIn()` + `replace('/dashboard')` через 2.5 с;
  - `ANALYSIS_LOADING` — авто-переход на `ANALYSIS_PREVIEW`.
    У обоих loading-экранов жест «назад» отключён.
- `app/+not-found.tsx`.

### Route guards — `navigation/withGuard.tsx`

Обёртка на каждый route-файл (`export default withGuard(Screen, { auth, premium })`),
значения — из колонок реестра:

- до гидратации AsyncStorage — нейтральный fallback, **без** редиректа
  (иначе deep link мигал бы на `/welcome`);
- `auth` и нет сессии → `<Redirect href="/welcome" />`;
- `premium` и тариф не premium → `<Redirect href="/subscription/offer" />`
  (Free по deep link на Premium-only роут уводит на Paywall — реестр +
  `CLAUDE.md` §6 / Фаза 6).

### Premium-гейт — `hooks/usePremiumGate.ts`

Переиспользуемый hook (`CLAUDE.md` §6): `isPremium` для hard-hide +
`resolveHref(target, { locked })` для lock-тизера (плитка/строка рендерится,
но по тапу ведёт на Paywall). Используется на дашборде/профиле в Фазе 3.

### Навигация и оверлеи

- `components/organisms/TabBar.tsx` — плавающий таб-бар прототипа
  (Главная / Вузы / ИИ-ментор / [Задачи] / Профиль). Вкладка **«Задачи»
  физически не рендерится для Free** (`CLAUDE.md` §6, паттерн 1). Хост
  показывает бар только на 5 роутах (`showTabs` прототипа).
- `components/organisms/OfflineBanner.tsx` — глобальный офлайн-баннер,
  скрыт на `system/*`.
- `app/_layout.tsx` — единый Stack; `presentation: 'modal'` для
  `subscription/*`, `gestureEnabled: false` для loading/maintenance/update.

### Стейт (Zustand + AsyncStorage)

- `stores/session.ts` — мок-сессия (`isAuthed`, `plan`, `hydrated`). Форма
  полей = `/api/v1/auth/*` + `/api/v1/profile/me` (`docs/api-contract.md`).
- `stores/ui.ts` — флаг `offline`.

### Прочее

- `components/dev/DevMenu.tsx` — **dev-only** (`__DEV__`) оверлей: Free/Premium,
  сброс сессии, офлайн-баннер, прыжки на `system/*` — для ручного клик-теста.
  Не продуктовый UI (аналог левой панели прототипа). Полноценный
  dev-Playground — Фаза 2.
- `app.config.ts` — `web.output: 'single'` (SPA): приложение мобайл-фёрст,
  серверный пререндер не нужен и падал на web-storage. Desktop-раскладка —
  Фаза 7 (`CLAUDE.md` §9).

## Проверки

| Проверка                               | Результат                              |
| -------------------------------------- | -------------------------------------- |
| `npm run typecheck`                    | ✅                                     |
| `npm run lint` (`--max-warnings=0`)    | ✅                                     |
| `npm run format:check`                 | ✅                                     |
| `npx expo-doctor`                      | ✅ 18/18                               |
| `npx expo export --platform web` (SPA) | ✅ 1236 модулей, без конфликтов роутов |
| `npx expo export --platform android`   | ✅                                     |

## Ручной клик-тест (для ревьюера)

`npm start` (Node 22) → в приложении: Splash → Welcome → «Регистрация» →
Auth Loading → Dashboard. Дальше — по кнопкам `<ScreenStub>` и таб-бару.
Кнопка **DEV** (правый край) — переключение Free/Premium и прыжки на
системные экраны.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
