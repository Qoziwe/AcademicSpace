# components/ — атомарный дизайн

Переиспользуемые «пазл-блоки» UI. Стили — только из токенов `theme/`
(`CLAUDE.md` §5, требования §8). Копипаста стилей от экрана к экрану запрещена.

- **`atoms/`** — неделимые примитивы: `Button`, `Chip`, `Switch`, `Checkbox`,
  `ProgressRing`, `ProgressBar`, `Avatar`, `TextField`, `IconTile`, `Divider`,
  `BrandLogo` (ромб/картинка по `constants/brand.ts`).
- **`molecules/`** — композиции атомов: `UniversityCard`, `FilterOptionRow`,
  `TaskModuleCard`, `ChatBubble`, `DocumentCell`, `FocusSoundTile`,
  `SettingsRow`, `BentoTile` (lock-паттерн), `PlanCard`.
- **`organisms/`** — крупные блоки экрана: `HeaderBar`, `FilterStepper`,
  `ResultsGroupedList`, `ActiveTasksBlock`, `ChatThread`, `TabBar`,
  `ProfileHeaderWidget`, `SystemScreenLayout`.

Сборка UI-кита — Фаза 2 роадмапа, визуальная сверка в dev-only Playground-роуте.
