# Medical Compliance & Data Privacy — Auralis AAC

> This document outlines how Auralis aligns with medical data standards, privacy regulations, and clinical deployment requirements.

---

## 1. Privacy Architecture — By Design, Not Afterthought

Auralis is designed from the ground up with a **zero-trust, zero-transmission** privacy model.

### Data Classification

| Data Type | Where Processed | Where Stored | Transmitted? |
|-----------|----------------|-------------|-------------|
| Video frames | Browser memory (RAM) | **Never stored** | ❌ Never |
| Facial landmarks (468 points) | Browser memory (RAM) | **Never stored** | ❌ Never |
| EAR/HAR/MAR values | Browser memory | **Never stored** | ❌ Never |
| Calibration profile | Device (IndexedDB) | Device only | ❌ Never |
| Typed text | Device (IndexedDB) | Device only | ⚠️ Only to caregiver (opt-in, P2P) |
| Session analytics | Device (IndexedDB) | Device only | ❌ Never (exported as file) |
| Settings/preferences | Device (IndexedDB) | Device only | ❌ Never |

### Key Guarantee
> **No video frame, facial landmark, or biometric data is EVER transmitted over the network, stored on disk, or accessible to any third party — including the developers of Auralis.**

---

## 2. HIPAA Alignment (USA)

While Auralis is not a "Covered Entity" under HIPAA (it's a free, open-source tool with no business associate agreements), its architecture is designed to align with HIPAA principles.

### HIPAA Technical Safeguards Alignment

| Safeguard | HIPAA Requirement | Auralis Implementation |
|-----------|-------------------|----------------------|
| Access Control | Unique user identification | User profiles with optional PIN lock |
| Audit Controls | Record access to ePHI | Session logs with timestamps (stored locally only) |
| Transmission Security | Encrypt ePHI in transit | Caregiver dashboard uses WebRTC (DTLS encrypted) |
| Integrity | Protect ePHI from alteration | IndexedDB data is write-protected by browser sandbox |
| Authentication | Verify user identity | Blink-based activation sequence (biometric by nature) |

### What Auralis Does NOT Do (Intentionally)
- Does NOT store Protected Health Information (PHI) on any server.
- Does NOT transmit data to cloud services.
- Does NOT require user accounts, emails, or identifying information.
- Does NOT use third-party analytics that could leak health data.

---

## 3. GDPR Alignment (EU)

| GDPR Principle | Implementation |
|---------------|----------------|
| **Lawful Basis** | Consent. Camera access requires explicit browser permission. |
| **Data Minimization** | Only the minimum landmarks needed for EAR/HAR/MAR are extracted. Full video is never stored. |
| **Purpose Limitation** | Data is used solely for blink detection and communication. Never for profiling, advertising, or research. |
| **Storage Limitation** | Session data can be manually deleted. No automatic retention beyond the browser's IndexedDB. |
| **Right to Erasure** | Clearing browser data or clicking "Delete All Data" in settings removes everything. |
| **Right to Portability** | Session data can be exported as JSON/CSV at any time. |
| **Data Protection by Design** | Zero-server architecture means there is no central database to breach. |

---

## 4. FHIR-Compatible Data Export

### What is FHIR?
FHIR (Fast Healthcare Interoperability Resources) is the global standard for exchanging healthcare information electronically. Auralis can export session data in a FHIR-compatible JSON format.

### Why This Matters
- A speech therapist can import session data into their clinic's Electronic Health Record (EHR) system.
- A neurologist can track disease progression over weeks/months using standardized data.
- Researchers can use anonymized, exported data for clinical studies.

### Example Export Structure
```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "survey",
      "display": "Survey"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://auralis.health/codes",
      "code": "aac-session",
      "display": "AAC Communication Session"
    }]
  },
  "subject": {
    "display": "Anonymous Patient"
  },
  "effectivePeriod": {
    "start": "2026-07-29T10:00:00Z",
    "end": "2026-07-29T10:22:00Z"
  },
  "component": [
    {
      "code": { "text": "Total Characters" },
      "valueInteger": 187
    },
    {
      "code": { "text": "Words Per Minute" },
      "valueQuantity": { "value": 1.5, "unit": "wpm" }
    },
    {
      "code": { "text": "Error Rate" },
      "valueQuantity": { "value": 6.4, "unit": "%" }
    },
    {
      "code": { "text": "Peak Fatigue Score" },
      "valueQuantity": { "value": 0.62, "unit": "score" }
    },
    {
      "code": { "text": "Emergency Activations" },
      "valueInteger": 0
    }
  ]
}
```

---

## 5. Clinical Deployment Considerations

### 5.1 Medical Device Classification
Auralis, as a communication aid, is classified as a **Class I medical device** in most jurisdictions (FDA, EU MDR). Class I devices:
- Have the lowest risk level.
- Often exempt from pre-market notification (510(k) in the USA).
- Still require compliance with Quality System Regulations (QSR) if sold commercially.

> **Note:** Since Auralis is free and open-source, it is distributed as a **general-purpose communication tool**, not as a regulated medical device. Users and caregivers use it at their own discretion.

### 5.2 Hospital IT Requirements
For deployment in hospital networks:
- **No installation required:** Runs in any modern browser.
- **No admin rights required:** No software to install.
- **No network dependency:** Works offline after first load.
- **No data egress:** No data leaves the device.
- **Firewall friendly:** No outbound connections needed for core functionality.

### 5.3 Clinical Validation Recommendations
Before using Auralis with patients, clinicians should:
1. Run the calibration with the patient.
2. Verify blink detection accuracy manually (count 20 intentional blinks, verify ≥18 are detected correctly).
3. Test emergency activation at least 3 times.
4. Ensure the patient can read the output text from their typical position.
5. Document the calibration parameters for the patient's medical record.

---

## 6. Ethical Considerations

### 6.1 Informed Consent
- Before first use, the app displays a clear explanation of what data is collected and how it is processed.
- Camera permission is requested with a custom, human-readable explanation (not just the browser's generic prompt).
- Users can review and delete all stored data at any time.

### 6.2 Autonomy
- The system never makes decisions for the user.
- Fatigue warnings are suggestions, not restrictions.
- The user controls when to speak, what to say, and when to stop.

### 6.3 Equity
- The system is free.
- The system works on low-cost devices.
- The system supports multiple languages.
- The source code is open for anyone to audit, modify, or improve.
