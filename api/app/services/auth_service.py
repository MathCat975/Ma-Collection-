from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import Credentials


async def register_user(
    session: AsyncSession,
    credentials: Credentials,
) -> User | None:
    existing_user = await session.scalar(
        select(User).where(User.email == str(credentials.email)),
    )

    if existing_user is not None:
        return None

    user = User(
        email=str(credentials.email),
        password_hash=hash_password(credentials.password),
    )
    session.add(user)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        return None

    await session.refresh(user)
    return user


async def authenticate_user(
    session: AsyncSession,
    credentials: Credentials,
) -> User | None:
    user = await session.scalar(
        select(User).where(User.email == str(credentials.email)),
    )

    if user is None or not verify_password(credentials.password, user.password_hash):
        return None

    return user
