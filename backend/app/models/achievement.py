import datetime as dt

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.extensions import db


class AchievementLogEntry(db.Model):
    __tablename__ = "achievement_log_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    kind: Mapped[str] = mapped_column(String(255), nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    dot: Mapped[str] = mapped_column(String(16), nullable=False)  # blue|blueLight|green|gold|rose
    date: Mapped[dt.date] = mapped_column(Date, server_default=func.current_date())
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
