from app.extensions import db
from app.models import Profile

SIGNUP_BODY = {
    "email": "cards@mail.kz",
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


class FakeProvider:
    def __init__(self, raw: str):
        self.raw = raw
        self.vision_calls: list[list] = []

    def generate_text(self, *, system, prompt, max_tokens=4096):
        return self.raw

    def generate_vision(self, *, system, prompt, images, max_tokens=4096):
        self.vision_calls.append(images)
        return self.raw


GOOD_RAW = (
    '{"title":"Квадратные уравнения",'
    '"cards":[{"question":"Что такое дискриминант?","answer":"D = b^2 - 4ac"},'
    '{"question":"Формула корней?","answer":"x = (-b ± √D) / 2a"}]}'
)


def test_create_deck_generates_cards(client, monkeypatch):
    token, _ = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.flashcards.get_provider", lambda feature: FakeProvider(GOOD_RAW)
    )

    res = client.post(
        "/api/v1/flashcards",
        json={"source": "text", "text": "не понимаю квадратные уравнения"},
        headers=_auth(token),
    )

    assert res.status_code == 201
    body = res.get_json()
    assert body["title"] == "Квадратные уравнения"
    assert body["cardsTotal"] == 2
    assert body["cardsRemaining"] == 2
    assert len(body["cards"]) == 2


def test_create_deck_without_text_is_bad_request(client):
    token, _ = _signup(client)

    res = client.post("/api/v1/flashcards", json={"source": "image"}, headers=_auth(token))

    assert res.status_code == 400


def test_create_deck_from_images_uses_vision(client, monkeypatch):
    import io

    token, _ = _signup(client)
    fake = FakeProvider(GOOD_RAW)
    monkeypatch.setattr("app.api.v1.flashcards.get_provider", lambda feature: fake)

    res = client.post(
        "/api/v1/flashcards",
        data={
            "source": "image",
            "images": [
                (io.BytesIO(b"\xff\xd8\xff\xe0fake-jpeg"), "note1.jpg"),
                (io.BytesIO(b"\xff\xd8\xff\xe0fake-jpeg-2"), "note2.jpg"),
            ],
        },
        headers=_auth(token),
        content_type="multipart/form-data",
    )

    assert res.status_code == 201
    body = res.get_json()
    assert body["title"] == "Квадратные уравнения"
    assert len(fake.vision_calls) == 1
    assert len(fake.vision_calls[0]) == 2
    assert fake.vision_calls[0][0].media_type == "image/jpeg"


def test_create_deck_without_text_or_images_multipart_is_bad_request(client):
    token, _ = _signup(client)

    res = client.post(
        "/api/v1/flashcards",
        data={"source": "image"},
        headers=_auth(token),
        content_type="multipart/form-data",
    )

    assert res.status_code == 400


def test_create_deck_respects_free_quota(client, monkeypatch):
    token, _ = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.flashcards.get_provider", lambda feature: FakeProvider(GOOD_RAW)
    )

    first = client.post(
        "/api/v1/flashcards", json={"source": "text", "text": "тема 1"}, headers=_auth(token)
    )
    assert first.status_code == 201

    second = client.post(
        "/api/v1/flashcards", json={"source": "text", "text": "тема 2"}, headers=_auth(token)
    )
    assert second.status_code == 409


def test_delete_deck_frees_quota_slot(client, monkeypatch):
    token, _ = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.flashcards.get_provider", lambda feature: FakeProvider(GOOD_RAW)
    )

    deck = client.post(
        "/api/v1/flashcards", json={"source": "text", "text": "тема"}, headers=_auth(token)
    ).get_json()

    del_res = client.delete(f"/api/v1/flashcards/{deck['id']}", headers=_auth(token))
    assert del_res.status_code == 200
    assert del_res.get_json() == {"ok": True}

    second = client.post(
        "/api/v1/flashcards", json={"source": "text", "text": "тема 2"}, headers=_auth(token)
    )
    assert second.status_code == 201


def test_mark_last_card_known_awards_xp_and_logs(client, monkeypatch):
    token, user_id = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.flashcards.get_provider", lambda feature: FakeProvider(GOOD_RAW)
    )

    deck = client.post(
        "/api/v1/flashcards", json={"source": "text", "text": "тема"}, headers=_auth(token)
    ).get_json()
    card_ids = [c["id"] for c in deck["cards"]]

    first = client.patch(
        f"/api/v1/flashcards/{deck['id']}/cards/{card_ids[0]}", headers=_auth(token)
    )
    assert first.status_code == 200
    assert first.get_json()["xpAwarded"] == 0

    second = client.patch(
        f"/api/v1/flashcards/{deck['id']}/cards/{card_ids[1]}", headers=_auth(token)
    )
    assert second.status_code == 200
    body = second.get_json()
    assert body["xpAwarded"] == 30
    assert body["deck"]["cardsRemaining"] == 0

    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one()
    assert profile.xp == 30

    log = client.get("/api/v1/achievements/log", headers=_auth(token)).get_json()
    assert log["days"][0]["items"][0]["kind"] == "умные карточки"
