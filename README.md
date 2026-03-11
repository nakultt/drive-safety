# PACER: Portable Adaptive Camera-based traffic violation detection system

This project is divided into three seamlessly connected modules:

## 1. Backend (FastAPI)
- **Role:** Central API for ingesting violations from the Pi, storing data in MongoDB, processing AI analytics with Gemini, and providing real-time WebSocket updates.
- **Location:** `./backend`
- **Deployment:** Render
  - Deploys automatically via the included `render.yaml`.
  - Exposes the REST API and WebSocket streams.

## 2. Frontend (React / Vite)
- **Role:** Dashboard for visualizing traffic violations, viewing camera status, and monitoring real-time vehicle analytics.
- **Location:** `./frontend`
- **Deployment:** Vercel
  - Connects to the backend via `VITE_API_URL` environment variable.

## 3. YOLO Detection Edge Unit (Raspberry Pi)
- **Role:** Captures camera frames, runs edge YOLO inference (NCNN optimized), detects traffic violations, and pushes events to the backend.
- **Location:** `./yolo`
- **Deployment:** Raspberry Pi
  - Configurable via `.bashrc` or systemd using `PACER_BACKEND_URL` to point to the Render backend URL.
  - Automatically handles offline modes by queueing events and syncing when connectivity is restored.

--- 

## Quick Start (Local)

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **YOLO (Simulated Edge):**
   ```bash
   cd yolo
   export PACER_BACKEND_URL=http://localhost:8000
   python detect_service.py
   ```
