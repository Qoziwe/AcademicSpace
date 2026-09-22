from app.extensions import db
from app.models import Profile, Task, TaskItem

SIGNUP_BODY = {
    "email": "tasks@mail.kz",
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


def _seed_task(user_id: int, item_count: int = 2) -> Task:
    task = Task(user_id=user_id, kind="ЧЕК-ЛИСТ", title="Мотивационное письмо", xp=80)
    db.session.add(task)
    db.session.flush()
    for i in range(item_count):
        db.session.add(TaskItem(task_id=task.id, label=f"Пункт {i}", done=False, position=i))
    db.session.commit()
    return task


def test_toggle_item_without_completing(client):
    token, user_id = _signup(client)
    task = _seed_task(user_id)

    res = client.patch(f"/api/v1/tasks/{task.id}/items/0", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["completed"] is False
    assert body["xpAwarded"] == 0
    assert body["task"]["items"][0]["done"] is True
    assert body["task"]["items"][1]["done"] is False


def test_completing_all_items_awards_xp_and_logs_achievement(client):
    token, user_id = _signup(client)
    task = _seed_task(user_id, item_count=1)

    res = client.patch(f"/api/v1/tasks/{task.id}/items/0", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["completed"] is True
    assert body["xpAwarded"] == 80
    assert body["task"] is None

    assert client.get(f"/api/v1/tasks/{task.id}", headers=_auth(token)).status_code == 404

    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one()
    assert profile.xp == 80

    log = client.get("/api/v1/achievements/log", headers=_auth(token)).get_json()
    assert log["totalXp"] == 80
    assert log["days"][0]["items"][0]["title"] == "Мотивационное письмо"
    assert log["days"][0]["items"][0]["kind"] == "чек-лист"
    assert log["days"][0]["items"][0]["dot"] == "green"
