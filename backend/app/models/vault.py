from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class Vault(db.Model):
    __tablename__ = "vaults"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    university_name: Mapped[str] = mapped_column(String(255), nullable=False)
    deadline: Mapped[str] = mapped_column(String(255), default="")
    cells_total: Mapped[int] = mapped_column(Integer, default=0)

    cells: Mapped[list["VaultCell"]] = relationship(
        back_populates="vault", cascade="all, delete-orphan", order_by="VaultCell.position"
    )


class VaultCell(db.Model):
    __tablename__ = "vault_cells"

    id: Mapped[int] = mapped_column(primary_key=True)
    vault_id: Mapped[int] = mapped_column(ForeignKey("vaults.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    sub: Mapped[str] = mapped_column(String(255), default="")
    uploaded: Mapped[bool] = mapped_column(Boolean, default=False)
    file_path: Mapped[str | None] = mapped_column(String(512))
    position: Mapped[int] = mapped_column(Integer, default=0)

    vault: Mapped[Vault] = relationship(back_populates="cells")
