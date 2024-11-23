import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from datetime import datetime
from math import ceil
from typing import Optional
from bson import ObjectId

from config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CREDIT_VALUE, FRONTEND_URL
from database import get_db
from models.payment import PaymentResponse, PaginatedPaymentResponse, CreatePaymentIntent
from utils.security import get_current_user

router = APIRouter()
stripe.api_key = STRIPE_SECRET_KEY

@router.post("/create-checkout-session/{credits}")
async def create_checkout_session(
    credits: float,
    current_user: str = Depends(get_current_user)
):
    try:
        db = get_db()
        user = db.users.find_one({"email": current_user})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Calculate amount in cents (Stripe requires integer amounts)
        amount = int(credits * CREDIT_VALUE * 100)  # Convert to cents

        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user,
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'brl',
                    'unit_amount': amount,
                    'product_data': {
                        'name': f'Podini | {int(credits)} Podcasts',
                        'description': f'Purchase of {int(credits)} podcasts on Podini.'
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{FRONTEND_URL}/payment/success",
            cancel_url=f"{FRONTEND_URL}/payment/cancel",
            metadata={
                'user_id': str(user['_id']),
                'credits': str(credits)
            }
        )

        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Handle the successful payment
        db = get_db()
        user_id = ObjectId(session.metadata.get('user_id'))

        payment_data = {
            "user_id": user_id,
            "payment_id": session.id,
            "status": "completed",
            "amount": session.amount_total / 100,  # Convert cents to dollars
            "description": "Credit purchase",
            "payment_date": datetime.utcnow(),
            "credits_added": False
        }

        db.payments.insert_one(payment_data)

        # Calculate credits to add
        credits_to_add = (session.amount_total / 100) / CREDIT_VALUE

        # Add credits to user's account
        db.users.update_one(
            {"_id": user_id},
            {"$inc": {"credits": credits_to_add}}
        )

        # Mark credits as added
        db.payments.update_one(
            {"payment_id": session.id},
            {"$set": {"credits_added": True}}
        )

    return {"status": "success"}

@router.get("/payments", response_model=PaginatedPaymentResponse)
async def get_payments(
    current_user: str = Depends(get_current_user),
    page: int = 1,
    size: int = 10
):
    db = get_db()
    user = db.users.find_one({"email": current_user})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    filter_query = {"user_id": ObjectId(user["_id"])}
    total = db.payments.count_documents(filter_query)

    total_pages = ceil(total / size)
    skip = (page - 1) * size

    payments = db.payments.find(filter_query).skip(skip).limit(size)

    items = [
        PaymentResponse(
            id=str(payment["payment_id"]),
            status=payment["status"],
            amount=payment["amount"],
            description=payment["description"]
        ) for payment in payments
    ]

    return PaginatedPaymentResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=total_pages
    )