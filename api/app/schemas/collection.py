from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.collection_entry import Statut
from app.schemas.item import ItemRead


class CollectionEntryCreate(BaseModel):
    item_id: int = Field(gt=0)
    statut: Statut
    note: int | None = Field(default=None, ge=1, le=5)
    commentaire: str | None = Field(default=None, max_length=1000)


class CollectionEntryUpdate(BaseModel):
    statut: Statut | None = None
    note: int | None = Field(default=None, ge=1, le=5)
    commentaire: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_statut(self) -> "CollectionEntryUpdate":
        if "statut" in self.model_fields_set and self.statut is None:
            raise ValueError("Le statut ne peut pas etre nul")

        return self


class CollectionEntryRead(BaseModel):
    id: int
    statut: Statut
    note: int | None
    commentaire: str | None
    date_ajout: datetime
    item: ItemRead

    model_config = ConfigDict(from_attributes=True)
