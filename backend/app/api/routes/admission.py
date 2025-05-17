from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.database import get_db
from app.models.user import User
from app.models.queue import QueueEntry, QueueStatus
from app.schemas import QueueResponse, QueueUpdate
from app.security import get_admission_user
from app.services.queue import update_queue_entry, get_all_queue_entries

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["admission"])  # Убрали prefix="/admission"

@router.get("/queue", response_model=List[QueueResponse])
def list_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admission_user),
    status: QueueStatus = None
):
    """Get all queue entries (for admission staff)"""
    logger.info(f"User {current_user.id} retrieving queue with status {status}")
    return get_all_queue_entries(db, status)

@router.post("/next", response_model=QueueResponse)
def process_next_in_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admission_user)
):
    """Move the next waiting applicant to in-progress status"""
    logger.info(f"User {current_user.id} processing next queue entry")
    next_entry = db.query(QueueEntry).filter(
        QueueEntry.status == QueueStatus.WAITING
    ).order_by(QueueEntry.queue_number).first()
    
    if not next_entry:
        logger.warning("No applicants waiting in the queue")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No applicants waiting in the queue"
        )
    
    next_entry.status = QueueStatus.IN_PROGRESS
    db.commit()
    db.refresh(next_entry)
    logger.info(f"Queue entry {next_entry.id} moved to IN_PROGRESS")
    
    return next_entry

@router.put("/queue/{queue_id}", response_model=QueueResponse)
def update_queue_status(
    queue_id: str,
    queue_update: QueueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admission_user)
):
    """Update queue entry status (for admission staff)"""
    logger.info(f"User {current_user.id} updating queue entry {queue_id}")
    queue_entry = db.query(QueueEntry).filter(QueueEntry.id == queue_id).first()
    
    if not queue_entry:
        logger.warning(f"Queue entry {queue_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue entry not found"
        )
    
    return update_queue_entry(db, queue_entry, queue_update)

@router.delete("/queue/{queue_id}", response_model=QueueResponse)
def delete_queue_entry(
    queue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admission_user)
):
    """Delete a queue entry (for admission staff)"""
    logger.info(f"User {current_user.id} attempting to delete queue entry {queue_id}")
    queue_entry = db.query(QueueEntry).filter(QueueEntry.id == queue_id).first()
    
    if not queue_entry:
        logger.warning(f"Queue entry {queue_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue entry not found"
        )
    
    db.delete(queue_entry)
    db.commit()
    logger.info(f"Queue entry {queue_id} deleted successfully")
    return queue_entry