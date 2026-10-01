from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class University(db.Model):
    """Каталог вузов — общие данные, не зависят от пользователя.

    Поля `required_*_index`/`selectivity_tier`/`tuition_eur_per_year` —
    вход алгоритма подбора (`app/services/matching`), не используются для
    отображения напрямую (для карточки вуза есть `stats`/`rows`).
    """

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

    # ── вход алгоритма подбора (`app/services/matching`) ──────────────────
    country: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    # подмножество FILTER_STEPS[faculty].options[].title на фронте
    faculties: Mapped[list] = mapped_column(JSON, default=list)
    # подмножество FILTER_STEPS[language].options[].title на фронте
    languages_offered: Mapped[list] = mapped_column(JSON, default=list)
    tuition_eur_per_year: Mapped[int] = mapped_column(Integer, default=0)
    scholarship_coverage_pct: Mapped[int | None] = mapped_column(Integer)
    # 1 (очень избирательный) … 5 (легко поступить) — сдвигает пороги
    # safety/match/reach именно для этого вуза
    selectivity_tier: Mapped[int] = mapped_column(Integer, default=3)
    # требования вуза уже в индексе 0–100, сравнимом напрямую со входом
    # анкеты (`Questionnaire.academics`) — без мультишкальной конвертации
    required_gpa_index: Mapped[int] = mapped_column(Integer, default=50)
    required_profile_score_index: Mapped[int] = mapped_column(Integer, default=50)
    required_language_index: Mapped[int] = mapped_column(Integer, default=50)


class UniversityMatch(db.Model):
    """Результат подбора для конкретного пользователя (safety/match/reach)."""

    __tablename__ = "university_matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    university_id: Mapped[int] = mapped_column(ForeignKey("universities.id"), nullable=False)

    category: Mapped[str] = mapped_column(String(16), nullable=False)  # safety|match|reach
    chance: Mapped[str] = mapped_column(String(16), nullable=False)  # "92%"
    tags: Mapped[list] = mapped_column(JSON, default=list)
