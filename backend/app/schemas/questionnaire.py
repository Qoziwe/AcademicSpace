from marshmallow import Schema, fields


class SubmitQuestionnaireSchema(Schema):
    interests = fields.List(fields.String(), load_default=None)
    academics = fields.Dict(load_default=None)
    preferences = fields.Dict(load_default=None)
