"""Засев БД тестовыми данными.

Пока моделей нет (появятся в Фазе 8.2) — переносить содержимое
frontend/mocks/fixtures.ts в БД пока некуда. Наполнить после Фазы 8.2.
"""

from app import create_app


def main() -> None:
    app = create_app()
    with app.app_context():
        print("Моделей ещё нет (Фаза 8.2) — сеять пока нечего.")


if __name__ == "__main__":
    main()
