from sqlalchemy.orm import Session
from app.schemas import UserCreate, AdminUserCreate
from app.models.user import User
from app.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate | AdminUserCreate, role: str = "applicant"):
    """Create a new user"""
    # Create password hash
    hashed_password = get_password_hash(user.password)
    
    # Create user object
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        hashed_password=hashed_password,
        role=role
    )
    
    # Save to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user