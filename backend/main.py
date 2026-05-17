from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import init_db
import os

load_dotenv()

app = FastAPI(title="Stock Chart API", version="1.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import stock, indicator, watchlist

app.include_router(stock.router, prefix="/stock", tags=["stock"])
app.include_router(indicator.router, prefix="/indicator", tags=["indicator"])
app.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
