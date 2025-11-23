from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    patients,
    gps,
    reviews,
    medications,
    clinical_notes,
    consent,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(patients.router)
api_router.include_router(gps.router)
api_router.include_router(reviews.router)
api_router.include_router(medications.router)
api_router.include_router(clinical_notes.router)
api_router.include_router(consent.router)
