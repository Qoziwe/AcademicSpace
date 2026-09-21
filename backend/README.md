# AcademicSpace — backend

Flask + PostgreSQL. Реализует `docs/api-contract.md` (Фаза 8, см. корневой
`docs/00-roadmap.md`). Пока в Фазе 8.1 — только каркас: фабрика приложения,
конфиги, расширения, единый формат ошибок, служебный `GET /api/v1/health`.
Модели/эндпоинты/бизнес-логика — следующие подфазы (8.2+).

Стек: Flask + Flask-SQLAlchemy + Flask-Migrate + Flask-JWT-Extended +
Flask-CORS + marshmallow, PostgreSQL, пакетный менеджер [`uv`](https://docs.astral.sh/uv/).

## Быстрый старт (без Docker)

```bash
cd backend
uv sync
cp .env.example .env               # поправить DATABASE_URL под локальный Postgres
uv run flask --app wsgi db upgrade # применить миграции (пока пустые — Фаза 8.2 добавит модели)
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
├── models/        — сущности (Фаза 8.2)
├── api/v1/        — blueprints по разделам api-contract.md
├── schemas/       — marshmallow-схемы запрос/ответ
└── services/      — бизнес-логика вне HTTP-слоя (AI-провайдеры, storage, payments)
migrations/        — Alembic
tests/             — pytest
seed.py            — засев БД тестовыми данными (наполнится в Фазе 8.2)
wsgi.py            — entrypoint для gunicorn
```

## Переменные окружения

См. `.env.example`. Секреты — только в `.env` (не коммитить), пример со
всеми ключами — `.env.example` (коммитится).
