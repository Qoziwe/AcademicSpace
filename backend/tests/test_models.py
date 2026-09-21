from app.extensions import db
from app.models import Profile, Task, TaskItem, User


def test_user_profile_and_task_with_items(app):
    with app.app_context():
        user = User(email="a@b.com", password_hash="x", name="A", grade="11 класс")
        db.session.add(user)
        db.session.flush()

        db.session.add(Profile(user_id=user.id, level=1, xp=0))

        task = Task(user_id=user.id, kind="ЧЕК-ЛИСТ", title="Тест", xp=10)
        task.items = [TaskItem(label="Пункт 1", position=0), TaskItem(label="Пункт 2", position=1)]
        db.session.add(task)
        db.session.commit()

        saved_task = db.session.get(Task, task.id)
        assert saved_task is not None
        assert [item.label for item in saved_task.items] == ["Пункт 1", "Пункт 2"]

        saved_profile = db.session.execute(
            db.select(Profile).filter_by(user_id=user.id)
        ).scalar_one()
        assert saved_profile.xp == 0
