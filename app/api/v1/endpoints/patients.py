from fastapi import APIRouter, Depends, HTTPException, Header
from app.api.deps import get_current_user, CurrentUser
from typing import List, Optional
from app.schemas.patient import PatientCreate, PatientInDB
from app.services.patient_service import PatientService

router = APIRouter()

def get_tenant_id(current_user: CurrentUser = Depends(get_current_user)):
    return current_user.tenant_id

@router.post("/", response_model=PatientInDB)
def create_patient(patient_in: PatientCreate, current_user: CurrentUser = Depends(get_current_user)):
    """
    Create a new patient.
    """
    patient = PatientService.create_patient(current_user.tenant_id, patient_in)
    if not patient:
        raise HTTPException(status_code=500, detail="Failed to create patient")
    return patient

@router.get("/{patient_id}", response_model=PatientInDB)
def get_patient(patient_id: str, current_user: CurrentUser = Depends(get_current_user)):
    """
    Get patient by ID.
    """
    patient = PatientService.get_patient(current_user.tenant_id, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/", response_model=List[PatientInDB])
def get_all_patients(current_user: CurrentUser = Depends(get_current_user)):
    """
    List all patients for a tenant. If user is a doctor, restrict to their patients.
    """
    if current_user.active_role == "doctor":
        # Find doctor_id for this user
        from app.db.supabase import db
        doc_res = db.table("doctors").select("id").eq("user_id", current_user.uid).execute()
        if doc_res.data:
            doctor_id = doc_res.data[0]["id"]
            # Fetch patients mapped to this doctor via appointments
            res = db.table("patients").select("*, appointments!inner(doctor_id)").eq("tenant_id", current_user.tenant_id).eq("appointments.doctor_id", doctor_id).execute()
            if res.data:
                # Remove nested appointments array
                for row in res.data:
                    if "appointments" in row:
                        del row["appointments"]
                return res.data
            return []
            
    return PatientService.get_all_patients(current_user.tenant_id)
