# Contributing to Auralis

> Thank you for considering contributing to Auralis! This project aims to give a voice to people who can't speak. Every contribution matters.

---

## 🤝 Who Can Contribute?

Auralis welcomes contributions from:
- **Software developers** (JavaScript, React, AI/ML, WebRTC)
- **Accessibility experts** (WCAG, assistive technology experience)
- **Speech-Language Pathologists** (SLPs) and occupational therapists
- **Medical professionals** (neurologists, ALS specialists, rehabilitation doctors)
- **UI/UX designers** (especially those with accessible design experience)
- **Translators** (help bring Auralis to more languages)
- **People with disabilities** and their caregivers (user testing and feedback)

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git fork https://github.com/RajvardhanS-Patil/Auralis.git
git clone https://github.com/YOUR_USERNAME/Auralis.git
cd Auralis
npm install
npm run dev
```

### 2. Branch Naming
```
feature/your-feature-name     # New features
fix/bug-description            # Bug fixes
docs/document-name             # Documentation updates
test/test-description          # Test additions
refactor/module-name           # Code refactoring
```

### 3. Commit Message Format
```
type(scope): short description

- Detailed explanation if needed
- Reference issue number: #123

Types: feat, fix, docs, test, refactor, perf, style, ci
Scope: vision, morse, speech, prediction, fatigue, ui, caregiver
```

**Examples:**
```
feat(vision): add Kalman filter to EAR smoothing pipeline
fix(morse): prevent double-detection of single blink
docs(algorithm): update EAR formula with 3D Euclidean distance
test(morse): add unit tests for involuntary blink rejection
```

---

## 📋 Before Submitting a PR

### Mandatory Checklist
- [ ] **Read `RULES.md`** and ensure your change passes all self-review questions.
- [ ] **Run tests:** `npm run test` — all tests must pass.
- [ ] **Run linter:** `npm run lint` — zero errors, zero warnings.
- [ ] **Run build:** `npm run build` — production build must succeed.
- [ ] **Test offline:** Verify your change doesn't break PWA offline functionality.
- [ ] **Update docs:** If you changed behavior, update the relevant `.md` file in `docs/aac/`.
- [ ] **No console.log:** Remove all debug logging before submitting.

### For UI Changes
- [ ] Test on at least 2 screen sizes (desktop + mobile).
- [ ] Verify color contrast meets WCAG AAA (≥ 7:1 ratio).
- [ ] Ensure all new elements work without mouse/keyboard (blink-only).
- [ ] Include before/after screenshots in the PR description.

### For Algorithm Changes
- [ ] Include benchmark results (false positive rate, latency).
- [ ] Test with low-quality webcam input.
- [ ] Update `ALGORITHM_DESIGN.md` with any new formulas or constants.

---

## 🏗️ Project Structure

```
Auralis/
├── docs/
│   └── aac/
│       ├── README.md                 # Project overview (in docs)
│       ├── ARCHITECTURE.md           # System design
│       ├── ALGORITHM_DESIGN.md       # Math & algorithms
│       ├── IMPLEMENTATION_PLAN.md    # Development roadmap
│       ├── UI_UX_GUIDELINES.md       # Design system
│       ├── RULES.md                  # Quality checklist
│       ├── TESTING_STRATEGY.md       # Testing plan
│       ├── DEPLOYMENT.md             # Hosting & CI/CD
│       ├── ADVANCED_FEATURES.md      # Unique features
│       ├── MORSE_CODE_REFERENCE.md   # Morse code charts
│       ├── MEDICAL_COMPLIANCE.md     # HIPAA, GDPR, FHIR
│       └── CONTRIBUTING.md           # This file
├── src/
│   ├── components/                   # React UI components
│   ├── core/
│   │   ├── vision/                   # Camera, MediaPipe, EAR
│   │   ├── morse/                    # State machine, dictionary
│   │   ├── speech/                   # TTS controller
│   │   ├── prediction/              # Trie, frequency scoring
│   │   └── fatigue/                  # Fatigue detection
│   ├── workers/                      # Web Worker scripts
│   ├── hooks/                        # Custom React hooks
│   ├── stores/                       # State management
│   ├── data/                         # Dictionaries, vocab
│   ├── utils/                        # Math helpers
│   └── styles/                       # CSS, design tokens
├── public/                           # Static assets, icons
├── tests/                            # Test files
├── README.md                         # Root project README
├── package.json
├── vite.config.ts
└── .github/
    └── workflows/
        └── deploy.yml                # CI/CD pipeline
```

---

## 🐛 Reporting Bugs

When reporting a bug, please include:
1. **Device & Browser:** (e.g., "Chrome 120, MacBook Air M2")
2. **Steps to reproduce:** (numbered list)
3. **Expected behavior:** (what should have happened)
4. **Actual behavior:** (what actually happened)
5. **Screenshots/Videos:** (if relevant)
6. **Console errors:** (open DevTools → Console, copy any red error messages)

---

## 💡 Feature Requests

Before requesting a feature, check:
1. Is it already listed in `ADVANCED_FEATURES.md` or `IMPLEMENTATION_PLAN.md`?
2. Does it pass the `RULES.md` checklist — especially the "Is this necessary?" and "Can the user do this with blinks only?" questions?
3. Would it benefit the **primary user** (person with motor impairments), not just developers?

---

## 📜 Code of Conduct

This project is built for people who are among the most vulnerable in society. We hold ourselves to the highest standard of conduct:

1. **Be kind.** Always.
2. **Be patient.** Not everyone has the same technical background.
3. **Be respectful.** Of users, contributors, and the people this project serves.
4. **No discrimination.** Of any kind. Period.
5. **Prioritize the user.** Every decision, every PR, every discussion should ultimately serve the person blinking at their screen, trying to say "I love you" or "I need help."
