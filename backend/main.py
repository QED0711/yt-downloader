import os, traceback, subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

from schemas import VideoUrl, DownloadReq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a directory to save downloaded files
DOWNLOAD_DIRECTORY = "downloads"
os.makedirs(DOWNLOAD_DIRECTORY, exist_ok=True)

AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus']
VIDEO_EXTENSIONS = ['mp4', 'webm', 'mkv', 'avi', 'flv', 'mov']

@app.get("/")
async def test():
    return "HELLO WORLD"

@app.post("/info")
async def introspect_video(video: VideoUrl):
    try:
        # Set up yt-dlp options for introspection
        ydl_opts = {
            'listformats': True,
            'noplaylist': True,
            'quite': True,
            'skip_download': True,
        }

        # Use yt-dlp to list available formats
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video.url, download=False)
            formats = info_dict.get('formats', [])
            format_list = [{
                'format_id': f.get('format_id'),
                'ext': f.get('ext'),
                'resolution': f.get('resolution'),
                'note': f.get('format_note')
            } for f in formats]

        return {"formats": format_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/download")
async def download(request: DownloadReq):
    url = request.url
    ext = request.ext.lower()
    audio_book = request.audio_book

    try:
        if ext in AUDIO_EXTENSIONS:
            # Set up yt-dlp options for audio
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': f'{DOWNLOAD_DIRECTORY}/%(title|replace:" ","_")s.%(ext)s',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': ext,
                    'preferredquality': '192',
                }],
            }
        elif ext in VIDEO_EXTENSIONS:
            # Set up yt-dlp options for video
            ydl_opts = {
                'format': 'bestvideo+bestaudio/best',
                'outtmpl': f'{DOWNLOAD_DIRECTORY}/%(title|replace:" ","_")s.{ext}',
                'merge_output_format': ext,
            }
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file extension: {ext}")

        # Use yt-dlp to download the content
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            title = info_dict.get('title', None)
            filename = ydl.prepare_filename(info_dict)
            # Adjust the filename extension if necessary
            if ext in AUDIO_EXTENSIONS:
                filename = filename.rsplit('.', 1)[0] + f'.{ext}'

            # If audio_book is True and it's an audio download
            if audio_book and ext in AUDIO_EXTENSIONS:
                print("##### CONVERTING TO AUDIO BOOK #####")
                # Convert to audiobook format (e.g., m4b)
                audiobook_ext = 'm4b'
                audiobook_filename = filename.rsplit('.', 1)[0] + f'.{audiobook_ext}'
                # Use ffmpeg to convert to m4b
                ffmpeg_command = [
                    'ffmpeg', '-i', filename, '-c:a', 'copy', audiobook_filename.replace(" ", "_")
                ]
                subprocess.run(ffmpeg_command, check=True)
                # Optionally, remove the original audio file
                os.remove(filename)
                # Update the filename to the new audiobook file
                filename = audiobook_filename
                ext = audiobook_ext  # Update extension if needed

            return {"message": "Download successful", "title": title, "filename": filename}

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)