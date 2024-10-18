#!/bin/bash

docker run --rm -ti -d \
    -p 8002:8000 \
    -v $PWD/:/app \
    youtube-downloader:latest
