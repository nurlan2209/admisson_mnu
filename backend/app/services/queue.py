from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List

from app.models.queue import QueueEntry, QueueStatus
from app.models.user import User
from app.schemas import QueueCreate, QueueUpdate, QueueStatusResponse, PublicQueueCreate

def create_queue_entry(db: Session, user: User, queue_data: QueueCreate):
    """Create a new queue entry for an authenticated applicant"""
    last_entry = db.query(func.max(QueueEntry.queue_number)).scalar()
    next_number = 1 if last_entry is None else last_entry + 1
    db_entry = QueueEntry(
        queue_number=next_number,
        full_name=user.full_name,
        phone=user.phone,
        programs=[],
        notes=queue_data.notes,
        status=QueueStatus.WAITING
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def update_queue_entry(db: Session, queue_entry: QueueEntry, update_data: QueueUpdate):
    """Update a queue entry"""
    if update_data.status is not None:
        queue_entry.status = update_data.status
    if update_data.notes is not None:
        queue_entry.notes = update_data.notes
    db.commit()
    db.refresh(queue_entry)
    return queue_entry

def get_queue_status(db: Session, phone: str) -> Optional[QueueStatusResponse]:
    """Get the queue status for a user based on phone"""
    entry = db.query(QueueEntry).filter(
        QueueEntry.phone == phone,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.IN_PROGRESS])
    ).first()
    if not entry:
        return None
    position = db.query(QueueEntry).filter(
        QueueEntry.status == QueueStatus.WAITING,
        QueueEntry.queue_number < entry.queue_number
    ).count()
    total_waiting = db.query(QueueEntry).filter(
        QueueEntry.status == QueueStatus.WAITING
    ).count()
    estimated_wait = position * 5 if entry.status == QueueStatus.WAITING else 0
    return QueueStatusResponse(
        queue_position=position + 1 if entry.status == QueueStatus.WAITING else 0,
        total_waiting=total_waiting,
        status=entry.status,
        estimated_wait_time=estimated_wait
    )

def get_all_queue_entries(db: Session, status: QueueStatus = None) -> List[QueueEntry]:
    """Get all queue entries, optionally filtered by status"""
    query = db.query(QueueEntry)
    if status:
        query = query.filter(QueueEntry.status == status)
    return query.order_by(QueueEntry.full_name.asc()).all()

def get_queue_count(db: Session) -> int:
    """Получить количество людей в очереди со статусом WAITING"""
    count = db.query(QueueEntry).filter(QueueEntry.status == QueueStatus.WAITING).count()
    return count