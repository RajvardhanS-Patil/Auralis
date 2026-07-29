# 🛡️ Auralis Development Rules & Self-Review Checklist

> **Purpose:** Before writing ANY code, designing ANY feature, or merging ANY pull request, every contributor (including AI assistants) MUST run through this checklist. This document is the quality gate for the entire project.

---

## 🔴 STOP — Ask These Questions First

Before you write a single line of code, answer these honestly:

### 1. Necessity Check
- [ ] **Is this feature absolutely necessary for the user?**
  - Does it directly help someone with ALS, cerebral palsy, stroke, or spinal cord injury communicate?
  - If the answer is "it would be cool" but not "it solves a real communication barrier," **cut it**.
- [ ] **Does this feature already exist in a library we can import?**
  - Never reinvent the wheel. Check npm, CDN libraries, and browser native APIs first.
  - Example: Don't build a custom TTS engine — the browser has `speechSynthesis` built in.
- [ ] **Can this code be written more compactly using an existing library?**
  - If you're writing more than 50 lines of utility code, there is almost certainly a battle-tested library that does it better.
  - Example: Don't write your own Kalman filter from scratch — use `kalmanjs` or similar.

### 2. Uniqueness Check
- [ ] **What makes this different from every other AAC tool?**
  - Auralis is NOT just "another blink detector." Every feature must pass the uniqueness test.
  - Our differentiators: Fatigue-aware AI, adaptive calibration, multi-modal input (blink + head tilt + facial gestures), caregiver dashboard, session analytics, offline-first PWA.
- [ ] **Can we add uniqueness to this feature?**
  - Before implementing anything the "standard" way, brainstorm for 2 minutes: Is there a smarter, more accessible, or more delightful way to do this?
  - Example: Instead of a boring "Settings" page, can the settings be adjusted via blink commands themselves?

### 3. Workability Check
- [ ] **Is this feature actually workable with a standard webcam?**
  - Will it work in poor lighting? At odd angles? With glasses on?
  - If a feature only works in lab conditions, it is not production-ready. **Reject it.**
- [ ] **Have we tested with real-world constraints?**
  - Low-end hardware (Chromebook, old Android phone)?
  - Users with asymmetric facial features, drooping eyelids, or glasses?
  - Background noise, multiple faces in frame?

### 4. Medical-Grade Quality Check
- [ ] **Could a false positive cause harm or frustration?**
  - A wrong character is annoying. A missed emergency phrase could be life-threatening.
  - Emergency phrases (e.g., "HELP", "PAIN", "CALL NURSE") must have near-zero false-negative rates.
- [ ] **Is the latency acceptable?**
  - From blink → character on screen must be < 200ms.
  - From "Speak" command → audio output must be < 500ms.
- [ ] **Does the feature degrade gracefully?**
  - What happens when the camera feed drops? When the face goes out of frame? When lighting changes?
  - The system must NEVER crash. It must show clear recovery instructions.

### 5. Accessibility & Ethics Check
- [ ] **Can a user with ZERO hand/arm mobility use this feature?**
  - Every single interaction must be achievable with eyes-only input.
  - If a feature requires clicking, tapping, or swiping, it is **broken by design**.
- [ ] **Does this respect the user's dignity?**
  - Never use infantilizing language or design patterns.
  - The user is an intelligent adult who cannot move — the UI should reflect that.
- [ ] **Is this privacy-safe?**
  - No video frame should ever leave the device.
  - No usage data should be sent to any server without explicit opt-in consent.

### 6. Code Quality Check
- [ ] **Is the code modular and testable?**
  - Each module (camera, EAR, Morse, TTS) should be independently unit-testable.
  - No God classes. No 500-line functions.
- [ ] **Are there proper error boundaries?**
  - Camera permission denied? Show a clear message and fallback.
  - MediaPipe fails to load? Show offline instructions.
- [ ] **Is there documentation for this code?**
  - Every exported function must have a JSDoc comment.
  - Complex algorithms must reference the relevant section of `ALGORITHM_DESIGN.md`.

---

## 🟡 During Development — Continuous Checks

| Check | Frequency | Action if Failed |
|-------|-----------|-----------------|
| EAR accuracy > 95% | Every commit | Re-calibrate thresholds or add smoothing |
| Frame rate ≥ 30fps on target device | Every feature addition | Optimize or defer the feature |
| False positive blink rate < 2% | Every algorithm change | Add debounce or hysteresis |
| All text readable at arm's length | Every UI change | Increase font size / contrast |
| Works without internet | Every deployment | Verify service worker caching |
| No console errors / warnings | Every commit | Fix immediately |

---

## 🟢 Before Merge / Deployment — Final Gates

- [ ] All unit tests pass.
- [ ] Manual test on at least 2 devices (desktop + mobile).
- [ ] Lighthouse accessibility score ≥ 95.
- [ ] No hardcoded timing values — all must come from the user's calibration profile.
- [ ] Emergency phrase system tested and verified.
- [ ] README and docs updated to reflect any new features.

---

## 💡 Golden Rules

1. **"If it can't be done with a blink, it doesn't ship."**
2. **"Compact code > clever code > long code."**
3. **"Every millisecond of latency is a millisecond of frustration for someone who can't speak."**
4. **"Test with the worst webcam you can find. If it works there, it works everywhere."**
5. **"The user's face is not data — it is their voice. Treat it with absolute respect."**
