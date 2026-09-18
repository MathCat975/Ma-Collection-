from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.collection_entry import Statut
from app.models.user import User
from app.schemas.collection import (
    CollectionEntryCreate,
    CollectionEntryRead,
    CollectionEntryUpdate,
)
from app.schemas.error import ErrorResponse
from app.services.collection_service import (
    DuplicateCollectionEntryError,
    create_collection_entry,
    delete_collection_entry,
    get_collection,
    update_collection_entry,
)


router = APIRouter(prefix="/me/collection", tags=["Collection"])
SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


@router.get(
    "",
    summary="Lire sa collection personnelle",
    response_model=list[CollectionEntryRead],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentification requise",
        },
    },
)
async def list_collection(
    session: SessionDep,
    current_user: CurrentUserDep,
    statut: Annotated[Statut | None, Query()] = None,
    tri: Annotated[Literal["date", "note"], Query()] = "date",
) -> list[CollectionEntryRead]:
    return await get_collection(
        session,
        current_user.id,
        statut,
        tri,
    )


@router.post(
    "",
    summary="Ajouter un jeu a sa collection",
    response_model=CollectionEntryRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentification requise",
        },
        404: {
            "model": ErrorResponse,
            "description": "Item introuvable",
        },
        409: {
            "model": ErrorResponse,
            "description": "Item deja present",
        },
    },
)
async def create_entry(
    data: CollectionEntryCreate,
    session: SessionDep,
    current_user: CurrentUserDep,
) -> CollectionEntryRead:
    try:
        entry = await create_collection_entry(
            session,
            current_user.id,
            data,
        )
    except DuplicateCollectionEntryError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet item est deja present dans la collection",
        ) from error

    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item introuvable",
        )

    return entry


@router.patch(
    "/{entry_id}",
    summary="Modifier une entree de sa collection",
    response_model=CollectionEntryRead,
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentification requise",
        },
        404: {
            "model": ErrorResponse,
            "description": "Entree introuvable",
        },
    },
)
async def update_entry(
    entry_id: int,
    data: CollectionEntryUpdate,
    session: SessionDep,
    current_user: CurrentUserDep,
) -> CollectionEntryRead:
    entry = await update_collection_entry(
        session,
        current_user.id,
        entry_id,
        data,
    )

    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entree introuvable",
        )

    return entry


@router.delete(
    "/{entry_id}",
    summary="Supprimer une entree de sa collection",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentification requise",
        },
        404: {
            "model": ErrorResponse,
            "description": "Entree introuvable",
        },
    },
)
async def delete_entry(
    entry_id: int,
    session: SessionDep,
    current_user: CurrentUserDep,
) -> Response:
    deleted = await delete_collection_entry(
        session,
        current_user.id,
        entry_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entree introuvable",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
