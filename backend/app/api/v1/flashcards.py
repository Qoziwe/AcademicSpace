import datetime as dt

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import BadRequest, Conflict, NotFound

from app.extensions import db
from app.models import AchievementLogEntry, FlashcardCard, FlashcardDeck, Profile
from app.schemas.flashcards import CreateFlashcardDeckSchema, MarkFlashcardKnownSchema
from app.services.ai.base import ImageInput
from app.services.ai.parsing import extract_json_object
from app.services.ai.router import get_provider

flashcards_bp = Blueprint("flashcards", __name__, url_prefix="/flashcards")

create_schema = CreateFlashcardDeckSchema()
mark_known_schema = MarkFlashcardKnownSchema()

FLASHCARD_QUOTAS = {"free": 1, "premium": 10}
FLASHCARD_DECK_XP = 30

FLASHCARDS_SYSTEM_PROMPT = (
    "Генератор карточек «вопрос → ответ» для повторения учебного материала. "
    "На основе описанной учеником темы создай набор карточек. Ответь СТРОГО "
    "валидным JSON без markdown-обрамления, ровно в такой форме:\n"
    '{"title":"...","cards":[{"question":"...","answer":"..."}, ...]}\n'
    "title — короткое название темы (2-5 слов). 5-8 карточек, вопросы "
    "конкретные и проверяемые, ответы — 1-3 предложения, по-русски."
)

FLASHCARDS_VISION_SYSTEM_PROMPT = (
    "Генератор карточек «вопрос → ответ» для повторения учебного материала. "
    "На фото — страницы конспекта, учебника или доски. Разбери материал на "
    "фото (и подпись ученика к нему, если есть) и создай набор карточек. "
    "Ответь СТРОГО валидным JSON без markdown-обрамления, ровно в такой "
    'форме:\n{"title":"...","cards":[{"question":"...","answer":"..."}, ...]}\n'
    "title — короткое название темы (2-5 слов). 5-8 карточек, вопросы "
    "конкретные и проверяемые, ответы — 1-3 предложения, по-русски."
)


def _quota_limit(profile: Profile) -> int:
    return FLASHCARD_QUOTAS["premium"] if profile.plan == "premium" else FLASHCARD_QUOTAS["free"]


def _deck_payload(deck: FlashcardDeck, *, with_cards: bool) -> dict:
    remaining = [c for c in deck.cards if not c.known]
    payload = {
        "id": str(deck.id),
        "title": deck.title,
        "source": deck.source,
        "createdAt": deck.created_at.isoformat(),
        "cardsTotal": deck.cards_total,
        "cardsRemaining": len(remaining),
    }
    if with_cards:
        payload["cards"] = [
            {"id": str(c.id), "question": c.question, "answer": c.answer} for c in remaining
        ]
    return payload


def _get_deck(user_id: int, deck_id: str) -> FlashcardDeck | None:
    try:
        deck_pk = int(deck_id)
    except ValueError:
        return None
    return db.session.execute(
        db.select(FlashcardDeck).filter_by(id=deck_pk, user_id=user_id)
    ).scalar_one_or_none()


@flashcards_bp.get("")
@jwt_required()
def list_decks():
    user_id = int(get_jwt_identity())
    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    decks = db.session.execute(db.select(FlashcardDeck).filter_by(user_id=user_id)).scalars().all()

    return jsonify(
        {
            "quota": {"used": len(decks), "limit": _quota_limit(profile) if profile else 0},
            "decks": [_deck_payload(d, with_cards=False) for d in decks],
        }
    )


@flashcards_bp.get("/<deck_id>")
@jwt_required()
def get_deck(deck_id: str):
    user_id = int(get_jwt_identity())
    deck = _get_deck(user_id, deck_id)
    if deck is None:
        raise NotFound("Колода не найдена.")
    return jsonify(_deck_payload(deck, with_cards=True))


def _load_create_request() -> tuple[dict, list[ImageInput]]:
    """Тело либо JSON (только текст), либо multipart (текст + фото) —
    фронт шлёт multipart, когда есть хотя бы одно фото
    (`services/api/http/flashcards.ts`)."""
    if (request.content_type or "").startswith("multipart/form-data"):
        raw = {"source": request.form.get("source"), "text": request.form.get("text")}
        images = [
            ImageInput(media_type=f.mimetype or "image/jpeg", data=f.read())
            for f in request.files.getlist("images")
            if f.filename
        ]
        return create_schema.load(raw), images

    return create_schema.load(request.get_json(silent=True) or {}), []


@flashcards_bp.post("")
@jwt_required()
def create_deck():
    user_id = int(get_jwt_identity())
    data, images = _load_create_request()

    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    if profile is None:
        raise NotFound("Профиль не найден.")

    deck_count = db.session.scalar(
        db.select(db.func.count()).select_from(FlashcardDeck).filter_by(user_id=user_id)
    )
    if deck_count >= _quota_limit(profile):
        raise Conflict("flashcards_quota_exceeded")

    text = (data.get("text") or "").strip()
    if not text and not images:
        raise BadRequest("Нужен текст темы или хотя бы одно фото конспекта.")

    provider = get_provider("flashcards")
    if images:
        prompt = text or "Разбери материал на фото."
        raw = provider.generate_vision(
            system=FLASHCARDS_VISION_SYSTEM_PROMPT, prompt=prompt, images=images, max_tokens=4096
        )
    else:
        raw = provider.generate_text(system=FLASHCARDS_SYSTEM_PROMPT, prompt=text, max_tokens=4096)

    parsed = extract_json_object(raw)
    cards_data = parsed.get("cards") if parsed else None
    if not parsed or not isinstance(cards_data, list) or not cards_data:
        raise BadRequest("Не удалось сгенерировать карточки — попробуйте переформулировать тему.")

    deck = FlashcardDeck(
        user_id=user_id, title=str(parsed.get("title") or text[:60]), source=data["source"]
    )
    db.session.add(deck)
    db.session.flush()

    added = 0
    for card in cards_data:
        question = str(card.get("question", "")).strip()
        answer = str(card.get("answer", "")).strip()
        if not question or not answer:
            continue
        db.session.add(FlashcardCard(deck_id=deck.id, question=question, answer=answer))
        added += 1
    if added == 0:
        raise BadRequest("Не удалось сгенерировать карточки — попробуйте переформулировать тему.")

    deck.cards_total = added
    db.session.commit()

    return jsonify(_deck_payload(deck, with_cards=True)), 201


@flashcards_bp.delete("/<deck_id>")
@jwt_required()
def delete_deck(deck_id: str):
    user_id = int(get_jwt_identity())
    deck = _get_deck(user_id, deck_id)
    if deck is None:
        raise NotFound("Колода не найдена.")
    db.session.delete(deck)
    db.session.commit()
    return jsonify({"ok": True})


@flashcards_bp.patch("/<deck_id>/cards/<card_id>")
@jwt_required()
def mark_card_known(deck_id: str, card_id: str):
    user_id = int(get_jwt_identity())
    mark_known_schema.load(request.get_json(silent=True) or {})

    deck = _get_deck(user_id, deck_id)
    if deck is None:
        raise NotFound("Колода не найдена.")
    try:
        card_pk = int(card_id)
    except ValueError:
        raise NotFound("Карточка не найдена.") from None
    card = next((c for c in deck.cards if c.id == card_pk), None)
    if card is None:
        raise NotFound("Карточка не найдена.")

    remaining_before = sum(1 for c in deck.cards if not c.known)
    card.known = True
    db.session.flush()
    remaining_after = sum(1 for c in deck.cards if not c.known)

    just_completed = remaining_before > 0 and remaining_after == 0
    xp_awarded = 0
    if just_completed:
        profile = db.session.execute(
            db.select(Profile).filter_by(user_id=user_id)
        ).scalar_one_or_none()
        xp_awarded = FLASHCARD_DECK_XP
        if profile is not None:
            profile.xp += xp_awarded
        db.session.add(
            AchievementLogEntry(
                user_id=user_id,
                title=deck.title,
                kind="умные карточки",
                xp=xp_awarded,
                dot="rose",
                date=dt.date.today(),
            )
        )

    db.session.commit()
    return jsonify({"deck": _deck_payload(deck, with_cards=True), "xpAwarded": xp_awarded})
