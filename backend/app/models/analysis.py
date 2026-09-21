import datetime as dt

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.extensions import db


class PortfolioAnalysis(db.Model):
    __tablename__ = "portfolio_analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    status: Mapped[str] = mapped_column(String(16), default="processing")  # processing|ready
    preview_blocks: Mapped[list] = mapped_column(JSON, default=list)  # [{title, text}]
    full_text: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
