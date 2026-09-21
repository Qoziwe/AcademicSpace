from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Profile(db.Model):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    avatar_url: Mapped[str | None] = mapped_column(String(512))
    level: Mapped[int] = mapped_column(default=1)
    xp: Mapped[int] = mapped_column(default=0)
    xp_to_next_level: Mapped[int] = mapped_column(default=1000)
    matches_count: Mapped[int] = mapped_column(default=0)
    rating: Mapped[int] = mapped_column(default=0)
    plan: Mapped[str] = mapped_column(String(16), default="free")

    # подпись зоны анализа на дашборде: {country, sinceLabel}
    analysis_country: Mapped[str | None] = mapped_column(String(255))
    analysis_since_label: Mapped[str | None] = mapped_column(String(64))
    subscription_row_sub: Mapped[str | None] = mapped_column(String(255))
