from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.stats_service import get_user_stats


@pytest.mark.asyncio
async def test_get_user_stats() -> None:
    session = AsyncMock(spec=AsyncSession)
    result = MagicMock()
    result.one.return_value = (
        4,
        1,
        2,
        1,
        Decimal("3.666666"),
    )
    session.execute.return_value = result

    stats = await get_user_stats(session, user_id=7)

    assert stats.model_dump() == {
        "total": 4,
        "par_statut": {
            "a_decouvrir": 1,
            "en_cours": 2,
            "termine": 1,
        },
        "note_moyenne": 3.67,
    }
