from fastapi import APIRouter, HTTPException, Depends
from models.user import UserCreate, UserLogin, UserChangePassword, ForgotPasswordRequest, ResetPasswordRequest
from utils.security import get_password_hash, verify_password, get_current_user, create_user_response, create_access_token
from database import get_db
from bson import ObjectId
from datetime import datetime, timedelta
from utils.email_operations import send_email
import secrets
import os

router = APIRouter()

@router.post("/register")
async def register(user: UserCreate):
    db = get_db()
    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "username": user.username,
        "password": hashed_password,
        "credits": user.initial_credits
    }
    result = db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    return create_user_response(new_user)

@router.post("/login")
async def login(user: UserLogin):
    db = get_db()
    db_user = db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return create_user_response(db_user)

@router.post("/change-password")
async def change_password(user_data: UserChangePassword, current_user: str = Depends(get_current_user)):
    db = get_db()
    db_user = db.users.find_one({"email": current_user})
    if not db_user or not verify_password(user_data.old_password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    new_hashed_password = get_password_hash(user_data.new_password)
    db.users.update_one({"email": current_user}, {"$set": {"password": new_hashed_password}})
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    db = get_db()
    user = db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expiration = datetime.utcnow() + timedelta(hours=1)

    db.users.update_one(
        {"email": request.email},
        {"$set": {"reset_token": reset_token, "reset_token_exp": expiration}}
    )

    # Send email
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    email_sent = send_email(
        to_email=request.email,
        subject="Reset Your Password",
        template_name="reset_password.html",
        context={"reset_link": reset_link}
    )

    if email_sent:
        return {"message": "Password reset instructions sent to your email"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send reset password email")

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    db = get_db()
    user = db.users.find_one({"reset_token": request.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if user["reset_token_exp"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Update password
    new_hashed_password = get_password_hash(request.new_password)
    db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": new_hashed_password},
            "$unset": {"reset_token": "", "reset_token_exp": ""}
        }
    )

    return {"message": "Password reset successfully"}

@router.get("/user-info")
async def get_user_info(current_user: str = Depends(get_current_user)):
    db = get_db()
    user = db.users.find_one({"email": current_user})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return create_user_response(user)