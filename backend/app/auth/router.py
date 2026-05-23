from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import schemas, service
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter()


@router.post("/login", response_model=schemas.LoginResponse)
async def login(body: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    return await service.login(body.email, body.password, db)


@router.post("/login/google")
async def login_google():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth is not implemented",
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    _: object = Depends(get_current_user),
):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()
    await service.logout(token)
