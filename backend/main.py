from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
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

from routers import stock, indicator

app.include_router(stock.router, prefix="/stock", tags=["stock"])
app.include_router(indicator.router, prefix="/indicator", tags=["indicator"])


@app.get("/health")
def health():
    return {"status": "ok"}
