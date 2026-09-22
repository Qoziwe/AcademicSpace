from marshmallow import Schema, fields, validate


class CreateFlashcardDeckSchema(Schema):
    source = fields.String(required=True, validate=validate.OneOf(["text", "image"]))
    text = fields.String(load_default=None)


class MarkFlashcardKnownSchema(Schema):
    known = fields.Boolean(load_default=True)
