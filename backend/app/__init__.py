import os

from flask import Flask

from app.api.v1 import api_v1
from app.config import get_config
from app.errors import register_error_handlers
from app.extensions import cors, db, jwt, migrate


def create_app(config_name: str | None = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(get_config(config_name))

    # Только для дефолтного DevConfig (SQLite-файл в instance/) — на
    # Postgres/testing это no-op, `instance/` просто останется пустой.
    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)

    from app import models  # noqa: F401  — регистрирует таблицы в db.metadata

    jwt.init_app(app)
    cors.init_app(app, origins=app.config["CORS_ORIGINS"])

    app.register_blueprint(api_v1)
    register_error_handlers(app)

    return app
