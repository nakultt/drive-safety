# PACER Backend

**Portable Adaptive Camera-based traffic violation detection system** — FastAPI backend with MongoDB, Gemini AI, and real-time WebSocket notifications.

## Prerequisites

- **Python 3.11+**
- **MongoDB** (running locally or remote instance)
- **Google Gemini API key** (for AI-powered features)

## Setup

### 1. Clone and install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=pacer_db
GEMINI_API_KEY=your_actual_gemini_api_key
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:8000
```

### 3. Start MongoDB

Make sure MongoDB is running. On macOS:

```bash
brew services start mongodb-community
```

### 4. Run the server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API is live at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

## Testing

### Health check

```bash
curl http://localhost:8000/health
```

### Test POST /api/events (multipart)

```bash
curl -X POST http://localhost:8000/api/events \
  -F "image=@/path/to/test_image.jpg" \
  -F 'data={
    "violation_type": "helmet_absence",
    "confidence": 0.95,
    "timestamp": "2025-01-15T10:30:00Z",
    "camera_source": "pi_camera",
    "camera_id": "pi-cam-001",
    "gps_lat": 13.0827,
    "gps_lng": 80.2707,
    "location_label": "Marina Beach Junction",
    "bounding_boxes": [{"x": 100, "y": 150, "w": 200, "h": 250, "label": "helmet_absence", "confidence": 0.95}]
  }'
```

## API Documentation

All endpoints are auto-documented via Swagger UI at `/docs` when the server is running.

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/events` | Ingest violation from Pi |
| POST | `/api/events/batch` | Batch ingest with base64 images |
| GET | `/api/violations` | List violations (paginated, filtered) |
| GET | `/api/vehicles` | List tracked vehicles |
| GET | `/api/analytics/summary` | Dashboard summary stats |
| GET | `/api/cameras` | List all cameras |
| POST | `/api/reports/generate-pdf` | Download PDF report |
| POST | `/api/reports/daily-digest` | AI-generated daily briefing |
| WS | `/ws/violations` | Real-time violation stream |
| GET | `/health` | System health check |

## Architecture

```
backend/
├── main.py                  # App init, CORS, middleware, startup
├── config.py                # Pydantic Settings (.env)
├── database.py              # Motor async MongoDB
├── websocket_manager.py     # WebSocket broadcast
├── models/                  # Pydantic request/response models
├── services/                # Business logic
│   ├── gemini_service.py    # Gemini AI (OCR, summaries, digest)
│   ├── annotation_service.py # OpenCV bounding boxes
│   ├── analytics_service.py # MongoDB aggregations
│   └── report_service.py    # PDF generation
├── routers/                 # API route handlers
│   ├── events.py            # Ingestion pipeline
│   ├── violations.py        # Violation CRUD
│   ├── vehicles.py          # Vehicle tracking
│   ├── analytics.py         # Analytics endpoints
│   ├── cameras.py           # Camera management
│   ├── reports.py           # Reports & digest
│   └── live.py              # WebSocket & status
└── uploads/                 # Runtime file storage
```
