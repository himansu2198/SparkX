from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import datetime


# ── Signup ────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name:         str           = Field(..., min_length=2, max_length=100)
    email:        EmailStr
    password:     str           = Field(..., min_length=6, max_length=72)
    college_name: Optional[str] = None
    college:      Optional[str] = None  # frontend alias

    @model_validator(mode="after")
    def normalise_college(self):
        if self.college and not self.college_name:
            self.college_name = self.college
        return self

    model_config = {"json_schema_extra": {"example": {
        "name": "Rahul Sharma", "email": "rahul@example.com",
        "password": "secret123", "college_name": "IIT Bombay"
    }}}


# ── Login ─────────────────────────────────────────────────────────────────────
class UserLogin(BaseModel):
    email:    EmailStr
    password: str

    model_config = {"json_schema_extra": {
        "example": {"email": "rahul@example.com", "password": "secret123"}
    }}


# ── Token ─────────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"


# ── User out ──────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id:           int
    name:         str
    email:        str
    level:        int
    xp:           int
    streak:       int
    college_name: Optional[str]
    created_at:   Optional[datetime]

    model_config = {"from_attributes": True}


# ── Leaderboard entry ─────────────────────────────────────────────────────────
class LeaderboardEntry(BaseModel):
    rank:         int
    id:           int
    name:         str
    level:        int
    xp:           int
    streak:       int
    college_name: Optional[str]

    model_config = {"from_attributes": True}


# ── Forgot password ───────────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    model_config = {"json_schema_extra": {
        "example": {"email": "rahul@example.com"}
    }}


# ── Reset password ────────────────────────────────────────────────────────────
class ResetPasswordRequest(BaseModel):
    token:        str
    new_password: str = Field(..., min_length=6, max_length=72)

    model_config = {"json_schema_extra": {
        "example": {"token": "abc123...", "new_password": "newpass123"}
    }}