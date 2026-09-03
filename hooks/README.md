# hooks/

- **`api/`** — TanStack Query хуки к «серверному» стейту. Пока за каждым
  хуком стоит мок-хендлер из `mocks/handlers/*`, но форма данных —
  один-в-один как в `docs/api-contract.md`. Каждый новый поход к бекенду
  фиксируется в `docs/api-contract.md` до/вместе с написанием хука
  (`CLAUDE.md` §5).
- Прочие UI-хуки (тема, premium-гейт, safe-area helpers и т.п.) — в корне
  `hooks/`.
