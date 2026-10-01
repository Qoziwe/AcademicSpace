from marshmallow import Schema, fields, validate


class CreateFlashcardDeckSchema(Schema):
    source = fields.String(
        required=True,
        validate=validate.OneOf(["text", "image"], error="source должен быть text или image."),
        error_messages={"required": "Поле обязательно."},
    )
    text = fields.String(load_default=None)


class MarkFlashcardKnownSchema(Schema):
    known = fields.Boolean(load_default=True)
