from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import stock, overview

app = FastAPI(title="Stock Visualizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stock.router)
app.include_router(overview.router)


@app.get("/health")
def health():
    return {"status": "ok"}
