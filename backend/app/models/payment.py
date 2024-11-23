from pydantic import BaseModel, Field
from decimal import Decimal
from typing import List, Optional

class PaymentResponse(BaseModel):
    id: str
    status: str
    amount: float
    description: str

class PaginatedPaymentResponse(BaseModel):
    items: List[PaymentResponse]
    total: int
    page: int
    size: int
    pages: int

class CreatePaymentIntent(BaseModel):
    amount: int  # Amount in cents
    currency: str