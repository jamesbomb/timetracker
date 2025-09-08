from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from ..deps import get_db, get_current_manager
from .. import schemas, crud, models
from ..email_utils import send_email

router = APIRouter(prefix="/manager", tags=["manager"])


@router.get("/requests")
def read_requests_for_approval(
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    requests = crud.get_requests_for_manager(db, current_manager)

    result = []
    for req in requests:
        req_dict = {
            "id": req.id,
            "user_id": req.user_id,
            "start_date": req.start_date,
            "end_date": req.end_date,
            "type": req.type,
            "status": req.status,
            "rejection_reason": req.rejection_reason,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "user": {"email": req.user.email, "full_name": req.user.full_name},
        }
        result.append(req_dict)
    return result

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
    reject_data: schemas.RejectRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    req = crud.update_request_status(
        db, request_id, models.RequestStatus.rejected, reject_data.rejection_reason
    )
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    subject = "Your TimeOff Request was rejected"
    body = (
        f"Your request from {req.start_date} to {req.end_date} has been rejected.\n"
        f"Reason: {reject_data.rejection_reason}"
    )
    send_email(background_tasks, req.user.email, subject, body)
    return req
