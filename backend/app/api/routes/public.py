# app/api/routes/public.py
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.queue import QueueEntry, QueueStatus
from app.schemas.queue import PublicQueueCreate, QueueResponse, PublicQueueResponse
from app.services.captcha import verify_captcha

router = APIRouter()

@router.post("/queue", response_model=QueueResponse)
async def add_to_queue(
    queue_data: PublicQueueCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Add applicant to the queue (public endpoint)"""
    
    # Verify captcha
    captcha_valid = await verify_captcha(queue_data.captcha_token, request.client.host)
    if not captcha_valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid captcha"
        )
    
    # Check if phone number already exists in active queue
    existing_entry = db.query(QueueEntry).filter(
        QueueEntry.phone == queue_data.phone,
        QueueEntry.status.in_([QueueStatus.WAITING.value, QueueStatus.IN_PROGRESS.value])
    ).first()
    
    if existing_entry:
        raise HTTPException(
            status_code=400,
            detail="Вы уже стоите в очереди"
        )
    
    # Get the next queue number
    last_entry = db.query(func.max(QueueEntry.queue_number)).scalar()
    next_number = 1 if last_entry is None else last_entry + 1
    
    # Create new entry
    db_entry = QueueEntry(
        queue_number=next_number,
        full_name=queue_data.full_name,
        phone=queue_data.phone,
        programs=queue_data.programs,
        notes=queue_data.notes,
        status=QueueStatus.WAITING
    )
    
    # Save to database
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return db_entry

@router.get("/queue/check", response_model=PublicQueueResponse)
async def check_queue_by_name(
    full_name: str = Query(..., description="ФИО для проверки статуса"),
    db: Session = Depends(get_db)
):
    """Проверка статуса заявки по ФИО абитуриента"""
    
    # Поиск заявки
    queue_entry = db.query(QueueEntry).filter(
        QueueEntry.full_name == full_name
    ).order_by(desc(QueueEntry.created_at)).first()
    
    if not queue_entry:
        raise HTTPException(
            status_code=404,
            detail="Заявка не найдена"
        )
    
    # Получаем позицию в очереди и кол-во людей впереди, если в ожидании
    position = None
    people_ahead = None
    estimated_time = None
    
    if queue_entry.status == QueueStatus.WAITING:
        # Позиция = количество людей со статусом WAITING и с меньшим номером + 1
        position = db.query(QueueEntry).filter(
            QueueEntry.status == QueueStatus.WAITING,
            QueueEntry.queue_number < queue_entry.queue_number
        ).count() + 1
        
        # Кол-во людей впереди = позиция - 1
        people_ahead = position - 1
        
        # Примерное время ожидания: 5 минут на человека
        estimated_time = people_ahead * 5
    
    # Формируем ответ с дополнительными данными
    response = PublicQueueResponse.from_orm(queue_entry)
    response.position = position
    response.people_ahead = people_ahead
    response.estimated_time = estimated_time
    
    return response

@router.delete("/queue/cancel/{queue_id}", response_model=QueueResponse)
async def cancel_queue_by_id(
    queue_id: str,
    db: Session = Depends(get_db)
):
    """Отмена заявки по ID"""
    
    queue_entry = db.query(QueueEntry).filter(
        QueueEntry.id == queue_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.IN_PROGRESS])
    ).first()
    
    if not queue_entry:
        raise HTTPException(
            status_code=404,
            detail="Заявка не найдена или уже завершена"
        )
    
    # Меняем статус на COMPLETED (отменено)
    queue_entry.status = QueueStatus.COMPLETED
    db.commit()
    db.refresh(queue_entry)
    
    return queue_entry

@router.put("/queue/move-back/{queue_id}", response_model=PublicQueueResponse)
async def move_back_in_queue(
    queue_id: str,
    db: Session = Depends(get_db)
):
    """Перемещение заявки в конец очереди"""
    
    queue_entry = db.query(QueueEntry).filter(
        QueueEntry.id == queue_id,
        QueueEntry.status == QueueStatus.WAITING
    ).first()
    
    if not queue_entry:
        raise HTTPException(
            status_code=404,
            detail="Заявка не найдена или не находится в статусе ожидания"
        )
    
    # Находим максимальный номер в очереди
    last_entry = db.query(func.max(QueueEntry.queue_number)).scalar()
    next_number = last_entry + 1 if last_entry else 1
    
    # Обновляем номер в очереди
    queue_entry.queue_number = next_number
    db.commit()
    db.refresh(queue_entry)
    
    # Получаем позицию в очереди и кол-во людей впереди
    position = db.query(QueueEntry).filter(
        QueueEntry.status == QueueStatus.WAITING,
        QueueEntry.queue_number < queue_entry.queue_number
    ).count() + 1
    
    people_ahead = position - 1
    estimated_time = people_ahead * 5
    
    # Формируем ответ с дополнительными данными
    response = PublicQueueResponse.from_orm(queue_entry)
    response.position = position
    response.people_ahead = people_ahead
    response.estimated_time = estimated_time
    
    return response