from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Questionnaire
from app.schemas.questionnaire import SubmitQuestionnaireSchema

questionnaire_bp = Blueprint("questionnaire", __name__, url_prefix="/questionnaire")

submit_schema = SubmitQuestionnaireSchema()

# Статичная витрина анкеты (`QUESTIONNAIRE_GROUPS` дизайн-референса) — те же
# поля показываются всем пользователям, реальные ответы не редактируются
# через этот экран напрямую (см. docs/api-contract.md §Questionnaire).
QUESTIONNAIRE_GROUPS = [
    {
        "title": "Академические результаты",
        "fields": [
            {"label": "Средний балл", "value": "4,7"},
            {"label": "Профильная математика", "value": "86"},
            {"label": "Английский", "value": "IELTS 5.5"},
            {"label": "Класс", "value": "11"},
        ],
    },
    {
        "title": "Предпочтения по вузам",
        "fields": [
            {"label": "Формат", "value": "Бакалавриат"},
            {"label": "Готовность к переезду", "value": "Да"},
            {"label": "Бюджет в год", "value": "до 3 000 €"},
        ],
    },
]


def _get_or_create(user_id: int) -> Questionnaire:
    q = db.session.execute(db.select(Questionnaire).filter_by(user_id=user_id)).scalar_one_or_none()
    if q is None:
        q = Questionnaire(user_id=user_id)
        db.session.add(q)
    return q


@questionnaire_bp.get("")
@jwt_required()
def get_questionnaire():
    user_id = int(get_jwt_identity())
    q = _get_or_create(user_id)
    db.session.commit()

    return jsonify({"filled": q.filled, "interests": q.interests, "groups": QUESTIONNAIRE_GROUPS})


@questionnaire_bp.post("")
@jwt_required()
def submit_questionnaire():
    user_id = int(get_jwt_identity())
    data = submit_schema.load(request.get_json(silent=True) or {})

    q = _get_or_create(user_id)
    if data["interests"] is not None:
        q.interests = data["interests"]
    if data["academics"] is not None:
        q.academics = data["academics"]
    if data["preferences"] is not None:
        q.preferences = data["preferences"]
    q.filled = True
    db.session.commit()

    return jsonify({"questionnaireId": str(q.id), "filled": True})
