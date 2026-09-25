from marshmallow import Schema, fields, validate


class SubscribeSchema(Schema):
    planId = fields.String(
        required=True,
        validate=validate.OneOf(["week", "month"], error="Выберите тариф: неделя или месяц."),
        error_messages={"required": "Поле обязательно."},
    )
    paymentMethod = fields.String(load_default="mock")
