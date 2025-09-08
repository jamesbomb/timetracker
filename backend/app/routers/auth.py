from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import schemas, crud, auth as auth_module
from ..deps import get_db, get_current_active_user
from .. import models
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = crud.create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=auth_module.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=schemas.Token)
def google_login(google_token: schemas.GoogleLogin, db: Session = Depends(get_db)):
    idinfo = auth_module.verify_google_token(google_token.token)
    email = idinfo.get("email")
    full_name = idinfo.get("name")
    user = crud.get_user_by_email(db, email)
    if not user:
        import os
        from ..schemas import UserCreate

        random_pwd = os.urandom(16).hex()
        user_in = UserCreate(email=email, password=random_pwd, full_name=full_name)
        user = crud.create_user(db, user_in, full_name=full_name)
    access_token = crud.create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=auth_module.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.User)
def read_current_user(current_user: models.User = Depends(get_current_active_user)):
    return current_user
