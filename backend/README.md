# AcademicSpace — backend

Flask + PostgreSQL. Реализует `docs/api-contract.md` (Фаза 8, см. корневой
`docs/00-roadmap.md`). На данный момент реализованы: каркас приложения
(Фаза 8.1), модели данных и миграции (Фаза 8.2), Auth + Profile (Фаза 8.3),
Questionnaire, Universities, Tasks, Vaults, Subscription, Achievement Log
(Фаза 8.4), AI Mentor (портфолио-анализ в фоновом потоке, чат с
опциональным предложением модуля, генерация умных карточек — Фаза 8.5,
`app/services/ai/` — Anthropic/OpenAI за общим интерфейсом `AIProvider`,
выбор провайдера per-фича через `.env`), файловое хранилище (Фаза 8.6,
`app/services/storage/` — интерфейс `StorageBackend`, реализация
`local.py` на диске через `STORAGE_LOCAL_PATH`; облачный бекенд позже
подключается одним файлом за тем же интерфейсом). Загрузка/выдача файла
копилки — через хранилище на бекенде, но фронтовый `DocumentVaultScreen`
ещё не перевязан на реальный per-vault хук (см. `docs/api-contract.md`
§Адаптер-seam). Оплата (Фаза 8.7, `app/services/payments/` — интерфейс
`PaymentProvider`, `mock_provider.py` честно активирует Premium; реальный
провайдер для Кыргызстана ещё не выбран — бизнес/юридический вопрос вне
этого плана). Умные карточки теперь генерируются и по фото (Фаза 8.8) —
`POST /flashcards` принимает multipart с `images`, распознаёт через
`AIProvider.generate_vision`.

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
