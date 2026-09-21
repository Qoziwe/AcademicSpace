import os
from datetime import timedelta


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


class DevConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg://academicspace:academicspace@localhost:5432/academicspace",
    )


class ProdConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


CONFIG_BY_NAME = {
    "development": DevConfig,
    "production": ProdConfig,
    "testing": TestConfig,
}


def get_config(name: str | None = None) -> type[Config]:
    name = name or os.environ.get("FLASK_ENV", "development")
    return CONFIG_BY_NAME.get(name, DevConfig)
