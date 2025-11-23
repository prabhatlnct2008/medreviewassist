from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ConsentBase(BaseModel):
    obtained: bool = False
    notes: Optional[str] = None


class ConsentUpdate(ConsentBase):
    pass


class ConsentResponse(ConsentBase):
    id: str
    review_id: str
    obtained_at: Optional[datetime]

    class Config:
        from_attributes = True
