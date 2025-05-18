# Обновленная конфигурация маршрутов в backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, queue, admission, admin, public
from app.database import Base, engine
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Admission Queue API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, tags=["auth"])
app.include_router(queue.router)
app.include_router(admission.router, prefix="/admission", tags=["admission"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(public.router, prefix="/api/public", tags=["public"])  # Добавляем префикс для публичных API

@app.get("/")
def read_root():
    return {"message": "Welcome to Admission Queue API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)