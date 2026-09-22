from marshmallow import Schema, fields, validate


class SignUpSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8))
    name = fields.String(required=True, validate=validate.Length(min=1))
    grade = fields.String(required=True, validate=validate.Length(min=1))


class SignInSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)
