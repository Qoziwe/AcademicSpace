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
    User,
    Vault,
    VaultCell,
)
from app.services.matching import rebuild_matches_for_user

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

# Каталог вузов — вход алгоритма подбора (`app/services/matching`). Числовые
# требования (`required_*_index`, 0–100) подобраны вручную как правдоподобное
# приближение (не скрейпинг реальных приёмных комиссий) — калибровка весов и
# порогов сама по себе в `app/services/matching/config.py`.
#
# Страны/факультеты/языки — те же строки, что в `FILTER_STEPS` фронтенда
# (`frontend/mocks/fixtures.ts`), иначе фильтр молча не найдёт совпадений.
UNIVERSITIES_SEED = [
    # ── Италия ──────────────────────────────────────────────────────────
    {
        "name": "Università di Padova",
        "city": "Падова",
        "country": "Италия",
        "faculties": ["Инженерия", "Информатика"],
        "languages_offered": ["Английский", "Итальянский"],
        "tuition_eur_per_year": 2500,
        "scholarship_coverage_pct": 100,
        "selectivity_tier": 5,
        "required_gpa_index": 45,
        "required_profile_score_index": 45,
        "required_language_index": 45,
    },
    {
        "name": "Politecnico di Torino",
        "city": "Турин",
        "country": "Италия",
        "faculties": ["Инженерия", "Архитектура"],
        "languages_offered": ["Английский", "Итальянский"],
        "tuition_eur_per_year": 2800,
        "scholarship_coverage_pct": 70,
        "selectivity_tier": 4,
        "required_gpa_index": 55,
        "required_profile_score_index": 55,
        "required_language_index": 50,
    },
    {
        "name": "Università di Bologna",
        "city": "Болонья",
        "country": "Италия",
        "faculties": ["Инженерия", "Экономика"],
        "languages_offered": ["Английский"],
        "tuition_eur_per_year": 3000,
        "scholarship_coverage_pct": 60,
        "selectivity_tier": 3,
        "required_gpa_index": 65,
        "required_profile_score_index": 65,
        "required_language_index": 60,
        "admissions_url": "https://www.unibo.it",
        "stats": [
            {"k": "в год", "v": "3 000 €"},
            {"k": "QS World", "v": "#154"},
        ],
        "rows": [
            {"k": "Направление", "v": "Инженерия · бакалавриат"},
            {"k": "Язык", "v": "Английский"},
            {"k": "Дедлайн заявки", "v": "12 мая"},
            {"k": "Стипендия", "v": "ER-GO, до 60 %"},
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
    {
        "name": "Università di Trento",
        "city": "Тренто",
        "country": "Италия",
        "faculties": ["Информатика", "Инженерия"],
        "languages_offered": ["Итальянский", "Английский"],
        "tuition_eur_per_year": 3400,
        "scholarship_coverage_pct": 50,
        "selectivity_tier": 3,
        "required_gpa_index": 68,
        "required_profile_score_index": 68,
        "required_language_index": 62,
    },
    {
        "name": "Politecnico di Milano",
        "city": "Милан",
        "country": "Италия",
        "faculties": ["Инженерия", "Архитектура", "Информатика"],
        "languages_offered": ["Английский", "Итальянский"],
        "tuition_eur_per_year": 4000,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 2,
        "required_gpa_index": 82,
        "required_profile_score_index": 85,
        "required_language_index": 75,
    },
    {
        "name": "Università Bocconi",
        "city": "Милан",
        "country": "Италия",
        "faculties": ["Экономика"],
        "languages_offered": ["Английский"],
        "tuition_eur_per_year": 15000,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 1,
        "required_gpa_index": 90,
        "required_profile_score_index": 90,
        "required_language_index": 80,
    },
    # ── Германия ────────────────────────────────────────────────────────
    {
        "name": "TU Dresden",
        "city": "Дрезден",
        "country": "Германия",
        "faculties": ["Инженерия", "Информатика"],
        "languages_offered": ["Немецкий", "Английский"],
        "tuition_eur_per_year": 500,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 4,
        "required_gpa_index": 55,
        "required_profile_score_index": 55,
        "required_language_index": 55,
    },
    {
        "name": "RWTH Aachen",
        "city": "Аахен",
        "country": "Германия",
        "faculties": ["Инженерия", "Информатика"],
        "languages_offered": ["Немецкий", "Английский"],
        "tuition_eur_per_year": 600,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 2,
        "required_gpa_index": 78,
        "required_profile_score_index": 80,
        "required_language_index": 70,
    },
    {
        "name": "Technical University of Munich",
        "city": "Мюнхен",
        "country": "Германия",
        "faculties": ["Инженерия", "Информатика", "Экономика"],
        "languages_offered": ["Английский", "Немецкий"],
        "tuition_eur_per_year": 300,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 1,
        "required_gpa_index": 88,
        "required_profile_score_index": 90,
        "required_language_index": 78,
    },
    {
        "name": "Freie Universität Berlin",
        "city": "Берлин",
        "country": "Германия",
        "faculties": ["Экономика", "Информатика"],
        "languages_offered": ["Немецкий", "Английский"],
        "tuition_eur_per_year": 400,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 3,
        "required_gpa_index": 65,
        "required_profile_score_index": 65,
        "required_language_index": 62,
    },
    {
        "name": "University of Stuttgart",
        "city": "Штутгарт",
        "country": "Германия",
        "faculties": ["Инженерия"],
        "languages_offered": ["Немецкий", "Английский"],
        "tuition_eur_per_year": 500,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 4,
        "required_gpa_index": 58,
        "required_profile_score_index": 60,
        "required_language_index": 55,
    },
    # ── Чехия ───────────────────────────────────────────────────────────
    {
        "name": "Charles University",
        "city": "Прага",
        "country": "Чехия",
        "faculties": ["Информатика", "Экономика", "Инженерия"],
        "languages_offered": ["Чешский", "Английский"],
        "tuition_eur_per_year": 0,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 3,
        "required_gpa_index": 60,
        "required_profile_score_index": 62,
        "required_language_index": 55,
    },
    {
        "name": "Czech Technical University",
        "city": "Прага",
        "country": "Чехия",
        "faculties": ["Инженерия", "Информатика"],
        "languages_offered": ["Чешский", "Английский"],
        "tuition_eur_per_year": 0,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 3,
        "required_gpa_index": 58,
        "required_profile_score_index": 60,
        "required_language_index": 52,
    },
    {
        "name": "Masaryk University",
        "city": "Брно",
        "country": "Чехия",
        "faculties": ["Экономика", "Информатика"],
        "languages_offered": ["Чешский", "Английский"],
        "tuition_eur_per_year": 0,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 4,
        "required_gpa_index": 50,
        "required_profile_score_index": 50,
        "required_language_index": 48,
    },
    {
        "name": "University of Economics, Prague",
        "city": "Прага",
        "country": "Чехия",
        "faculties": ["Экономика"],
        "languages_offered": ["Английский", "Чешский"],
        "tuition_eur_per_year": 2000,
        "scholarship_coverage_pct": None,
        "selectivity_tier": 3,
        "required_gpa_index": 62,
        "required_profile_score_index": 60,
        "required_language_index": 58,
    },
    # ── Казахстан ───────────────────────────────────────────────────────
    {
        "name": "Назарбаев Университет",
        "city": "Астана",
        "country": "Казахстан",
        "faculties": ["Инженерия", "Информатика", "Экономика"],
        "languages_offered": ["Английский"],
        "tuition_eur_per_year": 1500,
        "scholarship_coverage_pct": 100,
        "selectivity_tier": 2,
        "required_gpa_index": 80,
        "required_profile_score_index": 82,
        "required_language_index": 75,
    },
    {
        "name": "КазНУ им. аль-Фараби",
        "city": "Алматы",
        "country": "Казахстан",
        "faculties": ["Инженерия", "Экономика", "Информатика"],
        "languages_offered": ["Русский", "Казахский", "Английский"],
        "tuition_eur_per_year": 800,
        "scholarship_coverage_pct": 80,
        "selectivity_tier": 4,
        "required_gpa_index": 50,
        "required_profile_score_index": 50,
        "required_language_index": 45,
    },
    {
        "name": "Satbayev University",
        "city": "Алматы",
        "country": "Казахстан",
        "faculties": ["Инженерия"],
        "languages_offered": ["Русский", "Казахский"],
        "tuition_eur_per_year": 700,
        "scholarship_coverage_pct": 70,
        "selectivity_tier": 4,
        "required_gpa_index": 52,
        "required_profile_score_index": 55,
        "required_language_index": 42,
    },
    {
        "name": "КИМЭП",
        "city": "Алматы",
        "country": "Казахстан",
        "faculties": ["Экономика"],
        "languages_offered": ["Английский"],
        "tuition_eur_per_year": 2500,
        "scholarship_coverage_pct": 40,
        "selectivity_tier": 3,
        "required_gpa_index": 65,
        "required_profile_score_index": 60,
        "required_language_index": 65,
    },
    {
        "name": "Международный университет информационных технологий",
        "city": "Алматы",
        "country": "Казахстан",
        "faculties": ["Информатика", "Инженерия"],
        "languages_offered": ["Русский", "Английский"],
        "tuition_eur_per_year": 900,
        "scholarship_coverage_pct": 60,
        "selectivity_tier": 3,
        "required_gpa_index": 58,
        "required_profile_score_index": 60,
        "required_language_index": 55,
    },
]

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
    {
        "id": "week",
        "period": "Неделя",
        "price": "500 тг",
        "amount": 500,
        "sub": "попробовать",
        "best": False,
    },
    {
        "id": "month",
        "period": "Месяц",
        "price": "1 900 тг",
        "amount": 1900,
        "sub": "≈ 63 тг в день",
        "best": True,
    },
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
            "desc": (
                "Модуль появится в блоке «Активные задачи» на главной. "
                "Отмечать пункты можно не заходя в чат."
            ),
            "items": [
                "Пробный тест Listening",
                "20 слов академической лексики",
                "Разбор Writing Task 2",
                "Пробный тест Speaking",
                "Мок-экзамен целиком",
            ],
            "created": False,
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
            plan="free",
        )
    )

    db.session.add(
        Questionnaire(
            user_id=user.id,
            filled=True,
            interests=["Инженерия", "Технологии"],
            academics={
                "gpaPercent": 82,
                "examSubject": "Математика",
                "examScore": 78,
                "languageTest": "IELTS",
                "languageScore": 6.0,
                "achievementsCount": 1,
            },
            preferences={
                "country": "Италия",
                "universities": [],
                "faculty": "Инженерия",
                "language": "Английский",
                "cost": "до 3 000 € + стипендия",
                "costMaxEur": 3000,
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

    for uni_seed in UNIVERSITIES_SEED:
        db.session.add(
            University(
                name=uni_seed["name"],
                city=uni_seed["city"],
                country=uni_seed["country"],
                faculties=uni_seed["faculties"],
                languages_offered=uni_seed["languages_offered"],
                tuition_eur_per_year=uni_seed["tuition_eur_per_year"],
                scholarship_coverage_pct=uni_seed.get("scholarship_coverage_pct"),
                selectivity_tier=uni_seed["selectivity_tier"],
                required_gpa_index=uni_seed["required_gpa_index"],
                required_profile_score_index=uni_seed["required_profile_score_index"],
                required_language_index=uni_seed["required_language_index"],
                admissions_url=uni_seed.get("admissions_url"),
                stats=uni_seed.get("stats", []),
                rows=uni_seed.get("rows", []),
                required_documents=uni_seed.get("required_documents"),
                documents_note=uni_seed.get("documents_note"),
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

    matches_count = rebuild_matches_for_user(user.id)

    print(
        f"Засеяно: {DEMO_EMAIL} + профиль/анкета/задачи/вузы/копилки/чат/журнал "
        f"({matches_count} подобранных вузов по реальному алгоритму)"
    )


def main() -> None:
    app = create_app()
    with app.app_context():
        seed()


if __name__ == "__main__":
    main()
