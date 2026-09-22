"""Засев БД тестовыми данными.

Переносит содержимое `frontend/mocks/fixtures.ts` (демо-профиль, задачи,
чат, вузы, копилки, журнал) в БД, чтобы локальная разработка сразу
стартовала с реалистичными данными вместо пустой базы. Идемпотентно —
повторный запуск при уже существующем демо-пользователе ничего не делает.
"""

import datetime as dt

from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import (
    AchievementLogEntry,
    ChatMessage,
    Profile,
    Questionnaire,
    SubscriptionPlan,
    Task,
    TaskItem,
    University,
    UniversityMatch,
    User,
    Vault,
    VaultCell,
)

DEMO_EMAIL = "tinatin@mail.kz"

TASKS_SEED = [
    {
        "kind": "КАРТА",
        "title": "Дорожная карта: IELTS 6.5",
        "meta": "создано ИИ-ментором · дедлайн 20 марта",
        "xp": 120,
        "is_timer": False,
        "items": [
            ("Пробный тест Listening", True),
            ("20 слов академической лексики", False),
            ("Разбор Writing Task 2", False),
        ],
    },
    {
        "kind": "ЧЕК-ЛИСТ",
        "title": "Мотивационное письмо",
        "meta": "создано ИИ-ментором · 3 из 4 шагов",
        "xp": 80,
        "is_timer": False,
        "items": [
            ("Черновик первого абзаца", True),
            ("Убрать общие формулировки", True),
            ("Проверка у ментора", False),
        ],
    },
    {
        "kind": "ТАЙМЕР",
        "title": "25 минут на Writing Task 2",
        "meta": "создано ИИ-ментором · сессия фокуса",
        "xp": 40,
        "is_timer": True,
        "items": [
            ("Разобрать структуру эссе", False),
            ("Написать введение", False),
        ],
    },
]

UNIVERSITIES_SEED = {
    "padova": {
        "name": "Università di Padova",
        "city": "Падова",
        "category": "safety",
        "chance": "92%",
        "tags": ["2 500 €/год", "стипендия до 100%", "IELTS 5.5"],
    },
    "torino": {
        "name": "Politecnico di Torino",
        "city": "Турин",
        "category": "safety",
        "chance": "88%",
        "tags": ["2 800 €/год", "грант региона", "IELTS 5.5"],
    },
    "bologna": {
        "name": "Università di Bologna",
        "city": "Болонья",
        "category": "match",
        "chance": "71%",
        "tags": ["3 000 €/год", "стипендия ER-GO", "IELTS 6.0"],
        "admissions_url": "https://www.unibo.it",
        "stats": [
            {"k": "вероятность", "v": "71%"},
            {"k": "в год", "v": "3 000 €"},
            {"k": "QS World", "v": "#154"},
        ],
        "rows": [
            {"k": "Направление", "v": "Инженерия · бакалавриат"},
            {"k": "Язык", "v": "Английский"},
            {"k": "Дедлайн заявки", "v": "12 мая"},
            {"k": "Стипендия", "v": "ER-GO, до 100 %"},
            {"k": "Требуемый IELTS", "v": "6.0"},
        ],
        "required_documents": [
            "Аттестат с апостилем",
            "Транскрипт оценок",
            "IELTS сертификат",
            "Мотивационное письмо",
            "Рекомендация №1",
            "Dichiarazione di valore",
            "Копия паспорта",
        ],
        "documents_note": (
            "9 документов: аттестат с апостилем, IELTS, мотивационное письмо, "
            "2 рекомендации, dichiarazione di valore и др. Копилка уже создана."
        ),
    },
    "trento": {
        "name": "Università di Trento",
        "city": "Тренто",
        "category": "match",
        "chance": "66%",
        "tags": ["3 400 €/год", "опекунский грант", "IELTS 6.0"],
    },
    "polimi": {
        "name": "Politecnico di Milano",
        "city": "Милан",
        "category": "reach",
        "chance": "34%",
        "tags": ["+9 баллов рейтинга", "портфолио", "IELTS 6.5"],
    },
    "bocconi": {
        "name": "Università Bocconi",
        "city": "Милан",
        "category": "reach",
        "chance": "21%",
        "tags": ["+14 баллов", "эссе", "IELTS 7.0"],
    },
}

DOCUMENT_SLOTS = [
    "Аттестат с апостилем",
    "Транскрипт оценок",
    "IELTS сертификат",
    "Мотивационное письмо",
    "Рекомендация №1",
    "Dichiarazione di valore",
    "Копия паспорта",
]

VAULTS_SEED = [
    {
        "university_name": "Università di Bologna",
        "deadline": "дедлайн 12 мая · 9 ячеек",
        "cells_total": 9,
        "uploaded_count": 3,
    },
    {
        "university_name": "Università di Padova",
        "deadline": "дедлайн 2 июня · 7 ячеек",
        "cells_total": 7,
        "uploaded_count": 2,
    },
]

PLANS_SEED = [
    {"id": "week", "period": "Неделя", "price": "500 тг", "sub": "попробовать", "best": False},
    {"id": "month", "period": "Месяц", "price": "1 900 тг", "sub": "≈ 63 тг в день", "best": True},
]

ACHIEVEMENT_LOG_SEED = [
    {
        "days_ago": 0,
        "items": [
            ("Пробный тест Listening", "дорожная карта · IELTS 6.5", 20, "blue"),
            ("Сессия фокуса 25 минут", "таймер", 10, "blueLight"),
            ("Черновик первого абзаца", "чек-лист · мотивационное письмо", 15, "green"),
        ],
    },
    {
        "days_ago": 2,
        "items": [
            ("Ачивка «Первый подбор»", "достижение", 50, "gold"),
            ("Оценка по математике обновлена", "академические данные", 25, "rose"),
        ],
    },
]

CHAT_MESSAGES_SEED = [
    {
        "from_me": False,
        "text": (
            "Ваша стратегия готова. Основной разрыв — язык: IELTS 6.5 открывает "
            "9 из 14 подобранных программ. Предлагаю зафиксировать это как "
            "дорожную карту на 8 недель."
        ),
    },
    {"from_me": True, "text": "Давай, и ещё про мотивационное письмо"},
    {
        "from_me": False,
        "text": (
            "Хорошо. Оформлю подготовку к IELTS дорожной картой, а письмо — "
            "чек-листом, чтобы они были на главном экране, а не в переписке."
        ),
        "module": {
            "kind": "КАРТА",
            "title": "Дорожная карта: IELTS 6.5",
            "sub": "8 недель · 6 этапов",
            "description": (
                "Модуль появится в блоке «Активные задачи» на главной. "
                "Отмечать пункты можно не заходя в чат."
            ),
        },
    },
]


def seed() -> None:
    if db.session.execute(db.select(User).filter_by(email=DEMO_EMAIL)).scalar_one_or_none():
        print(f"Демо-пользователь {DEMO_EMAIL} уже есть — пропускаю сид.")
        return

    user = User(
        email=DEMO_EMAIL,
        password_hash=generate_password_hash("password123"),
        name="Батыркызы Тінатін",
        grade="11 класс",
    )
    db.session.add(user)
    db.session.flush()

    db.session.add(
        Profile(
            user_id=user.id,
            level=4,
            xp=620,
            xp_to_next_level=1000,
            matches_count=14,
            rating=78,
            plan="free",
            analysis_country="Италия",
            analysis_since_label="14 марта",
        )
    )

    db.session.add(
        Questionnaire(
            user_id=user.id,
            filled=False,
            interests=["Инженерия", "Технологии"],
            academics={
                "gpa": "4,7",
                "mathScore": 86,
                "english": "IELTS 5.5",
                "grade": "11",
            },
            preferences={
                "format": "Бакалавриат",
                "readyToRelocate": True,
                "budgetPerYear": "до 3 000 €",
            },
        )
    )

    for task_seed in TASKS_SEED:
        task = Task(
            user_id=user.id,
            kind=task_seed["kind"],
            title=task_seed["title"],
            meta=task_seed["meta"],
            xp=task_seed["xp"],
            is_timer=task_seed["is_timer"],
        )
        db.session.add(task)
        db.session.flush()
        for position, (label, done) in enumerate(task_seed["items"]):
            db.session.add(TaskItem(task_id=task.id, label=label, done=done, position=position))

    universities_by_key = {}
    for key, uni_seed in UNIVERSITIES_SEED.items():
        uni = University(
            name=uni_seed["name"],
            city=uni_seed["city"],
            admissions_url=uni_seed.get("admissions_url"),
            stats=uni_seed.get("stats", []),
            rows=uni_seed.get("rows", []),
            required_documents=uni_seed.get("required_documents"),
            documents_note=uni_seed.get("documents_note"),
        )
        db.session.add(uni)
        universities_by_key[key] = uni
    db.session.flush()

    for key, uni_seed in UNIVERSITIES_SEED.items():
        db.session.add(
            UniversityMatch(
                user_id=user.id,
                university_id=universities_by_key[key].id,
                category=uni_seed["category"],
                chance=uni_seed["chance"],
                tags=uni_seed["tags"],
            )
        )

    for vault_seed in VAULTS_SEED:
        vault = Vault(
            user_id=user.id,
            university_name=vault_seed["university_name"],
            deadline=vault_seed["deadline"],
            cells_total=vault_seed["cells_total"],
        )
        db.session.add(vault)
        db.session.flush()
        for position, title in enumerate(DOCUMENT_SLOTS):
            db.session.add(
                VaultCell(
                    vault_id=vault.id,
                    title=title,
                    sub="pdf" if position < vault_seed["uploaded_count"] else "нужен файл",
                    uploaded=position < vault_seed["uploaded_count"],
                    position=position,
                )
            )

    for plan_seed in PLANS_SEED:
        db.session.add(SubscriptionPlan(**plan_seed))

    today = dt.date.today()
    for day_seed in ACHIEVEMENT_LOG_SEED:
        entry_date = today - dt.timedelta(days=day_seed["days_ago"])
        for title, kind, xp, dot in day_seed["items"]:
            db.session.add(
                AchievementLogEntry(
                    user_id=user.id, title=title, kind=kind, xp=xp, dot=dot, date=entry_date
                )
            )

    for msg_seed in CHAT_MESSAGES_SEED:
        db.session.add(
            ChatMessage(
                user_id=user.id,
                from_me=msg_seed["from_me"],
                text=msg_seed["text"],
                module=msg_seed.get("module"),
            )
        )

    db.session.commit()
    print(f"Засеяно: {DEMO_EMAIL} + профиль/анкета/задачи/вузы/копилки/чат/журнал")


def main() -> None:
    app = create_app()
    with app.app_context():
        seed()


if __name__ == "__main__":
    main()
