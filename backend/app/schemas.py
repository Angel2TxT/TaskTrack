from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=1000)
    estimated_minutes: int = Field(ge=1, le=24 * 60)


class TaskTimeUpdate(BaseModel):
    elapsed_seconds: int = Field(ge=0, le=7 * 24 * 3600)


class TaskPublic(BaseModel):
    id: int
    title: str
    description: str
    estimated_minutes: int
    elapsed_seconds: int
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
