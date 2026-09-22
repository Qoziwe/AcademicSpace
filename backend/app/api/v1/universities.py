from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import NotFound

from app.extensions import db
from app.models import Profile, University, UniversityMatch

universities_bp = Blueprint("universities", __name__, url_prefix="/universities")

CATEGORY_ORDER = ["safety", "match", "reach"]
CATEGORY_TITLES = {
    "safety": "Безопасный выбор",
    "match": "Оптимальный выбор",
    "reach": "Амбициозная цель",
}
CATEGORY_LABELS = {"safety": "Safety", "match": "Match", "reach": "Reach"}

FREE_DOCS_NOTE = (
    "Список документов и копилка для их хранения доступны только в Premium. "
    "На базовом уровне вы видите сам список вузов."
)
PREMIUM_DOCS_NOTE_FALLBACK = (
    "Список документов появится, когда вуз подтвердит требования приёмной комиссии."
)


@universities_bp.post("/search")
@jwt_required()
def search_universities():
    user_id = int(get_jwt_identity())
    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    if profile is None:
        raise NotFound("Профиль не найден.")

    matches = db.session.execute(
        db.select(UniversityMatch, University)
        .join(University, UniversityMatch.university_id == University.id)
        .filter(UniversityMatch.user_id == user_id)
    ).all()

    by_category: dict[str, list[dict]] = {c: [] for c in CATEGORY_ORDER}
    for match, uni in matches:
        by_category.setdefault(match.category, []).append(
            {
                "id": str(uni.id),
                "name": uni.name,
                "city": uni.city,
                "chance": match.chance,
                "tags": match.tags,
            }
        )

    groups = []
    for category in CATEGORY_ORDER:
        items = by_category.get(category, [])
        sub = f"{CATEGORY_LABELS[category]} · {len(items)}"
        if category == "reach":
            sub += " · зона роста"
        groups.append(
            {
                "category": category,
                "title": CATEGORY_TITLES[category],
                "sub": sub,
                "items": items,
            }
        )

    return jsonify(
        {
            "country": profile.analysis_country or "",
            "matchesCount": profile.matches_count,
            "rating": profile.rating,
            "groups": groups,
        }
    )


@universities_bp.get("/<int:university_id>")
@jwt_required()
def get_university(university_id: int):
    user_id = int(get_jwt_identity())
    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    university = db.session.get(University, university_id)
    if profile is None or university is None:
        raise NotFound("Вуз не найден.")

    match = db.session.execute(
        db.select(UniversityMatch).filter_by(user_id=user_id, university_id=university_id)
    ).scalar_one_or_none()
    if match is None:
        raise NotFound("Вуз не найден в вашей подборке.")

    is_premium = profile.plan == "premium"
    if is_premium:
        required_documents = university.required_documents
        documents_note = university.documents_note or PREMIUM_DOCS_NOTE_FALLBACK
    else:
        required_documents = None
        documents_note = FREE_DOCS_NOTE

    return jsonify(
        {
            "id": str(university.id),
            "name": university.name,
            "city": university.city,
            "category": match.category,
            "admissionsUrl": university.admissions_url or "",
            "stats": university.stats,
            "rows": university.rows,
            "requiredDocuments": required_documents,
            "documentsNote": documents_note,
        }
    )
