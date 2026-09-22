import datetime as dt

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import NotFound

from app.extensions import db
from app.models import Profile, Subscription, SubscriptionPlan
from app.schemas.subscription import SubscribeSchema
from app.utils import ru_date

subscription_bp = Blueprint("subscription", __name__, url_prefix="/subscription")

subscribe_schema = SubscribeSchema()

# Мок-провайдер: `idle → processing → success` живёт на фронте через
# setTimeout (CLAUDE.md §11); бекенд сразу отвечает успехом. Формализуется в
# `app/services/payments/` в Фазе 8.7 — реальный провайдер ещё не выбран.
PLAN_DURATION_DAYS = {"week": 7, "month": 30}


@subscription_bp.get("/plans")
@jwt_required()
def get_plans():
    plans = db.session.execute(db.select(SubscriptionPlan)).scalars().all()
    return jsonify(
        [
            {"id": p.id, "period": p.period, "price": p.price, "sub": p.sub, "best": p.best}
            for p in plans
        ]
    )


@subscription_bp.post("/subscribe")
@jwt_required()
def subscribe():
    user_id = int(get_jwt_identity())
    data = subscribe_schema.load(request.get_json(silent=True) or {})

    plan = db.session.get(SubscriptionPlan, data["planId"])
    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    if plan is None or profile is None:
        raise NotFound("Тариф или профиль не найдены.")

    previous_active = (
        db.session.execute(db.select(Subscription).filter_by(user_id=user_id, status="active"))
        .scalars()
        .all()
    )
    for sub in previous_active:
        sub.status = "canceled"

    renews_at = ru_date(dt.date.today() + dt.timedelta(days=PLAN_DURATION_DAYS[plan.id]))
    db.session.add(
        Subscription(
            user_id=user_id,
            plan_id=plan.id,
            status="active",
            period_label=plan.period,
            price=plan.price,
            renews_at=renews_at,
            summary=f"{plan.period} · {plan.price}",
        )
    )
    profile.plan = "premium"
    db.session.commit()

    return jsonify(
        {"status": "success", "subscription": {"period": plan.period, "renewsAt": renews_at}}
    )
