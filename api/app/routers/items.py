from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.dependencies.pagination import PaginationParams, get_pagination
from app.schemas.error import ErrorResponse
from app.schemas.item import ItemRead, PaginatedItems
from app.services.item_service import get_item_by_id, get_items


router = APIRouter(prefix="/items", tags=["Catalogue"])
SessionDep = Annotated[AsyncSession, Depends(get_session)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    summary="Rechercher les jeux du catalogue",
    response_model=PaginatedItems,
)
async def list_items(
    session: SessionDep,
    pagination: PaginationDep,
    q: Annotated[str | None, Query(min_length=2, max_length=100)] = None,
    categorie: Annotated[str | None, Query(max_length=100)] = None,
) -> PaginatedItems:
    return await get_items(session, q, categorie, pagination)


@router.get(
    "/{item_id}",
    summary="Lire la fiche detaillee d'un jeu",
    response_model=ItemRead,
    responses={
        404: {
            "model": ErrorResponse,
            "description": "Jeu introuvable",
        },
    },
)
async def read_item(item_id: int, session: SessionDep) -> ItemRead:
    item = await get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item introuvable",
        )

    return ItemRead.model_validate(item)
