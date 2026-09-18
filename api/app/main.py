from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.init_db import create_db_and_tables
from app.db.session import engine
from app.exceptions import install_exception_handlers
from app.routers.auth import router as auth_router
from app.routers.collection import router as collection_router
from app.routers.items import router as items_router
from app.routers.stats import router as stats_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    await create_db_and_tables()
    try:
        yield
    finally:
        await engine.dispose()


app = FastAPI(
    title="Ma Collection API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

install_exception_handlers(app)
app.include_router(auth_router)
app.include_router(items_router)
app.include_router(collection_router)
app.include_router(stats_router)
