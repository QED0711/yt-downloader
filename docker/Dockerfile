FROM python:3.13-bookworm

RUN apt-get update && apt-get install -y \
    ffmpeg

WORKDIR /app
COPY ./backend/requirements.txt /app/requirements.txt 
RUN pip install -r requirements.txt

CMD "./scripts/start.sh"
