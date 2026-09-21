import datetime as dt

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.extensions import db


class Questionnaire(db.Model):
    __tablename__ = "questionnaires"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    filled: Mapped[bool] = mapped_column(Boolean, default=False)
    interests: Mapped[list] = mapped_column(JSON, default=list)
    academics: Mapped[dict] = mapped_column(JSON, default=dict)
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)

    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
