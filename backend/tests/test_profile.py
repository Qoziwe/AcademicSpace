SIGNUP_BODY = {
    "email": "profile@mail.kz",
    "password": "password123",
    "name": "Дана",
    "grade": "9 класс",
}


def _signup_token(client) -> str:
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    return res.get_json()["token"]


def test_profile_me_requires_auth(client):
    res = client.get("/api/v1/profile/me")

    assert res.status_code == 401


def test_profile_me_returns_fresh_profile(client):
    token = _signup_token(client)

    res = client.get("/api/v1/profile/me", headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 200
    body = res.get_json()
    assert body["name"] == "Дана"
    assert body["email"] == "profile@mail.kz"
    assert body["grade"] == "9 класс"
    assert body["plan"] == "free"
    assert body["level"] == 1
    assert body["xp"] == 0
    assert body["subscription"] is None
    assert body["subscriptionRowSub"]
    assert body["analysis"] == {"country": "", "sinceLabel": ""}
    assert len(body["dashboardStats"]) == 3
