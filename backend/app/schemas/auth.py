from marshmallow import Schema, fields, validate

_REQUIRED = {"required": "Поле обязательно."}


class SignUpSchema(Schema):
    email = fields.Email(
        required=True,
        error_messages={**_REQUIRED, "invalid": "Некорректный email."},
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=8, error="Пароль должен быть не короче 8 символов."),
        error_messages=_REQUIRED,
    )
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Укажите имя."),
        error_messages=_REQUIRED,
    )
    grade = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Укажите класс."),
        error_messages=_REQUIRED,
    )


class SignInSchema(Schema):
    email = fields.Email(
        required=True,
        error_messages={**_REQUIRED, "invalid": "Некорректный email."},
    )
    password = fields.String(required=True, error_messages=_REQUIRED)
