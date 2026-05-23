from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    avatar: str | None = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: UserOut
    token: str
