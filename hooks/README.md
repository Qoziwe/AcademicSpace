# hooks/

- **`api/`** — TanStack Query хуки к «серверному» стейту. Хук ходит в
  `services/api/<resource>.ts` (адаптер-seam), а не в `mocks/` напрямую:
  за `services/api/*` по `EXPO_PUBLIC_USE_MOCKS` стоит либо мок-хендлер
  `mocks/handlers/*`, либо `services/api/http/*` (Фаза 8). Форма данных —
  один-в-один как в `docs/api-contract.md`; каждый новый поход к бекенду
  фиксируется там до/вместе с написанием хука (`CLAUDE.md` §5).
- Прочие UI-хуки (тема, premium-гейт, safe-area helpers и т.п.) — в корне
  `hooks/`.
