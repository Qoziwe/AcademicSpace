import datetime as dt

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.extensions import db


class FlashcardDeck(db.Model):
    __tablename__ = "flashcard_decks"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(String(16), nullable=False)  # text|image
    cards_total: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    cards: Mapped[list["FlashcardCard"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan"
    )


class FlashcardCard(db.Model):
    __tablename__ = "flashcard_cards"

    id: Mapped[int] = mapped_column(primary_key=True)
    deck_id: Mapped[int] = mapped_column(ForeignKey("flashcard_decks.id"), nullable=False)

    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    # свайпнута ("запомнил") — не удаляется, чтобы cards_total оставался знаменателем
    known: Mapped[bool] = mapped_column(Boolean, default=False)

    deck: Mapped[FlashcardDeck] = relationship(back_populates="cards")
