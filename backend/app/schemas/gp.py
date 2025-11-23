from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class GPBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    practice_name: Optional[str] = None
    email: Optional[EmailStr] = None
    fax: Optional[str] = None


class GPCreate(GPBase):
    pass


class GPUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    practice_name: Optional[str] = None
    email: Optional[EmailStr] = None
    fax: Optional[str] = None


class GPResponse(GPBase):
    id: str
    created_by_id: str
    created_at: datetime

    class Config:
        from_attributes = True
