from pydantic import BaseModel

class VideoUrl(BaseModel):
    url: str

class DownloadReq(BaseModel):
    url: str
    ext: str
    audio_book: bool