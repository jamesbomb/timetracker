import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Table,
    Text,
)
from sqlalchemy.orm import relationship
from .database import Base

manager_units = Table(
    "manager_units",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("unit_id", Integer, ForeignKey("units.id"), primary_key=True),
    Column("created_at", DateTime, default=datetime.utcnow),
    Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
)

user_units = Table(
    "user_units",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("unit_id", Integer, ForeignKey("units.id"), primary_key=True),
    Column("created_at", DateTime, default=datetime.utcnow),
    Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    members = relationship(
        "User",
        secondary=user_units,
        back_populates="units",
    )
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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    requests = relationship("TimeOffRequest", back_populates="user")
    units = relationship(
        "Unit",
        secondary=user_units,
        back_populates="members",
    )
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
    rejection_reason = Column(Text, nullable=True)  # Motivazione del rifiuto
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="requests")
