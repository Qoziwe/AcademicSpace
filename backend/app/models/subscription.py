import datetime as dt

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.extensions import db


class SubscriptionPlan(db.Model):
    """Каталог тарифов — общие данные, не зависят от пользователя."""

    __tablename__ = "subscription_plans"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)  # "week" | "month"
    period: Mapped[str] = mapped_column(String(32), nullable=False)
    price: Mapped[str] = mapped_column(String(32), nullable=False)
    label: Mapped[str] = mapped_column(String(255), default="")


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
    summary: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
