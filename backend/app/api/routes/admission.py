from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.queue import QueueEntry, QueueStatus
from app.schemas import QueueResponse, QueueUpdate
from app.security import get_admission_user
from app.services.queue import update_queue_entry, get_all_queue_entries

router = APIRouter()

@router.get("/queue", response_model=List[QueueResponse])
def list_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admission_user),
    status: QueueStatus = None
):
    """Get all queue entries (for admission staff)"""
    return get_all_queue_entries(db, status)

@router.post("/next", response_model=QueueResponse)
def process_next_in_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admission_user)
):
    """Move the next waiting applicant to in-progress status"""
    # Get the next waiting entry
    next_entry = db.query(QueueEntry).filter(
        QueueEntry.status == QueueStatus.WAITING
    ).order_by(QueueEntry.queue_number).first()
    
    if not next_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No applicants waiting in the queue"
        )
    
    # Update to in-progress
    next_entry.status = QueueStatus.IN_PROGRESS
    db.commit()
    db.refresh(next_entry)
    
    return next_entry

@router.put("/queue/{queue_id}", response_model=QueueResponse)
def update_queue_status(
    queue_id: str,
    queue_update: QueueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admission_user)
):
    """Update queue entry status (for admission staff)"""
    # Get queue entry
    queue_entry = db.query(QueueEntry).filter(QueueEntry.id == queue_id).first()
    
    if not queue_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue entry not found"
        )
    
    # Update entry
    return update_queue_entry(db, queue_entry, queue_update)