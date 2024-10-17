#!/bin/bash

docker run --rm -ti -d \
    -p 8000:8000 \
    -v $PWD/:/app \
    youtube-downloader:latest