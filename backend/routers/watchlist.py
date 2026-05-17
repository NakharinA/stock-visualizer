from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.watchlist import WatchlistItem
from models.schemas import WatchlistAddRequest, WatchlistItemResponse, WatchlistResponse
from services.data_service import fetch_quote_info

router = APIRouter()


@router.get("", response_model=WatchlistResponse)
def list_watchlist(db: Session = Depends(get_db)):
    items = db.query(WatchlistItem).order_by(WatchlistItem.added_at.desc()).all()
    result = []
    for item in items:
        quote = fetch_quote_info(item.ticker)
        result.append(WatchlistItemResponse(
            ticker=item.ticker,
            name=item.name,
            added_at=item.added_at.isoformat() if item.added_at else "",
            price=quote["price"],
            change=quote["change"],
            change_pct=quote["change_pct"],
        ))
    return WatchlistResponse(items=result)


@router.post("", response_model=WatchlistItemResponse, status_code=201)
def add_to_watchlist(body: WatchlistAddRequest, db: Session = Depends(get_db)):
    ticker = body.ticker.upper().strip()
    existing = db.query(WatchlistItem).filter(WatchlistItem.ticker == ticker).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"'{ticker}' is already in your watchlist")
    item = WatchlistItem(ticker=ticker, name=body.name)
    db.add(item)
    db.commit()
    db.refresh(item)
    quote = fetch_quote_info(ticker)
    return WatchlistItemResponse(
        ticker=item.ticker,
        name=item.name,
        added_at=item.added_at.isoformat() if item.added_at else "",
        price=quote["price"],
        change=quote["change"],
        change_pct=quote["change_pct"],
    )


@router.delete("/{ticker}", status_code=204)
def remove_from_watchlist(ticker: str, db: Session = Depends(get_db)):
    ticker = ticker.upper().strip()
    item = db.query(WatchlistItem).filter(WatchlistItem.ticker == ticker).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"'{ticker}' not found in watchlist")
    db.delete(item)
    db.commit()
