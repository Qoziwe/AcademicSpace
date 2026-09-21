# AcademicSpace — backend

Flask + PostgreSQL. Реализует `docs/api-contract.md` (Фаза 8, см. корневой
`docs/00-roadmap.md`). На данный момент: каркас приложения (Фаза 8.1) +
модели данных и миграции (Фаза 8.2). Эндпоинты/бизнес-логика (Auth, Tasks,
Vaults, AI Mentor и т.д.) — следующие подфазы (8.3+), сейчас есть только
служебный `GET /api/v1/health`.

Стек: Flask + Flask-SQLAlchemy + Flask-Migrate + Flask-JWT-Extended +
Flask-CORS + marshmallow, PostgreSQL, пакетный менеджер [`uv`](https://docs.astral.sh/uv/).

## Быстрый старт (без Docker)

```bash
cd backend
uv sync
cp .env.example .env               # поправить DATABASE_URL под локальный Postgres
uv run flask --app wsgi db upgrade # применить миграции (все таблицы из app/models)
uv run python seed.py              # засеять демо-данными (профиль, задачи, вузы, чат, ...)
uv run flask --app wsgi run        # http://localhost:5000
```

## Быстрый старт (Docker Compose — Postgres + backend одной командой)

```bash
cd backend
cp .env.example .env
docker compose up --build
```

Проверка: `curl http://localhost:5000/api/v1/health` → `{"status":"ok"}`.

## Тесты и линт

```bash
uv run pytest -q
uv run ruff check .
uv run black --check .
```

Тесты используют `TestConfig` (SQLite in-memory) — реальный Postgres для
`pytest` не нужен.

## Структура

```
app/
├── __init__.py    — create_app() фабрика, регистрирует blueprints/расширения
├── config.py      — DevConfig/ProdConfig/TestConfig
├── extensions.py  — db (SQLAlchemy), migrate (Alembic), jwt, cors
├── errors.py      — единый JSON-формат ошибок {"error": {"code","message"}}
├── models/        — сущности (User, Profile, Questionnaire, University/UniversityMatch,
│                    Task/TaskItem, Vault/VaultCell, SubscriptionPlan/Subscription,
│                    AchievementLogEntry, FlashcardDeck/FlashcardCard, ChatMessage,
│                    PortfolioAnalysis) — все FK на user_id
├── api/v1/        — blueprints по разделам api-contract.md
├── schemas/       — marshmallow-схемы запрос/ответ
└── services/      — бизнес-логика вне HTTP-слоя (AI-провайдеры, storage, payments)
migrations/        — Alembic
tests/             — pytest
seed.py            — засев БД демо-данными (портирует frontend/mocks/fixtures.ts)
wsgi.py            — entrypoint для gunicorn
```

## Переменные окружения

См. `.env.example`. Секреты — только в `.env` (не коммитить), пример со
всеми ключами — `.env.example` (коммитится).
