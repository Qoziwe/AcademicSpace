from marshmallow import Schema, fields, validate


class SubmitPortfolioSchema(Schema):
    resume = fields.String(load_default="")
    motivationLetters = fields.List(fields.String(), load_default=list)
    activities = fields.List(fields.String(), load_default=list)
    achievements = fields.List(fields.String(), load_default=list)


class ChatMessageSchema(Schema):
    text = fields.String(required=True, validate=validate.Length(min=1))
