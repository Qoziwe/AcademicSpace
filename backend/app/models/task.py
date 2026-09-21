import datetime as dt

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.extensions import db


class Task(db.Model):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    kind: Mapped[str] = mapped_column(String(16), nullable=False)  # КАРТА|ЧЕК-ЛИСТ|ТАЙМЕР
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    meta: Mapped[str] = mapped_column(String(255), default="")
    xp: Mapped[int] = mapped_column(Integer, default=0)
    is_timer: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    items: Mapped[list["TaskItem"]] = relationship(
        back_populates="task", cascade="all, delete-orphan", order_by="TaskItem.position"
    )


class TaskItem(db.Model):
    __tablename__ = "task_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), nullable=False)

    label: Mapped[str] = mapped_column(String(255), nullable=False)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(Integer, default=0)

    task: Mapped[Task] = relationship(back_populates="items")
