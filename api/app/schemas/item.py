from pydantic import BaseModel, ConfigDict


class ItemRead(BaseModel):
    id: int
    titre: str
    categorie: str
    description: str
    image_url: str
    annee: int
    studio: str
    plateforme: str

    model_config = ConfigDict(from_attributes=True)


class PaginatedItems(BaseModel):
    total: int
    page: int
    limit: int
    results: list[ItemRead]
