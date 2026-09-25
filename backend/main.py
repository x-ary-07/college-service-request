import uuid
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import RequestCreate, StatusUpdate
from database import requests_collection


app = FastAPI(title="College Service Request System")


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------
# 1. CREATE A NEW REQUEST
# -----------------------------------
@app.post("/requests")
def create_request(new_request: RequestCreate):

    request_id = str(uuid.uuid4())[:8]

    document = {
        "request_id": request_id,
        "name": new_request.name,
        "id_number": new_request.id_number,
        "email": new_request.email,
        "role": new_request.role,
        "service_type": new_request.service_type,
        "description": new_request.description,
        "status": "Pending",
        "created_at": datetime.utcnow().isoformat()
    }

    requests_collection.insert_one(document)

    return {
        "message": "Request submitted successfully",
        "request_id": request_id,
        "status": "Pending"
    }


# -----------------------------------
# 2. GET ALL REQUESTS
# -----------------------------------
@app.get("/requests")
def get_all_requests():

    all_requests = list(
        requests_collection.find({}, {"_id": 0})
    )

    return all_requests


# -----------------------------------
# 3. GET ONE REQUEST
# -----------------------------------
@app.get("/requests/{request_id}")
def get_one_request(request_id: str):

    result = requests_collection.find_one(
        {"request_id": request_id},
        {"_id": 0}
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    return result


# -----------------------------------
# 4. UPDATE REQUEST STATUS
# -----------------------------------
@app.put("/requests/{request_id}")
def update_status(
    request_id: str,
    update: StatusUpdate
):

    result = requests_collection.update_one(
        {"request_id": request_id},
        {"$set": {"status": update.status}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    return {
        "message": "Status updated successfully",
        "request_id": request_id,
        "new_status": update.status
    }