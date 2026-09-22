SIGNUP_BODY = {
    "email": "quest@mail.kz",
    "password": "password123",
    "name": "Дана",
    "grade": "9 класс",
}


def _signup_token(client) -> str:
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    return res.get_json()["token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_get_questionnaire_requires_auth(client):
    res = client.get("/api/v1/questionnaire")

    assert res.status_code == 401


def test_get_questionnaire_creates_empty_record(client):
    token = _signup_token(client)

    res = client.get("/api/v1/questionnaire", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["filled"] is False
    assert body["interests"] == []
    assert len(body["groups"]) == 2


def test_submit_questionnaire_marks_filled_and_saves_interests(client):
    token = _signup_token(client)

    res = client.post(
        "/api/v1/questionnaire",
        json={"interests": ["Инженерия", "Технологии"]},
        headers=_auth(token),
    )

    assert res.status_code == 200
    assert res.get_json()["filled"] is True

    status = client.get("/api/v1/questionnaire", headers=_auth(token)).get_json()
    assert status["filled"] is True
    assert status["interests"] == ["Инженерия", "Технологии"]
