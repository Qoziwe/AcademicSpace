"""Общая логика подписки — используется `/profile/me` и `/subscription/*`.

Мок-провайдер не эмулирует настоящее автопродление (нет фоновых джобов,
`CLAUDE.md` §11) — поэтому «истечение» подписки проверяется лениво, при
каждом обращении к профилю/подписке: если у активной записи `ends_at`
уже в прошлом, она помечается `expired`, а `profile.plan` откатывается
на `free`.
"""

import datetime as dt

from app.extensions import db
from app.models import Profile, Subscription


def get_active_subscription(user_id: int, profile: Profile) -> Subscription | None:
    active = (
        db.session.execute(db.select(Subscription).filter_by(user_id=user_id, status="active"))
        .scalars()
        .first()
    )
    if active is None:
        return None

    if active.ends_at is not None and active.ends_at < dt.datetime.now(dt.UTC).replace(tzinfo=None):
        active.status = "expired"
        profile.plan = "free"
        db.session.commit()
        return None

    return active
