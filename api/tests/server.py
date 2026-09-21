import asyncio
import sys

import uvicorn

from tests.conftest import manage_schema
from app.main import app
from seed import seed


def main() -> None:
    if "--cleanup" in sys.argv:
        asyncio.run(manage_schema(False))
        return
    asyncio.run(manage_schema(True))
    try:
        asyncio.run(seed())
        uvicorn.run(app, host="127.0.0.1", port=8001)
    finally:
        asyncio.run(manage_schema(False))


if __name__ == "__main__":
    main()
