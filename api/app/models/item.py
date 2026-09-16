from sqlalchemy import Column, Integer, String, Text
from sqlmodel import Field, SQLModel


class Item(SQLModel, table=True):
    __tablename__ = "items"

    id: int | None = Field(default=None, primary_key=True)
    titre: str = Field(
        sa_column=Column(String(200), nullable=False, index=True),
    )
    categorie: str = Field(
        sa_column=Column(String(100), nullable=False, index=True),
    )
    description: str = Field(sa_column=Column(Text, nullable=False))
    image_url: str = Field(sa_column=Column(String(500), nullable=False))
    annee: int = Field(sa_column=Column(Integer, nullable=False))
    studio: str = Field(sa_column=Column(String(200), nullable=False))
    plateforme: str = Field(sa_column=Column(String(100), nullable=False))
