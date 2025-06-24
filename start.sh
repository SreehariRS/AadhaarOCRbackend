# Backend startup script (save as backend/start.sh)
#!/bin/bash
echo "Starting Aadhaar OCR Backend..."
echo "Checking if uploads directory exists..."
mkdir -p uploads
echo "Installing dependencies..."
npm install
echo "Building TypeScript..."
npm run build
echo "Starting server..."
npm run dev

# Alternative for Windows (save as backend/start.bat)
@echo off
echo Starting Aadhaar OCR Backend...
echo Checking if uploads directory exists...
if not exist uploads mkdir uploads
echo Installing dependencies...
npm install
echo Building TypeScript...
npm run build
echo Starting server...
npm run dev