# UI/UX & Accessibility Guidelines — Auralis AAC

> Every pixel, every interaction, every animation must serve one purpose: enabling someone who cannot speak or move to communicate with dignity, speed, and comfort.

---

## 1. Design Philosophy

### 1.1 Core Principles
1. **Eyes-Only Interaction:** If any feature requires a click, tap, swipe, or keyboard input, it is **broken by design**. 100% of the application must be operable through blinks and head gestures alone.
2. **Dignity-First Design:** The user is an intelligent adult trapped in an unresponsive body. The interface must feel like a sophisticated communication tool, never like a toy or a children's app.
3. **Speed is Compassion:** Every millisecond of latency is a millisecond of silence for someone trying to express pain, fear, love, or a simple request for water.
4. **Calm Computing:** The UI must be serene, predictable, and never overwhelming. Avoid flashy animations, jarring colors, or layouts that shift unexpectedly.

### 1.2 Color Palette

```css
:root {
  /* Background Layers */
  --bg-primary:     #0A0A0F;     /* Deep space black */
  --bg-secondary:   #12121A;     /* Card backgrounds */
  --bg-tertiary:    #1A1A2E;     /* Elevated surfaces */
  
  /* Text */
  --text-primary:   #E8E8ED;     /* Main content */
  --text-secondary: #9898A6;     /* Labels, hints */
  --text-muted:     #5A5A6E;     /* Disabled, subtle */
  
  /* Accent — Status */
  --accent-active:   #00E676;    /* System listening, success */
  --accent-warning:  #FFB300;    /* Fatigue warning, caution */
  --accent-danger:   #FF1744;    /* Emergency, critical error */
  --accent-info:     #40C4FF;    /* Informational, calibration */
  
  /* Morse Feedback */
  --morse-dot:       #7C4DFF;    /* Dot registered */
  --morse-dash:      #448AFF;    /* Dash registered */
  --morse-char:      #00E676;    /* Character completed */
}
```

### 1.3 Typography

```css
/* Primary: Atkinson Hyperlegible — designed specifically for low-vision users */
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');

/* Monospace for Morse display */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

:root {
  --font-primary: 'Atkinson Hyperlegible', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Scale: Output text is MASSIVE */
  --text-xs:   0.875rem;   /* 14px — Settings labels */
  --text-sm:   1rem;        /* 16px — Secondary info */
  --text-md:   1.25rem;     /* 20px — Status text */
  --text-lg:   1.75rem;     /* 28px — Section headers */
  --text-xl:   2.5rem;      /* 40px — Current word */
  --text-2xl:  3.5rem;      /* 56px — OUTPUT TEXT (main display) */
  --text-3xl:  5rem;         /* 80px — Emergency text */
}
```

---

## 2. Screen Layout

### 2.1 Main Communication Screen

```
┌──────────────────────────────────────────────────────────┐
│  [Status Bar: System State | Fatigue | Time]             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│         I need some water please                         │  ← OUTPUT TEXT (--text-2xl)
│                                                          │
│         █ (blinking cursor)                              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Morse Buffer: .-.          Current: R                   │  ← MORSE FEEDBACK (--text-lg)
├──────────────────────────────────────────────────────────┤
│  [1] water    [2] want    [3] was                        │  ← PREDICTIONS (--text-xl)
│  ← tilt left to select 1  |  tilt right to select 2 →   │
├──────────────────────────────────────────────────────────┤
│  ┌─────────┐                                             │
│  │ Camera  │  ● Listening   EAR: 0.32   ▓▓▓░░ Fatigue  │  ← STATUS BAR
│  │  (PiP)  │                                             │
│  └─────────┘                                             │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy
| Component | Size | Position | Purpose |
|-----------|------|----------|---------|
| Output Text Area | 50% of viewport height | Center | Shows completed text, large and clear |
| Morse Buffer | 8% of viewport | Below output | Shows current `.-.` sequence being built |
| Prediction Bar | 12% of viewport | Below Morse | Top 3 word suggestions |
| Status Bar | 10% of viewport | Bottom | Camera PiP, system state, EAR value, fatigue meter |
| Quick Phrases Panel | Hidden by default | Slide-in from right | Pre-configured common phrases |

---

## 3. Interaction Design

### 3.1 Blink Feedback
Every registered blink must produce **immediate, multi-sensory feedback**:

| Event | Visual | Audio | Duration |
|-------|--------|-------|----------|
| DOT registered | Purple pulse on Morse buffer | 800Hz sine, 50ms | Instant (<16ms) |
| DASH registered | Blue pulse on Morse buffer | 400Hz sine, 150ms | Instant |
| Character resolved | Green flash + character animates into text | C5 chime, 200ms | 300ms animation |
| Word completed | Subtle white flash on word | Soft confirm sound | 200ms |
| Backspace | Red flash + character fades out | Low tone 200Hz | 200ms |
| Emergency activated | Full screen red border pulse | Alarm tone | Continuous until resolved |

### 3.2 Animations
All animations must be:
- **Subtle:** Never distracting or overwhelming.
- **Fast:** Max 300ms duration. The user must never feel "waiting" for an animation.
- **Reducible:** A `prefers-reduced-motion` media query must disable all animations.
- **GPU-accelerated:** Use `transform` and `opacity` only. Never animate `width`, `height`, or `top/left`.

### 3.3 Camera Picture-in-Picture
- Small (120×90px) rounded rectangle in the bottom-left.
- Optionally blurred (privacy mode) — user can toggle via settings.
- Green border = face detected. Red border = face lost (prompt user to reposition).
- Opacity: 0.6 (doesn't compete for attention with the main text).

---

## 4. Calibration Screen Design

The calibration flow must be guided, patient, and reassuring.

### Step 1: Welcome
```
┌──────────────────────────────────────┐
│                                      │
│     Welcome to Auralis               │
│                                      │
│     Let's set up your personal       │
│     blink profile. This takes        │
│     about 15 seconds.                │
│                                      │
│     Blink once to begin.             │
│                                      │
│         ◯ ← (waiting for blink)      │
│                                      │
└──────────────────────────────────────┘
```

### Step 2: Baseline Capture
```
┌──────────────────────────────────────┐
│                                      │
│     Keep your eyes open              │
│     naturally for 3 seconds.         │
│                                      │
│         ████████░░ 2.1s remaining    │
│                                      │
│     (Measuring your resting          │
│      eye openness)                   │
│                                      │
└──────────────────────────────────────┘
```

### Step 3: Blink Training
```
┌──────────────────────────────────────┐
│                                      │
│     Now blink intentionally          │
│     5 times at your natural pace.    │
│                                      │
│     Blinks detected: ●●●○○          │
│                                      │
│     (Learning your blink speed       │
│      and intensity)                  │
│                                      │
└──────────────────────────────────────┘
```

### Step 4: Confirmation
```
┌──────────────────────────────────────┐
│                                      │
│     ✓ Calibration Complete!          │
│                                      │
│     Your profile has been saved.     │
│     You can recalibrate anytime      │
│     from settings.                   │
│                                      │
│     Blink 3 times quickly to         │
│     start communicating.             │
│                                      │
└──────────────────────────────────────┘
```

---

## 5. Emergency Screen Design

When the emergency system activates:
```
┌──────────────────────────────────────┐
│ ╔══════════════════════════════════╗ │
│ ║                                  ║ │
│ ║    🚨 EMERGENCY ACTIVE 🚨       ║ │
│ ║                                  ║ │
│ ║    Speaking:                     ║ │
│ ║    "I NEED HELP"                 ║ │
│ ║                                  ║ │
│ ║    Blink once to repeat.         ║ │
│ ║    Blink 3x quickly to cancel.   ║ │
│ ║                                  ║ │
│ ╚══════════════════════════════════╝ │
└──────────────────────────────────────┘
```
- Screen border pulses red.
- Emergency phrase is spoken immediately and can be repeated.
- Text is displayed at `--text-3xl` (80px).

---

## 6. Settings Panel

The settings panel must also be navigable via blinks. Use a numbered list approach:
- Each setting has a number.
- User blinks the number in Morse code to select it.
- Values cycle through options on selection.

| # | Setting | Options |
|---|---------|---------|
| 1 | Blink Sensitivity | Low / Medium / High |
| 2 | TTS Voice | (cycle through available voices) |
| 3 | TTS Speed | Slow / Normal / Fast |
| 4 | Audio Feedback | On / Off |
| 5 | Camera Privacy Blur | On / Off |
| 6 | Emergency Phrase | (editable text) |
| 7 | Recalibrate | (triggers calibration flow) |
| 8 | Export Session Data | (downloads JSON file) |

---

## 7. Responsive Design Targets

| Device | Layout Adjustments |
|--------|-------------------|
| **Desktop (≥1024px)** | Full layout as shown above |
| **Tablet (768–1024px)** | Stack Morse buffer and predictions vertically, enlarge touch targets |
| **Mobile (≤768px)** | Single-column, output text fills 60% of screen, camera PiP moves to top |

### Critical Rule
On ALL screen sizes, the output text must be readable from **arm's length** (approximately 60cm / 2 feet). This accounts for users in hospital beds or wheelchairs where the screen may not be directly in front of their face.

---

## 8. Accessibility Compliance

| Standard | Target | Notes |
|----------|--------|-------|
| WCAG 2.1 AAA | ✅ Full compliance | Highest accessibility tier |
| Color contrast ratio | ≥ 7:1 (AAA) | Verified with axe-core |
| Focus indicators | N/A | No keyboard/mouse focus needed; system is blink-driven |
| Screen reader support | Partial | TTS IS the output; ARIA labels on all elements for caregiver mode |
| `prefers-reduced-motion` | ✅ Respected | Disables all animations when enabled |
| `prefers-color-scheme` | Dark only | Light mode not offered (eye strain concern) |
