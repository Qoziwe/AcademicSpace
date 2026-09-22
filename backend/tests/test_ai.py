from app.extensions import db

SIGNUP_BODY = {
    "email": "ai@mail.kz",
    "password": "password123",
    "name": "Дана",
    "grade": "9 класс",
}


def _signup(client) -> str:
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    return res.get_json()["token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class FakeProvider:
    def __init__(self, text: str):
        self.text = text
        self.calls: list[str] = []

    def generate_text(self, *, system, prompt, max_tokens=4096):
        self.calls.append(prompt)
        return self.text

    def generate_vision(self, *, system, prompt, images, max_tokens=4096):
        return self.text


class SyncThread:
    """Заменяет `threading.Thread` в тестах — запускает target синхронно,
    чтобы не ждать реальный фоновый поток."""

    def __init__(self, target, args=(), daemon=None):
        self._target = target
        self._args = args

    def start(self):
        self._target(*self._args)


def test_chat_meta_returns_quick_prompts(client):
    token = _signup(client)

    res = client.get("/api/v1/ai/chat/meta", headers=_auth(token))

    assert res.status_code == 200
    assert len(res.get_json()["quickPrompts"]) > 0


def test_chat_message_persists_and_parses_module_suggestion(client, monkeypatch):
    token = _signup(client)
    raw = (
        "Отличная идея, давайте составим план.\n"
        '<<MODULE>>{"title":"IELTS","sub":"8 недель",'
        '"description":"План подготовки"}<<END>>'
    )
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: FakeProvider(raw))

    res = client.post(
        "/api/v1/ai/chat/messages", json={"text": "Помоги с IELTS"}, headers=_auth(token)
    )

    assert res.status_code == 200
    body = res.get_json()
    assert body["reply"]["text"] == "Отличная идея, давайте составим план."
    assert body["reply"]["module"] == {
        "title": "IELTS",
        "sub": "8 недель",
        "desc": "План подготовки",
        "created": False,
    }


def test_chat_message_without_module_marker(client, monkeypatch):
    token = _signup(client)
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: FakeProvider("Просто ответ."))

    res = client.post("/api/v1/ai/chat/messages", json={"text": "Привет"}, headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["reply"]["text"] == "Просто ответ."
    assert body["reply"]["module"] is None


def test_chat_message_requires_text(client):
    token = _signup(client)

    res = client.post("/api/v1/ai/chat/messages", json={}, headers=_auth(token))

    assert res.status_code == 400


def test_portfolio_analysis_processing_then_ready(client, monkeypatch):
    token = _signup(client)
    raw = '{"previewBlocks":[{"title":"Сильные стороны","text":"x"}],"fullText":"полный текст"}'
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: FakeProvider(raw))
    monkeypatch.setattr("app.api.v1.ai.threading.Thread", SyncThread)

    start_res = client.post("/api/v1/ai/portfolio", json={}, headers=_auth(token))
    assert start_res.status_code == 200
    analysis_id = start_res.get_json()["analysisId"]
    # SyncThread уже отработал синхронно к этому моменту.

    res = client.get(f"/api/v1/ai/analysis/{analysis_id}", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["status"] == "ready"
    assert body["previewBlocks"] == [{"title": "Сильные стороны", "text": "x"}]
    assert body["fullText"] == "полный текст"


def test_portfolio_analysis_provider_failure_resolves_gracefully(client, monkeypatch):
    token = _signup(client)

    class BrokenProvider:
        def generate_text(self, **kwargs):
            raise RuntimeError("boom")

    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: BrokenProvider())
    monkeypatch.setattr("app.api.v1.ai.threading.Thread", SyncThread)

    start_res = client.post("/api/v1/ai/portfolio", json={}, headers=_auth(token))
    analysis_id = start_res.get_json()["analysisId"]
    # Тестовая `app`-фикстура держит один app_context на весь тест, поэтому
    # POST и GET делят одну ORM-сессию — без expire_all() GET увидит
    # закешированный до фонового потока объект, а не то, что реально в БД
    # (в проде у каждого запроса свой контекст, этой проблемы нет).
    db.session.expire_all()

    res = client.get(f"/api/v1/ai/analysis/{analysis_id}", headers=_auth(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["status"] == "ready"
    assert body["previewBlocks"]


def test_analysis_404_for_other_user(client, monkeypatch):
    token = _signup(client)
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: FakeProvider("{}"))
    monkeypatch.setattr("app.api.v1.ai.threading.Thread", SyncThread)
    start_res = client.post("/api/v1/ai/portfolio", json={}, headers=_auth(token))
    analysis_id = start_res.get_json()["analysisId"]

    other_res = client.post(
        "/api/v1/auth/signup",
        json={"email": "other@mail.kz", "password": "password123", "name": "X", "grade": "9"},
    )
    other_token = other_res.get_json()["token"]

    res = client.get(f"/api/v1/ai/analysis/{analysis_id}", headers=_auth(other_token))
    assert res.status_code == 404


def test_portfolio_prompt_includes_questionnaire_and_matches(client, monkeypatch):
    token = _signup(client)
    fake = FakeProvider('{"previewBlocks":[],"fullText":""}')
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: fake)
    monkeypatch.setattr("app.api.v1.ai.threading.Thread", SyncThread)

    client.post("/api/v1/questionnaire", json={"interests": ["Физика"]}, headers=_auth(token))
    client.post("/api/v1/ai/portfolio", json={"resume": "Мой резюме-текст"}, headers=_auth(token))

    assert len(fake.calls) == 1
    assert "Физика" in fake.calls[0]
    assert "Мой резюме-текст" in fake.calls[0]
