import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app, create_access_token

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    # Recreate tables before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register_and_verify():
    # Register
    reg_response = client.post("/api/auth/register", json={
        "name": "Test Boss",
        "phone": "0701112222"
    })
    assert reg_response.status_code == 200
    assert reg_response.json()["message"] == "OTP sent successfully"
    
    # We can't easily extract the random OTP from the DB in this simple test without querying it directly
    # So we'll query the DB directly to get the OTP
    db = TestingSessionLocal()
    from database import Otp
    otp_record = db.query(Otp).filter(Otp.phone == "0701112222").first()
    assert otp_record is not None
    
    # Verify OTP
    ver_response = client.post("/api/auth/verify-otp", json={
        "phone": "0701112222",
        "otp": otp_record.otp_code
    })
    assert ver_response.status_code == 200
    assert "token" in ver_response.json()
    assert ver_response.json()["user"]["name"] == "Test Boss"

def test_protected_route_without_token():
    response = client.get("/api/vehicles")
    assert response.status_code == 403 # FastAPI HTTPBearer returns 403 if missing header

def test_create_and_get_vehicles():
    # 1. Create a dummy user/org token
    token = create_access_token({
        "user_id": 1,
        "organization_id": 1,
        "role": "owner"
    })
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create vehicle
    create_res = client.post("/api/vehicles", json={
        "make_model": "Toyota Quantum",
        "registration": "AB 12 C GP"
    }, headers=headers)
    assert create_res.status_code == 200
    assert create_res.json()["registration"] == "AB 12 C GP"
    
    # 3. Get vehicles
    get_res = client.get("/api/vehicles", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) == 1
    assert get_res.json()[0]["make_model"] == "Toyota Quantum"
