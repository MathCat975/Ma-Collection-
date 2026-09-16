from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import Credentials, TokenRead, UserRead
from app.schemas.error import ErrorResponse
from app.services.auth_service import authenticate_user, register_user


router = APIRouter(prefix="/auth", tags=["Authentification"])
SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


@router.post(
    "/register",
    summary="Creer un compte",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        409: {
            "model": ErrorResponse,
            "description": "Email deja utilise",
        },
    },
)
async def register(credentials: Credentials, session: SessionDep) -> User:
    user = await register_user(session, credentials)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette adresse email est deja utilisee",
        )

    return user


@router.post(
    "/login",
    summary="Se connecter",
    response_model=TokenRead,
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Identifiants invalides",
        },
    },
)
async def login(credentials: Credentials, session: SessionDep) -> TokenRead:
    user = await authenticate_user(session, credentials)

    if user is None or user.id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenRead(access_token=create_access_token(user.id))


@router.get(
    "/me",
    summary="Lire l'utilisateur connecte",
    response_model=UserRead,
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Jeton invalide ou absent",
        },
    },
)
async def read_current_user(current_user: CurrentUserDep) -> User:
    return current_user
