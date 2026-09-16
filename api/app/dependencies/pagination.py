from dataclasses import dataclass
from typing import Annotated

from fastapi import Query


@dataclass(frozen=True)
class PaginationParams:
    page: int
    limit: int


def get_pagination(
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=50)] = 12,
) -> PaginationParams:
    return PaginationParams(page=page, limit=limit)
