from flask import Flask, jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException


def _error_response(code: str, message: str, status: int):
    return jsonify({"error": {"code": code, "message": message}}), status


def _flatten_messages(messages: object) -> str:
    """`ValidationError.messages` — вложенный `{поле: [сообщение, ...]}`
    (иногда с вложенными словарями/списками для List/Nested-полей).
    Фронт показывает `error.message` как есть пользователю (тост/инлайн-
    текст под формой) — плоская строка нужна вместо `str(dict)`, которая
    выглядела бы как `{'password': ['Shorter than minimum length 8.']}`."""
    if isinstance(messages, dict):
        return " ".join(_flatten_messages(v) for v in messages.values())
    if isinstance(messages, list):
        return " ".join(_flatten_messages(v) for v in messages)
    return str(messages)


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ValidationError)
    def handle_validation_error(err: ValidationError):
        return _error_response("validation_error", _flatten_messages(err.messages), 400)

    @app.errorhandler(HTTPException)
    def handle_http_exception(err: HTTPException):
        code = (err.name or "error").lower().replace(" ", "_")
        return _error_response(code, err.description or err.name or "Ошибка", err.code or 500)

    @app.errorhandler(Exception)
    def handle_unexpected_error(err: Exception):
        app.logger.exception(err)
        return _error_response("internal_error", "Внутренняя ошибка сервера.", 500)
