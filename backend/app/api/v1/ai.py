import threading

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import Conflict, NotFound

from app.api.v1.tasks import task_payload
from app.extensions import db
from app.models import (
    ChatMessage,
    PortfolioAnalysis,
    Questionnaire,
    Task,
    TaskItem,
    UniversityMatch,
    User,
)
from app.schemas.ai import ChatMessageSchema, CreateChatModuleSchema, SubmitPortfolioSchema
from app.services.ai.parsing import extract_json_object, extract_module_suggestion
from app.services.ai.router import get_provider

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")

submit_portfolio_schema = SubmitPortfolioSchema()
chat_message_schema = ChatMessageSchema()
create_chat_module_schema = CreateChatModuleSchema()

# XP по типу модуля — 1:1 с `frontend/mocks/fixtures.ts` TASKS_SEED (КАРТА
# 120 / ЧЕК-ЛИСТ 80 / ТАЙМЕР 40). Фиксированная шкала по kind, а не по
# числу items — нейронка не должна уметь влиять на начисление XP размером
# сгенерированного списка шагов.
MODULE_KIND_XP = {"КАРТА": 120, "ЧЕК-ЛИСТ": 80, "ТАЙМЕР": 40}

CHAT_QUICK_PROMPTS = [
    "Как усилить письмо?",
    "Что делать с Reach-вузами?",
    "Собери план на неделю",
]

CHAT_SYSTEM_PROMPT = (
    "Ты — ИИ-ментор AcademicSpace, помогаешь школьнику 9–11 класса готовиться "
    "к поступлению в университет: стратегия подачи документов, мотивационные "
    "письма, подготовка к языковым экзаменам, тайм-менеджмент. Отвечай по-русски, "
    "дружелюбно и по делу, 2-5 предложений.\n\n"
    "Если пользователю стоит завести отслеживаемый модуль для конкретной "
    "следующей задачи — и только когда это действительно уместно, не в каждом "
    "ответе — добавь ПОСЛЕДНЕЙ строкой маркер в точности такого вида (без "
    "markdown, одна строка):\n"
    '<<MODULE>>{"title":"...","sub":"...","description":"...",'
    '"kind":"КАРТА|ЧЕК-ЛИСТ|ТАЙМЕР","items":["...","..."]}<<END>>\n'
    "title — короткое название модуля, sub — 3-6 слов уточнения, description — "
    "1 предложение о том, что попадёт в модуль. kind — КАРТА для растянутой во "
    "времени дорожной карты из нескольких этапов, ЧЕК-ЛИСТ для последовательных "
    "шагов одной конкретной задачи, ТАЙМЕР для одной сфокусированной сессии "
    "прямо сейчас. items — 2-5 конкретных пунктов, которые попадут в модуль "
    "(шаги/подзадачи), коротко, по-русски, без нумерации и вводных слов."
)

PORTFOLIO_SYSTEM_PROMPT = (
    "Ты — ИИ-аналитик стратегии поступления AcademicSpace. На основе данных о "
    "школьнике сформируй разбор его профиля. Ответь СТРОГО валидным JSON без "
    "markdown-обрамления и пояснений, ровно в такой форме:\n"
    '{"previewBlocks":[{"title":"...","text":"..."}, ...3 блока...],'
    '"fullText":"..."}\n'
    "previewBlocks — 3 коротких блока: сильные стороны профиля, план на "
    "ближайшие месяцы, на что обратить внимание у Reach-вузов (2-4 предложения "
    "каждый). fullText — связный развёрнутый разбор на 150-300 слов, по-русски."
)

FLASHCARDS_SYSTEM_PROMPT = (
    "Генератор карточек «вопрос → ответ» для повторения учебного материала. "
    "На основе описанной учеником темы создай набор карточек. Ответь СТРОГО "
    "валидным JSON без markdown-обрамления, ровно в такой форме:\n"
    '{"title":"...","cards":[{"question":"...","answer":"..."}, ...]}\n'
    "title — короткое название темы (2-5 слов). 5-8 карточек, вопросы "
    "конкретные и проверяемые, ответы — 1-3 предложения, по-русски."
)


def _portfolio_prompt(user: User, questionnaire: Questionnaire | None, body: dict) -> str:
    parts = [f"Ученик: {user.name}, {user.grade}."]
    if questionnaire is not None:
        if questionnaire.interests:
            parts.append(f"Интересы: {', '.join(questionnaire.interests)}.")
        if questionnaire.academics:
            parts.append(f"Академические данные: {questionnaire.academics}.")
        if questionnaire.preferences:
            parts.append(f"Предпочтения по вузам: {questionnaire.preferences}.")

    matches = (
        db.session.execute(db.select(UniversityMatch).filter_by(user_id=user.id)).scalars().all()
    )
    if matches:
        parts.append(
            "Подобранные вузы: "
            + "; ".join(f"{m.category} (шанс {m.chance})" for m in matches)
            + "."
        )

    if body.get("resume"):
        parts.append(f"Резюме: {body['resume']}")
    if body.get("motivationLetters"):
        parts.append("Мотивационные письма: " + " / ".join(body["motivationLetters"]))
    if body.get("activities"):
        parts.append("Активности: " + ", ".join(body["activities"]))
    if body.get("achievements"):
        parts.append("Достижения: " + ", ".join(body["achievements"]))

    return "\n".join(parts)


def _run_portfolio_analysis(app, analysis_id: int, prompt: str) -> None:
    with app.app_context():
        analysis = db.session.get(PortfolioAnalysis, analysis_id)
        if analysis is None:
            return
        try:
            provider = get_provider("portfolio")
            raw = provider.generate_text(
                system=PORTFOLIO_SYSTEM_PROMPT, prompt=prompt, max_tokens=4096
            )
            parsed = extract_json_object(raw)
            if parsed and isinstance(parsed.get("previewBlocks"), list):
                analysis.preview_blocks = parsed["previewBlocks"]
                analysis.full_text = parsed.get("fullText")
            else:
                analysis.preview_blocks = [{"title": "Разбор от ИИ-ментора", "text": raw}]
                analysis.full_text = raw
        except Exception:
            app.logger.exception("Portfolio analysis failed for id=%s", analysis_id)
            analysis.preview_blocks = [
                {
                    "title": "Не удалось получить анализ",
                    "text": "Сервис ИИ сейчас недоступен — попробуйте запустить анализ ещё раз.",
                }
            ]
            analysis.full_text = None
        finally:
            analysis.status = "ready"
            db.session.commit()


@ai_bp.post("/portfolio")
@jwt_required()
def start_portfolio_analysis():
    user_id = int(get_jwt_identity())
    body = submit_portfolio_schema.load(request.get_json(silent=True) or {})

    user = db.session.get(User, user_id)
    if user is None:
        raise NotFound("Пользователь не найден.")
    questionnaire = db.session.execute(
        db.select(Questionnaire).filter_by(user_id=user_id)
    ).scalar_one_or_none()

    analysis = PortfolioAnalysis(user_id=user_id, status="processing")
    db.session.add(analysis)
    db.session.commit()

    prompt = _portfolio_prompt(user, questionnaire, body)
    app = current_app._get_current_object()
    threading.Thread(
        target=_run_portfolio_analysis, args=(app, analysis.id, prompt), daemon=True
    ).start()

    return jsonify({"analysisId": str(analysis.id), "status": "processing"})


@ai_bp.get("/analysis/<int:analysis_id>")
@jwt_required()
def get_analysis(analysis_id: int):
    user_id = int(get_jwt_identity())
    analysis = db.session.execute(
        db.select(PortfolioAnalysis).filter_by(id=analysis_id, user_id=user_id)
    ).scalar_one_or_none()
    if analysis is None:
        raise NotFound("Анализ не найден.")

    return jsonify(
        {
            "analysisId": str(analysis.id),
            "status": analysis.status,
            "previewBlocks": analysis.preview_blocks,
            "fullText": analysis.full_text,
        }
    )


@ai_bp.get("/chat/meta")
@jwt_required()
def get_chat_meta():
    return jsonify({"quickPrompts": CHAT_QUICK_PROMPTS})


@ai_bp.post("/chat/messages")
@jwt_required()
def send_chat_message():
    user_id = int(get_jwt_identity())
    data = chat_message_schema.load(request.get_json(silent=True) or {})

    history = (
        db.session.execute(
            db.select(ChatMessage)
            .filter_by(user_id=user_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(20)
        )
        .scalars()
        .all()
    )
    history.reverse()

    messages = [{"role": "user" if m.from_me else "assistant", "content": m.text} for m in history]
    messages.append({"role": "user", "content": data["text"]})

    db.session.add(ChatMessage(user_id=user_id, from_me=True, text=data["text"]))

    provider = get_provider("chat")
    prompt = "\n\n".join(f"{m['role']}: {m['content']}" for m in messages)
    raw = provider.generate_text(system=CHAT_SYSTEM_PROMPT, prompt=prompt, max_tokens=2048)
    reply_text, module = extract_module_suggestion(raw)

    assistant_message = ChatMessage(user_id=user_id, from_me=False, text=reply_text, module=module)
    db.session.add(assistant_message)
    db.session.commit()

    return jsonify(
        {"reply": {"id": str(assistant_message.id), "text": reply_text, "module": module}}
    )


def _get_chat_message(user_id: int, message_id: str) -> ChatMessage | None:
    try:
        message_pk = int(message_id)
    except ValueError:
        return None
    return db.session.execute(
        db.select(ChatMessage).filter_by(id=message_pk, user_id=user_id)
    ).scalar_one_or_none()


@ai_bp.post("/chat/modules")
@jwt_required()
def create_chat_module():
    """Превращает модуль, предложенный ассистентом (`<<MODULE>>` маркер в
    `send_chat_message`), в настоящую задачу — `title`/`kind`/`items` уже
    придуманы нейронкой и лежат в `message.module`, второй поход к ИИ не
    нужен. Идемпотентно: повторный вызов на том же сообщении — 409."""
    user_id = int(get_jwt_identity())
    data = create_chat_module_schema.load(request.get_json(silent=True) or {})

    message = _get_chat_message(user_id, data["messageId"])
    if message is None or message.from_me or not message.module:
        raise NotFound("Сообщение с предложенным модулем не найдено.")
    if message.module.get("created"):
        raise Conflict("Модуль уже создан.")

    module = message.module
    kind = module.get("kind") if module.get("kind") in MODULE_KIND_XP else "КАРТА"
    items = module.get("items") or [module["title"]]

    task = Task(
        user_id=user_id,
        kind=kind,
        title=module["title"],
        meta=f"создано ИИ-ментором · {module['sub']}",
        xp=MODULE_KIND_XP[kind],
        is_timer=kind == "ТАЙМЕР",
    )
    db.session.add(task)
    db.session.flush()
    for position, label in enumerate(items):
        db.session.add(TaskItem(task_id=task.id, label=label, position=position))

    message.module = {**module, "created": True}
    db.session.commit()

    return jsonify({"created": True, "task": task_payload(task)})
