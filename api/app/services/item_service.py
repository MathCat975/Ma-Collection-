from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.dependencies.pagination import PaginationParams
from app.models.item import Item
from app.schemas.item import PaginatedItems


def build_items_query(
    q: str | None,
    categorie: str | None,
) -> tuple[object, list[object]]:
    statement = select(Item)
    filters: list[object] = []

    if q is not None:
        search = f"%{q.lower()}%"
        filters.append(
            or_(
                func.lower(Item.titre).like(search),
                func.lower(Item.description).like(search),
                func.lower(Item.studio).like(search),
                func.lower(Item.plateforme).like(search),
            ),
        )

    if categorie is not None:
        filters.append(func.lower(Item.categorie) == categorie.lower())

    if filters:
        statement = statement.where(*filters)

    return statement, filters


async def get_items(
    session: AsyncSession,
    q: str | None,
    categorie: str | None,
    pagination: PaginationParams,
) -> PaginatedItems:
    statement, filters = build_items_query(q, categorie)
    count_statement = select(func.count()).select_from(Item)

    if filters:
        count_statement = count_statement.where(*filters)

    total = await session.scalar(count_statement)
    offset = (pagination.page - 1) * pagination.limit
    result = await session.scalars(
        statement.order_by(Item.id).offset(offset).limit(pagination.limit),
    )

    return PaginatedItems(
        total=total or 0,
        page=pagination.page,
        limit=pagination.limit,
        results=list(result),
    )


async def get_item_by_id(session: AsyncSession, item_id: int) -> Item | None:
    return await session.get(Item, item_id)
