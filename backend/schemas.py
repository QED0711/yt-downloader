from pydantic import BaseModel
from typing import List

class VideoUrl(BaseModel):
    urls: List[str]

class DownloadReq(BaseModel):
    urls: List[str]
    format_id: str
    audio_book: bool