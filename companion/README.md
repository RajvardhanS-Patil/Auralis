# 🖐️ Auralis Companion — Hand Cursor Control

Control your **real system cursor** using hand gestures via your webcam. This Python script runs natively on your OS and has full mouse control — it works across your entire desktop, not just inside a browser.

## Quick Start

```bash
# 1. Navigate to the companion directory
cd companion

# 2. Install dependencies (use a virtual env if you prefer)
pip install -r requirements.txt

# 3. Run the hand cursor controller
python hand_cursor.py
```

> **⚠️ Important:** If the Auralis web app is using the webcam, close that browser tab first, or change `CAM_INDEX = 1` in `hand_cursor.py` to use a second camera.

## Gestures

| Gesture | Action |
|---------|--------|
| ☝️ **Point index finger** | Move cursor |
| 🤏 **Pinch (thumb + index)** | Left click |
| ✊ **Fist (all fingers down)** | Right click |

## Keyboard Controls

| Key | Action |
|-----|--------|
| `q` | Quit the script |
| `d` | Toggle debug overlay window |
| `+` | Increase smoothing (less jitter, more lag) |
| `-` | Decrease smoothing (more responsive, more jitter) |

## Safety

- **Emergency Stop:** Drag your mouse to the **top-left corner** of the screen. PyAutoGUI's failsafe will immediately kill the script.
- The debug window shows a blue rectangle representing the "active zone" — only hand movements inside this zone control the cursor.

## Tuning

Edit the constants at the top of `hand_cursor.py`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `FILTER_MIN_CUTOFF` | `1.5` | Smoothing when still. Lower = smoother. |
| `FILTER_BETA` | `0.5` | Responsiveness during fast movement. Higher = faster. |
| `PINCH_THRESHOLD` | `0.06` | How close thumb+index must be for a click. |
| `CLICK_COOLDOWN` | `0.4` | Seconds between clicks (prevents accidental double-clicks). |
| `DEAD_ZONE_PX` | `3` | Pixel threshold below which movement is ignored. |
| `ROI_X_MIN/MAX` | `0.15/0.85` | Horizontal tracking zone (center 70% of camera). |
| `ROI_Y_MIN/MAX` | `0.10/0.90` | Vertical tracking zone (center 80% of camera). |

## Architecture

```
Webcam → OpenCV → MediaPipe Hand Landmarker → One Euro Filter → PyAutoGUI → OS Cursor
                                                    ↓
                                          Gesture Detection → Click / Right-click
```

## Running Alongside the Web App

The recommended setup is:

1. **Terminal 1:** `npm run dev` (Auralis web app for blink-to-speech)
2. **Terminal 2:** `python companion/hand_cursor.py` (real cursor control)

If both need the same webcam, set `CAM_INDEX = 1` in the Python script to use a secondary camera, or close the browser tab's camera access first.
