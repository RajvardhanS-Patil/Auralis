/**
 * EAR Calculation Module — Eye Aspect Ratio computation using MediaPipe landmarks.
 * All AI inference must run in a Web Worker (per RULES.md architecture constraint).
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/** MediaPipe Face Mesh landmark indices for each eye */
export const EYE_LANDMARKS = {
  left: {
    p1: 362, // Lateral corner
    p2: 385, // Superior eyelid (medial)
    p3: 387, // Superior eyelid (lateral)
    p4: 263, // Medial corner
    p5: 373, // Inferior eyelid (lateral)
    p6: 380, // Inferior eyelid (medial)
  },
  right: {
    p1: 33,
    p2: 160,
    p3: 158,
    p4: 133,
    p5: 153,
    p6: 144,
  },
} as const;

/**
 * Computes the 3D Euclidean distance between two MediaPipe landmarks.
 * @param a - First landmark point
 * @param b - Second landmark point
 * @returns Distance between the two points
 */
export function euclidean3D(
  a: NormalizedLandmark,
  b: NormalizedLandmark
): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  );
}

/**
 * Calculates the Eye Aspect Ratio (EAR) for a single eye.
 *
 * Formula: EAR = (||p2 - p6|| + ||p3 - p5||) / (2.0 * ||p1 - p4||)
 *
 * @param landmarks - Full array of 468 face landmarks from MediaPipe
 * @param eye - Which eye to calculate ('left' | 'right')
 * @returns EAR value (typically 0.25-0.35 when open, ~0 when closed)
 */
export function calculateEAR(
  landmarks: NormalizedLandmark[],
  eye: 'left' | 'right'
): number {
  const idx = EYE_LANDMARKS[eye];

  const p1 = landmarks[idx.p1];
  const p2 = landmarks[idx.p2];
  const p3 = landmarks[idx.p3];
  const p4 = landmarks[idx.p4];
  const p5 = landmarks[idx.p5];
  const p6 = landmarks[idx.p6];

  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) {
    return -1; // Invalid landmarks
  }

  const vertical1 = euclidean3D(p2, p6);
  const vertical2 = euclidean3D(p3, p5);
  const horizontal = euclidean3D(p1, p4);

  if (horizontal === 0) return 0;

  return (vertical1 + vertical2) / (2.0 * horizontal);
}

/**
 * Calculates bilateral EAR (average of both eyes).
 * This compensates for facial asymmetry.
 * @param landmarks - Full face landmarks array
 * @returns Averaged EAR value or -1 if invalid
 */
export function calculateBilateralEAR(
  landmarks: NormalizedLandmark[]
): number {
  const leftEAR = calculateEAR(landmarks, 'left');
  const rightEAR = calculateEAR(landmarks, 'right');

  if (leftEAR < 0 && rightEAR < 0) return -1;
  if (leftEAR < 0) return rightEAR;
  if (rightEAR < 0) return leftEAR;

  return (leftEAR + rightEAR) / 2.0;
}
