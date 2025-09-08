from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import RequestStatus, TimeOffType


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class GoogleLogin(BaseModel):
    token: str


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    is_manager: bool
    is_superuser: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UnitBase(BaseModel):
    name: str


class UnitCreate(UnitBase):
    pass


class Unit(UnitBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    is_manager: bool
    managed_unit_ids: Optional[List[int]] = None  # Unità che gestisce
    member_unit_ids: Optional[List[int]] = None  # Unità a cui appartiene


class UserWithUnits(User):
    units: List[Unit] = []  # Unità a cui appartiene
    managed_units: List[Unit] = []  # Unità che gestisce

    model_config = ConfigDict(from_attributes=True)


class TimeOffRequestBase(BaseModel):
    start_date: datetime
    end_date: datetime
    type: TimeOffType


class TimeOffRequestCreate(TimeOffRequestBase):
    pass


class TimeOffRequest(TimeOffRequestBase):
    id: int
    user_id: int
    status: RequestStatus
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TimeOffRequestWithUser(TimeOffRequest):
    user: User


class RejectRequest(BaseModel):
    rejection_reason: str
