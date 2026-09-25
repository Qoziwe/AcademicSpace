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
        '"description":"План подготовки","kind":"КАРТА",'
        '"items":["Пробный тест","Разбор ошибок"]}<<END>>'
    )
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: FakeProvider(raw))

    res = client.post(
        "/api/v1/ai/chat/messages", json={"text": "Помоги с IELTS"}, headers=_auth(token)
    )

    assert res.status_code == 200
    body = res.get_json()
    assert body["reply"]["id"]
    assert body["reply"]["text"] == "Отличная идея, давайте составим план."
    assert body["reply"]["module"] == {
        "title": "IELTS",
        "sub": "8 недель",
        "desc": "План подготовки",
        "kind": "КАРТА",
        "items": ["Пробный тест", "Разбор ошибок"],
        "created": False,
    }


def test_chat_message_module_defaults_kind_and_items_when_missing(client, monkeypatch):
    token = _signup(client)
    raw = (
        "Давайте так.\n"
        '<<MODULE>>{"title":"Эссе","sub":"черновик","description":"План письма"}<<END>>'
    )
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: FakeProvider(raw))

    res = client.post("/api/v1/ai/chat/messages", json={"text": "Помоги"}, headers=_auth(token))

    module = res.get_json()["reply"]["module"]
    assert module["kind"] == "КАРТА"
    assert module["items"] == ["Эссе"]


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


def test_create_chat_module_creates_task_and_awards_kind_xp(client, monkeypatch):
    token = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.ai.get_provider",
        lambda feature: FakeProvider(
            "План.\n"
            '<<MODULE>>{"title":"IELTS 6.5","sub":"8 недель","description":"План",'
            '"kind":"ЧЕК-ЛИСТ","items":["Пробный тест","Разбор ошибок"]}<<END>>'
        ),
    )
    msg_res = client.post(
        "/api/v1/ai/chat/messages", json={"text": "Помоги с IELTS"}, headers=_auth(token)
    )
    message_id = msg_res.get_json()["reply"]["id"]

    res = client.post(
        "/api/v1/ai/chat/modules", json={"messageId": message_id}, headers=_auth(token)
    )

    assert res.status_code == 200
    body = res.get_json()
    assert body["created"] is True
    assert body["task"]["kind"] == "ЧЕК-ЛИСТ"
    assert body["task"]["title"] == "IELTS 6.5"
    assert body["task"]["xp"] == 80
    assert body["task"]["isTimer"] is False
    assert [it["label"] for it in body["task"]["items"]] == ["Пробный тест", "Разбор ошибок"]

    tasks = client.get("/api/v1/tasks", headers=_auth(token)).get_json()
    assert any(t["title"] == "IELTS 6.5" for t in tasks)


def test_create_chat_module_timer_kind_sets_is_timer_and_xp(client, monkeypatch):
    token = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.ai.get_provider",
        lambda feature: FakeProvider(
            "Ок.\n"
            '<<MODULE>>{"title":"Фокус-сессия","sub":"25 минут","description":"Таймер",'
            '"kind":"ТАЙМЕР","items":["Настроить таймер"]}<<END>>'
        ),
    )
    message_id = client.post(
        "/api/v1/ai/chat/messages", json={"text": "Хочу сфокусироваться"}, headers=_auth(token)
    ).get_json()["reply"]["id"]

    res = client.post(
        "/api/v1/ai/chat/modules", json={"messageId": message_id}, headers=_auth(token)
    )

    body = res.get_json()["task"]
    assert body["isTimer"] is True
    assert body["xp"] == 40


def test_create_chat_module_twice_conflicts(client, monkeypatch):
    token = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.ai.get_provider",
        lambda feature: FakeProvider(
            'Ок.\n<<MODULE>>{"title":"Эссе","sub":"черновик","description":"План",'
            '"kind":"КАРТА","items":["Шаг 1"]}<<END>>'
        ),
    )
    message_id = client.post(
        "/api/v1/ai/chat/messages", json={"text": "Помоги с эссе"}, headers=_auth(token)
    ).get_json()["reply"]["id"]

    first = client.post(
        "/api/v1/ai/chat/modules", json={"messageId": message_id}, headers=_auth(token)
    )
    second = client.post(
        "/api/v1/ai/chat/modules", json={"messageId": message_id}, headers=_auth(token)
    )

    assert first.status_code == 200
    assert second.status_code == 409


def test_create_chat_module_404_for_message_without_module(client, monkeypatch):
    token = _signup(client)
    monkeypatch.setattr("app.api.v1.ai.get_provider", lambda feature: FakeProvider("Просто ответ."))
    message_id = client.post(
        "/api/v1/ai/chat/messages", json={"text": "Привет"}, headers=_auth(token)
    ).get_json()["reply"]["id"]

    res = client.post(
        "/api/v1/ai/chat/modules", json={"messageId": message_id}, headers=_auth(token)
    )

    assert res.status_code == 404


def test_create_chat_module_404_for_other_users_message(client, monkeypatch):
    token = _signup(client)
    monkeypatch.setattr(
        "app.api.v1.ai.get_provider",
        lambda feature: FakeProvider(
            'Ок.\n<<MODULE>>{"title":"Эссе","sub":"черновик","description":"План",'
            '"kind":"КАРТА","items":["Шаг 1"]}<<END>>'
        ),
    )
    message_id = client.post(
        "/api/v1/ai/chat/messages", json={"text": "Помоги"}, headers=_auth(token)
    ).get_json()["reply"]["id"]

    other_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "other-modules@mail.kz",
            "password": "password123",
            "name": "X",
            "grade": "9",
        },
    )
    other_token = other_res.get_json()["token"]

    res = client.post(
        "/api/v1/ai/chat/modules", json={"messageId": message_id}, headers=_auth(other_token)
    )

    assert res.status_code == 404
