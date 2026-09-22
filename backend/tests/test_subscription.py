from app.extensions import db
from app.models import SubscriptionPlan

SIGNUP_BODY = {
    "email": "sub@mail.kz",
    "password": "password123",
    "name": "Дана",
    "grade": "9 класс",
}


def _signup(client) -> str:
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    return res.get_json()["token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _seed_plans() -> None:
    db.session.add(
        SubscriptionPlan(id="week", period="Неделя", price="500 тг", sub="попробовать", best=False)
    )
    db.session.add(
        SubscriptionPlan(
            id="month", period="Месяц", price="1 900 тг", sub="≈ 63 тг в день", best=True
        )
    )
    db.session.commit()


def test_get_plans(client):
    token = _signup(client)
    _seed_plans()

    res = client.get("/api/v1/subscription/plans", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert {p["id"] for p in body} == {"week", "month"}
    assert next(p for p in body if p["id"] == "month")["best"] is True


def test_subscribe_activates_premium(client):
    token = _signup(client)
    _seed_plans()

    res = client.post(
        "/api/v1/subscription/subscribe", json={"planId": "month"}, headers=_auth(token)
    )

    assert res.status_code == 200
    body = res.get_json()
    assert body["status"] == "success"
    assert body["subscription"]["period"] == "Месяц"
    assert body["subscription"]["renewsAt"]

    profile_res = client.get("/api/v1/profile/me", headers=_auth(token))
    assert profile_res.get_json()["plan"] == "premium"


def test_subscribe_with_unknown_plan_is_rejected(client):
    token = _signup(client)
    _seed_plans()

    res = client.post(
        "/api/v1/subscription/subscribe", json={"planId": "year"}, headers=_auth(token)
    )

    assert res.status_code == 400
