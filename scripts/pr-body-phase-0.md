# chore: bootstrap Expo + Expo Router project (Phase 0)

Закрывает **Фазу 0** из `docs/00-roadmap.md` — проектный бутстрап + финализация
дизайн-токенов. Кода экранов ещё нет (это Фаза 1+), только каркас.

## Что сделано

### Инициализация стека

- **Expo SDK 54 + Expo Router + TypeScript** (managed workflow). `tsconfig` —
  `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, алиас `@/*`.
- `experiments`: `typedRoutes`, `reactCompiler`.
- Экран-заглушка `app/index.tsx` — подтверждает, что роутер поднимается пустым
  (web-бандл собирается, `expo-doctor` 18/18).

### Структура (атомарный дизайн)

```
app/            providers/       theme/           constants/
components/     hooks/api/       stores/          mocks/handlers/
  atoms/          molecules/       organisms/
```

Каждый слой с README, описывающим назначение и границы (что сюда класть, что нет).

### Дизайн-токены — финализированы

- `theme/tokens.ts` — извлечены 1:1 из `docs/design-tokens.md`: обе палитры
  light/dark (7 семантических токенов), навy-цвета, акценты, радиусы
  (14/20/24/32 + xs/sm), отступы (4px-база), тени, шрифты (Unbounded / Manrope).
- `docs/design-tokens.md` — закрыт последний открытый вопрос №3: логотип =
  временный градиентный ромб, конфигурируемый через `constants/brand.json`
  (`logo.mode: "diamond" | "image"`), заменяется на картинку без правок экранов.

### Брендинг (UniPath → AcademicSpace)

- `constants/brand.json` — единственный источник: имя, тариф
  «AcademicSpace Premium», scheme `academicspace://`, bundle/package
  `com.academicspace.app`, домен.
- `constants/brand.ts` — типизированная обёртка над JSON для рантайма.
- `app.config.ts` читает тот же JSON. «UniPath» в коде не встречается.

### Конфиги и окружение

- `constants/env.ts` — типобезопасный доступ к `EXPO_PUBLIC_*`
  (`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_USE_MOCKS`).
- `.env.example` закоммичен, `.env` в `.gitignore`.
- `providers/` — `QueryClient` (TanStack Query) + `SafeAreaProvider` +
  `GestureHandlerRootView`.

### Качество кода и Git-процесс

- **ESLint** (flat config: `eslint-config-expo` + `eslint-plugin-prettier`),
  `--max-warnings=0`. **Prettier** (single-quote, trailing-comma all, width 100).
- **Husky**:
  - `pre-commit` → `lint-staged` (eslint --fix + prettier на staged);
  - `commit-msg` → `commitlint` (Conventional Commits);
  - `pre-push` → запрет прямого push в `main` + `typecheck`.
- **CI** (`.github/workflows/ci.yml`): `prettier --check` + `eslint` +
  `tsc --noEmit` на каждый PR и push в `main`.
- **Node 22 LTS** зафиксирован (`.nvmrc` + `package.json → engines`).

## Проверки

| Проверка                         | Результат                           |
| -------------------------------- | ----------------------------------- |
| `npm run typecheck`              | ✅ 0 ошибок                         |
| `npm run lint`                   | ✅ 0 warnings                       |
| `npm run format:check`           | ✅                                  |
| `npx expo-doctor`                | ✅ 18/18                            |
| `npx expo export --platform web` | ✅ бандл собирается, `/` рендерится |

## Действие вручную от мейнтейнера

Защита ветки `main` настраивается в **GitHub → Settings → Branches** (правила
перечислены в `README.md` → «Защита ветки `main`»): require PR, require status
check `Lint & Typecheck`, запрет прямого push, только Squash and Merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
