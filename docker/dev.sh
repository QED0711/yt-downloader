#!/bin/bash

docker run --rm -ti \
    -p 8000:8000 \
    -v $PWD/:/app \
    youtube-downloader:latest \
    bash
