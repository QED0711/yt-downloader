import os, traceback, subprocess, pdb
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
from yt_dlp.utils import sanitize_filename

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


@app.post("/api/info")
async def introspect_video(video: VideoUrl):
    try:
        # Set up yt-dlp options for introspection
        ydl_opts = {
            'listformats': True,
            'noplaylist': True,
            'quiet': True,
            'skip_download': True,
        }

        common_format_ids = None
        format_details = {}

        for url in video.urls:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=False)
                formats = info_dict.get('formats', [])

                # Map the format ID to full format details
                current_format_details = {f['format_id']: {
                    'format_id': f.get('format_id'),
                    'ext': f.get('ext'),
                    'resolution': f.get('resolution'),
                    'audio_codec': f.get('acodec'),
                    'channels': f.get('channels'),
                    'filesize': f.get('filesize')
                } for f in formats}

                # Store details for formats from the current URL
                format_details.update(current_format_details)

                # Extract the set of format IDs for the current video
                format_ids = set(current_format_details.keys())

                # Initialize or intersect format IDs
                if common_format_ids is None:
                    common_format_ids = format_ids
                else:
                    common_format_ids &= format_ids

        # Filter format details to only include those common format IDs
        common_format_list = [format_details[fmt_id] for fmt_id in common_format_ids]

        return {"formats": common_format_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/download")
async def download(request: DownloadReq):
    urls = request.urls
    format_id = request.format_id  # Get the format_id from the request
    audio_book = request.audio_book

    # List of valid audio codecs/extensions
    VALID_AUDIO_CODECS = ['mp3', 'aac', 'm4a', 'opus', 'vorbis', 'flac', 'alac', 'wav']

    for url in urls:
        try:
            # First, fetch the video information without downloading to get format details
            with yt_dlp.YoutubeDL({}) as ydl:
                info_dict = ydl.extract_info(url, download=False)
                formats = info_dict.get('formats', [])
                # Find the format matching the provided format_id
                selected_format = next((f for f in formats if f['format_id'] == format_id), None)
                if not selected_format:
                    raise HTTPException(status_code=400, detail=f"Format ID '{format_id}' not available for URL {url}")
                ext = selected_format.get('ext', 'mp4').lower()  # Default to 'mp4' if not specified
                # Determine if the format is audio-only
                is_audio = selected_format.get('vcodec') == 'none'

            # Sanitize the title to create a safe filename
            sanitized_title = sanitize_filename(info_dict.get('title', 'video'), restricted=True)
            # Replace spaces with underscores
            sanitized_title = sanitized_title.replace(' ', '_')

            # Set up yt-dlp options using the format_id
            ydl_opts = {
                'format': format_id,
                'outtmpl': f'{DOWNLOAD_DIRECTORY}/{sanitized_title}.%(ext)s',  # Let yt-dlp handle the extension
            }

            # Add postprocessor for audio formats if necessary
            if is_audio:
                # Map 'ext' to a valid audio codec
                if ext in VALID_AUDIO_CODECS:
                    preferred_codec = ext
                else:
                    # Default to 'mp3' if 'ext' is not a valid audio codec
                    preferred_codec = 'mp3'
                    ext = 'mp3'  # Update the extension for the output file

                # Update 'ext' to match 'preferred_codec'
                ext = preferred_codec

                ydl_opts['postprocessors'] = [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': preferred_codec,
                    'preferredquality': '192',
                }]

                # Update the output template to use the correct extension
                ydl_opts['outtmpl'] = f'{DOWNLOAD_DIRECTORY}/{sanitized_title}.%(ext)s'

            # Use yt-dlp to download the content
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=True)
                title = info_dict.get('title', None)
                # Get the actual filename from 'info_dict'
                filename = info_dict.get('filepath', os.path.splitext(ydl.prepare_filename(info_dict))[0] + f".{ext}")
                ext = filename.rsplit('.', 1)[-1].lower()

                # If audio_book is True and it's an audio download
                if audio_book and is_audio:
                    print("##### CONVERTING TO AUDIO BOOK #####")
                    # Convert to audiobook format (e.g., m4b)
                    audiobook_ext = 'm4b'
                    audiobook_filename = f"{filename.rsplit('.', 1)[0]}.{audiobook_ext}"
                    # Use ffmpeg to convert to m4b
                    ffmpeg_command = [
                        'ffmpeg', '-i', filename, '-c:a', 'aac', '-b:a', '192k', audiobook_filename
                    ]
                    subprocess.run(ffmpeg_command, check=True)
                    # Optionally, remove the original audio file
                    os.remove(filename)
                    # Update the filename to the new audiobook file
                    filename = audiobook_filename
                    ext = audiobook_ext  # Update extension if needed

        except Exception as e:
            print(traceback.format_exc())
            raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "n_downloads": len(urls)}



# Static file server
app.mount("/", StaticFiles(directory="dist", html=True), name="ui")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)