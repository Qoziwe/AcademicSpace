"""Интеграция: анкета → пересчёт `UniversityMatch` → `/universities/search`."""

from app.extensions import db
from app.models import Profile, University

SIGNUP_BODY = {
    "email": "match@mail.kz",
    "password": "password123",
    "name": "Дана",
    "grade": "11 класс",
}


def _signup(client) -> str:
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    return res.get_json()["token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _seed_catalog() -> None:
    db.session.add_all(
        [
            University(
                name="Safe State University",
                city="Город A",
                country="Италия",
                faculties=["Инженерия"],
                languages_offered=["Английский"],
                tuition_eur_per_year=2000,
                selectivity_tier=5,
                required_gpa_index=40,
                required_profile_score_index=40,
                required_language_index=40,
            ),
            University(
                name="Elite Institute of Technology",
                city="Город B",
                country="Италия",
                faculties=["Инженерия"],
                languages_offered=["Английский"],
                tuition_eur_per_year=9000,
                selectivity_tier=1,
                required_gpa_index=95,
                required_profile_score_index=95,
                required_language_index=90,
            ),
            University(
                name="Другой факультет",
                city="Город C",
                country="Италия",
                faculties=["Экономика"],
                languages_offered=["Английский"],
                tuition_eur_per_year=2500,
                selectivity_tier=3,
                required_gpa_index=50,
                required_profile_score_index=50,
                required_language_index=50,
            ),
            University(
                name="Вуз не в той стране",
                city="Город D",
                country="Германия",
                faculties=["Инженерия"],
                languages_offered=["Английский"],
                tuition_eur_per_year=1000,
                selectivity_tier=5,
                required_gpa_index=30,
                required_profile_score_index=30,
                required_language_index=30,
            ),
        ]
    )
    db.session.commit()


STRONG_ACADEMICS = {
    "gpaPercent": 90,
    "examSubject": "Математика",
    "examScore": 90,
    "languageTest": "IELTS",
    "languageScore": 8.0,
    "achievementsCount": 2,
}


def test_submit_questionnaire_computes_real_matches(client):
    token = _signup(client)
    _seed_catalog()

    res = client.post(
        "/api/v1/questionnaire",
        json={
            "interests": ["Инженерия"],
            "academics": STRONG_ACADEMICS,
            "preferences": {
                "country": "Италия",
                "universities": [],
                "faculty": "Инженерия",
                "language": "Английский",
                "cost": "без ограничений",
            },
        },
        headers=_auth(token),
    )

    assert res.status_code == 200
    body = res.get_json()
    assert body["filled"] is True
    # 2 из 4 засеянных вузов подходят по стране+факультету (Elite и Safe),
    # "Другой факультет" отсекается фильтром факультета, немецкий — страной.
    assert body["matchesCount"] == 2

    search = client.post("/api/v1/universities/search", headers=_auth(token)).get_json()
    by_name = {
        item["name"]: group["category"] for group in search["groups"] for item in group["items"]
    }
    assert by_name["Safe State University"] == "safety"
    assert by_name["Elite Institute of Technology"] in {"match", "reach"}
    assert "Другой факультет" not in by_name

    profile_res = client.get("/api/v1/profile/me", headers=_auth(token)).get_json()
    assert profile_res["matchesCount"] == 2
    assert profile_res["rating"] > 0
    assert profile_res["analysis"]["country"] == "Италия"


def test_submit_without_country_clears_matches(client):
    token = _signup(client)
    _seed_catalog()

    client.post(
        "/api/v1/questionnaire",
        json={
            "interests": [],
            "academics": STRONG_ACADEMICS,
            "preferences": {"country": "Италия", "faculty": "Инженерия", "language": "Английский"},
        },
        headers=_auth(token),
    )

    res = client.post(
        "/api/v1/questionnaire",
        json={"interests": [], "academics": STRONG_ACADEMICS, "preferences": {}},
        headers=_auth(token),
    )

    assert res.get_json()["matchesCount"] == 0
    search = client.post("/api/v1/universities/search", headers=_auth(token)).get_json()
    assert all(group["items"] == [] for group in search["groups"])


def test_weak_student_excluded_from_elite_university(client):
    token = _signup(client)
    _seed_catalog()

    client.post(
        "/api/v1/questionnaire",
        json={
            "interests": [],
            "academics": {
                "gpaPercent": 35,
                "examSubject": "Математика",
                "examScore": 35,
                "languageTest": "Не сдавал",
                "languageScore": None,
                "achievementsCount": 0,
            },
            "preferences": {"country": "Италия", "faculty": "Инженерия", "language": "Английский"},
        },
        headers=_auth(token),
    )

    profile = db.session.execute(db.select(Profile)).scalar_one()
    assert profile.matches_count <= 1
