from marshmallow import Schema, fields


class ToggleTaskItemSchema(Schema):
    """`done` — необязателен: если не передан, пункт переключается (toggle)."""

    done = fields.Boolean(load_default=None)
