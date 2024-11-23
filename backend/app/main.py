from contextlib import asynccontextmanager

import uvicorn
from config import SOFTWARE_NAME
from database import close_db, init_db
from fastapi import FastAPI
from routers import auth, protected, payment, ai, podcast

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    close_db()

app = FastAPI(
    lifespan=lifespan,
    title=f"{SOFTWARE_NAME} API",
    description=f"{SOFTWARE_NAME} backend API service",
    version="alpha",
    redoc_url="/redoc",
    docs_url="/swagger"
    )

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(payment.router, prefix="/payment", tags=["Payment"])
app.include_router(protected.router, prefix="/test", tags=["Test (Restricted Routes)"])
app.include_router(ai.router, prefix="/ai", tags=["AI Operations"])
app.include_router(podcast.router, prefix="/podcast", tags=["Podcast Operations"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)