import json
import re

_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)
_MODULE_RE = re.compile(r"<<MODULE>>\s*(\{.*\})\s*<<END>>\s*$", re.DOTALL)


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

    Форма `module` — `{title, sub, desc, created}`, 1:1 с `ChatModule` на
    фронте (`components/organisms/ChatThread.tsx`), а не с документированной
    в `api-contract.md` `{kind,title,sub,description}` — фронт нигде не
    читает `kind`/`description`."""
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

    return text, {
        "title": parsed["title"],
        "sub": parsed["sub"],
        "desc": parsed["description"],
        "created": False,
    }
