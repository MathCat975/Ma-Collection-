from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.collection_entry import CollectionEntry, Statut
from app.models.item import Item
from app.schemas.collection import (
    CollectionEntryCreate,
    CollectionEntryRead,
    CollectionEntryUpdate,
)
from app.schemas.item import ItemRead


class DuplicateCollectionEntryError(Exception):
    pass


def build_entry_read(
    entry: CollectionEntry,
    item: Item,
) -> CollectionEntryRead:
    return CollectionEntryRead(
        id=entry.id,
        statut=entry.statut,
        note=entry.note,
        commentaire=entry.commentaire,
        date_ajout=entry.date_ajout,
        item=ItemRead.model_validate(item),
    )


async def get_collection(
    session: AsyncSession,
    user_id: int,
    statut: Statut | None,
    tri: str,
) -> list[CollectionEntryRead]:
    statement = (
        select(CollectionEntry, Item)
        .join(Item, CollectionEntry.item_id == Item.id)
        .where(CollectionEntry.user_id == user_id)
    )

    if statut is not None:
        statement = statement.where(CollectionEntry.statut == statut)

    if tri == "note":
        statement = statement.order_by(
            CollectionEntry.note.desc().nullslast(),
            CollectionEntry.date_ajout.desc(),
        )
    else:
        statement = statement.order_by(CollectionEntry.date_ajout.desc())

    rows = (await session.execute(statement)).all()
    return [build_entry_read(entry, item) for entry, item in rows]


async def create_collection_entry(
    session: AsyncSession,
    user_id: int,
    data: CollectionEntryCreate,
) -> CollectionEntryRead | None:
    item = await session.get(Item, data.item_id)

    if item is None:
        return None

    existing_entry = await session.scalar(
        select(CollectionEntry).where(
            CollectionEntry.user_id == user_id,
            CollectionEntry.item_id == data.item_id,
        ),
    )

    if existing_entry is not None:
        raise DuplicateCollectionEntryError

    entry = CollectionEntry(
        user_id=user_id,
        item_id=data.item_id,
        statut=data.statut,
        note=data.note,
        commentaire=data.commentaire,
    )
    session.add(entry)

    try:
        await session.commit()
    except IntegrityError as error:
        await session.rollback()
        raise DuplicateCollectionEntryError from error

    await session.refresh(entry)
    return build_entry_read(entry, item)


async def update_collection_entry(
    session: AsyncSession,
    user_id: int,
    entry_id: int,
    data: CollectionEntryUpdate,
) -> CollectionEntryRead | None:
    row = (
        await session.execute(
            select(CollectionEntry, Item)
            .join(Item, CollectionEntry.item_id == Item.id)
            .where(
                CollectionEntry.id == entry_id,
                CollectionEntry.user_id == user_id,
            ),
        )
    ).first()

    if row is None:
        return None

    entry, item = row
    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(entry, field, value)

    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    return build_entry_read(entry, item)


async def delete_collection_entry(
    session: AsyncSession,
    user_id: int,
    entry_id: int,
) -> bool:
    entry = await session.scalar(
        select(CollectionEntry).where(
            CollectionEntry.id == entry_id,
            CollectionEntry.user_id == user_id,
        ),
    )

    if entry is None:
        return False

    await session.delete(entry)
    await session.commit()
    return True
