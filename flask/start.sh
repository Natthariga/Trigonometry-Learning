#!/bin/bash
export GEMINI_API_KEY=$GEMINI_API_KEY
gunicorn app:app --bind 0.0.0.0:$PORT
