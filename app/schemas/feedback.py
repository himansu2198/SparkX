from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    message: str = Field(..., min_length=10, max_length=1000)
    rating:  int = Field(..., ge=1, le=5)

    model_config = {"json_schema_extra": {"example": {
        "message": "SparkX helped me land my first internship!",
        "rating": 5,
    }}}


class FeedbackOut(BaseModel):
    id:         int
    message:    str
    rating:     int
    user_name:  Optional[str] = "Anonymous"   # FIX: was non-optional str → crash if User.name is None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}