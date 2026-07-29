# 🧠 Auralis — AI-Powered Blink-to-Speech AAC System

> *"Giving a voice to those who can't speak, using nothing but their eyes and a webcam."*

---

## 🌟 What is Auralis?

Auralis is a **free, open-source, medical-grade Assistive and Augmentative Communication (AAC) system** that transforms intentional eye blinks into real-time spoken language. Built for individuals with severe speech and motor impairments — including ALS, stroke, locked-in syndrome, spinal cord injuries, and cerebral palsy — Auralis requires **zero specialized hardware**. Just a standard webcam and a modern browser.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/RajvardhanS-Patil/Auralis.git
cd Auralis

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🖐️ Hand Cursor Control (Real System Cursor)

Auralis includes a **Python companion script** that lets you control your **real system cursor** anywhere on your laptop using hand gestures:

```bash
# Install Python dependencies
pip install -r companion/requirements.txt

# Run the hand cursor controller
python companion/hand_cursor.py
```

| Gesture | Action |
|---------|--------|
| ☝️ Point index finger | Move cursor |
| 🤏 Pinch (thumb + index) | Left click |
| ✊ Fist | Right click |

See [companion/README.md](./companion/README.md) for full details and tuning guide.

## 📚 Documentation
See [docs/aac/README.md](./docs/aac/README.md) for the complete documentation index.

## 📄 License
MIT License
