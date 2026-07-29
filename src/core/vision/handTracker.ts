/**
 * Hand Tracker Module — Pinch detection and cursor tracking using MediaPipe Hand landmarks.
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/** MediaPipe Hand Landmark indices */
export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  // ... other fingers omitted for brevity as we only need thumb and index
} as const;

/**
 * Computes the 3D Euclidean distance between two MediaPipe landmarks.
 */
function euclidean3D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  );
}

/**
 * Calculates a "Pinch Ratio" (similar to EAR) to determine if the thumb and index finger are pinching.
 * We normalize the distance between the thumb tip and index tip by the size of the hand
 * (distance from wrist to index MCP) to make it scale-invariant.
 * 
 * @param landmarks - Array of 21 hand landmarks from MediaPipe
 * @returns A ratio where lower values mean a closed pinch (typically < 0.2 is pinched, > 0.5 is open).
 */
export function calculatePinchRatio(landmarks: NormalizedLandmark[]): number {
  const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
  const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP];
  const wrist = landmarks[HAND_LANDMARKS.WRIST];
  const indexMcp = landmarks[HAND_LANDMARKS.INDEX_FINGER_MCP];

  if (!thumbTip || !indexTip || !wrist || !indexMcp) {
    return -1; // Invalid landmarks
  }

  const pinchDistance = euclidean3D(thumbTip, indexTip);
  const handSize = euclidean3D(wrist, indexMcp);

  if (handSize === 0) return 0;

  return pinchDistance / handSize;
}

/**
 * Extracts the virtual cursor coordinates from the index finger tip.
 * Coordinates are mapped to screen space (0 to 1).
 * 
 * @param landmarks - Array of 21 hand landmarks
 * @returns { x, y } where x and y are between 0 and 1.
 */
export function getCursorCoordinates(landmarks: NormalizedLandmark[]): { x: number; y: number } {
  const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP];
  if (!indexTip) return { x: 0.5, y: 0.5 };
  
  // Note: We mirror the X coordinate because the camera feed is usually mirrored
  return { 
    x: 1 - indexTip.x, 
    y: indexTip.y 
  };
}
