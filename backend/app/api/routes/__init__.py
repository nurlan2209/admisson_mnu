# Init file for routes
from fastapi import APIRouter

from app.api.routes import auth, queue, admission, admin

router = APIRouter()

# Include all routers
router.include_router(auth.router)
router.include_router(queue.router)
router.include_router(admission.router, prefix="/admission")
router.include_router(admin.router, prefix="/admin")