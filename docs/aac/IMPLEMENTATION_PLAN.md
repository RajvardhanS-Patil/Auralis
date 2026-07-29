# Implementation Plan — Auralis AAC

> 8-phase development roadmap from zero to production-ready medical-grade AAC application.

---

## Phase 1: Project Foundation & Tooling
**Duration:** 1–2 days | **Priority:** 🔴 Critical

- [ ] Initialize Vite + React 18 project with TypeScript.
- [ ] Configure ESLint (airbnb config), Prettier, and Husky pre-commit hooks.
- [ ] Set up folder structure:
  ```
  src/
  ├── components/       # React UI components
  ├── core/
  │   ├── vision/       # Camera, MediaPipe, EAR calculation
  │   ├── morse/        # State machine, dictionary
  │   ├── speech/       # TTS controller
  │   ├── prediction/   # Trie, frequency scoring
  │   └── fatigue/      # Fatigue detection engine
  ├── workers/          # Web Worker scripts
  ├── hooks/            # Custom React hooks
  ├── stores/           # State management (Zustand or Context)
  ├── data/             # Morse code dictionary, word frequency lists, medical vocab
  ├── utils/            # Math helpers, Kalman filter wrapper
  └── styles/           # Global CSS, design tokens
  ```
- [ ] Create `.env.example` with all configuration variables documented.
- [ ] Set up GitHub Actions CI pipeline (lint, test, build).
- [ ] Add PWA manifest (`manifest.json`) and register a Workbox service worker.

---

## Phase 2: Camera & MediaPipe Integration
**Duration:** 2–3 days | **Priority:** 🔴 Critical

- [ ] Build `CameraManager` class:
  - Request webcam permissions with graceful error handling.
  - Handle all failure states: camera not found, permission denied, camera in use, insecure context (HTTP).
  - Stream video to an off-screen `<video>` element.
- [ ] Integrate MediaPipe Face Landmarker (Vision Tasks API):
  - Load model from CDN on first use, cache via service worker for offline.
  - Run inference in a **Web Worker** to keep UI at 60fps.
  - Extract and post eye landmarks (indices 33, 133, 144, 153, 158, 160, 263, 362, 373, 380, 385, 387).
- [ ] Build a debug overlay (`<canvas>`) that draws landmarks on the user's face.
  - Toggle-able in settings (off by default in production).
- [ ] Verify face tracking works in:
  - Low light, bright light, backlit scenarios.
  - With glasses, sunglasses (should fail gracefully), and hats.
  - At various distances (30cm to 100cm from camera).

---

## Phase 3: EAR Algorithm & Blink Detection
**Duration:** 2–3 days | **Priority:** 🔴 Critical

- [ ] Implement `euclidean3D(a, b)` utility function.
- [ ] Implement `calculateEAR(eyeLandmarks)` for a single eye.
- [ ] Implement bilateral EAR (average of left + right).
- [ ] Integrate Kalman filter (`kalmanjs`) for EAR smoothing.
- [ ] Build the **Adaptive Baseline** system (EMA-based, see `ALGORITHM_DESIGN.md` §2.2).
- [ ] Build the **Hysteresis (Schmitt Trigger)** system (see `ALGORITHM_DESIGN.md` §2.3).
- [ ] Build a real-time EAR graph on a debug `<canvas>` (mini sparkline showing the last 5 seconds of EAR values, threshold lines, and detected blink markers).
- [ ] **Calibration Flow:**
  1. "Keep your eyes open naturally" → 3 seconds → record baseline EAR.
  2. "Blink intentionally 5 times" → record blink EAR range.
  3. Calculate personalized thresholds.
  4. Save calibration profile to IndexedDB.
- [ ] Measure and log false positive rate. Target: < 2% under normal conditions.

---

## Phase 4: Morse Code State Machine & Dictionary
**Duration:** 2–3 days | **Priority:** 🔴 Critical

- [ ] Implement the FSM with states: `IDLE`, `ARMED`, `BLINKING`, `EVALUATING`, `CHAR_COMPLETE`, `WORD_COMPLETE`, `EMERGENCY`.
- [ ] Implement the **Activation Sequence**: 3 rapid blinks within 2 seconds to ARM the system.
- [ ] Build the timing classifier (dot vs. dash based on calibrated thresholds).
- [ ] Build the `MorseCodeDictionary` (complete A-Z, 0-9, common punctuation).
- [ ] Implement involuntary blink rejection (see `ALGORITHM_DESIGN.md` §5.3).
- [ ] Build the **Command System** (reserved Morse sequences for app control):
  | Command | Morse Sequence | Action |
  |---------|---------------|--------|
  | Backspace | `........` (8 dots) | Delete last character |
  | Clear All | `--------` (8 dashes) | Clear entire text |
  | Speak | `..-.` | Trigger TTS |
  | Emergency | 5s sustained close | Speak emergency phrase |
- [ ] Display real-time Morse buffer on screen (e.g., `.-.` building up).
- [ ] Display the translated character with a subtle animation.

---

## Phase 5: Text-to-Speech & Audio Feedback
**Duration:** 1–2 days | **Priority:** 🟡 High

- [ ] Integrate Web Speech API (`window.speechSynthesis`).
- [ ] Build voice selector (filter available voices by language).
- [ ] Add rate, pitch, and volume controls.
- [ ] Implement audio feedback for blinks using **Tone.js**:
  - DOT: 800Hz sine wave, 50ms duration, 0.15 volume.
  - DASH: 400Hz sine wave, 150ms duration, 0.15 volume.
  - Character resolved: Pleasant chime (C5 note, 200ms).
  - Error/Delete: Low tone (200Hz, 100ms).
- [ ] All audio feedback must be toggleable.
- [ ] Test TTS with long sentences, special characters, and numbers.

---

## Phase 6: Predictive Text & Medical Vocabulary
**Duration:** 2–3 days | **Priority:** 🟡 High

- [ ] Build the `Trie` data structure for dictionary storage.
- [ ] Pre-load a base dictionary (~10,000 most common English words).
- [ ] Add medical vocabulary extension (pain words, body parts, patient needs, emotional states — see `ALGORITHM_DESIGN.md` §7.3).
- [ ] Implement frequency-weighted scoring with recency boost.
- [ ] Build the **Quick Phrases** system:
  - Pre-configured common phrases: "I need water", "I am in pain", "Thank you", "Yes", "No".
  - Accessible via a numbered shortcut system (e.g., blink the number 1 in Morse = `.----` to select the first quick phrase).
- [ ] Implement head-tilt selection for predictive suggestions (HAR-based, see `ALGORITHM_DESIGN.md` §3).
- [ ] Track user word frequency in IndexedDB for personalized predictions.

---

## Phase 7: Fatigue Detection, Emergency System & Caregiver Dashboard
**Duration:** 3–4 days | **Priority:** 🟡 High

- [ ] Implement the fatigue scoring algorithm (see `ALGORITHM_DESIGN.md` §6).
- [ ] Build fatigue indicator UI (subtle color shift on the screen border: green → yellow → orange → red).
- [ ] Implement the **Emergency System**:
  - 5-second sustained eye closure → immediately speak emergency phrase.
  - Bypasses Morse code engine entirely.
  - Visual SOS indicator (screen flashes red border).
  - Emergency phrases configurable during setup.
- [ ] Build the **Caregiver Dashboard** (separate route `/caregiver`):
  - Real-time text stream from the patient's session.
  - Fatigue level indicator.
  - Session statistics (characters typed, time active, break count).
  - Remote settings adjustment.
  - Connection via WebRTC Data Channel (peer-to-peer, no server).
- [ ] Build the **Session Logger**:
  - Log every session with timestamps, character count, fatigue events, errors.
  - Export as JSON (FHIR-compatible structure for medical integration).

---

## Phase 8: UI Polish, Testing & Deployment
**Duration:** 3–4 days | **Priority:** 🟡 High

- [ ] Finalize the dark mode design system (see `UI_UX_GUIDELINES.md`).
- [ ] Implement responsive layout (works on 10" tablets, 13" laptops, 24" monitors).
- [ ] Add onboarding tutorial (guided walkthrough for first-time users and caregivers).
- [ ] Run Lighthouse audits: Target ≥ 95 for Accessibility, ≥ 90 for Performance.
- [ ] Write unit tests for all core modules (Vitest).
- [ ] Write integration tests for the full pipeline (camera mock → EAR → Morse → text).
- [ ] Test on real devices:
  - Low-end: Chromebook, old Android phone (Samsung A10 or similar).
  - Mid-range: Standard laptop with integrated webcam.
  - High-end: Desktop with external HD webcam.
- [ ] Deploy as PWA to Vercel (free tier).
- [ ] Create a GitHub Release with changelog.
- [ ] Record a demo video showing the full user flow.

---

## Milestone Summary

| Phase | Deliverable | Estimated Duration |
|-------|------------|-------------------|
| 1 | Project skeleton, CI/CD, PWA shell | 1–2 days |
| 2 | Camera feed + face landmark detection | 2–3 days |
| 3 | Reliable blink detection with calibration | 2–3 days |
| 4 | Working Morse code → text translation | 2–3 days |
| 5 | Voice output + audio feedback | 1–2 days |
| 6 | Predictive text + medical vocab + quick phrases | 2–3 days |
| 7 | Fatigue detection, emergency system, caregiver dashboard | 3–4 days |
| 8 | Polish, testing, deployment | 3–4 days |
| **Total** | **Production-ready Auralis v1.0** | **~16–24 days** |
