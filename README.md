# 🧠 Auralis — AI-Powered Blink-to-Speech AAC System

> *"Giving a voice to those who can't speak, using nothing but their eyes and a webcam."*

---

## 🌟 What is Auralis?

Auralis is a **free, open-source, medical-grade Assistive and Augmentative Communication (AAC) system** that transforms intentional eye blinks into real-time spoken language. Built for individuals with severe speech and motor impairments — including ALS, stroke, locked-in syndrome, spinal cord injuries, and cerebral palsy — Auralis requires **zero specialized hardware**. Just a standard webcam and a modern browser.

### The Problem
- Traditional AAC devices cost **$5,000–$15,000+** (Tobii Dynavox, etc.).
- Eye-tracking hardware requires precise calibration and fails in real-world lighting.
- Physical switch systems require residual motor control that many patients lack.
- Most solutions are locked to specific operating systems and require installation.

### The Auralis Solution
A **web-based, AI-powered application** that runs entirely in the browser, processes everything locally (zero data leaves the device), and works on any device with a camera.

---

## 🏆 Key Differentiators (What Makes Auralis Unique)

| Feature | Traditional AAC | Auralis |
|---------|----------------|---------|
| Hardware Cost | $5,000–$15,000 | $0 (any webcam) |
| Platform | Windows-only installers | Any browser, any OS |
| Privacy | Cloud-processed data | 100% on-device AI |
| Input Method | Single (eye-tracking OR switch) | Multi-modal (blinks + head gestures + facial expressions) |
| Fatigue Detection | None | AI-based fatigue monitoring with auto-rest prompts |
| Adaptive Calibration | Manual, one-time | Continuous, self-adjusting |
| Emergency System | None | One-blink SOS with pre-programmed emergency phrases |
| Caregiver Mode | None | Real-time dashboard for caregivers to monitor and assist |
| Predictive Text | Basic | Context-aware prediction with medical vocabulary |
| Offline Support | Requires internet | Full PWA, works offline after first load |

---

## 🛠️ Technology Stack

### Core AI & Computer Vision
| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **Google MediaPipe Face Mesh** | 468-point 3D facial landmark detection | Runs in-browser via WebAssembly/WebGL, no server needed, ~5ms inference |
| **TensorFlow.js (Lite)** | Fatigue detection micro-model, predictive text | Client-side ML for enhanced intelligence |
| **Kalman Filter (kalmanjs)** | EAR signal smoothing | Eliminates noise from lighting changes and jitter |

### Speech & Audio
| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **Web Speech API** | Text-to-Speech synthesis | Native browser API, zero cost, multiple voices |
| **Tone.js** | Audio feedback (blink confirmation sounds) | Lightweight, precise audio timing for haptic-like feedback |

### Frontend & Application
| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **Vite + React 18** | Application framework | Fast HMR, tree-shaking, modern build pipeline |
| **Web Workers** | Offload AI inference from main thread | Prevents UI jank during 60fps processing |
| **IndexedDB (via Dexie.js)** | Local storage for user profiles, sessions, word history | Persistent, offline-first data without a server |
| **Service Worker (Workbox)** | PWA offline caching | Full functionality without internet after first load |

### Medical & Accessibility
| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **WCAG 2.1 AAA Compliance** | Accessibility standard | The highest tier of web accessibility |
| **FHIR-compatible JSON export** | Medical data interoperability | Allows session data to integrate with hospital EHR systems |
| **WebSocket (optional)** | Caregiver real-time dashboard | Low-latency push updates for remote monitoring |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/RajvardhanS-Patil/Auralis.git
cd Auralis

# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
# Navigate to http://localhost:5173
```

### System Requirements
- **Browser:** Chrome 90+, Edge 90+, Firefox 100+, Safari 16+
- **Camera:** Any webcam (720p minimum recommended)
- **Device:** Any laptop, tablet, or smartphone (works on low-end Chromebooks)
- **Internet:** Required only for first load; fully offline after PWA install

---

## 📚 Documentation Index

### Core Documentation
| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/aac/ARCHITECTURE.md) | System design, module breakdown, data flow diagrams |
| [ALGORITHM_DESIGN.md](./docs/aac/ALGORITHM_DESIGN.md) | EAR math, Kalman filtering, Morse code state machine, fatigue detection |
| [IMPLEMENTATION_PLAN.md](./docs/aac/IMPLEMENTATION_PLAN.md) | 8-phase development roadmap with milestones |
| [UI_UX_GUIDELINES.md](./docs/aac/UI_UX_GUIDELINES.md) | Accessibility-first design system and interaction patterns |

### Quality & Process
| Document | Description |
|----------|-------------|
| [RULES.md](./docs/aac/RULES.md) | Self-review checklist — every code change must pass this |
| [TESTING_STRATEGY.md](./docs/aac/TESTING_STRATEGY.md) | Unit, integration, accessibility, and real-world testing plan |
| [DEPLOYMENT.md](./docs/aac/DEPLOYMENT.md) | CI/CD pipeline, PWA setup, hosting, and release process |

### Advanced Features
| Document | Description |
|----------|-------------|
| [ADVANCED_FEATURES.md](./docs/aac/ADVANCED_FEATURES.md) | Fatigue detection, predictive text, emergency system, caregiver dashboard |
| [MORSE_CODE_REFERENCE.md](./docs/aac/MORSE_CODE_REFERENCE.md) | Complete Morse code chart, custom Auralis commands, quick-phrase system |
| [MEDICAL_COMPLIANCE.md](./docs/aac/MEDICAL_COMPLIANCE.md) | HIPAA considerations, data privacy, FHIR export, clinical trial readiness |

---

## 🤝 Contributing

We welcome contributions from developers, accessibility advocates, speech therapists, and medical professionals. Please read [CONTRIBUTING.md](./docs/aac/CONTRIBUTING.md) before submitting a PR.

---

## 📄 License

This project is open-source and free to use. Licensed under the [MIT License](./LICENSE).

---

> **Built with ❤️ for the 300+ million people worldwide living with severe speech and motor impairments.**
