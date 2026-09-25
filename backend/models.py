from pydantic import BaseModel, EmailStr
from typing import Literal


# Data required when a student/faculty submits a new request
class RequestCreate(BaseModel):
    name: str
    id_number: str
    email: EmailStr

    role: Literal["Student", "Faculty"]

    service_type: Literal[
        "Bonafide Certificate",
        "ID Card",
        "Hostel",
        "Transport",
        "Library",
        "IT Support"
    ]

    description: str


# Data required when admin changes the request status
class StatusUpdate(BaseModel):
    status: Literal[
        "Pending",
        "In Progress",
        "Completed"
    ]