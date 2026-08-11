import os
import random
import string
import requests
import traceback
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, User, Otp

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
    
    # Store user (or store temporarily until OTP verified, simplified for POC)
    new_user = User(name=req.name, phone=req.phone)
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
            "phone": user.phone
        },
        "token": "mock-jwt-token" # In a real app, generate a JWT here
    }

@app.get("/health")
def health():
    return {"status": "ok"}
