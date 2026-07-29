"""
Auralis Companion — Real System Cursor Control via Hand Tracking.

Uses MediaPipe Hand Landmarker + One Euro Filter + PyAutoGUI to let the user
control the actual Windows/Mac/Linux mouse cursor with their index finger.

Gestures:
  • Index finger pointing   → Move cursor
  • Thumb + Index pinch      → Left click
  • Fist (all fingers down)  → Right click
  • Peace sign (index+middle up, pinch) → Scroll mode

Controls:
  • Press 'q' to quit
  • Press 'd' to toggle debug overlay
  • Press '+'/'-' to adjust sensitivity
  • Move cursor to top-left corner → Emergency stop (pyautogui failsafe)

Usage:
  python companion/hand_cursor.py
"""

import time
import math
import sys

import cv2
import mediapipe as mp
import numpy as np
import pyautogui

from one_euro_filter import OneEuroFilter2D

# ═══════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════

# PyAutoGUI safety: drag mouse to top-left corner to kill the script
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0  # No artificial delay between pyautogui calls

# Screen dimensions
SCREEN_W, SCREEN_H = pyautogui.size()

# Camera settings
CAM_INDEX = 0
CAM_WIDTH = 640
CAM_HEIGHT = 480
CAM_FPS = 30

# Tracking region of interest (crop the center of the camera frame)
# This means only the center 60% of the camera is used for tracking,
# which gives more precision and a larger "virtual trackpad" feel.
ROI_X_MIN = 0.15
ROI_X_MAX = 0.85
ROI_Y_MIN = 0.10
ROI_Y_MAX = 0.90

# One Euro Filter tuning
FILTER_FREQ = 30.0    # Expected FPS
FILTER_MIN_CUTOFF = 1.5  # Lower = smoother when still (range 0.5-5.0)
FILTER_BETA = 0.5     # Higher = more responsive during fast moves (range 0.0-1.0)
FILTER_D_CUTOFF = 1.0

# Gesture detection thresholds
PINCH_THRESHOLD = 0.06       # Normalized distance for pinch detection
CLICK_COOLDOWN = 0.4         # Seconds between clicks (debounce)
FIST_THRESHOLD = 0.08        # How close fingertips must be to palm for fist

# Dead zone: ignore movements smaller than this many pixels
DEAD_ZONE_PX = 3

# ═══════════════════════════════════════════════════════════════════
# MediaPipe Hand Landmark indices
# ═══════════════════════════════════════════════════════════════════
WRIST = 0
THUMB_TIP = 4
INDEX_MCP = 5
INDEX_TIP = 8
MIDDLE_TIP = 12
RING_TIP = 16
PINKY_TIP = 20
MIDDLE_MCP = 9
RING_MCP = 13
PINKY_MCP = 17


def distance(lm1, lm2) -> float:
    """Euclidean distance between two landmarks (normalized coords)."""
    return math.sqrt(
        (lm1.x - lm2.x) ** 2
        + (lm1.y - lm2.y) ** 2
        + (lm1.z - lm2.z) ** 2
    )


def distance_2d(lm1, lm2) -> float:
    """2D Euclidean distance between two landmarks."""
    return math.sqrt((lm1.x - lm2.x) ** 2 + (lm1.y - lm2.y) ** 2)


def is_finger_folded(tip, mcp) -> bool:
    """Check if a finger is folded (tip is below MCP in y-axis)."""
    return tip.y > mcp.y


def detect_fist(landmarks) -> bool:
    """Detect fist gesture: all four fingertips curled below their MCPs."""
    lm = landmarks.landmark
    return (
        is_finger_folded(lm[INDEX_TIP], lm[INDEX_MCP])
        and is_finger_folded(lm[MIDDLE_TIP], lm[MIDDLE_MCP])
        and is_finger_folded(lm[RING_TIP], lm[RING_MCP])
        and is_finger_folded(lm[PINKY_TIP], lm[PINKY_MCP])
    )


def detect_pinch(landmarks) -> bool:
    """Detect pinch: thumb tip very close to index tip."""
    lm = landmarks.landmark
    return distance_2d(lm[THUMB_TIP], lm[INDEX_TIP]) < PINCH_THRESHOLD


def map_to_screen(x: float, y: float) -> tuple[float, float]:
    """
    Map normalized hand coordinates (within the ROI) to screen coordinates.
    Clamps to screen boundaries.
    """
    # Remap from ROI range to 0..1
    norm_x = (x - ROI_X_MIN) / (ROI_X_MAX - ROI_X_MIN)
    norm_y = (y - ROI_Y_MIN) / (ROI_Y_MAX - ROI_Y_MIN)

    # Clamp
    norm_x = max(0.0, min(1.0, norm_x))
    norm_y = max(0.0, min(1.0, norm_y))

    # Mirror X (camera is mirrored)
    norm_x = 1.0 - norm_x

    # Map to screen
    screen_x = norm_x * SCREEN_W
    screen_y = norm_y * SCREEN_H

    return screen_x, screen_y


def main():
    """Main loop: capture → detect → filter → move cursor."""

    print("=" * 60)
    print("  AURALIS COMPANION — Hand Cursor Control")
    print("=" * 60)
    print(f"  Screen: {SCREEN_W} × {SCREEN_H}")
    print(f"  Camera: {CAM_WIDTH} × {CAM_HEIGHT} @ {CAM_FPS} FPS")
    print()
    print("  Controls:")
    print("    q     — Quit")
    print("    d     — Toggle debug overlay")
    print("    +/-   — Adjust smoothing")
    print()
    print("  Gestures:")
    print("    Point index finger  → Move cursor")
    print("    Pinch (thumb+index) → Left click")
    print("    Fist                → Right click")
    print()
    print("  SAFETY: Drag cursor to top-left corner to emergency stop")
    print("=" * 60)

    # ── Initialize camera ──
    cap = cv2.VideoCapture(CAM_INDEX)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAM_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAM_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, CAM_FPS)

    if not cap.isOpened():
        print("[ERROR] Cannot open camera. Is another app using it?")
        print("  Tip: Close the Auralis web app tab first, or set CAM_INDEX=1")
        sys.exit(1)

    # ── Initialize MediaPipe Hands ──
    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7,
        model_complexity=1,  # 0=lite, 1=full (more accurate)
    )

    # ── Initialize One Euro Filter ──
    cursor_filter = OneEuroFilter2D(
        freq=FILTER_FREQ,
        min_cutoff=FILTER_MIN_CUTOFF,
        beta=FILTER_BETA,
        d_cutoff=FILTER_D_CUTOFF,
    )

    # ── State ──
    prev_x, prev_y = SCREEN_W / 2, SCREEN_H / 2
    last_click_time = 0.0
    last_rclick_time = 0.0
    show_debug = True
    is_clicking = False
    frame_count = 0
    fps_time = time.time()
    current_fps = 0.0

    print("[INFO] Hand tracking started. Show your hand to the camera.")

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            continue

        frame_count += 1
        now = time.time()

        # Calculate FPS every second
        if now - fps_time >= 1.0:
            current_fps = frame_count / (now - fps_time)
            frame_count = 0
            fps_time = now

        # Flip horizontally for mirror view
        frame = cv2.flip(frame, 1)

        # Convert BGR → RGB for MediaPipe
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        hand_detected = False

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                hand_detected = True
                lm = hand_landmarks.landmark

                # ── Get index finger tip position ──
                idx_x = lm[INDEX_TIP].x
                idx_y = lm[INDEX_TIP].y

                # ── Map to screen coordinates ──
                raw_x, raw_y = map_to_screen(idx_x, idx_y)

                # ── Apply One Euro Filter ──
                timestamp = time.time()
                smooth_x, smooth_y = cursor_filter(raw_x, raw_y, timestamp)

                # ── Dead zone: skip if movement is tiny ──
                dx = abs(smooth_x - prev_x)
                dy = abs(smooth_y - prev_y)

                if dx > DEAD_ZONE_PX or dy > DEAD_ZONE_PX:
                    try:
                        pyautogui.moveTo(
                            int(smooth_x),
                            int(smooth_y),
                            _pause=False,
                        )
                    except pyautogui.FailSafeException:
                        print("\n[SAFETY] Failsafe triggered! Exiting.")
                        break
                    prev_x, prev_y = smooth_x, smooth_y

                # ── Gesture: Pinch → Left Click ──
                pinching = detect_pinch(hand_landmarks)
                if pinching and not is_clicking:
                    if now - last_click_time > CLICK_COOLDOWN:
                        pyautogui.click(_pause=False)
                        last_click_time = now
                        is_clicking = True
                elif not pinching:
                    is_clicking = False

                # ── Gesture: Fist → Right Click ──
                if detect_fist(hand_landmarks):
                    if now - last_rclick_time > CLICK_COOLDOWN:
                        pyautogui.rightClick(_pause=False)
                        last_rclick_time = now

                # ── Draw debug overlay ──
                if show_debug:
                    mp_draw.draw_landmarks(
                        frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                    )

                    # Draw index finger tip as a large circle
                    h, w, _ = frame.shape
                    cx, cy = int(idx_x * w), int(idx_y * h)
                    color = (0, 255, 0) if not pinching else (0, 0, 255)
                    cv2.circle(frame, (cx, cy), 15, color, cv2.FILLED)

                    # Draw pinch line
                    tx, ty = int(lm[THUMB_TIP].x * w), int(lm[THUMB_TIP].y * h)
                    cv2.line(frame, (cx, cy), (tx, ty), (255, 200, 0), 2)

        # ── Debug window ──
        if show_debug:
            # Draw ROI rectangle
            h, w, _ = frame.shape
            roi_left = int(ROI_X_MIN * w)
            roi_right = int(ROI_X_MAX * w)
            roi_top = int(ROI_Y_MIN * h)
            roi_bottom = int(ROI_Y_MAX * h)
            cv2.rectangle(
                frame, (roi_left, roi_top), (roi_right, roi_bottom),
                (100, 100, 255), 2
            )

            # Status text
            status = "TRACKING" if hand_detected else "SEARCHING..."
            status_color = (0, 255, 0) if hand_detected else (0, 0, 255)
            cv2.putText(
                frame, f"Auralis Hand Control | {status}",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2
            )
            cv2.putText(
                frame, f"FPS: {current_fps:.0f} | Smoothing: {FILTER_MIN_CUTOFF:.1f}",
                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1
            )
            cv2.putText(
                frame, "q=Quit  d=Debug  +/-=Smooth",
                (10, h - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 150, 150), 1
            )

            cv2.imshow("Auralis Hand Cursor", frame)

        # ── Keyboard controls ──
        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            print("\n[INFO] Quitting...")
            break
        elif key == ord("d"):
            show_debug = not show_debug
            if not show_debug:
                cv2.destroyAllWindows()
        elif key == ord("+") or key == ord("="):
            FILTER_MIN_CUTOFF = max(0.1, FILTER_MIN_CUTOFF - 0.2)
            cursor_filter = OneEuroFilter2D(
                FILTER_FREQ, FILTER_MIN_CUTOFF, FILTER_BETA, FILTER_D_CUTOFF
            )
            print(f"  Smoothing increased → min_cutoff={FILTER_MIN_CUTOFF:.1f}")
        elif key == ord("-"):
            FILTER_MIN_CUTOFF = min(10.0, FILTER_MIN_CUTOFF + 0.2)
            cursor_filter = OneEuroFilter2D(
                FILTER_FREQ, FILTER_MIN_CUTOFF, FILTER_BETA, FILTER_D_CUTOFF
            )
            print(f"  Smoothing decreased → min_cutoff={FILTER_MIN_CUTOFF:.1f}")

    # ── Cleanup ──
    cap.release()
    cv2.destroyAllWindows()
    hands.close()
    print("[INFO] Hand cursor control stopped.")


if __name__ == "__main__":
    main()
