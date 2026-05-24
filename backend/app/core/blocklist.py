"""
In-memory token blocklist.

Tokens are stored with their expiry timestamp so the set does not grow
unbounded — expired entries are pruned on every write.
"""
import time

# {token: expiry_unix_timestamp}
_blocklist: dict[str, int] = {}


def _prune() -> None:
    now = int(time.time())
    expired = [t for t, exp in _blocklist.items() if exp <= now]
    for t in expired:
        del _blocklist[t]


def block_token(token: str, ttl: int) -> None:
    """Add token to blocklist for `ttl` seconds."""
    _prune()
    _blocklist[token] = int(time.time()) + ttl


def is_blocked(token: str) -> bool:
    """Return True if the token is in the blocklist and not yet expired."""
    exp = _blocklist.get(token)
    if exp is None:
        return False
    if int(time.time()) > exp:
        del _blocklist[token]
        return False
    return True
