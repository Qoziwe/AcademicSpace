"""Оркестрация подбора: читает анкету + каталог вузов, пересчитывает
`UniversityMatch` (кэш результата, не источник правды) и агрегаты профиля
(`rating`, `matchesCount`, зона анализа).

Вызывается из `POST /questionnaire` при каждом сабмите — каталог
небольшой (десятки вузов на страну), полный синхронный пересчёт в
хендлере дешевле, чем городить очередь/фоновую задачу.
"""

import datetime as dt

from app.extensions import db
from app.models import Profile, Questionnaire, University, UniversityMatch
from app.services.matching.scoring import (
    StudentProfile,
    UniversityRequirements,
    compute_fit,
    student_composite_index,
)
from app.utils import ru_date


def _format_eur(amount: int) -> str:
    return f"{amount:,}".replace(",", " ")


def _build_tags(uni: University) -> list[str]:
    tags = [f"{_format_eur(uni.tuition_eur_per_year)} €/год"]
    if uni.scholarship_coverage_pct:
        tags.append(f"стипендия до {uni.scholarship_coverage_pct}%")
    ielts_equivalent = round(uni.required_language_index / 100 * 9 * 2) / 2
    tags.append(f"IELTS {ielts_equivalent:g}")
    return tags


def _candidate_universities(
    country: str, faculty: str, language: str, budget_max_eur: float | None
) -> list[University]:
    query = db.select(University).filter_by(country=country)
    universities = db.session.execute(query).scalars().all()

    def matches(uni: University) -> bool:
        if faculty and faculty not in uni.faculties:
            return False
        if language and language not in uni.languages_offered:
            return False
        if budget_max_eur is not None and uni.tuition_eur_per_year > budget_max_eur:
            return False
        return True

    return [uni for uni in universities if matches(uni)]


def rebuild_matches_for_user(user_id: int) -> int:
    """Пересчитывает подборку пользователя. Возвращает число найденных вузов.

    Без страны в предпочтениях считать нечего (анкета ещё не прошла шаг
    фильтров до конца) — очищает старую подборку и выходит.
    """
    questionnaire = db.session.execute(
        db.select(Questionnaire).filter_by(user_id=user_id)
    ).scalar_one_or_none()
    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    if questionnaire is None or profile is None:
        return 0

    db.session.execute(db.delete(UniversityMatch).filter_by(user_id=user_id))

    academics = questionnaire.academics or {}
    preferences = questionnaire.preferences or {}
    country = preferences.get("country") or ""

    if not academics or not country:
        profile.matches_count = 0
        db.session.commit()
        return 0

    student = StudentProfile(
        gpa_percent=float(academics.get("gpaPercent") or 0),
        exam_score=float(academics.get("examScore") or 0),
        language_test=academics.get("languageTest") or "Не сдавал",
        language_score=academics.get("languageScore"),
        interests=questionnaire.interests or [],
        achievements_count=int(academics.get("achievementsCount") or 0),
    )

    candidates = _candidate_universities(
        country=country,
        faculty=preferences.get("faculty") or "",
        language=preferences.get("language") or "",
        budget_max_eur=preferences.get("costMaxEur"),
    )

    found = 0
    for uni in candidates:
        requirements = UniversityRequirements(
            faculties=uni.faculties,
            languages_offered=uni.languages_offered,
            tuition_eur_per_year=uni.tuition_eur_per_year,
            selectivity_tier=uni.selectivity_tier,
            required_gpa_index=uni.required_gpa_index,
            required_profile_score_index=uni.required_profile_score_index,
            required_language_index=uni.required_language_index,
        )
        result = compute_fit(student, requirements)
        if result.category is None:
            continue

        db.session.add(
            UniversityMatch(
                user_id=user_id,
                university_id=uni.id,
                category=result.category,
                chance=result.chance_label,
                tags=_build_tags(uni),
            )
        )
        found += 1

    profile.matches_count = found
    profile.rating = round(student_composite_index(student))
    profile.analysis_country = country
    profile.analysis_since_label = ru_date(dt.date.today())
    db.session.commit()
    return found
