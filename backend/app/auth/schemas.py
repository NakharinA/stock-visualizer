from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(..., description="User's email address", example="demo@example.com")
    password: str = Field(..., description="User's password", example="password123")


class UserOut(BaseModel):
    id: str = Field(..., description="Unique user ID", example="usr_abc123")
    name: str = Field(..., description="Display name", example="Jane Doe")
    email: str = Field(..., description="Email address", example="user@example.com")
    avatar: str | None = Field(None, description="Avatar URL", example="https://cdn.example.com/avatar.png")

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: UserOut
    token: str = Field(..., description="Bearer token to include in Authorization header", example="eyJhbGci...")
