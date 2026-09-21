from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import NotFound

from app.extensions import db
from app.models import Profile, Subscription, SubscriptionPlan, User

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")


@profile_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    if user is None or profile is None:
        raise NotFound("Профиль не найден.")

    active_subscription = (
        db.session.execute(db.select(Subscription).filter_by(user_id=user_id, status="active"))
        .scalars()
        .first()
    )

    if active_subscription:
        subscription = {
            "period": active_subscription.plan_id,
            "periodLabel": active_subscription.period_label,
            "price": active_subscription.price,
            "renewsAt": active_subscription.renews_at,
            "summary": active_subscription.summary,
        }
        subscription_row_sub = f"Premium · продлится {active_subscription.renews_at}"
    else:
        week_plan = db.session.get(SubscriptionPlan, "week")
        subscription = None
        subscription_row_sub = f"Базовый доступ · {week_plan.price if week_plan else ''} / неделя"

    return jsonify(
        {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "grade": user.grade,
            "avatarUrl": profile.avatar_url,
            "level": profile.level,
            "xp": profile.xp,
            "xpToNextLevel": profile.xp_to_next_level,
            "matchesCount": profile.matches_count,
            "rating": profile.rating,
            "plan": profile.plan,
            "subscription": subscription,
            "subscriptionRowSub": subscription_row_sub,
            "analysis": {
                "country": profile.analysis_country or "",
                "sinceLabel": profile.analysis_since_label or "",
            },
            "dashboardStats": [
                {"v": str(profile.rating), "k": "рейтинг"},
                {"v": "12/12", "k": "полей"},
                {"v": profile.analysis_country or "", "k": "страна подбора"},
            ],
        }
    )
