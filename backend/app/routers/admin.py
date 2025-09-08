from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from ..deps import get_db, get_current_superuser
from .. import crud, schemas

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/units", response_model=schemas.Unit)
def create_unit(
    unit: schemas.UnitCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_superuser),
):
    return crud.create_unit(db, unit.name)

@router.get("/units", response_model=List[schemas.Unit])
def list_units(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_superuser),
):
    return crud.get_units(db)

@router.get("/users", response_model=List[schemas.UserWithUnits])
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_superuser),
):
    return crud.get_users(db)

@router.patch("/users/{user_id}", response_model=schemas.UserWithUnits)
def update_user(
    user_id: int,
    user_upd: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_superuser),
):
    updated = crud.update_user_manager(
        db,
        user_id,
        user_upd.is_manager,
        user_upd.managed_unit_ids,
        user_upd.member_unit_ids,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated
