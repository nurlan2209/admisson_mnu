from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.queue import QueueStatus

# Base queue schema with common fields
class QueueBase(BaseModel):
    notes: Optional[str] = None

# Schema for creating a queue entry by an applicant
class QueueCreate(QueueBase):
    programs: List[str]

# Schema for updating queue entries by staff
class QueueUpdate(QueueBase):
    status: Optional[QueueStatus] = None

# Schema for public form submission (without auth)
class PublicQueueCreate(BaseModel):
    full_name: str
    phone: str
    programs: List[str]
    notes: Optional[str] = None
    captcha_token: Optional[str] = None  # Теперь опциональное поле

# Response schema for queue entries - updated to use applicant data directly
class QueueResponse(QueueBase):
    id: str
    queue_number: int
    full_name: str
    phone: str
    programs: List[str]
    status: QueueStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={datetime: lambda v: v.isoformat()}
    )

# Queue status response for checking position
class QueueStatusResponse(BaseModel):
    queue_position: int
    total_waiting: int
    status: QueueStatus
    estimated_wait_time: Optional[int] = None  # Minutes
