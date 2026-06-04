from fastapi import APIRouter

router = APIRouter()


# TODO: implement in Phase 04
@router.get("/stock/{symbol}")
def get_stock(symbol: str):
    raise NotImplementedError
