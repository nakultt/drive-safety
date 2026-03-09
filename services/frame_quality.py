"""
Frame Quality Assessment Filter
================================
Smart Driver Safety System – Edge AI Traffic Monitoring

This module evaluates incoming camera frames before they are forwarded to the
YOLO detection engine.  Poor-quality frames (blurry, too dark, or occluded)
are immediately rejected so that downstream compute is not wasted and false
detections are minimised.

Quality checks implemented
--------------------------
1. Blur detection      – Laplacian variance
2. Luminance check     – mean grayscale intensity
3. Occlusion check     – Canny edge density

All checks are designed to be lightweight and suitable for Raspberry Pi.

Usage
-----
    from services.frame_quality import frame_quality_check

    ok, reason = frame_quality_check(frame)
    if ok:
        run_yolo_detection(frame)
    else:
        logger.info("Skipping frame: %s", reason)
"""

from typing import Tuple

import cv2
import numpy as np

# ---------------------------------------------------------------------------
# Tunable thresholds
# ---------------------------------------------------------------------------
# Increase BLUR_THRESHOLD to be more aggressive about rejecting blurry frames.
BLUR_THRESHOLD: float = 80.0

# Frames with mean brightness below this value (0–255) are considered too dark.
DARK_THRESHOLD: float = 40.0

# Fraction of pixels that must be edge pixels for the frame to be considered
# unoccluded.  Tune upward if you get too many false positives in plain scenes.
EDGE_DENSITY_THRESHOLD: float = 0.02  # 2 % of total pixels

# Canny hysteresis thresholds (kept conservative for performance).
CANNY_LOW: int = 50
CANNY_HIGH: int = 150


# ---------------------------------------------------------------------------
# Individual quality-check functions
# ---------------------------------------------------------------------------

def is_blurry(frame: np.ndarray) -> bool:
    """Return True if *frame* is considered blurry.

    The Laplacian operator highlights regions of rapid intensity change; its
    variance is a reliable proxy for sharpness.  A low variance means that
    there are few sharp edges → the frame is blurry.

    Parameters
    ----------
    frame:
        BGR or grayscale image as a NumPy array.

    Returns
    -------
    bool
        ``True`` when ``Laplacian variance < BLUR_THRESHOLD``.
    """
    gray = _to_gray(frame)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return laplacian_var < BLUR_THRESHOLD


def is_dark(frame: np.ndarray) -> bool:
    """Return True if *frame* is too dark for reliable detection.

    Average grayscale intensity is a fast, reliable luminance proxy.

    Parameters
    ----------
    frame:
        BGR or grayscale image as a NumPy array.

    Returns
    -------
    bool
        ``True`` when ``mean brightness < DARK_THRESHOLD``.
    """
    gray = _to_gray(frame)
    mean_brightness = float(np.mean(gray))
    return mean_brightness < DARK_THRESHOLD


def is_occluded(frame: np.ndarray) -> bool:
    """Return True if *frame* appears to be occluded or blocked.

    A scene with very few edges (e.g. a covered lens, heavy fog, or a solid
    obstruction) produces a very low Canny edge density.  Below the threshold
    we assume the camera view is not useful.

    Parameters
    ----------
    frame:
        BGR or grayscale image as a NumPy array.

    Returns
    -------
    bool
        ``True`` when the fraction of edge pixels falls below
        ``EDGE_DENSITY_THRESHOLD``.
    """
    gray = _to_gray(frame)
    edges = cv2.Canny(gray, CANNY_LOW, CANNY_HIGH)

    # Edge density = number of edge pixels / total pixels
    total_pixels = edges.size
    edge_pixels = int(np.count_nonzero(edges))
    edge_density = edge_pixels / total_pixels

    return edge_density < EDGE_DENSITY_THRESHOLD


# ---------------------------------------------------------------------------
# Primary pipeline entry-point
# ---------------------------------------------------------------------------

def frame_quality_check(frame: np.ndarray) -> Tuple[bool, str]:
    """Run all quality checks on *frame* and return a pass/fail result.

    Checks are ordered from cheapest to most expensive so that we short-circuit
    early whenever possible.

    Parameters
    ----------
    frame:
        BGR image captured from the camera (as returned by ``cv2.VideoCapture``).

    Returns
    -------
    Tuple[bool, str]
        ``(True,  "Frame OK")``                   – frame is acceptable.
        ``(False, "Frame rejected: <reason>")``   – frame should be skipped.

    Examples
    --------
    >>> ok, reason = frame_quality_check(frame)
    >>> if ok:
    ...     run_yolo_detection(frame)
    ... else:
    ...     logger.info("Skipping frame – %s", reason)
    """
    if frame is None or frame.size == 0:
        return False, "Frame rejected: empty or null frame"

    # 1. Luminance / brightness check (very fast – single mean over gray image)
    if is_dark(frame):
        return False, "Frame rejected: too dark"

    # 2. Blur detection (Laplacian variance – single convolution pass)
    if is_blurry(frame):
        return False, "Frame rejected: blurry"

    # 3. Occlusion check (Canny edge detection – slightly heavier)
    if is_occluded(frame):
        return False, "Frame rejected: occluded"

    return True, "Frame OK"


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _to_gray(frame: np.ndarray) -> np.ndarray:
    """Convert *frame* to grayscale if it is not already.

    Avoids redundant conversion when the caller supplies a grayscale image.
    """
    if frame.ndim == 2 or (frame.ndim == 3 and frame.shape[2] == 1):
        return frame
    return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
