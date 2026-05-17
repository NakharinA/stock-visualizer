from fastapi import APIRouter
from models.schemas import IndicatorRequest, IndicatorResponse
from services.indicator_service import compute_indicator

router = APIRouter()


@router.post("/compute", response_model=IndicatorResponse)
def compute(req: IndicatorRequest):
    return compute_indicator(req)
