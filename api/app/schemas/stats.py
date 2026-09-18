from pydantic import BaseModel


class StatusCounts(BaseModel):
    a_decouvrir: int
    en_cours: int
    termine: int


class StatsRead(BaseModel):
    total: int
    par_statut: StatusCounts
    note_moyenne: float | None
