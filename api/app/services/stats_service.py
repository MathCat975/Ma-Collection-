from sqlalchemy import case, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.collection_entry import CollectionEntry, Statut
from app.schemas.stats import StatsRead, StatusCounts


async def get_user_stats(
    session: AsyncSession,
    user_id: int,
) -> StatsRead:
    statement = select(
        func.count(CollectionEntry.id),
        func.sum(
            case(
                (CollectionEntry.statut == Statut.A_DECOUVRIR, 1),
                else_=0,
            ),
        ),
        func.sum(
            case(
                (CollectionEntry.statut == Statut.EN_COURS, 1),
                else_=0,
            ),
        ),
        func.sum(
            case(
                (CollectionEntry.statut == Statut.TERMINE, 1),
                else_=0,
            ),
        ),
        func.avg(CollectionEntry.note),
    ).where(CollectionEntry.user_id == user_id)

    result = (await session.execute(statement)).one()
    total, a_decouvrir, en_cours, termine, note_moyenne = result

    return StatsRead(
        total=total,
        par_statut=StatusCounts(
            a_decouvrir=a_decouvrir or 0,
            en_cours=en_cours or 0,
            termine=termine or 0,
        ),
        note_moyenne=(
            round(float(note_moyenne), 2)
            if note_moyenne is not None
            else None
        ),
    )
