from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class University(db.Model):
    """Каталог вузов — общие данные, не зависят от пользователя."""

    __tablename__ = "universities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    admissions_url: Mapped[str | None] = mapped_column(String(512))

    # [{k, v}] — карточка вуза (UNIVERSITY_DETAILS)
    stats: Mapped[list] = mapped_column(JSON, default=list)
    rows: Mapped[list] = mapped_column(JSON, default=list)

    # null → тизер для Free (гейтится на уровне эндпоинта, не здесь)
    required_documents: Mapped[list | None] = mapped_column(JSON)
    documents_note: Mapped[str | None] = mapped_column(Text)


class UniversityMatch(db.Model):
    """Результат подбора для конкретного пользователя (safety/match/reach)."""

    __tablename__ = "university_matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"), nullable=False)

    category: Mapped[str] = mapped_column(String(16), nullable=False)  # safety|match|reach
    chance: Mapped[str] = mapped_column(String(16), nullable=False)  # "92%"
    tags: Mapped[list] = mapped_column(JSON, default=list)
