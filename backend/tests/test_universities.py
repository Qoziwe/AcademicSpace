from app.extensions import db
from app.models import Profile, University, UniversityMatch

SIGNUP_BODY = {
    "email": "uni@mail.kz",
    "password": "password123",
    "name": "Дана",
    "grade": "9 класс",
}


def _signup(client) -> tuple[str, int]:
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    body = res.get_json()
    return body["token"], int(body["user"]["id"])


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _seed_match(user_id: int, *, premium: bool = False) -> University:
    uni = University(
        name="Università di Bologna",
        city="Болонья",
        admissions_url="https://www.unibo.it",
        stats=[{"k": "вероятность", "v": "71%"}],
        rows=[{"k": "Язык", "v": "Английский"}],
        required_documents=["Аттестат"],
        documents_note="9 документов.",
    )
    db.session.add(uni)
    db.session.flush()
    db.session.add(
        UniversityMatch(
            user_id=user_id,
            university_id=uni.id,
            category="match",
            chance="71%",
            tags=["3 000 €/год"],
        )
    )
    if premium:
        profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one()
        profile.plan = "premium"
    db.session.commit()
    return uni


def test_search_groups_by_category(client):
    token, user_id = _signup(client)
    _seed_match(user_id)

    res = client.post("/api/v1/universities/search", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    groups = {g["category"]: g for g in body["groups"]}
    assert len(groups["match"]["items"]) == 1
    assert groups["match"]["items"][0]["name"] == "Università di Bologna"
    assert groups["safety"]["items"] == []


def test_university_detail_hides_documents_for_free(client):
    token, user_id = _signup(client)
    uni = _seed_match(user_id, premium=False)

    res = client.get(f"/api/v1/universities/{uni.id}", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["requiredDocuments"] is None
    assert "Premium" in body["documentsNote"]


def test_university_detail_shows_documents_for_premium(client):
    token, user_id = _signup(client)
    uni = _seed_match(user_id, premium=True)

    res = client.get(f"/api/v1/universities/{uni.id}", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["requiredDocuments"] == ["Аттестат"]
    assert body["documentsNote"] == "9 документов."


def test_university_detail_404_when_not_in_users_results(client):
    token, user_id = _signup(client)
    other_uni = University(name="Другой вуз", city="Город")
    db.session.add(other_uni)
    db.session.commit()

    res = client.get(f"/api/v1/universities/{other_uni.id}", headers=_auth(token))

    assert res.status_code == 404
