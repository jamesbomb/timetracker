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

    # trova tutti i manager delle unità a cui appartiene l'utente
    managers_to_notify = set()
    for unit in current_user.units:
        for manager in unit.managers:
            if (
                manager.id != current_user.id
            ):  # Non notificare se stesso se è anche manager
                managers_to_notify.add(manager)

    # invia email a tutti i manager
    if managers_to_notify:
        subject = "New TimeOff Request"
        body = (
            f"User {current_user.full_name or current_user.email} requested {request.type}"
            f" from {request.start_date} to {request.end_date}."
        )
        for manager in managers_to_notify:
            send_email(background_tasks, manager.email, subject, body)

    return req
