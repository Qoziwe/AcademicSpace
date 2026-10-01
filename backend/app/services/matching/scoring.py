"""Чистая математика подбора — без обращений к БД, чтобы быть
тривиально тестируемой на синтетических профилях (`tests/test_matching.py`).
"""

import math
from dataclasses import dataclass

from app.services.matching import config
from app.services.matching.normalize import exam_index, gpa_index, language_index


@dataclass(frozen=True)
class StudentProfile:
    gpa_percent: float
    exam_score: float
    language_test: str
    language_score: float | None
    interests: list[str]
    achievements_count: int = 0


@dataclass(frozen=True)
class UniversityRequirements:
    faculties: list[str]
    languages_offered: list[str]
    tuition_eur_per_year: int
    selectivity_tier: int
    required_gpa_index: int
    required_profile_score_index: int
    required_language_index: int


@dataclass(frozen=True)
class FitResult:
    score: int
    category: str | None  # "safety"|"match"|"reach"|None (None → не показываем)
    chance_label: str


def sub_score(delta: float) -> float:
    """Логистическая кривая: delta=0 (ровно на уровне требования) → 50.

    Положительный запас плавно тянет к 100, недобор — к 0, без жёсткого
    обрыва на пороге (который давал бы ложную уверенность у границы).
    """
    return 100.0 / (1.0 + math.exp(-config.LOGISTIC_K * delta / 10.0))


def student_composite_index(student: StudentProfile) -> float:
    """Общий «рейтинг абитуриента» — тот же взвешенный индекс, что и в
    fit-score, но сам по себе, без сравнения с конкретным вузом
    (`Profile.rating` на дашборде/результатах).
    """
    return (
        config.WEIGHT_GPA * gpa_index(student.gpa_percent)
        + config.WEIGHT_EXAM * exam_index(student.exam_score)
        + config.WEIGHT_LANGUAGE * language_index(student.language_test, student.language_score)
    )


def _bucket_thresholds(selectivity_tier: int) -> tuple[float, float, float]:
    shift = (config.SELECTIVITY_NEUTRAL_TIER - selectivity_tier) * config.SELECTIVITY_SHIFT_PER_TIER
    return (
        config.SAFETY_MIN + shift,
        config.MATCH_MIN + shift,
        config.REACH_MIN + shift,
    )


def compute_fit(student: StudentProfile, university: UniversityRequirements) -> FitResult:
    gpa_delta = gpa_index(student.gpa_percent) - university.required_gpa_index
    exam_delta = exam_index(student.exam_score) - university.required_profile_score_index
    lang_delta = (
        language_index(student.language_test, student.language_score)
        - university.required_language_index
    )

    weighted = (
        config.WEIGHT_GPA * sub_score(gpa_delta)
        + config.WEIGHT_EXAM * sub_score(exam_delta)
        + config.WEIGHT_LANGUAGE * sub_score(lang_delta)
    )

    interest_bonus = (
        config.INTEREST_BONUS if set(student.interests) & set(university.faculties) else 0.0
    )
    achievement_bonus = min(
        student.achievements_count * config.ACHIEVEMENT_BONUS_PER_ITEM,
        config.ACHIEVEMENT_BONUS_CAP,
    )

    score = round(max(0.0, min(100.0, weighted + interest_bonus + achievement_bonus)))

    safety_min, match_min, reach_min = _bucket_thresholds(university.selectivity_tier)
    if score >= safety_min:
        category = "safety"
    elif score >= match_min:
        category = "match"
    elif score >= reach_min:
        category = "reach"
    else:
        category = None

    chance = max(config.CHANCE_MIN_DISPLAY, min(config.CHANCE_MAX_DISPLAY, score))
    return FitResult(score=score, category=category, chance_label=f"{chance}%")
