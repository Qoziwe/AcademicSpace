"""Перевод разнородных входных шкал в единый индекс 0–100, сравнимый
напрямую с `University.required_*_index`.
"""

from app.services.matching.config import LANGUAGE_SCALES


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def gpa_index(gpa_percent: float) -> float:
    """GPA уже собирается анкетой в процентах (0–100) — конвертация не нужна."""
    return clamp(gpa_percent)


def exam_index(exam_score: float) -> float:
    """Балл профильного экзамена уже собирается анкетой в шкале 0–100."""
    return clamp(exam_score)


def language_index(test: str, score: float | None) -> float:
    """IELTS/TOEFL/Duolingo → 0–100 по known-точкам шкалы теста.

    `score=None` или тест "Не сдавал" → честный 0 (нет подтверждённого
    уровня языка), не нейтральные 50 — иначе бы отсутствие данных
    маскировалось под "средний" результат.
    """
    if score is None or test not in LANGUAGE_SCALES:
        return 0.0

    low, high = LANGUAGE_SCALES[test]
    if high <= low:
        return 0.0
    return clamp((score - low) / (high - low) * 100)
