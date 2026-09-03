# mocks/

Централизованный мок-слой (Фаза 4 роадмапа). Не «данные на коленке» по
компонентам, а единая система:

- **`handlers/`** — по ресурсам (`auth`, `profile`, `questionnaire`,
  `universities`, `chat`, `tasks`, `vaults`, `subscription`). Форма ответа —
  один-в-один как будущий Flask (`docs/api-contract.md`).
- Единый мок-стор сессии (эквивалент `state` из `renderVals()`
  дизайн-референса: анкета/фильтры/тарифы/сообщения/задачи/оплата/офлайн),
  персистентный через AsyncStorage.
- Переключатель `EXPO_PUBLIC_USE_MOCKS` (`constants/env.ts`) — Фаза 8 меняет
  адаптер, а не хуки.
