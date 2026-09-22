import datetime as dt

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import NotFound

from app.extensions import db
from app.models import AchievementLogEntry, Profile, Task
from app.schemas.tasks import ToggleTaskItemSchema

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks")

toggle_schema = ToggleTaskItemSchema()

# Как вид модуля превращается в запись журнала при закрытии всех пунктов —
# 1:1 с `frontend/mocks/fixtures.ts` TASK_KIND_LOG.
TASK_KIND_LOG = {
    "КАРТА": {"kind": "дорожная карта", "dot": "blue"},
    "ЧЕК-ЛИСТ": {"kind": "чек-лист", "dot": "green"},
    "ТАЙМЕР": {"kind": "таймер", "dot": "blueLight"},
}


def _task_payload(task: Task) -> dict:
    return {
        "id": str(task.id),
        "kind": task.kind,
        "title": task.title,
        "meta": task.meta,
        "xp": task.xp,
        "isTimer": task.is_timer,
        "items": [{"label": it.label, "done": it.done} for it in task.items],
    }


def _get_task(user_id: int, task_id: str) -> Task | None:
    try:
        task_pk = int(task_id)
    except ValueError:
        return None
    return db.session.execute(
        db.select(Task).filter_by(id=task_pk, user_id=user_id)
    ).scalar_one_or_none()


@tasks_bp.get("")
@jwt_required()
def get_tasks():
    user_id = int(get_jwt_identity())
    tasks = db.session.execute(db.select(Task).filter_by(user_id=user_id)).scalars().all()
    return jsonify([_task_payload(t) for t in tasks])


@tasks_bp.get("/<task_id>")
@jwt_required()
def get_task(task_id: str):
    user_id = int(get_jwt_identity())
    task = _get_task(user_id, task_id)
    if task is None:
        raise NotFound("Задача не найдена.")
    return jsonify(_task_payload(task))


@tasks_bp.patch("/<task_id>/items/<int:item_index>")
@jwt_required()
def toggle_task_item(task_id: str, item_index: int):
    user_id = int(get_jwt_identity())
    data = toggle_schema.load(request.get_json(silent=True) or {})

    task = _get_task(user_id, task_id)
    if task is None:
        raise NotFound("Задача не найдена.")

    item = next((it for it in task.items if it.position == item_index), None)
    if item is None:
        raise NotFound("Пункт не найден.")

    item.done = data["done"] if data["done"] is not None else not item.done
    db.session.flush()

    complete = len(task.items) > 0 and all(it.done for it in task.items)
    if not complete:
        db.session.commit()
        return jsonify({"task": _task_payload(task), "completed": False, "xpAwarded": 0})

    profile = db.session.execute(db.select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    log_map = TASK_KIND_LOG.get(task.kind, {"kind": task.kind, "dot": "blue"})
    task_xp = task.xp
    if profile is not None:
        profile.xp += task_xp
    db.session.add(
        AchievementLogEntry(
            user_id=user_id,
            title=task.title,
            kind=log_map["kind"],
            xp=task_xp,
            dot=log_map["dot"],
            date=dt.date.today(),
        )
    )
    db.session.delete(task)
    db.session.commit()

    return jsonify({"task": None, "completed": True, "xpAwarded": task_xp})
