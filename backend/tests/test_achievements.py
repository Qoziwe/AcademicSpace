import datetime as dt

from app.extensions import db
from app.models import AchievementLogEntry

SIGNUP_BODY = {
    "email": "log@mail.kz",
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


def test_log_groups_entries_by_day_newest_first(client):
    token, user_id = _signup(client)
    today = dt.date.today()
    db.session.add(
        AchievementLogEntry(
            user_id=user_id,
            title="Старое",
            kind="достижение",
            xp=50,
            dot="gold",
            date=today - dt.timedelta(days=2),
        )
    )
    db.session.add(
        AchievementLogEntry(
            user_id=user_id, title="Новое", kind="таймер", xp=10, dot="blueLight", date=today
        )
    )
    db.session.commit()

    res = client.get("/api/v1/achievements/log", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["totalXp"] == 0
    assert len(body["days"]) == 2
    assert body["days"][0]["date"].startswith("сегодня")
    assert body["days"][0]["items"][0]["title"] == "Новое"
    assert not body["days"][1]["date"].startswith("сегодня")
