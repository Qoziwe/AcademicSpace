from marshmallow import Schema, fields, validate

_REQUIRED = {"required": "Поле обязательно."}


class SubmitPortfolioSchema(Schema):
    resume = fields.String(load_default="")
    motivationLetters = fields.List(fields.String(), load_default=list)
    activities = fields.List(fields.String(), load_default=list)
    achievements = fields.List(fields.String(), load_default=list)


class ChatMessageSchema(Schema):
    text = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Введите текст сообщения."),
        error_messages=_REQUIRED,
    )


class CreateChatModuleSchema(Schema):
    messageId = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Не указан id сообщения."),
        error_messages=_REQUIRED,
    )
