# Testing Strategy — Auralis AAC

> A communication tool for people who cannot speak must be reliable beyond any reasonable doubt. Testing is not optional — it is the difference between empowerment and frustration.

---

## 1. Testing Philosophy

1. **Every module must be independently testable.** Camera module, EAR calculation, Morse FSM, TTS — each has its own test suite.
2. **Mock the camera, not the math.** Camera input is mocked with pre-recorded landmark data. Mathematical functions are tested with real numbers.
3. **Accessibility is tested automatically AND manually.** Lighthouse catches 80% of issues. A human catches the rest.
4. **Real-world testing is non-negotiable.** Lab conditions ≠ hospital rooms. Test on bad cameras, in bad lighting, at bad angles.

---

## 2. Test Framework & Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit tests and integration tests (fast, Vite-native) |
| **Testing Library (React)** | Component rendering and interaction tests |
| **Playwright** | End-to-end browser tests, cross-browser verification |
| **axe-core / @axe-core/playwright** | Automated accessibility audits |
| **Lighthouse CI** | Performance, accessibility, PWA scores in CI |
| **Mock Service Worker (MSW)** | Not needed (no backend), but useful for mocking WebRTC in caregiver tests |

---

## 3. Unit Tests

### 3.1 EAR Calculation (`core/vision/ear.test.ts`)
```
✓ should return ~0.35 for a fully open eye (mock landmarks)
✓ should return ~0.05 for a fully closed eye (mock landmarks)
✓ should return the average of left and right EAR
✓ should handle missing landmarks gracefully (return null)
✓ should handle NaN coordinates (return null)
✓ should compute correct Euclidean distance in 3D
```

### 3.2 Kalman Filter Integration (`core/vision/filter.test.ts`)
```
✓ should smooth noisy EAR values
✓ should respond quickly to genuine blinks (low lag)
✓ should not smooth out a real blink event (amplitude preserved)
✓ should handle rapid successive blinks without merging them
```

### 3.3 Adaptive Baseline (`core/vision/baseline.test.ts`)
```
✓ should converge to the average EAR when eyes are open
✓ should NOT update baseline during a blink
✓ should slowly drift when lighting changes (simulated gradual EAR shift)
✓ should recalculate dynamic threshold when baseline changes
```

### 3.4 Morse Code FSM (`core/morse/stateMachine.test.ts`)
```
✓ should start in IDLE state
✓ should transition to ARMED after 3 rapid blinks
✓ should classify a 200ms blink as DOT
✓ should classify a 600ms blink as DASH
✓ should discard blinks < 80ms (involuntary)
✓ should emit 'E' for a single DOT (Morse: '.')
✓ should emit 'T' for a single DASH (Morse: '-')
✓ should emit 'S' for DOT-DOT-DOT (Morse: '...')
✓ should emit 'O' for DASH-DASH-DASH (Morse: '---')
✓ should emit 'SOS' for '... --- ...'
✓ should add a space after T_WORD_SPACE timeout
✓ should trigger emergency after 5s sustained blink
✓ should execute backspace command for 8 rapid dots
✓ should return to IDLE after deactivation sequence
```

### 3.5 Predictive Text (`core/prediction/trie.test.ts`)
```
✓ should return 'hello' as top suggestion for prefix 'hel'
✓ should rank more frequent words higher
✓ should include medical vocabulary ('nauseous' for 'nau')
✓ should apply recency boost for recently typed words
✓ should return empty array for unknown prefixes
✓ should handle single-character prefixes
```

### 3.6 Fatigue Detection (`core/fatigue/fatigue.test.ts`)
```
✓ should return score 0.0 for stable, normal EAR baseline
✓ should return score > 0.5 when baseline drops by 20%
✓ should detect increasing blink rate as fatigue indicator
✓ should NOT trigger fatigue alert in first 60 seconds of a session
```

### 3.7 TTS Controller (`core/speech/tts.test.ts`)
```
✓ should call speechSynthesis.speak with correct text
✓ should respect rate, pitch, volume settings
✓ should queue multiple utterances
✓ should cancel current speech when emergency activates
```

---

## 4. Integration Tests

### 4.1 Full Pipeline Test (Camera Mock → Text Output)
Using pre-recorded landmark data sequences:
```
✓ Given a sequence of landmarks simulating 'SOS' blinks:
  → Should output 'SOS' on screen
  → Should take < 10 seconds total processing time
  
✓ Given landmarks with gradual lighting change:
  → Adaptive baseline should adjust
  → Blink detection accuracy should remain > 95%

✓ Given landmarks simulating involuntary blinks:
  → No characters should be output when system is IDLE
  → No false characters when system is ARMED
```

### 4.2 Calibration → Session Flow
```
✓ Fresh user → calibration completes → profile saved to IndexedDB
✓ Returning user → calibration skipped → profile loaded from IndexedDB
✓ Recalibration → old profile overwritten → new thresholds applied immediately
```

---

## 5. Accessibility Tests

### 5.1 Automated (axe-core via Playwright)
Run on every page/route:
```
✓ No WCAG 2.1 AA violations
✓ No WCAG 2.1 AAA violations (stretch goal — track separately)
✓ All images have alt text
✓ All interactive elements have ARIA labels
✓ Color contrast ratio ≥ 7:1 for all text
```

### 5.2 Manual Accessibility Checklist
- [ ] Output text readable from 60cm (arm's length) on a 13" laptop.
- [ ] All status indicators are distinguishable without relying on color alone (use icons + text).
- [ ] Emergency screen is immediately clear and comprehensible.
- [ ] Calibration flow is completable using blinks only (no mouse/keyboard).
- [ ] Settings are adjustable using blinks only.

---

## 6. Performance Tests

### 6.1 Benchmarks (Measured in CI)
| Metric | Target | Tool |
|--------|--------|------|
| Frame processing latency | < 16ms | `performance.now()` in tests |
| Blink-to-character latency | < 200ms | Custom instrumentation |
| Memory (sustained 10-min session) | < 150MB | Chrome DevTools Protocol via Playwright |
| CPU (sustained 10-min session) | < 40% | Chrome DevTools Protocol |
| Lighthouse Performance | ≥ 90 | Lighthouse CI |
| Lighthouse Accessibility | ≥ 95 | Lighthouse CI |
| Lighthouse PWA | ✅ Installable | Lighthouse CI |

### 6.2 Device Matrix
| Device Category | Example | Test Method |
|----------------|---------|-------------|
| Low-end laptop | Chromebook (MediaTek/Celeron) | Manual + automated |
| Mid-range laptop | Dell Inspiron 15 | Automated (CI) |
| Desktop + external cam | Any modern desktop | Manual |
| Android tablet | Samsung Tab A8 | Manual (Chrome mobile) |
| Android phone | Samsung A15 / Pixel 6a | Manual (Chrome mobile) |
| iPad | iPad 9th gen | Manual (Safari) |
| iPhone | iPhone SE (3rd gen) | Manual (Safari) |

---

## 7. Real-World Scenario Tests

These cannot be automated. They require a human tester simulating real-world conditions.

| Scenario | What to Test |
|----------|-------------|
| **Glasses user** | Do glasses frames cause false landmarks? |
| **Backlit face** | Window behind user — does EAR remain stable? |
| **Low light** | Dimly lit hospital room — does face detection work? |
| **Angle variation** | Camera below face (tablet on table), camera at eye level, camera above |
| **Multiple faces** | Caregiver standing behind patient — does it lock to the primary face? |
| **Facial asymmetry** | Simulated Bell's palsy (one eye partially closed) — does bilateral EAR compensate? |
| **Extended session** | 30-minute continuous use — does fatigue detection trigger? Memory leaks? |
| **Network offline** | Airplane mode after first load — does everything still work? |

---

## 8. CI Pipeline Integration

```yaml
# .github/workflows/test.yml (conceptual)
on: [push, pull_request]

jobs:
  lint:
    - ESLint
    - Prettier check
    
  unit-tests:
    - vitest run --coverage
    - Minimum coverage: 80% for core modules
    
  integration-tests:
    - vitest run --config vitest.integration.config.ts
    
  accessibility:
    - playwright test --project=accessibility
    - axe-core violations = 0
    
  lighthouse:
    - lighthouse ci --assert performance>=90 accessibility>=95
    
  build:
    - vite build
    - Verify PWA manifest and service worker
```
