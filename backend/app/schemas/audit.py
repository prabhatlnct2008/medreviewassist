from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.enums import AuditAction


class AuditLogResponse(BaseModel):
    id: str
    review_id: str
    user_id: str
    user_name: Optional[str] = None
    action: AuditAction
    details: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True
