#!/bin/bash

cd ./backend
# python main.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
