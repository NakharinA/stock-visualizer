from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import schemas, service
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter()


@router.post(
    "/login",
    response_model=schemas.LoginResponse,
    summary="Email / password login",
    description="Authenticate with email and password. Returns the authenticated user and a Bearer token.",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
    },
)
async def login(body: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    return await service.login(body.email, body.password, db)


@router.post(
    "/login/google",
    summary="Google OAuth login (not implemented)",
    description="Placeholder for Google OAuth login. Returns 501.",
    responses={
        501: {"description": "Not implemented"},
    },
)
async def login_google():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth is not implemented",
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout",
    description="Invalidate the current Bearer token. Requires Authorization header.",
    responses={
        204: {"description": "Logged out successfully"},
        401: {"description": "Missing or invalid token"},
    },
)
async def logout(
    request: Request,
    _: object = Depends(get_current_user),
):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()
    await service.logout(token)
