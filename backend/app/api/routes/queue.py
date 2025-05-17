from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.queue import QueueEntry, QueueStatus
from app.schemas import QueueCreate, QueueResponse, QueueStatusResponse, PublicQueueCreate
from app.security import get_current_active_user
from app.services import queue as queue_service

router = APIRouter(prefix="/api/public")

@router.get("/queue/count")
def queue_count(db: Session = Depends(get_db)):
    count = queue_service.get_queue_count(db)
    return {"count": count}

# Pydantic-схема для публичного запроса
class PublicQueueResponse(BaseModel):
    id: str
    queue_number: int
    full_name: str
    phone: str
    programs: List[str]
    status: QueueStatus
    notes: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat(),
        },
    }

@router.post("/queue", response_model=PublicQueueResponse)
async def add_to_public_queue(
    queue_data: PublicQueueCreate,
    db: Session = Depends(get_db)
):
    """Добавить публичного пользователя в очередь без аутентификации"""
    existing_entry = db.query(QueueEntry).filter(
        QueueEntry.phone == queue_data.phone,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.IN_PROGRESS])
    ).first()
    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с этим номером телефона уже в очереди"
        )

    last_entry = db.query(QueueEntry).order_by(QueueEntry.queue_number.desc()).first()
    queue_number = (last_entry.queue_number + 1) if last_entry else 1
    queue_entry = QueueEntry(
        full_name=queue_data.full_name,
        phone=queue_data.phone,
        programs=queue_data.programs,
        notes=queue_data.notes,
        status=QueueStatus.WAITING,
        queue_number=queue_number
    )
    db.add(queue_entry)
    db.commit()
    db.refresh(queue_entry)
    return PublicQueueResponse.from_orm(queue_entry)

# Эндпоинты для аутентифицированных пользователей
@router.post("/queue", response_model=QueueResponse)
def add_to_queue(
    queue_data: QueueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Добавить заявителя в очередь"""
    if current_user.role != "applicant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can join the queue"
        )
    
    existing_entry = db.query(QueueEntry).filter(
        QueueEntry.phone == current_user.phone,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.IN_PROGRESS])
    ).first()
    
    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже стоите в очереди"
        )
    
    return queue_service.create_queue_entry(db=db, user=current_user, queue_data=queue_data)

@router.get("/queue/status", response_model=QueueStatusResponse)
def get_user_queue_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить текущий статус очереди заявителя"""
    if current_user.role != "applicant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can check queue status"
        )
    
    status = queue_service.get_queue_status(db, current_user.phone)
    if not status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not currently in the queue"
        )
    
    return status

@router.delete("/queue/cancel", response_model=QueueResponse)
def cancel_queue_by_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Отменить текущую заявку в очереди пользователя (по телефону)"""
    if current_user.role != "applicant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can cancel queue entries"
        )
    
    queue_entry = db.query(QueueEntry).filter(
        QueueEntry.phone == current_user.phone,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.IN_PROGRESS])
    ).first()
    
    if not queue_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active queue entry found"
        )
    
    queue_entry.status = QueueStatus.COMPLETED
    db.commit()
    db.refresh(queue_entry)
    
    return queue_entry

@router.delete("/queue/cancel/{queue_id}", response_model=QueueResponse)
def cancel_queue_by_id(
    queue_id: str = Path(..., description="ID заявки для отмены"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Отменить заявку в очереди по ID"""
    queue_entry = db.query(QueueEntry).filter(
        QueueEntry.id == queue_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.IN_PROGRESS])
    ).first()

    if not queue_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue entry not found"
        )
    
    if current_user.role != "applicant" or queue_entry.phone != current_user.phone:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to cancel this queue entry"
        )

    queue_entry.status = QueueStatus.COMPLETED
    db.commit()
    db.refresh(queue_entry)

    return queue_entry

@router.put("/queue/cancel/{queue_id}", response_model=QueueResponse)
def cancel_queue_put(
    queue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Опциональный PUT для отмены заявки по ID (если фронтенд требует PUT)"""
    return cancel_queue_by_id(queue_id, db, current_user)
