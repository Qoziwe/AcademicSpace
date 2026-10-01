from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Questionnaire
from app.schemas.questionnaire import SubmitQuestionnaireSchema
from app.services.matching import rebuild_matches_for_user

questionnaire_bp = Blueprint("questionnaire", __name__, url_prefix="/questionnaire")

submit_schema = SubmitQuestionnaireSchema()


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

    return jsonify({"filled": q.filled, "interests": q.interests, "academics": q.academics})


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

    matches_count = rebuild_matches_for_user(user_id)

    return jsonify({"questionnaireId": str(q.id), "filled": True, "matchesCount": matches_count})
