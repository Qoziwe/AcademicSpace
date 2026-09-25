import os
from datetime import timedelta
from pathlib import Path

# `backend/` — родитель `app/`, где лежит этот файл.
BACKEND_DIR = Path(__file__).resolve().parent.parent


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

    STORAGE_BACKEND = os.environ.get("STORAGE_BACKEND", "local")
    STORAGE_LOCAL_PATH = os.environ.get("STORAGE_LOCAL_PATH", "storage")

    AI_CHAT_PROVIDER = os.environ.get("AI_CHAT_PROVIDER", "anthropic")
    AI_PORTFOLIO_PROVIDER = os.environ.get("AI_PORTFOLIO_PROVIDER", "anthropic")
    AI_FLASHCARDS_PROVIDER = os.environ.get("AI_FLASHCARDS_PROVIDER", "anthropic")
    ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
    # AI_*_PROVIDER=openrouter — один ключ, доступ к моделям разных
    # вендоров через OpenAI-совместимый API (openrouter.ai). MODEL — слаг
    # вида "провайдер/модель" (https://openrouter.ai/models), без дефолта:
    # у агрегатора нет единственно верного выбора, угадывать рискованно.
    OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
    OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL")

    # Реальный провайдер для Кыргызстана ещё не выбран (см. docs/00-roadmap.md
    # Фаза 8.7) — "mock" честно активирует Premium без реального списания.
    PAYMENT_PROVIDER = os.environ.get("PAYMENT_PROVIDER", "mock")


class DevConfig(Config):
    DEBUG = True
    # SQLite-файл в `instance/` (уже в .gitignore) — локальная разработка не
    # требует ни Docker, ни локально поднятого Postgres. Тот же движок, что
    # и у `TestConfig` (не in-memory — файл переживает перезапуск сервера).
    # Продакшн (`ProdConfig`) и Docker Compose всегда задают `DATABASE_URL`
    # явно — Postgres, модели/миграции без Postgres-специфичных типов,
    # переключение между движками ничего не ломает.
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'instance' / 'dev.db'}"
    )


class ProdConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-secret-key-not-for-production-use"


CONFIG_BY_NAME = {
    "development": DevConfig,
    "production": ProdConfig,
    "testing": TestConfig,
}


def get_config(name: str | None = None) -> type[Config]:
    name = name or os.environ.get("FLASK_ENV", "development")
    return CONFIG_BY_NAME.get(name, DevConfig)
