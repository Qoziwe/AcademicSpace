from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import AchievementLogEntry, Profile
from app.utils import ru_date_with_today

achievements_bp = Blueprint("achievements", __name__, url_prefix="/achievements")


@achievements_bp.get("/log")
@jwt_required()
def get_log():
    user_id = int(get_jwt_identity())
    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()

    entries = (
        db.session.execute(
            db.select(AchievementLogEntry)
            .filter_by(user_id=user_id)
            .order_by(AchievementLogEntry.date.desc(), AchievementLogEntry.created_at.desc())
        )
        .scalars()
        .all()
    )

    days: list[dict] = []
    for entry in entries:
        label = ru_date_with_today(entry.date)
        if days and days[-1]["_date"] == entry.date:
            days[-1]["items"].append(entry)
        else:
            days.append({"_date": entry.date, "date": label, "items": [entry]})

    return jsonify(
        {
            "totalXp": profile.xp if profile else 0,
            "days": [
                {
                    "date": d["date"],
                    "items": [
                        {"title": e.title, "kind": e.kind, "xp": e.xp, "dot": e.dot}
                        for e in d["items"]
                    ],
                }
                for d in days
            ],
        }
    )
