from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_active_user
from .. import schemas, crud
from ..email_utils import send_email

router = APIRouter(prefix="/users/me/requests", tags=["requests"])

@router.get("", response_model=list[schemas.TimeOffRequest])
def read_my_requests(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    return crud.get_timeoff_requests_by_user(db, current_user.id)

@router.post("", response_model=schemas.TimeOffRequest, status_code=status.HTTP_201_CREATED)
def create_request(
    request: schemas.TimeOffRequestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    req = crud.create_timeoff_request(db, current_user.id, request)
    if current_user.unit and current_user.unit.users:
        manager = next((u for u in current_user.unit.users if u.is_manager), None)
        if manager:
            subject = "New TimeOff Request"
            body = (
                f"User {current_user.full_name or current_user.email} requested {request.type}"
                f" from {request.start_date} to {request.end_date}."
            )
            send_email(background_tasks, manager.email, subject, body)
    return req