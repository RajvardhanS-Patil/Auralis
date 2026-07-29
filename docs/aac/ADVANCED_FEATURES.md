# Advanced Features — Auralis AAC

> These are the features that elevate Auralis from a simple blink detector to a **medical-grade, industry-ready communication system**.

---

## 1. 🧠 Fatigue-Aware AI

### The Problem
People with ALS and other motor neuron diseases experience progressive muscle fatigue. After 15–30 minutes of intentional blinking, their blink speed decreases, their eyelids droop, and their accuracy drops. No existing AAC system accounts for this.

### Auralis Solution
- **Continuous monitoring** of EAR baseline drift, blink rate, and response times.
- **Fatigue score** computed on a sliding 5-minute window (see `ALGORITHM_DESIGN.md` §6).
- **Graduated response:**
  1. **Score 0.3–0.6 (Mild):** Subtle amber glow on screen border. No interruption.
  2. **Score 0.6–0.8 (Moderate):** Gentle audio chime + text suggestion: "You've been active for 20 minutes. Would you like a break?"
  3. **Score 0.8–1.0 (Severe):** Stronger recommendation + automatic timing threshold relaxation (gives the user more time per blink).
- **CRITICAL:** The system NEVER forcibly stops the user. Autonomy is paramount. These are suggestions only.

### Uniqueness Factor
**No other free AAC tool on the market has fatigue-aware adaptive algorithms.** This is a publishable research-grade feature.

---

## 2. 🔀 Multi-Modal Input System

### The Problem
Morse code via blinks alone is slow (~5–8 words per minute). Users need faster input methods.

### Auralis Solution
Auralis doesn't rely on a single input channel. It uses **three modalities simultaneously**:

| Input | Detection Method | Use Case |
|-------|-----------------|----------|
| **Eye Blinks** | EAR threshold | Morse code input (primary) |
| **Head Tilts** | HAR (roll angle) | Select predictive text suggestions |
| **Mouth Opening** | MAR threshold | Trigger "Speak" command |

### How They Work Together
1. User blinks "H-E-L" in Morse code.
2. Predictive text suggests: [1] HELLO  [2] HELP  [3] HELMET
3. User **tilts head left** → selects "HELLO" instantly.
4. User **opens mouth** → system speaks "HELLO" aloud.

This reduces a 20-blink sequence to just 6 blinks + 1 head tilt + 1 mouth open.

### Uniqueness Factor
**Multi-modal input without any hardware** — this is typically only possible with $10K+ systems.

---

## 3. 🚨 Emergency Communication System

### The Problem
In medical settings, patients sometimes need to communicate urgency immediately — pain, choking, difficulty breathing. Morse code is too slow for emergencies.

### Auralis Solution
- **Instant Activation:** Close eyes for 5 continuous seconds → triggers emergency mode.
- **Zero Morse Code Required:** Bypasses the entire Morse engine.
- **Pre-Configured Phrases:**
  - "I need help"
  - "I am in pain" (with optional pain level: mild/moderate/severe)
  - "Call a nurse"
  - "I can't breathe"
  - "I need suction" (common for ALS patients on ventilators)
- **Selection:** Once in emergency mode, system cycles through phrases. User blinks once to confirm the current phrase.
- **Audio + Visual:** Phrase is spoken aloud AND displayed in massive red text.
- **Caregiver Alert:** If caregiver dashboard is connected, sends an immediate push notification.

### Uniqueness Factor
**Life-saving feature.** This alone could justify the project in a clinical setting.

---

## 4. 📊 Session Analytics & Medical Export

### The Problem
Clinicians (neurologists, speech therapists) need data on how the patient is communicating over time. Is their condition improving? Deteriorating? Are they fatigued more quickly than last week?

### Auralis Solution
Every session logs:
- Start/end timestamps
- Total characters typed
- Words per minute
- Error rate (backspaces per character)
- Fatigue score over time (time-series)
- Blink metrics (average duration, frequency)
- Emergency activations

### Data Export
- **JSON export** with FHIR-compatible structure (Fast Healthcare Interoperability Resources).
- **CSV export** for spreadsheet analysis.
- A clinician can review weeks of data to track disease progression or therapy effectiveness.

### Session Summary Card (In-App)
```
┌─────────────────────────────────────┐
│  Session Summary — July 29, 2026    │
│                                     │
│  Duration:     22 minutes           │
│  Characters:   187                  │
│  Words:        34                   │
│  WPM:          1.5                  │
│  Errors:       12 (6.4%)           │
│  Fatigue Peak: 0.62 (Moderate)     │
│  Emergencies:  0                    │
│                                     │
│  [Export JSON]  [Export CSV]         │
└─────────────────────────────────────┘
```

### Uniqueness Factor
**Clinical-grade session data from a free web app.** This is the bridge between a hobby project and a medical tool.

---

## 5. 🗣️ Quick Phrases & Phrase Board

### The Problem
Many daily communications are repetitive: "Yes", "No", "Thank you", "I need water", "Turn on the TV". Spelling these out in Morse code every time is exhausting.

### Auralis Solution
- **Pre-configured Phrase Board** with categories:
  - **Basic:** Yes, No, Thank you, Please, OK
  - **Needs:** Water, Food, Bathroom, Medication, Blanket
  - **Medical:** Pain, Nauseous, Dizzy, Can't breathe, Need suction
  - **Social:** Hello, Goodbye, I love you, How are you?
  - **Custom:** User/caregiver can add unlimited custom phrases

- **Access Method:** User blinks a number in Morse code to select a category, then another number to select a phrase. Example:
  - Blink `1` (Morse: `.----`) → Category: Needs
  - Blink `3` (Morse: `...--`) → Phrase: "Bathroom"
  - System speaks: "I need to use the bathroom"

### Uniqueness Factor
**Reduces a 2-minute Morse code effort to a 5-second selection.** Dramatically improves quality of life.

---

## 6. 👥 Caregiver Dashboard

### The Problem
Caregivers (nurses, family members) need to see what the patient is typing in real-time, especially if they are in another room or if the patient's speaker volume is low.

### Auralis Solution
- **Separate web route:** `/caregiver`
- **Connection:** Peer-to-peer via WebRTC Data Channel (no server required — both devices must be on the same local network) OR via a simple WebSocket relay.
- **Features:**
  - Live text stream (see what the patient is typing in real time)
  - Fatigue level indicator
  - Emergency push alerts
  - Remote settings adjustment (e.g., increase volume, change voice)
  - Session history review
- **Privacy:** Caregiver sees TEXT ONLY — never the video feed.

### Pairing Flow
1. Patient's app displays a 6-digit code.
2. Caregiver enters the code on their device.
3. WebRTC connection established.
4. Connection indicator visible on both screens.

### Uniqueness Factor
**Real-time caregiver monitoring without cloud infrastructure.** Most AAC systems require expensive cloud services for this.

---

## 7. 🌐 Multi-Language Support

### The Problem
AAC users exist in every country and speak every language. Morse code is universal, but the output language must be configurable.

### Auralis Solution
- **Morse code is language-agnostic** — the dots and dashes map to characters universally.
- **Dictionary files** are swappable per language.
- **Web Speech API** supports 50+ languages for TTS — user selects their preferred language/voice.
- **UI labels** can be translated via a simple JSON locale file.

### Phase 1 Languages
English, Spanish, Hindi, Portuguese, French, German, Japanese (Romaji input)

### Uniqueness Factor
**A truly global AAC tool** — not locked to English-speaking markets.

---

## 8. 🔒 Privacy & Data Sovereignty

### Core Guarantees
1. **Zero video data leaves the device.** MediaPipe processes frames in the browser's memory. No frames are saved, transmitted, or logged.
2. **No telemetry by default.** Auralis collects zero usage data unless the user explicitly opts in.
3. **All data stored locally.** IndexedDB on the user's device. Clearing browser data deletes everything.
4. **Export, don't upload.** Session data is exported as a file to the user's device. It is never "synced" to a cloud.
5. **Open source.** Anyone can audit the code to verify these guarantees.
