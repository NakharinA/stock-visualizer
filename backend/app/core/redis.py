import redis.asyncio as aioredis

from app.core.config import settings

_redis_client: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


async def cache_get(key: str) -> str | None:
    client = get_redis()
    return await client.get(key)


async def cache_set(key: str, value: str, ttl: int = 86400) -> None:
    client = get_redis()
    await client.set(key, value, ex=ttl)


async def cache_delete(key: str) -> None:
    client = get_redis()
    await client.delete(key)
