from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(
        sa_column=Column(
            String(320),
            unique=True,
            index=True,
            nullable=False,
        ),
    )
    password_hash: str = Field(nullable=False)
