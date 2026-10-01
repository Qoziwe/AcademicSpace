from marshmallow import Schema, fields, validate

LANGUAGE_TESTS = ["IELTS", "TOEFL", "Duolingo", "Не сдавал"]


class AcademicsSchema(Schema):
    """Реальные данные анкеты — вход алгоритма подбора (`app/services/matching`).

    `gpaPercent`/`examScore` — уже в шкале 0–100 (просим пользователя
    перевести в проценты сам, чтобы не городить таблицу конвертации под
    каждую национальную систему оценок). `languageScore` — наоборот, в
    родной шкале теста (IELTS 0–9 и т. д.), конвертация — на стороне
    `services/matching/normalize.py`.
    """

    gpaPercent = fields.Float(
        required=True, validate=validate.Range(min=0, max=100, error="От 0 до 100.")
    )
    examSubject = fields.String(required=True, validate=validate.Length(min=1))
    examScore = fields.Float(
        required=True, validate=validate.Range(min=0, max=100, error="От 0 до 100.")
    )
    languageTest = fields.String(required=True, validate=validate.OneOf(LANGUAGE_TESTS))
    languageScore = fields.Float(allow_none=True, load_default=None)
    achievementsCount = fields.Integer(
        load_default=0, validate=validate.Range(min=0, max=50, error="От 0 до 50.")
    )


class SubmitQuestionnaireSchema(Schema):
    interests = fields.List(fields.String(), load_default=None)
    academics = fields.Nested(AcademicsSchema, allow_none=True, load_default=None)
    preferences = fields.Dict(load_default=None)
