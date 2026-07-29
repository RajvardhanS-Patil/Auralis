# Morse Code Reference — Auralis AAC

> Complete reference for International Morse Code + custom Auralis control commands.

---

## 1. International Morse Code — Letters

| Letter | Morse | Blink Pattern (● = short, ▬ = long) |
|--------|-------|--------------------------------------|
| A | `.-` | ● ▬ |
| B | `-...` | ▬ ● ● ● |
| C | `-.-.` | ▬ ● ▬ ● |
| D | `-..` | ▬ ● ● |
| E | `.` | ● |
| F | `..-.` | ● ● ▬ ● |
| G | `--.` | ▬ ▬ ● |
| H | `....` | ● ● ● ● |
| I | `..` | ● ● |
| J | `.---` | ● ▬ ▬ ▬ |
| K | `-.-` | ▬ ● ▬ |
| L | `.-..` | ● ▬ ● ● |
| M | `--` | ▬ ▬ |
| N | `-.` | ▬ ● |
| O | `---` | ▬ ▬ ▬ |
| P | `.--.` | ● ▬ ▬ ● |
| Q | `--.-` | ▬ ▬ ● ▬ |
| R | `.-.` | ● ▬ ● |
| S | `...` | ● ● ● |
| T | `-` | ▬ |
| U | `..-` | ● ● ▬ |
| V | `...-` | ● ● ● ▬ |
| W | `.--` | ● ▬ ▬ |
| X | `-..-` | ▬ ● ● ▬ |
| Y | `-.--` | ▬ ● ▬ ▬ |
| Z | `--..` | ▬ ▬ ● ● |

---

## 2. International Morse Code — Numbers

| Number | Morse | Blink Pattern |
|--------|-------|---------------|
| 0 | `-----` | ▬ ▬ ▬ ▬ ▬ |
| 1 | `.----` | ● ▬ ▬ ▬ ▬ |
| 2 | `..---` | ● ● ▬ ▬ ▬ |
| 3 | `...--` | ● ● ● ▬ ▬ |
| 4 | `....-` | ● ● ● ● ▬ |
| 5 | `.....` | ● ● ● ● ● |
| 6 | `-....` | ▬ ● ● ● ● |
| 7 | `--...` | ▬ ▬ ● ● ● |
| 8 | `---..` | ▬ ▬ ▬ ● ● |
| 9 | `----.` | ▬ ▬ ▬ ▬ ● |

---

## 3. Common Punctuation

| Symbol | Morse | Description |
|--------|-------|-------------|
| `.` | `.-.-.-` | Period / Full stop |
| `,` | `--..--` | Comma |
| `?` | `..--..` | Question mark |
| `!` | `-.-.--` | Exclamation mark |
| `'` | `.----.` | Apostrophe |
| `/` | `-..-.` | Slash |
| `(` | `-.--.` | Open parenthesis |
| `)` | `-.--.-` | Close parenthesis |
| `&` | `.-...` | Ampersand |
| `:` | `---...` | Colon |
| `=` | `-...-` | Equals |
| `+` | `.-.-.` | Plus |
| `-` | `-....-` | Hyphen |
| `@` | `.--.-.` | At sign |

---

## 4. Auralis Custom Commands

These are **non-standard** Morse sequences reserved for app control. They do NOT conflict with any standard Morse character.

| Command | Sequence | Action | Notes |
|---------|----------|--------|-------|
| **Activate System** | 3 rapid blinks | ARM the Morse code engine | Must be within 2 seconds |
| **Deactivate System** | 3 rapid blinks (again) | Return to IDLE / Sleep mode | Toggle behavior |
| **Backspace** | 8 rapid dots `........` | Delete last character | Fast, repetitive motion |
| **Clear All** | 8 dashes `--------` | Clear entire text buffer | Deliberate, slow motion |
| **Speak** | `..-.` (letter F) | Trigger TTS to speak current text | Can also use mouth-open gesture |
| **Emergency** | 5-second eye closure | Activate emergency phrase system | Bypasses Morse engine |
| **Quick Phrase Mode** | `--.-` (letter Q) | Enter Quick Phrase selection | Blink number to select phrase |
| **Settings** | `...-` (letter V) | Open settings panel | Navigate with number blinks |

---

## 5. Timing Reference

### Default Timing (Adjustable per User)

```
|← DOT →|    |←── DASH ──→|
  ≤300ms       400–1500ms

|← Intra-character gap →|
        ≤800ms

|←── Word gap ──→|
     ≤2000ms

|←──── Emergency ────→|
         5000ms
```

### Example: Spelling "HELLO"

```
H: ....          → 4 short blinks
   [800ms pause] → character boundary
E: .             → 1 short blink
   [800ms pause] → character boundary
L: .-..          → short, long, short, short
   [800ms pause] → character boundary
L: .-..          → short, long, short, short
   [800ms pause] → character boundary
O: ---           → 3 long blinks
   [2000ms pause]→ word boundary (space)
```

**Total blinks for "HELLO":** 17 blinks
**With predictive text (after "HEL"):** ~9 blinks + 1 head tilt = 60% faster

---

## 6. Learning Path for New Users

### Week 1: The Basics
Focus on the **10 most common letters** in English:
| Priority | Letter | Morse | Frequency in English |
|----------|--------|-------|---------------------|
| 1 | E | `.` | 12.7% |
| 2 | T | `-` | 9.1% |
| 3 | A | `.-` | 8.2% |
| 4 | O | `---` | 7.5% |
| 5 | I | `..` | 7.0% |
| 6 | N | `-.` | 6.7% |
| 7 | S | `...` | 6.3% |
| 8 | H | `....` | 6.1% |
| 9 | R | `.-.` | 6.0% |
| 10 | D | `-..` | 4.3% |

These 10 letters cover **73.9%** of all English text. Master these first.

### Week 2: Quick Phrases
Learn to use Quick Phrase mode (`Q` = `--.-`) to access pre-built common phrases without spelling.

### Week 3: Full Alphabet
Add remaining letters and numbers gradually.

### Week 4: Speed & Prediction
Focus on using head tilts to accept predictive text suggestions, dramatically increasing WPM.
