from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.models.queue import QueueStatus
from app.schemas.user import UserResponse as UserInfo  # в начале файла
from app.schemas.user import UserResponse

# Queue schemas
class QueueBase(BaseModel):
    notes: Optional[str] = None

class QueueCreate(QueueBase):
    pass

class QueueUpdate(QueueBase):
    status: Optional[QueueStatus] = None

class QueueResponse(QueueBase):
    id: str
    queue_number: int
    user_id: str
    status: QueueStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserResponse] = None  # Вложенная схема пользователя

    class Config:
        from_attributes = True

class QueueStatusResponse(BaseModel):
    queue_position: int
    total_waiting: int
    status: QueueStatus
    estimated_wait_time: Optional[int] = None  # Minutes