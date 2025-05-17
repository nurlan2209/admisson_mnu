from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from typing import Optional, List

from app.models.queue import QueueEntry, QueueStatus
from app.schemas import QueueCreate, QueueUpdate, QueueStatusResponse, PublicQueueCreate

# app/services/queue.py
def create_queue_entry(db: Session, applicant_data: PublicQueueCreate):
    """Create a new queue entry for an applicant"""
    # Get the next queue number
    last_entry = db.query(func.max(QueueEntry.queue_number)).scalar()
    next_number = 1 if last_entry is None else last_entry + 1
    
    # Create new entry
    db_entry = QueueEntry(
        queue_number=next_number,
        full_name=applicant_data.full_name,
        phone=applicant_data.phone,
        programs=applicant_data.programs,
        notes=applicant_data.notes,
        status=QueueStatus.WAITING
    )
    
    # Save to database
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return db_entry

def update_queue_entry(db: Session, queue_entry: QueueEntry, update_data: QueueUpdate):
    """Update a queue entry"""
    # Update fields
    if update_data.status is not None:
        queue_entry.status = update_data.status
    
    if update_data.notes is not None:
        queue_entry.notes = update_data.notes
    
    # Save changes
    db.commit()
    db.refresh(queue_entry)
    
    return queue_entry

def get_queue_status(db: Session, user_id: str) -> Optional[QueueStatusResponse]:
    """Get the queue status for a user"""
    # Get the user's entry
    entry = db.query(QueueEntry).filter(
        QueueEntry.user_id == user_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.IN_PROGRESS])
    ).first()
    
    if not entry:
        return None
    
    # Count waiting entries before this one
    position = db.query(QueueEntry).filter(
        QueueEntry.status == QueueStatus.WAITING,
        QueueEntry.queue_number < entry.queue_number
    ).count()
    
    # Get total waiting
    total_waiting = db.query(QueueEntry).filter(
        QueueEntry.status == QueueStatus.WAITING
    ).count()
    
    # Calculate estimated wait time (5 minutes per person)
    estimated_wait = position * 5 if entry.status == QueueStatus.WAITING else 0
    
    return QueueStatusResponse(
        queue_position=position + 1 if entry.status == QueueStatus.WAITING else 0,
        total_waiting=total_waiting,
        status=entry.status,
        estimated_wait_time=estimated_wait
    )


def get_all_queue_entries(db: Session, status: QueueStatus = None) -> List[QueueEntry]:
    """Get all queue entries, optionally filtered by status"""
    query = db.query(QueueEntry).options(joinedload(QueueEntry.user))
    
    if status:
        query = query.filter(QueueEntry.status == status)
    
    return query.order_by(QueueEntry.queue_number).all()

def get_queue_count(db: Session) -> int:
    """Получить количество людей в очереди со статусом WAITING"""
    count = db.query(QueueEntry).filter(QueueEntry.status == QueueStatus.WAITING).count()
    return count