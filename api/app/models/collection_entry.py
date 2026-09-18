from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlmodel import Field, SQLModel


class Statut(str, Enum):
    A_DECOUVRIR = "a_decouvrir"
    EN_COURS = "en_cours"
    TERMINE = "termine"


class CollectionEntry(SQLModel, table=True):
    __tablename__ = "collection_entries"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "item_id",
            name="uq_collection_entry_user_item",
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    item_id: int = Field(foreign_key="items.id", index=True)
    statut: Statut = Field(
        sa_column=Column(String(20), nullable=False),
    )
    note: int | None = Field(
        default=None,
        sa_column=Column(Integer, nullable=True),
    )
    commentaire: str | None = Field(
        default=None,
        sa_column=Column(Text, nullable=True),
    )
    date_ajout: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
