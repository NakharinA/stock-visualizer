rmdir -Recurse -Force .venv
uv .venv
uv sync
uv run uvicorn app.main:app --reload --port 8000