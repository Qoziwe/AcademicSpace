"""Чистая математика подбора — синтетические профили, без БД."""

from app.services.matching import config
from app.services.matching.normalize import gpa_index, language_index
from app.services.matching.scoring import (
    StudentProfile,
    UniversityRequirements,
    compute_fit,
    sub_score,
)

NEUTRAL_UNI = UniversityRequirements(
    faculties=["Инженерия"],
    languages_offered=["Английский"],
    tuition_eur_per_year=3000,
    selectivity_tier=3,
    required_gpa_index=70,
    required_profile_score_index=70,
    required_language_index=70,
)


def _student(**overrides) -> StudentProfile:
    base = dict(
        gpa_percent=70,
        exam_score=70,
        language_test="IELTS",
        language_score=6.0,
        interests=[],
        achievements_count=0,
    )
    base.update(overrides)
    return StudentProfile(**base)


def test_weights_sum_to_one():
    assert config.WEIGHT_GPA + config.WEIGHT_EXAM + config.WEIGHT_LANGUAGE == 1.0


def test_sub_score_at_zero_delta_is_fifty():
    assert sub_score(0) == 50.0


def test_sub_score_monotonic_in_delta():
    assert sub_score(-20) < sub_score(-5) < sub_score(0) < sub_score(5) < sub_score(20)


def test_meeting_average_exactly_is_reach_not_safety():
    # Студент ровно на среднем уровне поступивших — это "можно дотянуться",
    # а не гарантия и не комфортный запас.
    result = compute_fit(_student(), NEUTRAL_UNI)
    assert result.category == "reach"


def test_strong_student_is_safety():
    student = _student(gpa_percent=95, exam_score=95, language_score=8.5)
    result = compute_fit(student, NEUTRAL_UNI)
    assert result.category == "safety"
    assert result.score >= 80


def test_weak_student_is_excluded():
    student = _student(
        gpa_percent=20, exam_score=20, language_test="Не сдавал", language_score=None
    )
    result = compute_fit(student, NEUTRAL_UNI)
    assert result.category is None


def test_no_language_evidence_is_treated_as_zero():
    assert language_index("Не сдавал", None) == 0.0
    assert language_index("IELTS", None) == 0.0


def test_gpa_improvement_never_worsens_category():
    categories = {"safety": 3, "match": 2, "reach": 1, None: 0}
    weak = compute_fit(_student(gpa_percent=50), NEUTRAL_UNI)
    strong = compute_fit(_student(gpa_percent=90), NEUTRAL_UNI)
    assert categories[strong.category] >= categories[weak.category]
    assert strong.score >= weak.score


def test_more_selective_tier_is_harder_to_classify_as_safety():
    elite = UniversityRequirements(**{**NEUTRAL_UNI.__dict__, "selectivity_tier": 1})
    easy = UniversityRequirements(**{**NEUTRAL_UNI.__dict__, "selectivity_tier": 5})
    student = _student(gpa_percent=85, exam_score=85, language_score=7.5)

    elite_result = compute_fit(student, elite)
    easy_result = compute_fit(student, easy)

    categories = {"safety": 3, "match": 2, "reach": 1, None: 0}
    assert categories[easy_result.category] >= categories[elite_result.category]


def test_interest_bonus_applies_when_faculty_matches():
    student_with_interest = _student(interests=["Инженерия"])
    student_without = _student(interests=["Экономика"])

    with_bonus = compute_fit(student_with_interest, NEUTRAL_UNI)
    without_bonus = compute_fit(student_without, NEUTRAL_UNI)

    assert with_bonus.score > without_bonus.score


def test_gpa_index_clamps_to_0_100():
    assert gpa_index(150) == 100
    assert gpa_index(-10) == 0
