import os
import random
import string
import requests
import traceback
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import SessionLocal, User, Otp, Organization, Vehicle, Driver, WeeklyAllocation, DailyFare
from jose import jwt

app = FastAPI(title="FleetTrack Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

SECRET_KEY = os.getenv("JWT_SECRET", "fleettrack-super-secret-key-2026")
ALGORITHM = "HS256"
security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("user_id") or not payload.get("organization_id"):
            raise HTTPException(status_code=401, detail="Invalid token structure")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class RegisterRequest(BaseModel):
    name: str
    phone: str

class LoginRequest(BaseModel):
    phone: str

class VerifyRequest(BaseModel):
    phone: str
    otp: str

def send_sms(mail_to: str, msg: str):
    try:
        # User provided logic
        mail_to = mail_to.replace("+27", "0").replace(" ", "")
        data = {
            "mobile_numbers": mail_to,
            "message": msg
        }
        token = os.getenv("IWIN_API_TOKEN", "679fc77f7336456aa1b5bccb30b2a6ff")
        response = requests.post(
            'https://api.iwin.co.za/iwin/api/v1/messages',
            data=data,
            headers={'Authorization': f'bearer {token}'}
        )
        return response
    except Exception as e:
        traceback.print_exc()
        return None

def generate_and_send_otp(phone: str, db: Session):
    otp_code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    otp_record = Otp(phone=phone, otp_code=otp_code, expires_at=expires_at)
    db.add(otp_record)
    db.commit()
    
    send_sms(phone, f"Your FleetTrack code is: {otp_code}")

@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    if user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Provision a new Organization for the fleet owner
    new_org = Organization(name=f"{req.name}'s Fleet", subscription_tier="free")
    db.add(new_org)
    db.commit()
    db.refresh(new_org)

    # Store user and link to their new organization
    new_user = User(name=req.name, phone=req.phone, organization_id=new_org.id, role="owner")
    db.add(new_user)
    db.commit()
    
    generate_and_send_otp(req.phone, db)
    return {"message": "OTP sent successfully"}

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register.")
    
    generate_and_send_otp(req.phone, db)
    return {"message": "OTP sent successfully"}

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyRequest, db: Session = Depends(get_db)):
    otp_record = db.query(Otp).filter(
        Otp.phone == req.phone,
        Otp.otp_code == req.otp,
        Otp.expires_at > datetime.utcnow()
    ).order_by(Otp.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "message": "Verification successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "organization_id": user.organization_id,
            "role": user.role
        },
        "token": create_access_token({
            "user_id": user.id,
            "organization_id": user.organization_id,
            "role": user.role
        })
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# --- SaaS API Endpoints ---

class VehicleCreateRequest(BaseModel):
    make_model: str
    registration: str
    default_installment: float = 4000.0

@app.get("/api/vehicles")
def get_vehicles(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    org_id = current_user["organization_id"]
    vehicles = db.query(Vehicle).filter(Vehicle.organization_id == org_id).all()
    # For POC, we'll return an empty list if none exist, the frontend handles mapping
    return vehicles

@app.post("/api/vehicles")
def create_vehicle(req: VehicleCreateRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    org_id = current_user["organization_id"]
    vehicle = Vehicle(
        organization_id=org_id,
        make_model=req.make_model,
        registration=req.registration,
        default_installment=req.default_installment
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

class DriverCreateRequest(BaseModel):
    name: str
    phone: str
    allocated_vehicle_id: int = None

@app.get("/api/drivers")
def get_drivers(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    org_id = current_user["organization_id"]
    return db.query(Driver).filter(Driver.organization_id == org_id).all()

@app.post("/api/drivers")
def create_driver(req: DriverCreateRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    org_id = current_user["organization_id"]
    driver = Driver(
        organization_id=org_id,
        name=req.name,
        phone=req.phone,
        allocated_vehicle_id=req.allocated_vehicle_id
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

class WeeklyFaresRequest(BaseModel):
    vehicle_id: int
    driver_id: int
    week_start_date: str # YYYY-MM-DD
    installment: float
    driver_share: float
    maintenance: float
    total_collected: float
    daily_fares: list # list of dicts: [{"date": "YYYY-MM-DD", "amount": 1000}]

@app.post("/api/weekly-fares")
def save_weekly_fares(req: WeeklyFaresRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    org_id = current_user["organization_id"]
    
    # Verify vehicle belongs to organization
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id, Vehicle.organization_id == org_id).first()
    if not vehicle:
        raise HTTPException(status_code=403, detail="Unauthorized vehicle access")
        
    week_start = datetime.strptime(req.week_start_date, "%Y-%m-%d").date()
    
    # Save allocation
    allocation = WeeklyAllocation(
        vehicle_id=req.vehicle_id,
        driver_id=req.driver_id,
        week_start_date=week_start,
        installment=req.installment,
        driver_share=req.driver_share,
        maintenance=req.maintenance,
        total_collected=req.total_collected
    )
    db.add(allocation)
    
    # Save daily fares
    for df in req.daily_fares:
        fare_date = datetime.strptime(df["date"], "%Y-%m-%d").date()
        daily = DailyFare(
            vehicle_id=req.vehicle_id,
            date=fare_date,
            amount=float(df["amount"] or 0)
        )
        db.add(daily)
        
    db.commit()
    return {"message": "Weekly fares saved successfully"}
