import datetime as dt

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.extensions import db


class SubscriptionPlan(db.Model):
    """Каталог тарифов — общие данные, не зависят от пользователя."""

    __tablename__ = "subscription_plans"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)  # "week" | "month"
    period: Mapped[str] = mapped_column(String(32), nullable=False)
    price: Mapped[str] = mapped_column(String(32), nullable=False)
    sub: Mapped[str] = mapped_column(String(255), default="")  # подпись под ценой
    best: Mapped[bool] = mapped_column(Boolean, default=False)  # выделенный тариф на PAYWALL
    # Числовая цена в тенге — для сравнения тарифов (запрет даунгрейда,
    # `POST /subscription/subscribe`), `price` остаётся строкой для показа.
    amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class Subscription(db.Model):
    """Подписка конкретного пользователя (текущая/прошлая)."""

    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    plan_id: Mapped[str] = mapped_column(ForeignKey("subscription_plans.id"), nullable=False)

    status: Mapped[str] = mapped_column(String(16), default="active")  # active|expired|canceled
    period_label: Mapped[str] = mapped_column(String(64), default="")
    price: Mapped[str] = mapped_column(String(32), default="")
    renews_at: Mapped[str | None] = mapped_column(String(64))
    # Настоящая дата окончания периода — `renews_at` только человекочитаемая
    # подпись. Нужна, чтобы сравнивать «подписка ещё действует» (запрет
    # даунгрейда, ленивое истечение в `services/subscriptions.py`).
    ends_at: Mapped[dt.datetime | None] = mapped_column(DateTime(timezone=True))
    # Отмена = выключить автопродление, доступ остаётся до `ends_at` (как у
    # настоящих провайдеров) — `status` при этом остаётся "active" до
    # ленивого истечения, `POST /subscription/cancel` только ставит флаг.
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False)
    summary: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
