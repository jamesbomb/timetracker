from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_manager
from .. import schemas, crud, models
from ..email_utils import send_email

router = APIRouter(prefix="/manager", tags=["manager"])

@router.get("/requests", response_model=list[schemas.TimeOffRequest])
def read_requests_for_approval(
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    return crud.get_requests_for_manager(db, current_manager)

@router.post("/requests/{request_id}/approve", response_model=schemas.TimeOffRequest)
def approve_request(
    request_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    req = crud.update_request_status(db, request_id, models.RequestStatus.approved)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    subject = "Your TimeOff Request was approved"
    body = f"Your request from {req.start_date} to {req.end_date} has been approved."
    send_email(background_tasks, req.user.email, subject, body)
    return req

@router.post("/requests/{request_id}/reject", response_model=schemas.TimeOffRequest)
def reject_request(
    request_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    req = crud.update_request_status(db, request_id, models.RequestStatus.rejected)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    subject = "Your TimeOff Request was rejected"
    body = f"Your request from {req.start_date} to {req.end_date} has been rejected."
    send_email(background_tasks, req.user.email, subject, body)
    return req