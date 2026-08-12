import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Date
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subscription_tier = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    vehicles = relationship("Vehicle", back_populates="organization")
    drivers = relationship("Driver", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    role = Column(String, default="owner") # owner, manager
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class Otp(Base):
    __tablename__ = "otps"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, index=True)
    otp_code = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    make_model = Column(String)
    registration = Column(String, unique=True, index=True)
    status = Column(String, default="active")
    default_installment = Column(Float, default=4000.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="vehicles")
    allocations = relationship("WeeklyAllocation", back_populates="vehicle")
    daily_fares = relationship("DailyFare", back_populates="vehicle")
    drivers = relationship("Driver", back_populates="allocated_vehicle")

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    allocated_vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    name = Column(String)
    phone = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="drivers")
    allocated_vehicle = relationship("Vehicle", back_populates="drivers")
    allocations = relationship("WeeklyAllocation", back_populates="driver")

class WeeklyAllocation(Base):
    __tablename__ = "weekly_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    week_start_date = Column(Date, nullable=False, index=True)
    installment = Column(Float, default=0.0)
    driver_share = Column(Float, default=0.0)
    maintenance = Column(Float, default=0.0)
    total_collected = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="allocations")
    driver = relationship("Driver", back_populates="allocations")

class DailyFare(Base):
    __tablename__ = "daily_fares"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="daily_fares")

# Ensure tables are created
Base.metadata.create_all(bind=engine)
