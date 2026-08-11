import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Otp(Base):
    __tablename__ = "otps"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, index=True)
    otp_code = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

Base.metadata.create_all(bind=engine)
