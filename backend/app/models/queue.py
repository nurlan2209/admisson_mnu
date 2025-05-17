from sqlalchemy import Column, Integer, String, DateTime, Enum, JSON
from sqlalchemy.sql import func
from uuid import uuid4
import enum

from app.database import Base

class QueueStatus(str, enum.Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PAUSED = "paused"

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    queue_number = Column(Integer, index=True)
    full_name = Column(String, nullable=False)    # новое поле: ФИО
    phone = Column(String, nullable=False)        # новое поле: телефон
    programs = Column(JSON, nullable=False)       # новое поле: программы (JSON)
    status = Column(Enum(QueueStatus), default=QueueStatus.WAITING)
    notes = Column(String, nullable=True)         # новое поле: заметки
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
