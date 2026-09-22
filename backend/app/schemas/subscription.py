from marshmallow import Schema, fields, validate


class SubscribeSchema(Schema):
    planId = fields.String(required=True, validate=validate.OneOf(["week", "month"]))
    paymentMethod = fields.String(load_default="mock")
