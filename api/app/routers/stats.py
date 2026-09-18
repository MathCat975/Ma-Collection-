from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.error import ErrorResponse
from app.schemas.stats import StatsRead
from app.services.stats_service import get_user_stats


router = APIRouter(prefix="/me", tags=["Statistiques"])
SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


@router.get(
    "/stats",
    summary="Lire les statistiques de sa collection",
    response_model=StatsRead,
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentification requise",
        },
    },
)
async def read_stats(
    session: SessionDep,
    current_user: CurrentUserDep,
) -> StatsRead:
    return await get_user_stats(session, current_user.id)
