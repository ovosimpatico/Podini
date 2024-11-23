from fastapi import APIRouter, Depends, Query, HTTPException
from utils.security import get_current_user
from utils.paid_user import get_paid_user
from utils.credit_operations import check_and_deduct_credits

router = APIRouter()

@router.get("/example-protected-route")
async def protected_route(current_user: str = Depends(get_current_user)):
    return {"message": "This is a protected route", "user": current_user}

@router.get("/example-paid-route")
async def paid_feature(
    current_user: str = Depends(get_current_user),
    days: int = Query(30, ge=1, description="Number of days since last payment")
):
    try:
        is_paid = get_paid_user(current_user, days)
        return {
            "message": f"This is a paid feature (last payment within {days} days)",
            "user": current_user
        }
    except HTTPException as e:
        raise e

@router.get("/credit-based-route")
async def credit_based_feature(
    current_user: str = Depends(get_current_user),
    credits_required: float = Query(1.0, ge=0, description="Number of credits required for this operation")
):
    try:
        check_and_deduct_credits(current_user, credits_required)
        return {
            "message": f"This is a credit-based feature (cost: {credits_required} credits)",
            "user": current_user
        }
    except HTTPException as e:
        raise e