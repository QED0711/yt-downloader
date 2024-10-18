#!/bin/bash

docker run --rm -ti -d \
    --name yt-downloader \
    -p 8002:8000 \
    -v $PWD/:/app \
    youtube-downloader:latest
