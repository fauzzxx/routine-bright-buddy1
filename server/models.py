from typing import List, Optional
from pydantic import BaseModel


class Frame(BaseModel):
    title: str
    description: str


class GenerateVideoRequest(BaseModel):
    routine_id: Optional[str] = None
    title: str
    frames: List[Frame]
    duration_sec: int = 8
    aspect_ratio: str = "16:9"
    style: Optional[str] = None


class JobResponse(BaseModel):
    job_id: str


class StatusResponse(BaseModel):
    status: str
    url: Optional[str] = None
    error: Optional[str] = None


class FrameHF(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None


class GenerateVideoHFRequest(BaseModel):
    routine_id: Optional[str] = None
    prompt: Optional[str] = None
    frames: List[FrameHF]
    fps: int = 7