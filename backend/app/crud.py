from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate, is_manager: bool = False, unit_id: int = None, full_name: str = None):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name or full_name,
        is_manager=is_manager,
        unit_id=unit_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not user.hashed_password or not pwd_context.verify(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta):
    from datetime import datetime, timedelta
    from jose import jwt
    import os

    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM")
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_timeoff_requests_by_user(db: Session, user_id: int):
    return db.query(models.TimeOffRequest).filter(models.TimeOffRequest.user_id == user_id).all()


def create_timeoff_request(db: Session, user_id: int, request: schemas.TimeOffRequestCreate):
    db_req = models.TimeOffRequest(
        user_id=user_id,
        start_date=request.start_date,
        end_date=request.end_date,
        type=request.type,
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req


def get_requests_for_manager(db: Session, manager: models.User):
    return db.query(models.TimeOffRequest).join(models.User).filter(models.User.unit_id == manager.unit_id).all()


def update_request_status(db: Session, request_id: int, status):
    req = db.query(models.TimeOffRequest).filter(models.TimeOffRequest.id == request_id).first()
    if req:
        req.status = status
        db.commit()
        db.refresh(req)
    return req