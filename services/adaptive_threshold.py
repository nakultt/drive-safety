"""
Per-Violation Adaptive Threshold Filter
=========================================
Smart Driver Safety System – Edge AI Traffic Monitoring

After the YOLO model returns detections, each detection must be validated
against a violation-specific confidence threshold before it is stored in
the database.

Using a single global threshold would either:
  • let too many false positives through (threshold too low), or
  • discard genuine detections (threshold too high).

Per-violation thresholds balance precision and recall for every class
independently, which is especially important for edge deployments where
compute and false-alarm costs are high.

Pipeline position
-----------------
Camera → Frame Quality Filter → YOLO inference
      → Adaptive Threshold Filter  ← (this module)
      → save_event / skip

Usage
-----
    from services.adaptive_threshold import is_valid_detection

    for detection in detections:
        if is_valid_detection(detection["class"], detection["confidence"]):
            save_event(detection)
"""

# ---------------------------------------------------------------------------
# Per-violation confidence thresholds
# ---------------------------------------------------------------------------
# Tune each value independently based on real-world false-positive / false-
# negative rates observed during testing on your target hardware.
#
# Guidelines:
#   • Raise the threshold if a class produces too many false positives.
#   • Lower the threshold if genuine detections are being lost.

VIOLATION_THRESHOLDS: dict[str, float] = {
    # Rider not wearing a helmet – moderate threshold; model is well-trained.
    "helmet": 0.60,

    # Phone held to ear / in hand while driving – higher bar due to partial
    # occlusions and varied hand positions causing frequent false alarms.
    "phone": 0.70,

    # Overspeed detected via plate / vehicle tracking signal – lower threshold
    # because overspeed events are safety-critical and must not be missed.
    "overspeed": 0.50,

    # Animal on road – medium-high threshold; lighting variation causes noise.
    "animal": 0.65,

    # Pothole on road surface – lower threshold; texture-based detections are
    # naturally lower confidence even when correct.
    "pothole": 0.55,
}

# Fallback threshold applied when an unrecognised violation type is received.
# Kept conservative (0.5) so unknown classes are not silently discarded.
DEFAULT_THRESHOLD: float = 0.50


# ---------------------------------------------------------------------------
# Primary filter function
# ---------------------------------------------------------------------------

def is_valid_detection(violation_type: str, confidence: float) -> bool:
    """Return True if *confidence* meets or exceeds the threshold for
    *violation_type*.

    Parameters
    ----------
    violation_type : str
        The class label returned by the YOLO model, e.g. ``"helmet"``.
        Matching is case-insensitive so ``"Helmet"`` and ``"helmet"``
        are treated identically.
    confidence : float
        The confidence score returned by the YOLO model (0.0 – 1.0).

    Returns
    -------
    bool
        ``True``  – detection is reliable; proceed to save_event().
        ``False`` – detection is below threshold; discard silently.

    Examples
    --------
    >>> is_valid_detection("helmet", 0.72)
    True
    >>> is_valid_detection("phone", 0.65)
    False
    >>> is_valid_detection("unknown_class", 0.55)
    True   # falls back to DEFAULT_THRESHOLD (0.50)
    """
    # Normalise to lowercase so the caller doesn't need to worry about casing.
    key = violation_type.strip().lower()

    # Retrieve the threshold; fall back to DEFAULT_THRESHOLD for unknown types.
    threshold = VIOLATION_THRESHOLDS.get(key, DEFAULT_THRESHOLD)

    return confidence >= threshold


# ---------------------------------------------------------------------------
# Optional: introspection helper (useful for logging / dashboards)
# ---------------------------------------------------------------------------

def get_threshold(violation_type: str) -> float:
    """Return the configured threshold for *violation_type*.

    Useful for logging or exposing thresholds via the FastAPI admin endpoint.

    Parameters
    ----------
    violation_type : str
        Violation class label (case-insensitive).

    Returns
    -------
    float
        Configured threshold, or ``DEFAULT_THRESHOLD`` if unknown.
    """
    return VIOLATION_THRESHOLDS.get(violation_type.strip().lower(), DEFAULT_THRESHOLD)
