from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.enums import UserRole


class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.PHARMACIST
    ahpra_number: Optional[str] = None
    organisation_name: Optional[str] = None
    terms_accepted: bool = Field(..., description="Must accept terms")
    clinical_responsibility_accepted: bool = Field(..., description="Must accept clinical responsibility")


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    ahpra_number: Optional[str] = None
    organisation_name: Optional[str] = None
    conducts_hmr: Optional[bool] = None
    conducts_rmmr: Optional[bool] = None


class OnboardingData(BaseModel):
    ahpra_number: Optional[str] = None
    conducts_hmr: bool = True
    conducts_rmmr: bool = True
    organisation_name: Optional[str] = None
    compliance_acknowledged: bool = Field(..., description="Must acknowledge compliance info")


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    ahpra_number: Optional[str]
    organisation_name: Optional[str]
    conducts_hmr: bool
    conducts_rmmr: bool
    onboarding_completed: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str
