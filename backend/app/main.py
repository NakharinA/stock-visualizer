from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.router import router as auth_router
from app.core.config import settings
from app.core.redis import get_redis
from app.portfolio.router import router as portfolio_router
from app.stocks.router import router as stocks_router
from app.watchlist.router import router as watchlist_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialise Redis connection pool on startup
    get_redis()
    yield


app = FastAPI(
    title="Stock Visualizer API",
    version="1.0.0",
    description=(
        "REST API for the Stock Visualizer application.\n\n"
        "## Authentication\n"
        "Most endpoints require a Bearer token obtained from `POST /auth/login`.\n"
        "Click **Authorize** (🔒) and enter the token value only (without the `Bearer ` prefix)."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

_cors_origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials="*" not in _cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])
app.include_router(stocks_router, prefix="/stocks", tags=["stocks"])
app.include_router(watchlist_router, tags=["watchlist"])


@app.get("/health")
async def health():
    return {"status": "ok"}
