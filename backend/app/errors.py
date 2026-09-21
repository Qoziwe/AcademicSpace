from flask import Flask, jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException


def _error_response(code: str, message: str, status: int):
    return jsonify({"error": {"code": code, "message": message}}), status


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ValidationError)
    def handle_validation_error(err: ValidationError):
        return _error_response("validation_error", str(err.messages), 400)

    @app.errorhandler(HTTPException)
    def handle_http_exception(err: HTTPException):
        code = (err.name or "error").lower().replace(" ", "_")
        return _error_response(code, err.description or err.name or "Error", err.code or 500)

    @app.errorhandler(Exception)
    def handle_unexpected_error(err: Exception):
        app.logger.exception(err)
        return _error_response("internal_error", "Internal server error", 500)
