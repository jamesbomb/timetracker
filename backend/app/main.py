import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request

from .database import engine, Base
from .routers import auth, timeoff, manager

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Holidays and TimeOff Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_coop_header(request: Request, call_next):
    response = await call_next(request)
    # Disabilitiamo temporaneamente COOP per evitare problemi con il popup di Google
    # response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    # response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return response

app.include_router(auth.router)
app.include_router(timeoff.router)
app.include_router(manager.router)
