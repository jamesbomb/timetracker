import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

# association table for managers to multiple units
manager_units = Table(
    "manager_units",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("unit_id", Integer, ForeignKey("units.id"), primary_key=True),
)


class RequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class TimeOffType(str, enum.Enum):
    leave = "leave"
    permit = "permit"


class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    users = relationship("User", back_populates="unit")
    managers = relationship(
        "User",
        secondary=manager_units,
        back_populates="managed_units",
    )


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_manager = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    unit = relationship("Unit", back_populates="users")
    requests = relationship("TimeOffRequest", back_populates="user")
    managed_units = relationship(
        "Unit",
        secondary=manager_units,
        back_populates="managers",
    )


class TimeOffRequest(Base):
    __tablename__ = "timeoff_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    type = Column(Enum(TimeOffType), default=TimeOffType.leave)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="requests")
