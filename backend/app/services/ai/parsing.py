import json
import re

_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)
_MODULE_RE = re.compile(r"<<MODULE>>\s*(\{.*\})\s*<<END>>\s*$", re.DOTALL)
_MODULE_KINDS = {"КАРТА", "ЧЕК-ЛИСТ", "ТАЙМЕР"}


def extract_json_object(raw: str) -> dict | None:
    """Парсит JSON-ответ нейронки, снимая возможные markdown code-fences.
    Возвращает `None`, если модель не вернула валидный JSON."""
    cleaned = _FENCE_RE.sub("", raw.strip()).strip()
    try:
        data = json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        return None
    return data if isinstance(data, dict) else None


def extract_module_suggestion(raw: str) -> tuple[str, dict | None]:
    """Отделяет от текста ответа опциональный маркер `<<MODULE>>{...}<<END>>`
    (см. системный промпт чата). Возвращает (текст_без_маркера, module|None).

    `title/sub/desc/created` — 1:1 с `ChatModule` на фронте
    (`components/organisms/ChatThread.tsx`), фронт их и показывает в
    карточке-предложении. `kind`/`items` — служебные поля: фронт их не
    читает (лежат в `message.module` только на бекенде), но именно по ним
    `POST /ai/chat/modules` создаёт реальную задачу без второго похода к
    нейронке в момент клика — состав модуля уже придуман вместе с ответом."""
    match = _MODULE_RE.search(raw)
    if not match:
        return raw.strip(), None

    text = raw[: match.start()].strip()
    try:
        parsed = json.loads(match.group(1))
    except (json.JSONDecodeError, ValueError):
        return raw.strip(), None

    if not isinstance(parsed, dict) or not {"title", "sub", "description"}.issubset(parsed):
        return text, None

    kind = parsed.get("kind")
    if kind not in _MODULE_KINDS:
        kind = "КАРТА"

    raw_items = parsed.get("items")
    items = (
        [str(i).strip() for i in raw_items if str(i).strip()] if isinstance(raw_items, list) else []
    )
    if not items:
        items = [parsed["title"]]
    items = items[:6]

    return text, {
        "title": parsed["title"],
        "sub": parsed["sub"],
        "desc": parsed["description"],
        "kind": kind,
        "items": items,
        "created": False,
    }
