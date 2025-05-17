# app/api/routes/public.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.queue import QueueEntry, QueueStatus
from app.schemas.queue import PublicQueueCreate, QueueResponse
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