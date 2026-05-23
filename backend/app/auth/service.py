from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import LoginResponse, UserOut
from app.core.redis import cache_set
from app.core.security import create_access_token, decode_access_token, verify_password
from app.models import User


async def login(email: str, password: str, db: AsyncSession) -> LoginResponse:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(user.id)
    return LoginResponse(
        user=UserOut.model_validate(user),
        token=token,
    )


async def logout(token: str) -> None:
    payload = decode_access_token(token)
    exp: int = payload.get("exp", 0)
    now = int(datetime.now(timezone.utc).timestamp())
    ttl = max(exp - now, 1)
    await cache_set(f"blocklist:{token}", "1", ttl=ttl)
