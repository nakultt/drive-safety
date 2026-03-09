# PACER — YOLO Detection Service (Raspberry Pi)

Runs on the Raspberry Pi edge unit. Captures camera frames, runs YOLO inference,
detects traffic violations, and sends events to the PACER backend.

## Prerequisites

- Python 3.8+ with pip
- Raspberry Pi with camera (or USB webcam)
- YOLO26n NCNN model (already in `yolo26n_ncnn_model/`)

## Setup

```bash
pip install ultralytics[export] opencv-python requests
```

## Run

```bash
# Set your backend URL and location
export PACER_BACKEND_URL=http://<backend-ip>:8000
export PACER_CAMERA_ID=pi-cam-001
export PACER_GPS_LAT=13.0827
export PACER_GPS_LNG=80.2707
export PACER_LOCATION_LABEL="Marina Beach Junction"

python detect_service.py
```

### Preview mode (with display)

```bash
export PACER_SHOW_PREVIEW=true
python detect_service.py
```

## How Detection Works

The YOLO26n model detects COCO objects (person, motorcycle, cell phone, animals, etc.).
The rules engine maps these into PACER violation types:

| Violation | Rule |
|-----------|------|
| `triple_riding` | Motorcycle + 3 or more persons nearby |
| `helmet_absence` | Person on motorcycle (heuristic proxy) |
| `driver_distraction` | Person on motorcycle + cell phone detected |
| `animal_crossing` | Any animal class (dog, cow, elephant, etc.) |

> **Note:** `pothole`, `wrong_side_driving`, and `overspeeding` need additional inputs
> (custom model, lane detection, speed sensor) and are not detected by this COCO-based model.

## Offline Mode

When the backend is unreachable, events are saved to `./offline_queue/` and
automatically retried when connectivity is restored.

## Files

| File | Purpose |
|------|---------|
| `detect_service.py` | Main detection loop |
| `violation_rules.py` | COCO → violation mapping rules |
| `offline_queue.py` | Local event queue for offline mode |
| `pi_config.py` | All settings (env vars) |
| `yolo_video.py` | Simple YOLO webcam demo (original) |
| `yolo_img.py` | Simple YOLO image demo (original) |

## Configuration (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `PACER_BACKEND_URL` | `http://localhost:8000` | Backend server URL |
| `PACER_CAMERA_ID` | `pi-cam-001` | Unique camera identifier |
| `PACER_CAMERA_SOURCE` | `pi_camera` | Camera type |
| `PACER_CAMERA_INDEX` | `0` | OpenCV camera index |
| `PACER_GPS_LAT` | `13.0827` | Deployment latitude |
| `PACER_GPS_LNG` | `80.2707` | Deployment longitude |
| `PACER_LOCATION_LABEL` | `Deployment Location` | Human-readable name |
| `PACER_MODEL_PATH` | `./yolo26n_ncnn_model` | YOLO model directory |
| `PACER_CONFIDENCE` | `0.45` | Min detection confidence |
| `PACER_DETECTION_INTERVAL` | `1.0` | Seconds between frames |
| `PACER_COOLDOWN_SECONDS` | `30` | Duplicate suppression window |
| `PACER_SHOW_PREVIEW` | `false` | Show annotated frame window |