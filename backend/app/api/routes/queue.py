from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.queue import QueueEntry
from app.schemas import QueueCreate, QueueResponse, QueueStatusResponse
from app.security import get_current_active_user
from app.services.queue import create_queue_entry, get_queue_status

router = APIRouter()

@router.post("/queue", response_model=QueueResponse)
def add_to_queue(
    queue_data: QueueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add applicant to the queue"""
    # Check if user is an applicant
    if current_user.role != "applicant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can join the queue"
        )
    
    # Check if user is already in queue
    existing_entry = db.query(QueueEntry).filter(
        QueueEntry.user_id == current_user.id,
        QueueEntry.status.in_(["waiting", "in_progress"])
    ).first()
    
    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже стоите в очереди"
        )
    
    # Add user to queue
    return create_queue_entry(db=db, user_id=current_user.id, queue_data=queue_data)

@router.get("/queue/status", response_model=QueueStatusResponse)
def get_user_queue_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get applicant's current position in the queue"""
    # Check if user is an applicant
    if current_user.role != "applicant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can check queue status"
        )
    
    # Get queue status
    status = get_queue_status(db, current_user.id)
    if not status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not currently in the queue"
        )
    
    return status