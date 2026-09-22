from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import NotFound

from app.extensions import db
from app.models import Profile, Subscription, SubscriptionPlan
from app.schemas.subscription import SubscribeSchema
from app.services.payments.router import get_payment_provider

subscription_bp = Blueprint("subscription", __name__, url_prefix="/subscription")

subscribe_schema = SubscribeSchema()


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

    result = get_payment_provider().charge(
        plan_id=plan.id, period=plan.period, price=plan.price, payment_method=data["paymentMethod"]
    )
    if result.status != "success":
        return jsonify({"status": "failed", "subscription": None}), 402

    previous_active = (
        db.session.execute(db.select(Subscription).filter_by(user_id=user_id, status="active"))
        .scalars()
        .all()
    )
    for sub in previous_active:
        sub.status = "canceled"

    db.session.add(
        Subscription(
            user_id=user_id,
            plan_id=plan.id,
            status="active",
            period_label=plan.period,
            price=plan.price,
            renews_at=result.renews_at,
            summary=result.summary,
        )
    )
    profile.plan = "premium"
    db.session.commit()

    return jsonify(
        {"status": "success", "subscription": {"period": plan.period, "renewsAt": result.renews_at}}
    )
